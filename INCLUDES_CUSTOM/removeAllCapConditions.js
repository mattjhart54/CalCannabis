//remove all the conditions before add them. 
function removeAllCapConditions() {
    var capCondResult = aa.capCondition.getCapConditions(capId);

    if (!capCondResult.getSuccess())
    { logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()); return false }

    var ccs = capCondResult.getOutput();
    for (pc1 in ccs) {
        var rmCapCondResult = aa.capCondition.deleteCapCondition(capId, ccs[pc1].getConditionNumber());
        if (rmCapCondResult.getSuccess())
            logDebug("Successfully removed condition to CAP : " + capId + ". Condition Description:" + ccs[pc1].getConditionDescription());
    }

}