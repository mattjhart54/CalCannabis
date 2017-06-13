//lwacht
// condition document script to update the doc group/category
try{
	if(documentUploadedFrom == "ACA"){
		var documentModels = documentModelArray.toArray();
		var documentModel = null;
		var conditionNumber = 0;
		for(i = 0; i<documentModels.length;i++){
			documentModel = documentModels[i];
			conditionNumber = documentModel.getConditionNumber();
			//if(conditionNumber != null && conditionNumber != 0){
			if(!matches(conditionNumber, null, 0)){
				var capConditionResult = aa.capCondition.getCapCondition(capId, conditionNumber);
				if(capConditionResult.getSuccess()){
					var capCondition = capConditionResult.getOutput();
					var conditionGroup = capCondition.getConditionGroup();
					var conditionName =
					capCondition.getConditionDescription();
					documentModel.setDocCategory(conditionName);
					//documentModel.setDocDepartment(conditionGroup);
					documentModel.setDocGroup("CALCANNABIS APPLICANT");
					logDebug("Condition Name - " + conditionName);
					logDebug("Condition Group - " + conditionGroup);
					var updateDocumentResult = aa.document.updateDocument(documentModel);
					if(updateDocumentResult.getSuccess()){
						logDebug("Update document model successfully - " + 	documentModel.getDocName());
					}else{
						logDebug("Update document model failed - " + documentModel.getDocName());
					}
				}else{
					logDebug("No condition number - " + documentModel.getDocName());
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in DUA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: "+ startDate, capId + "; " + err.message+ br + "; STACK: "+ err.stack + br +": DOCUMENT ARRAY: " + documentModel+ br + message);
}
//lwacht
//compare the documents uploaded to the documents required in the "attachment" event
// if any documents are required, send an email.
/* not using for now
try{
	var docModel = documentModelArray.toArray();
	cancel = true;
	//List all the element of the documentModelArray
	for (var x in docModel){
		var docInfo = docModel[x];
		var thisCategory = docInfo.getDocCategory();
		var allDocsLoaded = true;
		var arrMissingDocs = [];
		var docFound = false;
		for (l in ATTACHMENTS){
			var reqDocument = ""+ATTACHMENTS[l]["Document Type"];
			//logDebug("reqDocument: " + reqDocument);
			if (reqDocument.equals(thisCategory)){
				docFound = true;
				ATTACHMENTS[l]["Uploaded"]="CHECKED";
				ATTACHMENTS[l]["Status"]="Under Review";
				logDebug("Required document found: " + thisCategory + ". Attachment table updated.");
				editCapConditionStatus("License Required Documents", reqDocument,"Met", "Not Applied");
			}
			if(ATTACHMENTS[l]["Status"]!="Under Review"){
				allDocsLoaded = false;
			}
		}
		//update attachments table with which documents have been uploaded
		removeASITable("ATTACHMENTS");
		addASITable("ATTACHMENTS", ATTACHMENTS);
		//if there are any missing documents, send an email
		if(!allDocsLoaded){
			var br = "<br>";
			var emailBody ="";
			for(x in arrMissingDocs){
				emailBody += " - " + arrMissingDocs[x] + br;
			}
			//logDebug("emailBody: " + emailBody);
			//aa.sendMail("lwacht@cdfa.ca.gov",debugEmail , "", "vote for pedro", "yay");
			emailContact("Application " + capIDString + " has been received", "Thank you for submitting your application.  Your application is missing required documents. These must be uploaded to your application before processing will begin." +br + emailBody + "Thank you");
		}else{
			updateTask("Application Intake", "All Documents Received", "Updated via script DUA:LICENSES/CULTIVATOR/* /APPLICATION", "");
			updateAppStatus("All Documents Received", "Updated via script DUA:LICENSES/CULTIVATOR/* /APPLICATION");
		}
	}
} catch(err){
	logDebug("An error has occurred in DUA:LICENSES/CULTIVATOR/* /APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
}
end code not being used
*/ 
