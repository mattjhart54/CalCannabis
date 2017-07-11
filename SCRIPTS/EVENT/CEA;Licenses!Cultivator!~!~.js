try {
	updateLegalBusinessName();

}catch (err){
	logDebug("A JavaScript Error occurred: CEA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CEA:Licenses/Cultivation/*/Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}