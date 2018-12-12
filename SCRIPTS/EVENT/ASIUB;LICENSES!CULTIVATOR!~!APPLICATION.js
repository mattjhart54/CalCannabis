// MHART 121118 user Story 5831 - Owner Table Percentage Check
try{
	if(!publicUser) {
		var totPct = 0;
		if (typeof(OWNERS) == "object") {
			for(x in OWNERS) {
				var ownPct = parseFloat(OWNERS[x]["Percent Ownership"]);
				totPct = totPct + ownPct 
			}
		}
		if (totPct > 100 || totPct < 0) {
			cancel = true;
			showMessage = true;
			comment("The total Percent Ownership must be greatthan 0 and less than 100.")
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Percent Ownership: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}