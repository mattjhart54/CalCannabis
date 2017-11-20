/*===========================================
Title: resetCapIdStatusClass
Purpose: if someone goes through the 
		pageflow again from the review page,
		they get to go through the whole
		process again, so documents and such
		get updated
Author: Lynda Wacht		
Functional Area : page flow
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis
Parameters:
	capId: capId: optional capId
	contactType: text: The type of contact to whom the email/report should be sent

============================================== */ 
function resetCapIdStatusClass(){
try{
	var itemCap = capId;
	if (arguments.length > 0)
		itemCap = arguments[0];
	var capIdStatus = getCapIdStatusClass(itemCap);
	if(matches(capIdStatus,"INCOMPLETE EST","INCOMPLETE CAP")){
	    var tempCapModel = inCapScriptModel.getCapModel();
		tempCapModel.setCapClass("INCOMPLETE TMP");
		var results = aa.cap.editCapByPK(tempCapModel);
		return results.getSuccess();
	}
}catch(err){
	logDebug("An error occurred in resetCapIdStatusClass: " + err.message);
	logDebug(err.stack);
}}