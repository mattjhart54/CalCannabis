try{
	if(documentUploadedFrom == "ACA"){
		var cancelUpload = false;
		for(var index = 0; index < documentModelArray.size(); index++) {
			if (String(documentModelArray.get(index).getDocCategory()) != "Delegate Contact"){
				cancelUpload = true;
			}
		}
		if(cancelUpload){
			cancel = true;		
			showMessage = true;
			comment("To upload additional documents, please submit a new amendment. For further questions, please contact the Department of Cannabis Control by calling 1 (844) 61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.");
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/LICENSE: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/LICENSE: No Documents: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: " + documentModelArray);
}