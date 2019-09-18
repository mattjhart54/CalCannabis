//lwacht: 080816: prototype
try{
//	var parCapArr=AInfo["Parent ID"].split("-");
	vLicenseID = getParentLicenseCapID(capId);
	vIDArray = String(vLicenseID).split("-");
	vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
	if (vLicenseID != null) {
// Get current expiration date.
		vLicenseObj = new licenseObject(null, vLicenseID);
		vExpDate = vLicenseObj.b1ExpDate;
		vExpDate = new Date(vExpDate);
// Extend license expiration by 1 year
		vExpYear = vExpDate.getFullYear() + 1;
		logDebug("New Year " + vExpYear);
//	var parCapId = aa.cap.getCapID(parCapArr[0],parCapArr[1],parCapArr[2]).getOutput();
//	if (parCapId != null) {
		var newAltId = vLicenseID.getCustomID() + "-" + vExpYear;
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}

//lwacht: 080816: prototype end