try{
	if(documentUploadedFrom == "ACA"){
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess())
			var wfObj = workflowResult.getOutput();
		else 	{ 
			logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
			return false; 
		}
		var fTask;
		var wftask;
		for (i in wfObj) {
			fTask = wfObj[i];
			if(matches(fTask.getTaskDescription(),"Science Amendment Review","Science Manager Review")){
				if (matches(fTask.getDisposition(),"Amendment Rejected","Recommended for Transition","Physical Modification Approved","Approved for Provisional Renewal","In Progress","Revisions Required","Transition Amendment Approved")){
					cancel = true;		
					showMessage = true;
					comment("The Science Amendment has been finalized. To upload additional documents, please submit a new Science Amendment. For further questions please contact CalCannabis at 1-833-CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.");
				}
			}		
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: No Documents: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: " + documentModel);
}