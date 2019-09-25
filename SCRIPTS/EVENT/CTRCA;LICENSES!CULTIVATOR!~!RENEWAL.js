try{
	vLicenseID = getParentLicenseCapID(capId);
	vIDArray = String(vLicenseID).split("-");
	vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
	if (vLicenseID != null) {
// Get current expiration date.
		vLicenseObj = new licenseObject(null, vLicenseID);
		vExpDate = vLicenseObj.b1ExpDate;
		vExpDate = new Date(vExpDate);
// Extend license expiration by 1 year and append to record number
		vExpYear = vExpDate.getFullYear() + 1;
		var newAltId = vLicenseID.getCustomID() + "-" + vExpYear;
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
	}
// Copy business contact from license
	copyContactsByType(vLicenseID,capId,"Business");
// Add condition effective in thirty days if Late Fee not paid	
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
// Invoice all fees if cash payment selected art submission
	var feeDesc = AInfo["License Type"] + " - Renewal Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
	if(thisFee){
		var hasFee = feeExists(thisFee.feeCode,"NEW");
		if(hasFee) {
			var invNbr = invoiceAllFees();
			updateAppStatus("Renewal Fee Due","Licensee chose Cash Option at checkout");
			deactivateTask("Renewal Review");
		}
	}else{
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/License/Renewal: Get Fee: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		logDebug("An error occurred retrieving fee item: " + feeDesc);
	}

} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
