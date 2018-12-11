try{
	var totPct = 0;
	if (typeof(OWNERS) == "object") {
		for(x in OWNERS) {
			totPct = totPct + OWNERS[x]["Percent Ownership"] 
		}
	}
	if (totPct > 100) {
		showMessage = true;
		cancel = true;
		comment("The total Percent Ownership cannot be greater than 100%.")
	}
} catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Percent Ownership: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}