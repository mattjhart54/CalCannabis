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
	newStatus: pne of:
	 * COMPLETE = real record
	 * INCOMPLETE TMP = Initial state of partial cap
	 * INCOMPLETE CAP = In process cap/estimate that save and resumed
	 * INCOMPLETE EST = Completed estimate/partial cap
	 * EDITABLE = Complete cap re-opened for ACA edit
	capId: capId: optional capId

============================================== */ 
function resetCapIdStatusClass(newStatus){
try{
	var itemCap = capId;
	if (arguments.length > 1)
		itemCap = arguments[1];
	var capIdStatus = getCapIdStatusClass(itemCap);
	var inCapScriptModel = aa.cap.getCap(itemCap).getOutput();
	var tempCapModel = inCapScriptModel.getCapModel();
	tempCapModel.setCapClass(newStatus);
	var results = aa.cap.editCapByPK(tempCapModel);
	return results;
}catch(err){
	logDebug("An error occurred in resetCapIdStatusClass: " + err.message);
	logDebug(err.stack);
}}