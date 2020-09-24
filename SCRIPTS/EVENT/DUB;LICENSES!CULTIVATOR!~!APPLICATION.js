try{
	if(documentUploadedFrom == "ACA"){
		var denyAttachment = false;
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess()){
			var wfObj = workflowResult.getOutput();
		}else{ 
			logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());  
		}
		var fTask;
		var wftask;
		for (i in wfObj) {
			fTask = wfObj[i];
			if(fTask.getTaskDescription().equals("Scientific Review")){
				if (fTask.getDisposition().equals("Scientific Review Completed")){
					denyAttachment = true;
					break;
				}
			}
			if(fTask.getTaskDescription().equals("Science Manager Review")){
				if (matches(fTask.getDisposition(),"In Progress","Recommended for Denial","Science Manager Review Completed")){
					denyAttachment = true
					break;
				}
				if (fTask.getDisposition().equals("Disqualified")){
					disqualifiedStatus = true
					break;
				}
			}
			if(fTask.getTaskDescription().equals("Final Review")){
				if (matches(fTask.getDisposition(),"Approved for Annual License","Approved for Provisional License")){
					denyAttachment = true
					break;
				}
			}
			if(fTask.getTaskDescription().equals("Application Disposition")){
				if (matches(fTask.getDisposition(),"Closed","License Issued","Provisional License Issued")){
					denyAttachment = true
					break;
				}
			}
			if(fTask.getTaskDescription().equals("License Manager")){
				if (fTask.getDisposition().equals("Denied")){
					denyAttachment = true
					break;
				}
				if (fTask.getActiveFlag().equals("Y")){
					if (fTask.getDisposition().equals("Revisions Required")){
						denyAttachment = true
						break;
					}
				}
			}					
		}
		if (denyAttachment){
			cancel = true;		
			showMessage = true;
			comment("To upload additional documents, please submit a new amendment. For further questions please contact CalCannabis at 1-833-CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.");
		}
		if (disqualifiedStatus){
			cancel = true;		
			showMessage = true;
			comment("This application has been placed on hold. Please contact CalCannabis Cultivation Licensing by calling (833) CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.");
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: No Documents: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: " + documentModel);
}