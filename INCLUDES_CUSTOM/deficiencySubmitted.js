/*===========================================
Title: deficiencySubmitted
Purpose: processes all child/grandchild deficiency
	records
Author: Lynda Wacht		
Functional Area : child records
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis 
Parameters:	
	none
============================================== */
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
			//lwacht: 180806: 5608: only update the Admin Review when the submitted app is not an owner app
			if(matches(parAppTypeArray[3], "Application", "Owner Application")){
				if(appTypeArray[2]=="Medical"){
					//lwacht: 180806: 5608: deactivate Admin Mgr Review on first submitted deficiency record
					capId = parentCapId;
					if(isTaskActive("Administrative Manager Review")){
						deactivateTask("Administrative Manager Review");
					}
					capId = currCap;
					//lwacht: 180806: 5608: end
			//lwacht: 180806: 5608: end
					var taskItemScriptModel=aa.workflow.getTask(parentCapId, "Administrative Review");
					if(taskItemScriptModel.getSuccess()){
						var taskItemScript = taskItemScriptModel.getOutput();
						if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response")){
							var actionByUser=taskItemScript.getTaskItem().getAssignedUser(); // Get action by user, this is a SysUserModel
							var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
							if(taskUpdaterModel.getSuccess()) {
								var taskUpdater = taskUpdaterModel.getOutput(); 
								var staffEmail = taskUpdater.email;
								email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + newAltId + " has been submitted.");
								logDebug("Admin Amendment record processed");
							}
							else {
								logDebug("No user assigned to Administrative Review task. No emails sent.");
							}
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
				//this is a bit complicated because the owner deficiency is a grandchild of the annual application,
				//so i'm getting the grandparent annual capId, then finding each of the owner child records, then,
				//finally looking for the rest of the owner deficiency records to see if any have not been submitted.
				if(appTypeArray[2]=="Owner"){
					var grandParCapId =  getParentByCapId(parentCapId);
					if(grandParCapId){
						//lwacht: 180806: 5608: deactivate Admin Mgr Review on first submitted deficiency record
						capId = grandParCapId;
						if(isTaskActive("Administrative Manager Review")){
							deactivateTask("Administrative Manager Review");
						}
						capId = currCap;
						//lwacht: 180806: 5608: end
						var arrOwnChild = getChildren("Licenses/Cultivator/Medical/Owner Application",grandParCapId);
						var unSubRecd = false;
						for(c in arrOwnChild){
							var thisOwnChild = arrOwnChild[c];
							var arrOwnDefChild = getChildren("Licenses/Cultivator/Owner/Amendment",thisOwnChild);
							for (o in arrOwnDefChild){
								var thisOwnnDefChild = arrOwnDefChild[o].getCustomID();
								if(thisOwnnDefChild.indexOf("T")>6){
									unSubRecd = true;
								}
							}
						}
						if(!unSubRecd){
				//lwacht: 180806: 5608: end
							var taskItemScriptModel=aa.workflow.getTask(grandParCapId, "Owner Application Reviews");
							if(taskItemScriptModel.getSuccess()){
								var taskItemScript = taskItemScriptModel.getOutput();
								if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response") ){
									var actionByUser=taskItemScript.getTaskItem().getAssignedUser(); // Get action by user, this is a SysUserModel
									var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
									if(taskUpdaterModel.getSuccess()) {
										var taskUpdater = taskUpdaterModel.getOutput(); 
										var staffEmail = taskUpdater.email;
										email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + newAltId + " has been submitted.");
										logDebug("Owner Amendment record processed");
									}
									else {
										logDebug("No user assigned to Owner Application Review task. No emails sent.");
									}
									capId = grandParCapId;
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
			}
			if(parAppTypeArray[3]=="Application"){
				var taskItemScriptModel=aa.workflow.getTask(parentCapId, "Scientific Review");
				if(taskItemScriptModel.getSuccess()){
					var taskItemScript = taskItemScriptModel.getOutput();
					if(matches(taskItemScript.disposition, "Additional Information Needed", "Incomplete Response")){
						var actionByUser=taskItemScript.getTaskItem().getAssignedUser(); // Get action by user, this is a SysUserModel
						var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
						if(taskUpdaterModel.getSuccess()) {
							var taskUpdater = taskUpdaterModel.getOutput(); 
							var staffEmail = taskUpdater.email;
							email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + newAltId + " has been submitted.");
							logDebug("Scientific Amendment record processed");
						}
						else {
							logDebug("No user assigned to Scientific Review task. No emails sent.");
						}
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
						var actionByUser=taskItemScript.getTaskItem().getAssignedUser(); // Get action by user, this is a SysUserModel
						var taskUpdaterModel = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName());
						if(taskUpdaterModel.getSuccess()) {
							var taskUpdater = taskUpdaterModel.getOutput(); 
							var staffEmail = taskUpdater.email;
							email(staffEmail, sysFromEmail, "Deficiency Report for " + parentAltId, "The deficiency report " + newAltId + " has been submitted.");
							logDebug("CEQA Amendment record processed");
						}
						else {
							logDebug("No user assigned to CEQA Review task. No emails sent.");
						}
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
}}

