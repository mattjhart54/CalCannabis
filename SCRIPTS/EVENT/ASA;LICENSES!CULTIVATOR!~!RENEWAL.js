//lwacht
//update AltId
//lwacht: commenting out and putting in CTRCA

try{
	if(AInfo["Changes"]=="Y") {
		var expDate = dateAddMonths(null,12);
		setLicExpirationDate(parentCapId,null,expDate,"Active");
		emailRptContact("PRA", "LCA_APP_APPROVAL_PAID", "Official License Certificate", true, capStatus, capId, "Designated Responsible Party", "altId", parCapId.getCustomID());
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/RENEWAL: Update AltId: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
