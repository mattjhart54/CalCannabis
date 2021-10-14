
function getDispositionDate(taskName){
try{
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess()){
  	 	var wfObj = workflowResult.getOutput();
		for (i in wfObj) {
			fTask = wfObj[i];
			wfTask = fTask.getTaskDescription();
			if(wfTask==taskName){
				var dispDate = fTask.getDispositionDate();
				if(isNaN(dispDate)){
					logDebug("Assigned date for " + taskName + ": " + convertDate(dispDate));
					return convertDate(fTask.getAssignmentDate());
				}else{
					logDebug("No assigned date for " + taskName + " (" + dispDate + ")");
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
	logDebug("A JavaScript Error occurred: getDispositionDate " + err.message);
	logDebug(err.stack);
}}