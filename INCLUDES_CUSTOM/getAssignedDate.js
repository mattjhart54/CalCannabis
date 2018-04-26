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
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess()){
  	 	var wfObj = workflowResult.getOutput();
		for (i in wfObj) {
			fTask = wfObj[i];
			wfTask = fTask.getTaskDescription();
			if(wfTask==taskName){
				var asgnDate = fTask.getAssignmentDate();
				if(isNaN(asgnDate)){
					logDebug("Assigned date for " + taskName + ": " + convertDate(asgnDate));
					return convertDate(fTask.getAssignmentDate());
				}else{
					logDebug("No assigned date for " + taskName + " (" + asgnDate + ")");
					return false;
				}
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