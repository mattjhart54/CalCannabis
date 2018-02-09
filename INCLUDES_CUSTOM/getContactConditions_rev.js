/*===========================================
Title: getContactConditions_rev
Purpose: retrieves contact conditions, including
	the condition ID
Author: Lynda Wacht		
Functional Area : condition
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis story 2896
Parameters:	
	pType: text: condition type
	pStatus: text: condition status
	pDesc: text: condition name
	pImpact: text: lock/hold/notice/required
	capId: capid: optional capid
============================================== */
function getContactConditions_rev(pType, pStatus, pDesc, pImpact) {
try{
	var resultArray = new Array();
	var lang = "en_US";

	var bizDomainModel4Lang = aa.bizDomain.getBizDomainByValue("I18N_SETTINGS", "I18N_DEFAULT_LANGUAGE");
	if (bizDomainModel4Lang.getSuccess())
		lang = bizDomainModel4Lang.getOutput().getDescription();

	if (arguments.length > 4)
		var itemCap = arguments[4]; // use cap ID specified in args
	else
		var itemCap = capId;
	////////////////////////////////////////
	// Check Contacts
	////////////////////////////////////////


	var capContactResult = aa.people.getCapContactByCapID(itemCap);

	if (!capContactResult.getSuccess()) {
		logDebug("**WARNING: getting CAP contact: " + capContactResult.getErrorMessage());
		var conArray = new Array();
	} else {
		var conArray = capContactResult.getOutput();
		if (!conArray)
			conArray = new Array();
	}

	for (var thisCon in conArray)
		if (conArray[thisCon].getCapContactModel().getRefContactNumber()) {
			var conCondResult = aa.commonCondition.getCommonConditions("CONTACT", conArray[thisCon].getCapContactModel().getRefContactNumber());

			if (!conCondResult.getSuccess()) {
				logDebug("**WARNING: getting contact Conditions : " + licCondResult.getErrorMessage());
				var conCondArray = new Array();
			} else {
				var conCondArray = conCondResult.getOutput();
			}

			for (var thisConCond in conCondArray) {
				var thisCond = conCondArray[thisConCond];
				//for(x in thisCond){
				//	if(typeof(thisCond)!="function"){
				//		logDebug(x+": "+ thisCond[x]);
				//	}
				//}
				var cType = thisCond.getConditionType();
				var cStatus = thisCond.getConditionStatus();
				var cDesc = thisCond.getConditionDescription();
				var cImpact = thisCond.getImpactCode();
				var cType = thisCond.getConditionType();
				var cComment = thisCond.getConditionComment();
				var cExpireDate = thisCond.getExpireDate();
				var cNumber = thisCond.conditionNumber;

				if (cType == null)
					cType = " ";
				if (cStatus == null)
					cStatus = " ";
				if (cDesc == null)
					cDesc = " ";
				if (cImpact == null)
					cImpact = " ";
				if (cNumber == null)
					cNumber = " ";

				if ((pType == null || pType.toUpperCase().equals(cType.toUpperCase())) && (pStatus == null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc == null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact == null || pImpact.toUpperCase().equals(cImpact.toUpperCase()))) {
					var r = new condMatchObj;
					r.objType = "Contact";
					r.contactObj = conArray[thisCon];
					r.status = cStatus;
					r.type = cType;
					r.impact = cImpact;
					r.description = cDesc;
					r.comment = cComment;
					r.expireDate = cExpireDate;
					r.condNbr = cNumber;

					var langCond = aa.condition.getCondition(thisCond, lang).getOutput();

					r.arObject = langCond;
					r.arDescription = langCond.getResConditionDescription();
					r.arComment = langCond.getResConditionComment();

					resultArray.push(r);
				}
			}
		}

	return resultArray;
}catch(err){
	logDebug("An error occurred in addContactStdCondition_rev: " + err.message);
	logDebug(err.stack);
}}