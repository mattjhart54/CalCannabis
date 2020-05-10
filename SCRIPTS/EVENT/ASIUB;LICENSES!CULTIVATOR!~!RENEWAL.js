// JSHEAR 05082020 user Story 6519 - Covid Payment Deferral
try{
	if(!publicUser) {
		var appStatus = getAppStatus();
		if (AInfo['Deferral Approved'] == "CHECKED" && appStatus != "Renewal Fee Due"){
			cancel = true;
			showMessage = true;
			comment("Record Status must be 'Renewal Fee Due' in order the Defer payment");	
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/RENEWAL: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/RENEWAL: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}