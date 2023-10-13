//User Story 7153 - Send Inactive Record to CATUPDATE
try{
	if(matches(taskStatus("License Status"),"Inactive","Active","Limited Operations")){
		var capId = aa.cap.getCapID(capIDString).getOutput();
		addToCat(capId);
	}
	
	//User Story 7703 - Satisfy 'Suspension Lift Notice' Condition when workflow status is 'Limited Operations'
	if(wfTask == "License Status" && wfStatus == "Limited Operations") {
		if(appHasCondition("Application Condition", "Applied", "Suspension Lift Notice", null)) {
			editCapConditionStatus("Application Condition", "Suspension Lift Notice", "Condition Met", "Not Applied");
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/LICENSE: Adding to CAT Set: " + err.message);
	logDebug(err.stack);
}
