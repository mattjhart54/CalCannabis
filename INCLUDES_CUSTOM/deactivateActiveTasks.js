function deactivateActiveTasks(processName) {

    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    for (i in wfObj) {
        fTask = wfObj[i];
        if (fTask.getProcessCode().equals(processName) || processName == null)
            if (fTask.getActiveFlag().equals("Y"))
                deactivateTask(fTask.getTaskDescription());
    }

}