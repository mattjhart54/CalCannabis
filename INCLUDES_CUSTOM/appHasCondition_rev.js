function appHasCondition_rev(pType,pStatus,pDesc,pImpact)
	{
	// 
	// Added parameter for record to check for condition
	//
	if (arguments.length > 4)
			itemId = arguments[4]; // use cap ID specified in args
	if (pType==null)
		var condResult = aa.capCondition.getCapConditions(itemId);
	else
		var condResult = aa.capCondition.getCapConditions(itemId,pType);
		
	if (condResult.getSuccess())
		var capConds = condResult.getOutput();
	else
		{ 
		logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		return false;
		}
	
	var cStatus;
	var cDesc;
	var cImpact;
	
	for (cc in capConds)
		{
		var thisCond = capConds[cc];
		logDebug(thisCond.getConditionStatus() + " " + thisCond.getConditionDescription() + " " + thisCond.getImpactCode() + " " + thisCond.getConditionType());
		var cStatus = thisCond.getConditionStatus();
		var cDesc = thisCond.getConditionDescription();
		var cImpact = thisCond.getImpactCode();
		var cType = thisCond.getConditionType();
		if (cStatus==null)
			cStatus = " ";
		if (cDesc==null)
			cDesc = " ";
		if (cImpact==null)
			cImpact = " ";
		//Look for matching condition
		
		if ( (pStatus==null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc==null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact==null || pImpact.toUpperCase().equals(cImpact.toUpperCase())))
			return true; //matching condition found
		}
	return false; //no matching condition found
} 
	
