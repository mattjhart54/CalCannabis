// lwacht
// compare the documents uploaded to the documents required by the added conditions
// remove the condition for all uploaded documents
try{
	var docsList = [];
	var allDocsLoaded = true;
	//docsList = getDocumentList();//Get all Documents on a Record
	var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
	for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
		var thisDocument = capDocResult.getOutput().get(docInx);
		var documentModel = null;
		var conditionNumber = 0;
		conditionNumber = thisDocument.getConditionNumber();
		//if(conditionNumber != null && conditionNumber != 0){
		if(!matches(conditionNumber, null, 0)){
			var capConditionResult = aa.capCondition.getCapCondition(capId, conditionNumber);
			if(capConditionResult.getSuccess()){
				var capCondition = capConditionResult.getOutput();
				try{
					var conditionName = capCondition.getConditionType();
					var conditionGroup = capCondition.getConditionGroup();
					capCondition.getConditionDescription();
					thisDocument.setDocCategory(conditionName);
					//documentModel.setDocDepartment(conditionGroup);
					thisDocument.setDocGroup("CALCANNABIS APPLICANT");
					logDebug("Condition Name - " + conditionName);
					logDebug("Condition Group - " + conditionGroup);
					var updateDocumentResult = aa.document.updateDocument(thisDocument);
					if(updateDocumentResult.getSuccess()){
						logDebug("Update document model successfully - " + 	thisDocument.getDocName());
					}else{
						logDebug("Update document model failed - " + thisDocument.getDocName());
					}
				}catch(err){
					logDebug("Error retrieving Cap Condition detail: " + err.message);
				}
			}else{
				logDebug("No condition number - " + thisDocument.getDocName());
			}
		}
		//var thisDocument = docsList[dl];
		var docCategory = thisDocument.getDocCategory();
		removeCapCondition("License Required Documents", docCategory);
		aa.sendMail(sysFromEmail, debugEmail, "", "Info Only: CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: "+ startDate, capId + br + "docCategory: " + docCategory);
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
