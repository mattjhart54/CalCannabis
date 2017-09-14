function deficiencySubmitted() {
try {
	parentAltId = AInfo["ParentCapId"];
	if(parentAltId){
		var currCap = capId;
		resParCapId = aa.cap.getCapID(parentAltId);
		if(resParCapId.getSuccess()){
			parentCapId = resParCapId.getOutput();
			var linkResult = aa.cap.createAppHierarchy(parentCapId, capId);
			if (linkResult.getSuccess()){
				logDebug("Successfully linked to Parent Application : " + parentAltId);
			}else{
				logDebug( "**ERROR: linking to parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());
			}
			var parCap = aa.cap.getCap(parentCapId).getOutput();
			parAppType = parCap.getCapType();
			parAppTypeString = parAppType.toString();
			parAppTypeArray = parAppTypeString.split("/");
			if(parAppTypeArray[3]=="Application"){
				var taskItemScriptModel=aa.workflow.getTask(parentCapId, "Administrative Review");
				if(taskItemScriptModel.getSuccess()){
					var taskItemScript = taskItemScriptModel.getOutput();
					if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response")){
						var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
						var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
						var taskUpdater = taskUpdaterModel.getOutput(); 
						staffEmail = taskUpdater.email;
						email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + newAltId + " has been submitted.");
						logDebug("Admin Amendment record processed");
						capId = parentCapId;
						activateTask("Administrative Review");
						capId = currCap;
					}
				}else{
					logDebug("Error occurred getting taskItemScriptModel: Administrative Review: " + taskItemScriptModel.getErrorMessage());
				}
				var taskItemScriptModel=aa.workflow.getTask(parentCapId, "Owner Application Reviews");
				if(taskItemScriptModel.getSuccess()){
					var taskItemScript = taskItemScriptModel.getOutput();
					if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response") ){
						var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
						var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
						var taskUpdater = taskUpdaterModel.getOutput(); 
						staffEmail = taskUpdater.email;
						email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + newAltId + " has been submitted.") ;
						logDebug("Owner Amendment record processed");
						capId = parentCapId;
						activateTask("Owner Application Reviews");
						capId = currCap;
					}
				}else{
					logDebug("Error occurred getting taskItemScriptModel: Owner Application Reviews: " + taskItemScriptModel.getErrorMessage());
				}
			}
			if(parAppTypeArray[3]=="Application"){
				var taskItemScriptModel=aa.workflow.getTask(parentCapId, "Scientific Review");
				if(taskItemScriptModel.getSuccess()){
					var taskItemScript = taskItemScriptModel.getOutput();
					if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response")){
						var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
						var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
						var taskUpdater = taskUpdaterModel.getOutput(); 
						staffEmail = taskUpdater.email;
						email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + newAltId + " has been submitted.") ;
						logDebug("Scientific Amendment record processed");
						capId = parentCapId;
						activateTask("Scientific Review");
						capId = currCap;
					}
				}else{
					logDebug("Error occurred getting taskItemScriptModel: Scientific Review: " + taskItemScriptModel.getErrorMessage());
				}
				var taskItemScriptModel=aa.workflow.getTask(parentCapId, "CEQA Review");
				if(taskItemScriptModel.getSuccess()){
					var taskItemScript = taskItemScriptModel.getOutput();
					if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response")){
						var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
						var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
						var taskUpdater = taskUpdaterModel.getOutput(); 
						staffEmail = taskUpdater.email;
						email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + newAltId + " has been submitted.") ;
						logDebug("CEQA Amendment record processed");
						capId = parentCapId;
						activateTask("CEQA Review");
						capId = currCap;
					}
				}else{
					logDebug("Error occurred getting taskItemScriptModel: CEQA Review: " + taskItemScriptModel.getErrorMessage());
				}
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
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/AMENDMENT: Notify Processor: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
}
