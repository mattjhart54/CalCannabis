try{
	if(documentUploadedFrom == "ACA"){
		var useAppSpecificGroupName = false;
		cap = aa.cap.getCap(capId).getOutput();
		AInfo= [];
		loadAppSpecific4ACA(AInfo);
		docAttached = false;
		for(var index = 0; index < documentModelArray.size(); index++) {
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
		
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/RENEWAL: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/RENEWAL: No Documents: "+ startDate, capId + br+ err.message+ br+ err.stack);
}
function loadAppSpecificBefore(thisArr) {
	//
	// Returns an associative array of App Specific Info
	//
	for (loopk in AppSpecificInfoModels)
		{
		if (useAppSpecificGroupName)
			{
			thisArr[AppSpecificInfoModels[loopk].getCheckboxType() + "." + AppSpecificInfoModels[loopk].checkboxDesc] = AppSpecificInfoModels[loopk].checklistComment;
			logDebug("{" + AppSpecificInfoModels[loopk].getCheckboxType() + "." + AppSpecificInfoModels[loopk].checkboxDesc + "} = " + AppSpecificInfoModels[loopk].checklistComment);
			}
			else
			{
			thisArr[AppSpecificInfoModels[loopk].checkboxDesc] = AppSpecificInfoModels[loopk].checklistComment;
			logDebug("{" + AppSpecificInfoModels[loopk].checkboxDesc + "} = " + AppSpecificInfoModels[loopk].checklistComment);
			}
		}
	}
