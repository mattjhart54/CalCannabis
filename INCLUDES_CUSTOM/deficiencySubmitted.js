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
				//lwacht: 180806: 5608: only update the Admin Review when the submitted app is not an owner app
				if(appTypeArray[2]=="Medical"){
				//lwacht: 180806: 5608: end
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
							//lwacht: 180426: story ????: reset the assigned task
							var asgnDateAR = getAssignedDate("Administrative Review");
							activateTask("Administrative Review");
							if(asgnDateAR){
								updateTaskAssignedDate("Administrative Review", asgnDateAR);
							}else{
								logDebug("No assigned date found for Administrative Review");
							}
							//lwacht: 180426: story ????: end
							//defect 4763: deactivate manager review when processor reviews are active
							deactivateTask("Administrative Manager Review");
							capId = currCap;
						}
					}else{
						logDebug("Error occurred getting taskItemScriptModel: Administrative Review: " + taskItemScriptModel.getErrorMessage());
					}
				}
				//lwacht: 180806: 5608: only update the Owner Review when the submitted app is the last owner app
				if(appTypeArray[2]=="Owner"){
					var resParCapId = getChildren("Licenses/Cultivator/Owner/Amendment",resParCapId);
					var unSubRecd = false;
					for(c in resParCapId){
						var thisChild = resParCapId[c].getCustomID();
						if(thisChild.indexOf("T")>6){
							unSubRecd = true;
						}
					}
					if(!unSubRecd){
				//lwacht: 180806: 5608: end
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
								//lwacht: 180426: story ????: reset the assigned task
								var asgnDateOR = getAssignedDate("Owner Application Reviews");
								activateTask("Owner Application Reviews");
								if(asgnDateOR){
									updateTaskAssignedDate("Owner Application Reviews", asgnDateOR);
								}else{
									logDebug("No assigned date found for Owner Application Reviews");
								}
								//lwacht: 180426: story ????: end
								deactivateTask("Administrative Manager Review");
								capId = currCap;
							}
						}else{
							logDebug("Error occurred getting taskItemScriptModel: Owner Application Reviews: " + taskItemScriptModel.getErrorMessage());
						}
					}
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
						//lwacht: 180426: story ????: reset the assigned task
						var asgnDateSR = getAssignedDate("Scientific Review");
						activateTask("Scientific Review");
						if(asgnDateSR){
							updateTaskAssignedDate("Scientific Review", asgnDateSR);
						}else{
							logDebug("No assigned date found for Scientific Review");
						}
						//lwacht: 180426: story ????: end
						deactivateTask("Science Manager Review");
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
						//lwacht: 180426: story ????: reset the assigned task
						var asgnDateCR = getAssignedDate("CEQA Review");
						activateTask("CEQA Review");
						if(asgnDateCR){
							updateTaskAssignedDate("CEQA Review", asgnDateCR);
						}else{
							logDebug("No assigned date found for CEQA Review");
						}
						//lwacht: 180426: story ????: end
						deactivateTask("Science Manager Review");
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
