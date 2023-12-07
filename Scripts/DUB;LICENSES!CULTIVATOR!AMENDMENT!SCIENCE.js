try{
	var capIdStatusClass = getCapIdStatusClass(capId);
	if (capIdStatusClass == "COMPLETE") {
		if(documentUploadedFrom == "ACA"){
			var allowAttachment = false;
			if (isTaskActive("Science Amendment Review")){
				allowAttachment = true;
			}	
			if (!allowAttachment){
				cancel = true;		
				showMessage = true;
				comment("The Science Amendment has been finalized. To upload additional documents, please submit a new Science Amendment. For further questions, please contact the Department of Cannabis Control by calling 1 (844) 61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.");
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: No Documents: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: " + documentModel);
}