function editCapConditionEffDate(pType,pDesc,pStatus,pEffDate) {
    // updates a condition with the pEffDate
    // returns true if updates, false if not
    // updates if condtion status is equal pStatus 
    // all parameters are required

    var itemCap = capId;
    if (arguments.length > 4) {
        itemCap = arguments[4];
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
        var cDesc = thisCond.getConditionDescription();
        var cStatus = thisCond.getConditionStatus();
        var cStatusType = thisCond.getConditionStatusType();
   
        if (cDesc.toUpperCase() == pDesc.toUpperCase()) {
            if (pStatus.toUpperCase().equals(cStatus.toUpperCase())) {
            	eDate = aa.date.parseDate(pEffDate)
                thisCond.setEffectDate(eDate);
                aa.capCondition.editCapCondition(thisCond);
                conditionUpdated = true; // condition has been found and updated
            } 
        }
    }    
    if (conditionUpdated) {
        logDebug("Condition has been found and updated with effective date: " + pEffDate);
    } 
    else{
        logDebug("ERROR: no matching condition found");
    }
    return conditionUpdated; 
}