// condition document script to update the doc group/category
try{
	if(documentUploadedFrom == "ACA"){
		var documentModels = documentModelArray.toArray();
		var documentModel = null;
		var conditionNumber = 0;
		for(i = 0; i<documentModels.length;i++){
			documentModel = documentModels[i];
			conditionNumber = documentModel.getConditionNumber();
			//logDebug(" i = " + i);
			//logDebug("Condition Number = " + conditionNumber);
			if(conditionNumber != null && conditionNumber != 0){
				var capConditionResult =
				aa.capCondition.getCapCondition(capId, conditionNumber);
				if(capConditionResult.getSuccess()){
					var capCondition = capConditionResult.getOutput();
					var conditionGroup = capCondition.getConditionGroup();
					var conditionName =
					capCondition.getConditionDescription();
					documentModel.setDocCategory(conditionName);
					//documentModel.setDocDepartment(conditionGroup);
					documentModel.setDocGroup("CALCANNABIS OWNER");
					//logDebug("Condition Name - " + conditionName);
					//logDebug("Condition Group - " + conditionGroup);
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
	logDebug("An error has occurred in DUA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Required Documents: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: " + documentModel);
}