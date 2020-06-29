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
	b1ExpResult = aa.expiration.getLicensesByCapID(vLicenseID);
	var curDate = new Date();
	if (b1ExpResult.getSuccess()) {
		this.b1Exp = b1ExpResult.getOutput();
		expDate = this.b1Exp.getExpDate();
		if(expDate) {
			tmpExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
			var tmpDate = new Date(tmpExpDate);
	
			if(tmpDate <= curDate) {
				var feeDesc = AInfo["License Type"] + " - Late Fee";
				var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
				if(thisFee){
					if (!feeExists(thisFee.feeCode,"NEW")){
						updateFee(thisFee.feeCode,"LIC_CC_REN", "FINAL", 1, "Y", "N");
						effDate = dateAdd(AInfo["Expiration Date"],30);
						addStdConditionEffDate("Application Condition", "Application Hold",effDate);
					}else{
						effDate = dateAdd(AInfo["Expiration Date"],30);
						addStdConditionEffDate("Application Condition", "Application Hold",effDate);
					}
				}else{
					aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/Licnese/Renewal: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
					logDebug("An error occurred retrieving fee item: " + feeDesc);
				}
			}
		}
	}
	
// Set status and deactivate workflow if fees are due
	
//	if (AInfo["License Issued Type"] == "Provisional") {
//		updateTask("Provisional Renewal Review","In Progress","","");
//		deactivateTask("Annual Renewal Review");
//	}else{
//		updateTask("Annual Renewal Review","In Progress","","");
//		deactivateTask("Provisional Renewal Review");
//	}
	if(balanceDue > 0) {
		updateAppStatus("Renewal Fee Due"," ");
		deactivateActiveTasks();
	}
// Invoice all fees if cash payment selected at submission in ACA
	var feeDesc = AInfo["License Type"] + " - Renewal Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
	if(thisFee){
		var hasFee = feeExists(thisFee.feeCode,"NEW");
		if(hasFee) {
			var invNbr = invoiceAllFees();
//			if (AInfo["License Issued Type"] == "Provisional") {
//				updateTask("Provisional Renewal Review","In Progress","","");
//			}else{
//				updateTask("Annual Renewal Review","In Progress","","");
//			}
			updateAppStatus("Renewal Fee Due","Licensee chose Cash Option at checkout");
			deactivateTask("Annual Renewal Review");
			deactivateTask("Provisional Renewal Review");
		}
	}else{
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/License/Renewal: Get Fee: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		logDebug("An error occurred retrieving fee item: " + feeDesc);
	}
//	6467: Create License Case Record for all Provisional License Renewals when a Science Amendment associated to the License Parent Record has not been submitted prior to submission of a Provisional Renewal for that corresponding renewal year
	if (AInfo['License Issued Type'] == "Provisional"){
		var vLicenseID = getParentLicenseCapID(capId);
		var vIDArray = String(vLicenseID).split("-");
		var vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
		var scienceArr = getChildren("Licenses/Cultivator/Amendment/Science",vLicenseID);
		var issueDate = getAppSpecific("Valid From Date",vLicenseID);
		var approvedRen = false;
		var licCaseExclusion = false;
		if (scienceArr) {
			if (scienceArr.length > 0) {
				for (x in scienceArr){
					var scienceCap = scienceArr[x];
					if (getAppSpecific("Associated Renewal",scienceCap) == "Yes"){
						var correspondingYear = getAppSpecific("Renewal Year",scienceCap)
						var thisLic = new licenseObject(null,vLicenseID);
						var licExpDateObj = new Date(thisLic.b1ExpDate);
						var	expYear = licExpDateObj.getFullYear();
						logDebug("expYear: " + expYear);
						if (String(correspondingYear) == String(expYear)){
							var saAppStatus = aa.cap.getCap(scienceCap).getOutput().getCapStatus();
							var workflowResult = aa.workflow.getTasks(scienceCap);
							if (workflowResult.getSuccess()){
								wfObj = workflowResult.getOutput();		
								for (i in wfObj) {
									fTask = wfObj[i];
									var status = fTask.getDisposition();
									var taskDesc = fTask.getTaskDescription();
									if(status != null && taskDesc != null && status != "Physical Modification Approved" && saAppStatus != "Amendment Approved"){
										licCaseExclusion = true;
									}
								}
							}else{
								logDebug("**ERROR: Failed to get workflow object: "+wfObj );
							}
						}
					}
				}
			}
		}
		if (!licCaseExclusion){
			var licCaseId = createChild("Licenses","Cultivator","License Case","NA","",vLicenseID);
			if (licCaseId){
				// Set alt id for the case record based on the number of child case records linked to the license record
				cIds = getChildren("Licenses/Cultivator/License Case/*",vLicenseID);
				if(matches(cIds, null, "", undefined)){
					amendNbr = "000" + 1;
				}else{
					var cIdLen = cIds.length
					if(cIds.length <= 9){
						amendNbr = "000" +  cIdLen;
					}else{
						if(cIds.length <= 99){
							amendNbr = "00" +  cIdLen;
						}else{
							if(cIds.length <= 999){
								amendNbr = "00" +  cIdLen;
							}else{
								amendNbr = cIdLen
							}
						}
					}
				}
				licCaseAltId = licCaseId.getCustomID();
				yy = licCaseAltId.substring(0,2);
				newLCAltId = vLicenseID.getCustomID() + "-LC"+ yy + "-" + amendNbr;
				var updateResult = aa.cap.updateCapAltID(licCaseId, newLCAltId);
				if (updateResult.getSuccess()){
					logDebug("Created License Case: " + newLCAltId + ".");
				}else{ 
					logDebug("Error renaming amendment record " + licCaseId);
				}
				// Copy the Designated resposible Party contact from the License Record to the Case record
				//copyContactsByType_rev(vLicenseID,licCaseId,"Designated Responsible Party");
				
				// Copy custom fields from the license record to the Case record
				holdId = capId;
				capId = vLicenseID;
				PInfo = new Array;
				loadAppSpecific(PInfo);
				capId = holdId;
				editAppSpecific("License Number",vLicenseID.getCustomID(),licCaseId);
				editAppSpecific("License Type",PInfo["License Type"],licCaseId);
				editAppSpecific("Legal Business Name",PInfo["Legal Business Name"],licCaseId);
				editAppSpecific("Premises City",PInfo["Premise City"],licCaseId);
				editAppSpecific("Premises County",PInfo["Premise County"],licCaseId);
				editAppSpecific("Local Authority Type",PInfo["Local Authority Type"],licCaseId);
				editAppSpecific("Case Renewal Type","Renewal Allowed",licCaseId);
				editAppSpecific("Case Description","Provisional Renewal Missing Science Amendment",licCaseId);
				editAppSpecific("Case Opened By","Science - Provisional",licCaseId);
				editAppSpecific("Priority","Moderate",licCaseId);
				editAppName("Renewal Allowed",licCaseId);
				editCapConditionStatus("Application Condition","Provisional Renewal Missing Science Amendment","Condition Met","Not Applied");
			}else{
				logDebug("Failed to create License Case Record for " + vLicenseID.getCustomID());
			}
		}
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
	if(appHasCondition("Notice","Applied","Local Non-Compliance",null))
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
		altId = newAltId  //capId.getCustomID();
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
				editAppName(AInfo["License Issued Type"] + " " + AInfo["Designation Type"] + " - " + AInfo["License Type"],vLicenseID);
			}else{
				editAppName(AInfo["License Issued Type"] + " " + AInfo["Cultivator Type"] + " - " + AInfo["License Type"],vLicenseID);
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
	//		updateAppStatus("Approved","Renewal Fast Tracked");
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
	//attach invoice for all submitted records
	iListResult = aa.finance.getInvoiceByCapID(capId,null);
	if (iListResult.getSuccess()) {
		iList = iListResult.getOutput();
		invNbr = "";
		iFound = false;
		for (iNum in iList){
			fList = aa.invoice.getFeeItemInvoiceByInvoiceNbr(iList[iNum].getInvNbr()).getOutput()
			for (fNum in fList){
				invNbr = iList[iNum].getInvNbr();
				if (!matches(invNbr,null,undefined,"")){
					iFound = true;
					runReportAttach(capId,"CDFA_Invoice_Params","agencyId", "CALCANNABIS","capID",newAltId,"invoiceNbr", String(invNbr));
				}
			}
			if (!iFound){
				  logMessage("Invoice not found");
			}
		}	
	}

} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}