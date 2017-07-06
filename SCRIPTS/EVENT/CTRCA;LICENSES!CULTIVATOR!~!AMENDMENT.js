//lwacht
//notify processor(s) that the amendment record has been submitted
try{
	if(parentCapId){
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
				email(staffEmail, sysFromEmail, "Deficiency Report for " + parentCapId, "The deficiency report " + capIDString + " has been submitted.") ;
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
				email(staffEmail, sysFromEmail, "Deficiency Report for " + parentCapId, "The deficiency report " + capIDString + " has been submitted.") ;
			}
		}else{
			logDebug("Error occurred getting taskItemScriptModel: CEQA Review: " + taskItemScriptModel.getErrorMessage());
		}
	}else{
		logDebug("No parent found. No emails sent.");
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/AMENDMENT: Notify Processor: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/AMENDMENT: Notify Processor: "+ startDate, capId + br + err.message+ br+ err.stack);
}
