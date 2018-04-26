/*===========================================
Title: emailDrpPriContacts
Purpose: Email the DRP and/or Primary contact 
		 depending on their preferred channel
		Note: This is intended for a very 
		specific purpose and will not be able
		to be used outside of that
Author: Lynda Wacht		
Functional Area : Workflow
Description : Gets the assigned date for a workflow task
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis
Parameters:
	taskName: Text: name of the task for which the assigned date is desired
	capId: capid: optional capid
============================================== */

function getAssignedDate(taskName){
try{
	if (arguments.length > 1)
		var itemCap = arguments[1]; // use cap ID specified in args
	else
		var itemCap = capId;
	var workflowResult = aa.workflow.getTasks(itemCap);
 	if (workflowResult.getSuccess()){
  	 	var wfObj = workflowResult.getOutput();
		for (i in wfObj) {
			fTask = wfObj[i];
			wfTask = fTask.getTaskDescription();
			if(wfTask==taskName){
				logDebug("Assigned date for " + taskName + ": " + convertDate(fTask.getAssignmentDate()));
				return fTask.getAssignmentDate();
			}
		}
  	}else{ 
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
		return false; 
	}
	logDebug("Task " + taskName + " not found.  Returning false.");
	return false;
}catch (err){
	logDebug("A JavaScript Error occurred: getAssignedDate " + err.message);
	logDebug(err.stack);
}}