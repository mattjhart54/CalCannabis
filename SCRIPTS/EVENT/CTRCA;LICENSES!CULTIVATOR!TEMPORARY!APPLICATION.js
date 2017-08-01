//lwacht
//add parent if app number provided
try{
	if(!matches(AInfo["App Number"],null,"", "undefined"){
		addParent(AInfo["App Number"]);
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Remove Conditions: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Remove Conditions: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
