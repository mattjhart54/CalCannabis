try{
	if(documentUploadedFrom == "ACA"){
		AInfo= [];
		loadAppSpecific(AInfo);
		docMissing = true;
		docAttached = false;
		capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
		submittedDocList = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
		logDebug("Document Cnt " + submittedDocList.length + " License Change " + AInfo["License Change"]);
		if(submittedDocList.length > 0) {
			for (var i in submittedDocList ){
				logDebug("Document " + submittedDocList[i].getDocCategory());
				licChange = getAppSpecific("License Change")   
				if(AInfo["License Change"] == "Yes") {
					if(submittedDocList[i].getDocCategory() == "Cultivation Plan - Detailed Premises Diagram")
						docsMissing = false;
				}else {
					if(submittedDocList[i].getDocCategory() == "Cultivation Plan - Detailed Premises Diagram")
						docAttached = true;
				}
			}
		}
				
		if(docMissing == true) {
			showMessage = true;
			comment("A cultivation license size change has been requested and a revised premises diagram is required. Please upload the premises diagram.");
		}
		if(docAttached == true) {
			showMessage = true;
			comment("A cultivation license size change was not selected and a premises diagram is not required. For further questions, please contact the Department of Cannabis Control by calling 1-844-61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.");
		}
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/RENEWAL: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/RENEWAL: No Documents: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: " + documentModel);
}
