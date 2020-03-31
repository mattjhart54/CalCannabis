function editCapConditionStatus(pType,pDesc,pStatus,pStatusType) {
    // updates a condition with the pType and pDesc
    // to pStatus and pStatusType, returns true if updates, false if not
    // will not update if status is already pStatus && pStatusType
    // all parameters are required except for pType
    // optional fromStatus for 5th paramater
    // optional capId for 6th parameter

    var itemCap = capId;
    var fromStatus = "";

    if (arguments.length > 4) {
        fromStatus = arguments[4];
    }   

    if (arguments.length > 5) {
        itemCap = arguments[5];
    }

    if (pType==null)
        var condResult = aa.capCondition.getCapConditions(itemCap);
    else
        var condResult = aa.capCondition.getCapConditions(itemCap,pType);
        
    if (condResult.getSuccess())
        var capConds = condResult.getOutput();
    else
        { 
        logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
        logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
        return false;
        }

    var conditionUpdated = false;

    for (cc in capConds) {
        var thisCond = capConds[cc];
        var cStatus = thisCond.getConditionStatus();
        var cStatusType = thisCond.getConditionStatusType();
        var cDesc = thisCond.getConditionDescription();
        var cImpact = thisCond.getImpactCode();
        logDebug(cStatus + ": " + cStatusType);
        
        if (cDesc.toUpperCase() == pDesc.toUpperCase()) {
            if (fromStatus.toUpperCase().equals(cStatus.toUpperCase()) || fromStatus == "") {
                thisCond.setConditionStatus(pStatus);
                thisCond.setConditionStatusType(pStatusType);
                thisCond.setImpactCode("");
                aa.capCondition.editCapCondition(thisCond);
                conditionUpdated = true; // condition has been found and updated
            } 
        }
    }
    
    
    if (conditionUpdated) {
        logDebug("Condition has been found and updated to a status of: " + pStatus);
    } else {
        logDebug("ERROR: no matching condition found");
    }
    
    return conditionUpdated; //no matching condition found

}