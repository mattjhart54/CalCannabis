/*===========================================
Title: addToCat
Purpose: Add the given capId to the CAT_UPDATES set. These records will be sent to the CAT API
Author: John Towell

Parameters:
	capId: table model
============================================== */
function addToCat(capId) {
    try {
        var SET_ID = 'CAT_UPDATES';
        var createResult = createSetIfNeeded(SET_ID);
        if (!createResult.getSuccess()) {
            logDebug("**ERROR: Failed to create " + SET_ID + " set: " + createResult.getErrorMessage());
            return false;
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

    /**
     * PRIVATE FUNCTIONS
     */

    /**
     * Creates the set if needed.
     */
    function createSetIfNeeded(setId) {
        var theSetResult = aa.set.getSetByPK(setId);
        if (!theSetResult.getSuccess()) {
            theSetResult = aa.set.createSet(setId, setId, null, null);
        }

        return theSetResult;
    }
}

