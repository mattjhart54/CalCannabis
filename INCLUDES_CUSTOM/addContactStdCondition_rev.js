/*===========================================
Title: addContactStdCondition_rev
Purpose: adds a standard condition to a contact
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
function addContactStdCondition_rev(contSeqNum,cType, cDesc) {    // optional cap ID
try{
	var foundCondition = false;
	var javascriptDate = new Date()
	var javautilDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());
	cStatus = "Applied";
	if (arguments.length > 3)
		cStatus = arguments[3]; // use condition status in args	
	if (!aa.capCondition.getStandardConditions){
		logDebug("addAddressStdCondition function is not available in this version of Accela Automation.");
	}else{
		standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
		for(i = 0; i<standardConditions.length;i++){
			if(standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) {
				standardCondition = standardConditions[i]; // add the last one found
				foundCondition = true;
				if (!contSeqNum) {
					var capContactResult = aa.people.getCapContactByCapID(capId);
					if (capContactResult.getSuccess()){
						var Contacts = capContactResult.getOutput();
						for (var contactIdx in Contacts){
							var contactNbr = Contacts[contactIdx].getCapContactModel().getPeople().getRefContactNumber();
							if (contactNbr){
								var newCondition = aa.commonCondition.getNewCommonConditionModel().getOutput();
								newCondition.setServiceProviderCode(aa.getServiceProviderCode());
								newCondition.setEntityType("CONTACT");
								newCondition.setEntityID(contactNbr);
								newCondition.setConditionDescription(standardCondition.getConditionDesc());
								newCondition.setConditionGroup(standardCondition.getConditionGroup());
								newCondition.setConditionType(standardCondition.getConditionType());
								newCondition.setConditionComment(standardCondition.getConditionComment());
								newCondition.setImpactCode(standardCondition.getImpactCode());
								newCondition.setConditionStatus(cStatus)
								newCondition.setAuditStatus("A");
								newCondition.setIssuedByUser(systemUserObj);
								newCondition.setIssuedDate(javautilDate);
								newCondition.setEffectDate(javautilDate);
								newCondition.setAuditID(currentUserID);
								var addContactConditionResult = aa.commonCondition.addCommonCondition(newCondition);
								if (addContactConditionResult.getSuccess()){
									logDebug("Successfully added reference contact (" + contactNbr + ") condition: " + cDesc);
									var thisC = addContactConditionResult.getOutput();
									return thisC.toString();
								}else{
									logDebug( "**ERROR: adding reference contact (" + contactNbr + ") condition: " + addContactConditionResult.getErrorMessage());
									return false;
								}
							}
						}
					}
				}else{
					var newCondition = aa.commonCondition.getNewCommonConditionModel().getOutput();
					newCondition.setServiceProviderCode(aa.getServiceProviderCode());
					newCondition.setEntityType("CONTACT");
					newCondition.setEntityID(contSeqNum);
					newCondition.setConditionDescription(standardCondition.getConditionDesc());
					newCondition.setConditionGroup(standardCondition.getConditionGroup());
					newCondition.setConditionType(standardCondition.getConditionType());
					newCondition.setConditionComment(standardCondition.getConditionComment());
					newCondition.setImpactCode(standardCondition.getImpactCode());
					newCondition.setConditionStatus(cStatus)
					newCondition.setAuditStatus("A");
					newCondition.setIssuedByUser(systemUserObj);
					newCondition.setIssuedDate(javautilDate);
					newCondition.setEffectDate(javautilDate);
					newCondition.setAuditID(currentUserID);
					var addContactConditionResult = aa.commonCondition.addCommonCondition(newCondition);
					if (addContactConditionResult.getSuccess()){
						logDebug("Successfully added reference contact (" + contSeqNum + ") condition: " + cDesc);
						var thisC = addContactConditionResult.getOutput();
						return thisC.toString();
					}else{
						logDebug( "**ERROR: adding reference contact (" + contSeqNum + ") condition: " + addContactConditionResult.getErrorMessage());
						return false;
					}
				}
			}
		}
	}
	if (!foundCondition){
		logDebug( "**WARNING: couldn't find standard condition for " + cType + " / " + cDesc);
		return false;
	}
}catch(err){
	logDebug("An error occurred in addContactStdCondition_rev: " + err.message);
	logDebug(err.stack);
}}