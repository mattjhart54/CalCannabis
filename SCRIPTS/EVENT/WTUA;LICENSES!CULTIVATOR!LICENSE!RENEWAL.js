try {
	if (matches(wfTask,"Renewal Review","Annual Renewal Review","Provisional Renewal Review") && wfStatus == "Approved") {
		var vLicenseID;
		var vIDArray;
		var renewalCapProject;
		var vExpDate;
		var vNewExpDate;
		var vLicenseObj;
	// Get the parent license
		vLicenseID = getParentLicenseCapID(capId);
		vIDArray = String(vLicenseID).split("-");
		vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
		licAltId = vLicenseID.getCustomID();
		altId = capId.getCustomID();
		if (vLicenseID != null) {
	// Get current expiration date.
			vLicenseObj = new licenseObject(null, vLicenseID);
			vExpDate = vLicenseObj.b1ExpDate;
			vExpDate = new Date(vExpDate);
	// Extend license expiration by 1 year
			vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
	// Update license expiration date
			logDebug("Updating Expiration Date to: " + vNewExpDate);
			vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
	// Set license record expiration and status to active
			vLicenseObj.setStatus("Active");
			updateAppStatus("Active","License Renewed",vLicenseID);
	// Update the Cultivation Type on the license record
			if(AInfo["Designation Change"] == "Yes") {
				editAppSpecific("Cultivator Type",AInfo["Designation Type"],vLicenseID);
				editAppName(AInfo["License Issued Type"] + " " + AInfo["Designation Type"] + " - " + AInfo["License Type"],vLicenseID);
			}else{
				editAppName(AInfo["License Issued Type"] + " " + AInfo["Cultivator Type"] + " - " + AInfo["License Type"],vLicenseID);
			}
	//Set renewal to complete, used to prevent more than one renewal record for the same cycle
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
			if (renewalCapProject != null) {
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);
			}
			
	//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
			if (AInfo["License Issued Type"] == "Provisional"){
				var approvalLetter = "Provisional Renewal Approval";
				var emailTemplate = "LCA_RENEWAL_APPROVAL";
			}else{
				var approvalLetter = "";
				var emailTemplate = "LCA_ANNUAL_RENEWAL_APPROVAL";
			}
			var scriptName = "asyncRunOfficialLicenseRpt";
			var envParameters = aa.util.newHashMap();
			envParameters.put("licType", "");
			envParameters.put("appCap",altId);
			envParameters.put("licCap",licAltId); 
			envParameters.put("reportName","Official License Certificate");
			envParameters.put("approvalLetter", approvalLetter);
			envParameters.put("emailTemplate", emailTemplate);
			envParameters.put("reason", "");
			envParameters.put("currentUserID",currentUserID);
			envParameters.put("contType","Designated Responsible Party");
			envParameters.put("fromEmail",sysFromEmail);
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
							setAddResult=aa.set.add(sName,vLicenseID);
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
			addToCat(vLicenseID);
		}
		if(balanceDue>0){
			// Remove Late Fees
			if (AInfo['Waive Late Fee'] == "CHECKED"){
				var feeDesc = AInfo["License Type"] + " - Late Fee";
				var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
				if(thisFee){
					var hasFee = feeExists(thisFee.feeCode);
					if(hasFee) {
						voidRemoveFeesByDesc(feeDesc);
						var scriptName = "asyncRunBalanceDueRpt";
						var envParameters = aa.util.newHashMap();
						envParameters.put("altId",capId.getCustomID()); 
						envParameters.put("reportName","Balance Due Report"); 
						envParameters.put("contType","Designated Responsible Party"); 
						envParameters.put("currentUserID",currentUserID);
						envParameters.put("fromEmail",sysFromEmail);
						aa.runAsyncScript(scriptName, envParameters);
					}
				}
			}
			updateAppStatus("Deferral Approved", "Updated via WTUA:LICENSES/CULTIVATOR/*/Renewal.");
		}
	}
	//Removing as per 6355, 6313, 6314, 6315
	/*if (matches(wfTask,"Annual Renewal Review","Provisional Renewal Review") && wfStatus == "Recommended for Denial") {
		var vLicenseID;
		var vIDArray;
		var renewalCapProject;
		var vExpDate;
		var vNewExpDate;
		var vLicenseObj;
	// Get the parent license
		vLicenseID = getParentLicenseCapID(capId);
		vIDArray = String(vLicenseID).split("-");
		vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
		licAltId = vLicenseID.getCustomID();
		if (vLicenseID != null) {
	// Set license record expiration and status to inactive
			vLicenseObj = new licenseObject(null, vLicenseID);
			vLicenseObj.setStatus("Inactive");
	//		updateAppStatus("Inactive","License Renewed",vLicenseID);
	//Set renewal to complete, used to prevent more than one renewal record for the same cycle
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
			if (renewalCapProject != null) {
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);
			}
	// Add record to the CAT set
			addToCat(vLicenseID);
		}
	}*/
	if (wfTask == "License Manager" && wfStatus == "Revisions Required") {
		reactivateActiveTasksWithStatus("Recommended for Denial");
		deactivateTask("License Manager");
	}			
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: " + err.message);
	logDebug(err.stack);
}