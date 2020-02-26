try{
// Make the renewal record accessible in ACA	
	aa.cap.updateAccessByACA(capId,"Y");
// Update alt id on renewal record
	vLicenseID = getParentLicenseCapID(capId);
	vIDArray = String(vLicenseID).split("-");
	vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
	if (vLicenseID != null) {
		vLicenseAltId = vLicenseID.getCustomID();
		cIds = getChildren("Licenses/Cultivator/License/Renewal",vLicenseID);
		if(matches(cIds, null, "", undefined)) 
			renewNbr = renewNbr = "0" + 1;
		else {
			cIdLen = cIds.length 
			if(cIds.length <= 9) {
				renewNbr = cIdLen + 1;
				renewNbr = "0" +  renewNbr;
			}else {
				renewNbr = cIdLen + 1;
			}
		}
		newAltId = vLicenseAltId + "-R" + renewNbr;
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
	}
// Copy business contact from license
	copyContactsByType(vLicenseID,capId,"Designated Responsible Party");
	copyContactsByType(vLicenseID,capId,"Business");
// Add condition effective in thirty days if Late Fee not paid	
	var hasFee = false;
	var feeDesc = AInfo["License Type"] + " - Late Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
	if(thisFee){
		var hasFee = feeExists(thisFee.feeCode,"NEW");
		if(hasFee) {
			effDate = dateAdd(AInfo["Expiration Date"],30);
			addStdConditionEffDate("Application Condition", "Application Hold",effDate);
		}
	}else{
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/License/Renewal: Get Fee: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		logDebug("An error occurred retrieving fee item: " + feeDesc);
	}
// Set status and deactivate workflow if fees are due
	
	if (AInfo["License Issued Type"] == "Provisional") {
		updateTask("Provisional Renewal Review","In Progress","","");
		deactivateTask("Annual Renewal Review");
	}else{
		updateTask("Annual Renewal Review","In Progress","","");
		deactivateTask("Provisional Renewal Review");
	}
	if(balanceDue > 0) {
		updateAppStatus("Renewal Fee Due","Licensee chose Cash Option at checkout");
		deactivateActiveTasks();
	}
// Invoice all fees if cash payment selected at submission in ACA
	var feeDesc = AInfo["License Type"] + " - Renewal Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
	if(thisFee){
		var hasFee = feeExists(thisFee.feeCode,"NEW");
		if(hasFee) {
			var invNbr = invoiceAllFees();
			if (AInfo["License Issued Type"] == "Provisional") {
				updateTask("Provisional Renewal Review","In Progress","","");
			}else{
				updateTask("Annual Renewal Review","In Progress","","");
			}
			updateAppStatus("Renewal Fee Due","Licensee chose Cash Option at checkout");
			deactivateTask("Annual Renewal Review");
			deactivateTask("Provisional Renewal Review");
		}
	}else{
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/License/Renewal: Get Fee: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		logDebug("An error occurred retrieving fee item: " + feeDesc);
	}
// Check License Cases to see if renewal can be fast tracked
	var licenseId = AInfo["License Number"];
	var licId = aa.cap.getCapID(licenseId);
	licId = licId.getOutput();
	childIds  = getChildren("Licenses/Cultivator/License Case/*",licId);
	holdId = capId;
	capId = licId;
	var caseReview = false;
	if(appHasCondition("Owner History","Applied","DOJ LiveScan Match",null))
		caseReview = true;
	if(appHasCondition("License Hold","Applied","Local Non-Compliance",null))
		caseReview = true;		
	for(c in childIds) {
		capId = childIds[c];
		cCap = aa.cap.getCap(capId).getOutput();
		cStatus = cCap.getCapStatus();
		cInfo = new Array;
		loadAppSpecific(cInfo);
		logDebug(cInfo["Case Renewal Type"] + " - " + cStatus);
		if(matches(cInfo["Case Renewal Type"], "Renewal Review", "Renewal Hold")) {
			if(!matches(cStatus, "Resolved", "Closed")) {
				caseReview = true;
				break;
			}
		}
	}	
	capId = holdId;
// Fast track license if qualified and fees paid
	if(!caseReview && !hasFee && publicUser) {	
		var renewalCapProject;
		var vExpDate;
		var vNewExpDate;
		var vLicenseObj;
		licAltId = licId.getCustomID();
		altId = capId.getCustomID();
		if (licId != null) {
	// Get current expiration date.
			vLicenseObj = new licenseObject(null, licId);
			vExpDate = vLicenseObj.b1ExpDate;
			vExpDate = new Date(vExpDate);
	// Extend license expiration by 1 year
			vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
	// Update license expiration date
			logDebug("Updating Expiration Date to: " + vNewExpDate);
			vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
	// Set license record expiration and status to active
			vLicenseObj.setStatus("Active");
			updateAppStatus("Active","License Renewed",licId);
	// Update the Cultivation Type on the license record
			if(AInfo["Designation Change"] == "Yes") {
				editAppSpecific("Cultivator Type",AInfo["Designation Type"],licId);
				editAppName(AInfo["Designation Type"] + " - " + AInfo["License Type"],licId);
			}
	//Set renewal to complete, used to prevent more than one renewal record for the same cycle
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(licId);
			if (renewalCapProject != null) {
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);
			}
	// Update the workflow on the Renewal record to approved
			if (AInfo["License Issued Type"] == "Provisional") {
				closeTask("Provisional Renewal Review","Approved","Renewal Fast Tracked","");
			}else{
				closeTask("Annual Renewal Review","Approved","Renewal Fast Tracked","");
			}
			updateAppStatus("Approved","Renewal Fast Tracked");
			editAppSpecific("Fast Track","CHECKED");
			
	//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
			if (AInfo["License Issued Type"] == "Provisional")
				var approvalLetter = "Provisional Renewal Approval";
			else
				var approvalLetter = "Approval Letter Renewal";
			var scriptName = "asyncRunOfficialLicenseRpt";
			var envParameters = aa.util.newHashMap();
			envParameters.put("licType", "");
			envParameters.put("appCap",altId);
			envParameters.put("licCap",licAltId); 
			envParameters.put("reportName","Official License Certificate");
			envParameters.put("approvalLetter", approvalLetter);
			envParameters.put("emailTemplate", "LCA_RENEWAL_APPROVAL");
			envParameters.put("reason", "");
			envParameters.put("currentUserID",currentUserID);
			envParameters.put("contType","Designated Responsible Party");
			envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
			aa.runAsyncScript(scriptName, envParameters);
			
			var priContact = getContactObj(capId,"Designated Responsible Party");
		// If DRP preference is Postal add license record to Annual/Provisional Renewal A set
			if(priContact){
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						
						if (AInfo['License Issued Type'] == "Provisional") {
							var sName = createSet("PROVISIONAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
						}
						if (AInfo['License Issued Type'] == "Annual"){
							var sName = createSet("ANNUAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
						}
						if(sName){
							setAddResult=aa.set.add(sName,licId);
							if(setAddResult.getSuccess()){
								logDebug(capId.getCustomID() + " successfully added to set " +sName);
							}else{
								logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
							}
						}
					}
				}
			}
	// Add record to the CAT set
			addToCat(licId);
		}

	}
	else {
//  No fast track. Send renewal submitted email notification to DRP
		var priContact = getContactObj(capId,"Designated Responsible Party");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$altId$$", newAltId);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$parentId$$", vLicenseAltId);
			var rFiles = [];
			var priEmail = ""+priContact.capContact.getEmail();
			
			sendNotification(sysFromEmail,priEmail,"","LCA_RENEWAL_SUBMISSION",eParams, rFiles,capId)
	
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("Renewal Submission","Renewal Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,capId);
						if(setAddResult.getSuccess()){
							logDebug(capId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
	} 

} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
