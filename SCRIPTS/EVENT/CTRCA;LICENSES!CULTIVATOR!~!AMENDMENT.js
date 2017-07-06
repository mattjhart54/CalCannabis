//lwacht: update altid based on altId assigned when the record was created
try{
	var newAltId = AInfo["AltId"];
	var updAltId = aa.cap.updateCapAltID(capId,newAltId);
	if(!updAltId.getSuccess()){
		logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
	}else{
		logDebug("Deficiency record ID updated to : " + newAltId);
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/AMENDMENT: AltId Update: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/AMENDMENT: AltId Update: "+ startDate, capId + br + err.message+ br+ err.stack);
}

//lwacht
//notify processor(s) that the amendment record has been submitted
try{
	parentAltId = AInfo["ParentCapId"];
	if(parentAltId){
		resParCapId = aa.cap.getCapID(parentAltId);
		if(resParCapId.getSuccess()){
			parentCapId = resParCapId.getOutput();
			var linkResult = aa.cap.createAppHierarchy(parentCapId, capId);
			if (linkResult.getSuccess()){
				logDebug("Successfully linked to Parent Application : " + parentAltId);
			}else{
				logDebug( "**ERROR: linking to parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());
			}
			var taskItemScriptModel=aa.workflow.getTask(parentCapId, "Administrative Review");
			if(taskItemScriptModel.getSuccess()){
				var taskItemScript = taskItemScriptModel.getOutput();
				if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response") && taskItemScript.activeFlag=="Y"){
					var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
					var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
					var taskUpdater = taskUpdaterModel.getOutput(); 
					staffEmail = taskUpdater.email;
					email(staffEmail, sysFromEmail, "Deficiency Report for " + parentCapId, "The deficiency report " + capIDString + " has been submitted.") ;
				}
			}else{
				logDebug("Error occurred getting taskItemScriptModel: Administrative Review: " + taskItemScriptModel.getErrorMessage());
			}
			var taskItemScriptModel=aa.workflow.getTask(parentCapId, "Owner Application Reviews");
			if(taskItemScriptModel.getSuccess()){
				var taskItemScript = taskItemScriptModel.getOutput();
				if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response") && taskItemScript.activeFlag=="Y"){
					var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
					var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
					var taskUpdater = taskUpdaterModel.getOutput(); 
					staffEmail = taskUpdater.email;
					email(staffEmail, sysFromEmail, "Deficiency Report for " + parentCapId, "The deficiency report " + capIDString + " has been submitted.") ;
				}
			}else{
				logDebug("Error occurred getting taskItemScriptModel: Owner Application Reviews: " + taskItemScriptModel.getErrorMessage());
			}
			var taskItemScriptModel=aa.workflow.getTask(parentCapId, "Scientific Review");
			if(taskItemScriptModel.getSuccess()){
				var taskItemScript = taskItemScriptModel.getOutput();
				if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response") && taskItemScript.activeFlag=="Y"){
					var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
					var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
					var taskUpdater = taskUpdaterModel.getOutput(); 
					staffEmail = taskUpdater.email;
					email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + capIDString + " has been submitted.") ;
				}
			}else{
				logDebug("Error occurred getting taskItemScriptModel: Scientific Review: " + taskItemScriptModel.getErrorMessage());
			}
			var taskItemScriptModel=aa.workflow.getTask(parentCapId, "CEQA Review");
			if(taskItemScriptModel.getSuccess()){
				var taskItemScript = taskItemScriptModel.getOutput();
				if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response") && taskItemScript.activeFlag=="Y"){
					var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
					var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
					var taskUpdater = taskUpdaterModel.getOutput(); 
					staffEmail = taskUpdater.email;
					email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + capIDString + " has been submitted.") ;
				}
			}else{
				logDebug("Error occurred getting taskItemScriptModel: CEQA Review: " + taskItemScriptModel.getErrorMessage());
			}
		}else{
			logDebug("Error occurred getting resParCapId: " + resParCapId.getErrorMessage());
		}
	}else{
		logDebug("No parent found. No emails sent.");
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/AMENDMENT: Notify Processor: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/AMENDMENT: Notify Processor: "+ startDate, capId + br + err.message+ br+ err.stack);
}