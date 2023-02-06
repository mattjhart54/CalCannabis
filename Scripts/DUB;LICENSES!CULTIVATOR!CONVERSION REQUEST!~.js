try{
	var capIdStatusClass = getCapIdStatusClass(capId);
	
	if (capIdStatusClass == "COMPLETE") {
		if(documentUploadedFrom == "ACA"){
			cap = aa.cap.getCap(capId).getOutput();	
			capStatus = cap.getCapStatus();
			if(!matches(capStatus,"Submitted","Additional Information Needed")) {
				cancel = true;		
				showMessage = true;
				comment("Unable to upload documents. For further questions, please contact the Department of Cannabis Control by calling 1-844-61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.");
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/CONVERSION REQUEST/*: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/CONVERSION REQUEST/*: "+ startDate, capId + br+ err.message+ br+ err.stack);
}
