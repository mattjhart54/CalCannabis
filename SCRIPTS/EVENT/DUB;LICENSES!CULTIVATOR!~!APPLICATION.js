try{
	if(documentUploadedFrom == "ACA"){
		var denyAttachment = false;
		var disqualifiedStatus = false;
		var errorMessage = "To upload additional documents, please submit a new amendment. For further questions please contact CalCannabis at 1-833-CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.";
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
			
			if(fTask.getTaskDescription().equals("Administrative Manager Review")){
				if (fTask.getDisposition().equals("Disqualified")){
					denyAttachment = true
					errorMessage = "This application has been placed on hold. Please contact CalCannabis Cultivation Licensing by calling (833) CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.";
				}
			}						
			if(fTask.getTaskDescription().equals("Scientific Review")){
				if (fTask.getDisposition().equals("Scientific Review Completed")){
					denyAttachment = true;
				}
			}
			if(fTask.getTaskDescription().equals("Science Manager Review")){
				if (matches(fTask.getDisposition(),"Recommended for Denial","Science Manager Review Completed")){
					denyAttachment = true
				}
				if (fTask.getDisposition().equals("Disqualified")){
					denyAttachment = true
					errorMessage = "This application has been placed on hold. Please contact CalCannabis Cultivation Licensing by calling (833) CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.";
				}
			}
			if(fTask.getTaskDescription().equals("Final Review")){
				if (matches(fTask.getDisposition(),"Approved for Annual License","Approved for Provisional License")){
					denyAttachment = true
				}
			}
			if(fTask.getTaskDescription().equals("Application Disposition")){
				if (matches(fTask.getDisposition(),"Closed","License Issued","Provisional License Issued")){
					denyAttachment = true
				}
			}
			if(fTask.getTaskDescription().equals("License Manager")){
				if (fTask.getActiveFlag().equals("Y")){
					if (fTask.getDisposition().equals("Revisions Required")){
						denyAttachment = true
					}
				}
			}					
		}
		if (denyAttachment){
			cancel = true;		
			showMessage = true;
			comment(errorMessage);
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/*/APPLICATION: Upload Document: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/*/APPLICATION: Upload Document: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: ");
}