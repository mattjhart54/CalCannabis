try{
	if(documentUploadedFrom == "ACA"){
		pId = getParent();
		pCap = aa.cap.getCap(pId).getOutput();
		pStatus = pCap.getCapStatus();
		if(pStatus == "Disqualified" || capStatus == "Disqualified") {
			cancel = true;		
			showMessage = true;
			comment("This application has been placed on hold. Please contact CalCannabis Cultivation Licensing by calling (833) CALGROW (225-4769) or by sending an email to calcannabis@cdfa.ca.gov.");
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/*/AMENDMENT: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/*/AMENDMENT: Amendment Disqualified: "+ startDate, capId + br+ err.message+ br+ err.stack);
}