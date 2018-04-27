/*===========================================
Title: addToCat
Purpose: Add the given capId to the CAT_UPDATES set. These records will be sent to the CAT API
Author: John Towell

Parameters:
	capId: record id
============================================== */
//lwacht: 180417: story 5411: removing function as it's not called anywhere else
function addToCat(capId) {
    try {
        var SET_ID = 'CAT_UPDATES';
        var theSetResult = aa.set.getSetByPK(SET_ID);
        if (!theSetResult.getSuccess()) {
            theSetResult = aa.set.createSet(SET_ID, SET_ID, null, null);
			if (!theSetResult.getSuccess()) {
				logDebug("**ERROR: Failed to create " + SET_ID + " set: " + createResult.getErrorMessage());
				return false;
			}
		}
		var addResult = aa.set.add(SET_ID, capId);
		if (!addResult.getSuccess()) {
			logDebug("**ERROR: Failed to add [" + capId + "] to " + SET_ID + " set: " + addResult.getErrorMessage());
			return false;
		}
    } catch (err) {
        logDebug("A JavaScript Error occurred: addToCat: " + err.message);
        logDebug(err.stack);
    }
    return true;
}
//lwacht: 180417: story 5411: end
