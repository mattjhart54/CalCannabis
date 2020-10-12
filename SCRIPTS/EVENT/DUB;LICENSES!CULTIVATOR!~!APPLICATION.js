try{
	if(documentUploadedFrom == "ACA"){
		var denyAttachment = false;
		var disqualifiedStatus = false;
		var errorMessage = "Document upload not allowed. Please contact CalCannabis Cultivation Licensing by calling 1-833-CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.";
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess()){
			var wfObj = workflowResult.getOutput();
		}else{ 
			logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());  
		}
		var activeTask = false;
		for (i in wfObj){
			if (wfObj[i].getTaskDescription().equals("Scientific Review") && wfObj[i].getDisposition().equals("Additional Information Needed")){
				denyAttachment = true;
				errorMessage = "Document upload not allowed in the application. To upload additional documents, utilize the deficiency record (ending in DEF##T or DEF##). For further questions please contact CalCannabis Cultivation Licensing by calling 1-833-CALGROW (225-4769) or by sending an email to cdfa.CalCannabis_Scientists@cdfa.ca.gov.";
			}
			if (wfObj[i].getActiveFlag().equals("Y")){
				if (matches(wfObj[i].getTaskDescription(),"Science Manager Review","License Manager", "Final Review", "Application Disposition") && wfObj[i].getDisposition() != ("Denied")){
					denyAttachment = true;
				}
			}else{
				if (wfObj[i].getDisposition().equals("Disqualified")){
					denyAttachment = true;
					errorMessage = "This application has been placed on hold. Please contact CalCannabis Cultivation Licensing by calling 1-833-CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.";
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
