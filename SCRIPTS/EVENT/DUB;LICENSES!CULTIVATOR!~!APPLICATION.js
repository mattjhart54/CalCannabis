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
		var activeTask = false;
		for (i in wfObj){
			if (wfObj[i].getActiveFlag().equals("Y")){
				if (matches(wfObj[i].getTaskDescription(),"License Manager", "Final Review", "Application Disposition") && wfObj[i].getDisposition() != ("Denied")){
					denyAttachment = true;
				}
			}else{
				if (wfObj[i].getDisposition().equals("Disqualified")){
					denyAttachment = true;
					errorMessage = "This application has been placed on hold. Please contact CalCannabis Cultivation Licensing by calling (833) CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.";
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
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/*/APPLICATION: Upload Document: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/*/APPLICATION: Upload Document: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: ");
}
