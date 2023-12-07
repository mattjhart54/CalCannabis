try{
	if(documentUploadedFrom == "ACA"){
		var denyAttachment = false;
		var disqualifiedStatus = false;
		var errorMessage = "Document upload not allowed. Please contact Department of Cannabis Control by calling 1 (844) 61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.";
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess()){
			var wfObj = workflowResult.getOutput();
			var activeTask = false;
			for (i in wfObj){
				if (wfObj[i].getTaskDescription().equals("Scientific Review") && wfObj[i].getDisposition().equals("Additional Information Needed")){
					denyAttachment = true;
					errorMessage = "Document upload not allowed in the application. To upload additional documents, utilize the deficiency record (ending in DEF##T or DEF##). For further questions please contact Department of Cannabis Control by calling 1 (844) 61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.";
				}
				if (wfObj[i].getActiveFlag().equals("Y")){
					if (matches(wfObj[i].getTaskDescription(),"Science Manager Review","License Manager", "Final Review", "Application Disposition") && wfObj[i].getDisposition() != ("Denied")){
						denyAttachment = true;
					}
				}else{
					if (matches(wfObj[i].getDisposition(),"Disqualified","Abandoned")){
						denyAttachment = true;
						errorMessage = "This application has been placed on hold. Please contact Department of Cannabis Control by calling 1 (844) 61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.";
						break;
					}
					if (matches(wfObj[i].getDisposition(),"Closed","Provisional License Issued","License Issued")){
						denyAttachment = true;
						break;
					}
				}
			}
			
			if (denyAttachment){
				cancel = true;		
				showMessage = true;
				comment(errorMessage);
			}
		}else{ 
			logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());  
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/*/APPLICATION: Upload Document: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/*/APPLICATION: Upload Document: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: ");
}
