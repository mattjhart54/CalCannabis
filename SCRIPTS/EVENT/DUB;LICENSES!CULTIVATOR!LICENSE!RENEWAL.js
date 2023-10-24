try{
//	if(documentUploadedFrom == "ACA"){
		AInfo= [];
		loadAppSpecific(AInfo);
		docAttached = false;
		for(var index = 0; index < documentModelArray.size(); index++) {
			logDebug("Document " + String(documentModelArray.get(index).getDocCategory()));
			if(AInfo["License Change"] != "Yes") {
				if (String(documentModelArray.get(index).getDocCategory()) == "Cultivation Plan - Detailed Premises Diagram")
					docAttached = true;
			}
		}
		if(docAttached == true) {
			cancel = true;
			showMessage = true;
			comment("A cultivation license size change was not selected and a premises diagram is not required. For further questions, please contact the Department of Cannabis Control by calling 1-844-61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.");
		}
		
//	}
	cancel = true;
	showMessage = true;
	comment("License Change " + AInfo["License Change"] + " Number of Docs " + documentModelArray.size());
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/RENEWAL: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/RENEWAL: No Documents: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: " + documentModel);
}
