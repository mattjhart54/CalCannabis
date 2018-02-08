/*===========================================
Title: convert2RealCAP
Purpose: adds a standard condition with template data
	and returns the condId so it can be further modified
Author: Lynda Wacht		
Functional Area : ACA
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis story 2896
Parameters:
	cType: text: condition type
	cDesc: text: condition name
	capId: capid: optional capid
============================================== */
function addStdConditionWithTemplate(cType, cDesc) {    // optional cap ID
try{
    var itemCap = capId;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
    if (!aa.capCondition.getStandardConditions) {
        logDebug("addStdCondition function is not available in this version of Accela Automation.");
    }
    else {
        standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
        for (i = 0; i < standardConditions.length; i++)
            if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
        {
            standardCondition = standardConditions[i];
            var addCapCondResult = aa.capCondition.createCapConditionFromStdCondition(itemCap, standardCondition.getConditionNbr());
            logDebug("addCapCondResult.getOutput(): " + addCapCondResult.getOutput());
			if (addCapCondResult.getSuccess()) {
                logDebug("Successfully added condition (" + standardCondition.getConditionDesc() + ")");
				return addCapCondResult.getOutput();
            }
            else {
                logDebug("**ERROR: adding condition (" + standardCondition.getConditionDesc() + "): " + addCapCondResult.getErrorMessage());
				return false;
            }
        }
    }
}catch(err){
	logDebug("An error occurred in addStdConditionWithTemplate: " + err.message);
	logDebug(err.stack);
}}