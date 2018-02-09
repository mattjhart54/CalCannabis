/*===========================================
Title: addContactStdCondition_rev
Purpose: adds a standard condition to a contact, allows the
	short comments field to be updated 
	and returns the condId so it can be further modified
Author: Lynda Wacht		
Functional Area : condition
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis story 2896
Parameters:	
	contSeqNum: number: contact reference sequence number
	cType: text: condition type
	cDesc: text: condition name
	addComment: text: added to the short comments
	capId: capid: optional capid
============================================== */
function addContactStdCondition_rev(contSeqNum,cType, cDesc, addComment) {    // optional cap ID
try{
	var foundCondition = false;
	var javascriptDate = new Date()
	var javautilDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());
	cStatus = "Applied";
	if (arguments.length > 4)
		cStatus = arguments[4]; // use condition status in args	
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
								if(addComment!=null){
									var condComment = standardCondition.getConditionComment() + ": " + addComment;
								}else{
									var condComment = standardCondition.getConditionComment() ;
								}
								newCondition.setConditionComment(condComment);
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
					if(addComment!=null){
						var condComment = standardCondition.getConditionComment() + ": " + addComment;
					}else{
						var condComment = standardCondition.getConditionComment() ;
					}
					newCondition.setConditionComment(condComment);
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