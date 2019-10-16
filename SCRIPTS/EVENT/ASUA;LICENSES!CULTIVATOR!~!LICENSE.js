//Sends license to CAT when status becomes 'Inactive'
try{
	if (appTypeArray[2] != "Temporary") {
		if(matches(appStatus, "Cancelled","Expired","Revoked","Surrendered", "Suspended", "Inactive")){
	//		addToCat(capId);
			var SET_ID = 'CAT_UPDATES';
			var theSetResult = aa.set.getSetByPK(SET_ID);
			if (!theSetResult.getSuccess()) {
				theSetResult = aa.set.createSet(SET_ID, SET_ID, null, null);
				if (!theSetResult.getSuccess()) {
					logDebug("**ERROR: Failed to create " + SET_ID + " set: " + createResult.getErrorMessage());
			//		return false;
				}
			}
			logDebug("capId " + capId);
			var addResult = aa.set.add(SET_ID, capId);
			if (!addResult.getSuccess()) {
				logDebug("**ERROR: Failed to add [" + capId + "] to " + SET_ID + " set: " + addResult.getErrorMessage());
			//	return false;
			}
		}
	}

}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/*/LICENSE: Adding to CAT Set: " + err.message);
	logDebug(err.stack);
}
//MJH 190411 story 5977 - Revoke application when license is revoked
try {
	if(capStatus == "Revoked") { 
		childRecs = getChildren("Licenses/Cultivator/*/Application");
		var holdId = capId;
		for (c in childRecs) {
			capId = childRecs[c];
			childCap = aa.cap.getCap(capId).getOutput();
			childStatus = childCap.getCapStatus();
			childTypeResult = childCap.getCapType();	
			childTypeString = childTypeResult.toString();	
			childTypeArray = childTypeString.split("/");
			childAltId = capId.getCustomID();
			if(matches(childTypeArray[2], "Adult Use","Medical","Temporary")) 
				updateAppStatus("License Revoked","updated by script",capId);	
		}
		var capId = holdId;
	}
}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/*/LICENSE: License Revoked: " + err.message);
	logDebug(err.stack);
}
//MJH 190411 story 5977 - end
