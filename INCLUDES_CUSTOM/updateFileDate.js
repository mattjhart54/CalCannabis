/*===========================================
Title: validateEmail
Purpose: 180206: story 5200: update file date, usually to submission date
Author: Lynda Wacht		
Functional Area : date
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : 
Parameters: 
	newDate: date: date to push date to
============================================== */
function updateFileDate(newDate){
try{
	var capMdl = aa.cap.getCap(capId).getOutput(); //returns CapScriptModel object
	var tDay = dateAdd(newDate,0);
	var thisDate = aa.date.parseDate(tDay)
	var updFileDt = capMdl.setFileDate(thisDate);
	var capModel = capMdl.getCapModel();
	setDateResult = aa.cap.editCapByPK(capModel);
	if (!setDateResult.getSuccess()) {
		logDebug("**WARNING: error setting file date : " + setDateResult.getErrorMessage());
		return false;
	}else{
		logDebug("File date successfully updated to " + tDay);
		return true;
	}
} catch(err){
	logDebug("An error occurred in validateEmail: " + err.message);
	logDebug(err.stack);
}}


