function checkWorkflowTaskAndStatus(capId, workflowTask, taskStatus) {
	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		aa.print("**ERROR: Failed to get workflow object: "+wfObj );
		return false;
	}
	
	for (i in wfObj) {
		fTask = wfObj[i];
		var status = fTask.getDisposition();
		var taskDesc = fTask.getTaskDescription();
		
		if(status != null && taskDesc != null && taskDesc.equals(workflowTask) && status.equals(taskStatus))
			return true;
	}
	
	return false;
}