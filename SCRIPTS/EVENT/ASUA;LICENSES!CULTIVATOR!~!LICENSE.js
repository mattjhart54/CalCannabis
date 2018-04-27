//Sends license to CAT when status becomes 'Inactive'
try{
	if (appTypeArray[2] != "Temporary") {
		if(matches(appStatus, "Revoked", "Suspended", "Inactive")){
			addToCat(capId);
		}
	}
}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/*/LICENSE: Adding to CAT Set: " + err.message);
	logDebug(err.stack);
}
