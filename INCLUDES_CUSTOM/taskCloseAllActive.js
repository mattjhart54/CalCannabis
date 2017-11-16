function taskCloseAllActive(pStatus,pComment) {
	// Closes all tasks in on the workflow that are Active
	// Optional task names to exclude
	
	var taskArray = new Array();
	var closeAll = false;
	if (arguments.length > 2) { //Check for task names to exclude
		for (var i=2; i<arguments.length; i++)
			taskArray.push(arguments[i]);
	}
	else
		closeAll = true;

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
	else 	{ 
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
		return false; 
	}
	var fTask;
	var stepnumber;
	var processID;
	var dispositionDate = aa.date.getCurrentDate();
	var wfnote = " ";
	var wftask;
	for (i in wfObj) {
		fTask = wfObj[i];
		wftask = fTask.getTaskDescription();
		stepnumber = fTask.getStepNumber();
//		processID = fTask.getProcessID();
		if (closeAll) {
			if(fTask.getActiveFlag() == "Y") {
				updateTask(wftask,pStatus,pComment,"");
				deactivateTask(wftask)
				logMessage("Deactivating Workflow Task " + wftask + " with status " + pStatus);
				logDebug("Deactivating Workflow Task " + wftask + " with status " + pStatus);
			}
		}
		else {
			if (!exists(wftask,taskArray)) {
				if(fTask.getActiveFlag() == "Y") {
					updateTask(wftask,pStatus,pComment,"");
					deactivateTask(wftask)
					logMessage("Deactivating Workflow Task " + wftask + " with status " + pStatus);
					logDebug("Deactivating Workflow Task " + wftask + " with status " + pStatus);
				}
			}
		}
	}
}