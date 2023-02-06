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

//lwacht
//notify assigned user of active tasks that a document has been uploaded
try{
	wf = aa.workflow.getTaskItemByCapID(capId,null).getOutput();
	for(x in wf) {
		fTask = wf[x]; 
		taskName=fTask.getTaskDescription();
		if(fTask.getActiveFlag()=="Y") {
			var caseMgr = wf[x].getAssignedStaff().getFirstName()+ " " +wf[x].getAssignedStaff().getLastName();
			var assignedUserID = aa.person.getUser(wf[x].getAssignedStaff().getFirstName(),wf[x].getAssignedStaff().getMiddleName(),wf[x].getAssignedStaff().getLastName()).getOutput();
			if(assignedUserID!=null){
				var staffEmail = assignedUserID.getEmail();
				if(staffEmail){
					email(staffEmail, sysFromEmail, "A new document has been uploaded.", "A new document has been uploaded for license application " + capIDString + ". Please review this new document before taking any action on the application.");
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in DUA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Notify of Uploaded Document: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Notify of Uploaded Document: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}

