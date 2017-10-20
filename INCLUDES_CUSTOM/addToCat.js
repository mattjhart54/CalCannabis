function addToCat(capId) {
    try {
        var SET_ID = 'CAT_UPDATES';
        var createResult = createSetIfNeeded();
        if (!createResult.getSuccess()) {
            logDebug("**ERROR: Failed to create CAT_UPDATES set: " + createResult.getErrorMessage());
            return false;
        }
        var addResult = aa.set.add(SET_ID, capId);
        if (!addResult.getSuccess()) {
            logDebug("**ERROR: Failed to add [" + capId + "] to CAT_UPDATES set: " + addResult.getErrorMessage());
            return false;
        }
    } catch (err) {
        logDebug("A JavaScript Error occurred: addToCat: " + err.message);
        logDebug(err.stack);
    }
}

function createSetIfNeeded() {
    var theSetResult = aa.set.getSetByPK(SET_ID);
    if (!theSetResult.getSuccess()) {
        theSetResult = aa.set.createSet(SET_ID, SET_ID, null, null);
    }

    return theSetResult;
}