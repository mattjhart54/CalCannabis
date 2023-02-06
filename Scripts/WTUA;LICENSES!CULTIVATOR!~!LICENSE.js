//User Story 7153 - Send Inactive Record to CATUPDATE
try{
	if(matches(taskStatus("License Status"),"Inactive","Active")){
		var capId = aa.cap.getCapID(capIDString).getOutput();
		addToCat(capId);
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/LICENSE: Adding to CAT Set: " + err.message);
	logDebug(err.stack);
}