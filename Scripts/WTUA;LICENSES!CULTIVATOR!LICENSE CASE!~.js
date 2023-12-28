try{
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Notice Of Violation") {
		editAppSpecific("Case Renewal Type","Renewal Review");
		editAppName("Renewal Review");
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("Notice","Applied","Notice of Violation",null)){
			addStdCondition("Notice","Notice of Violation");
		}
		capId = holdId;
	}
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Owner Conviction") {
		editAppSpecific("Case Renewal Type","Renewal Review");
		editAppName("Renewal Review");
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("Notice","Applied","Owner Conviction",null)){
			addStdCondition("Notice","Owner Conviction");
		}
		capId = holdId;
	}
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Local Non-Compliance") {
		editAppSpecific("Case Renewal Type","Renewal Review");
		editAppName("Renewal Review");
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("Notice","Applied","Local Non-Compliance",null)){
			addStdCondition("Notice","Local Non-Compliance");
		}
		capId = holdId;
	}
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Refer to LAU") {
		editAppSpecific("Case Renewal Type","Renewal Review");
		editAppName("Renewal Review");
	}
	/*Removed wfTask Notice Non-Compliance Issued in story 7105
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Notice Non-Compliance Issued") {
		updateAppStatus("Notice Non-Compliance Issued");
	}*/
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Suspension Lift Requested") {
		//Assign to user who set LAU Assessment task to LAU Exected - Suspension
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess()){
			wfObj = workflowResult.getOutput();
			for (var i in wfObj) {
				fTask = wfObj[i];
				logDebug(fTask.getTaskDescription() + " | " + fTask.getDisposition() + " | " + fTask.getActiveFlag());
				if (fTask.getTaskDescription() == "LAU Assessment" && fTask.getDisposition() == "LAU Executed - Suspension"){
						var actionByUser=fTask.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel
						var actionByObj = aa.person.getUser(actionByUser.getFirstName(), actionByUser.getMiddleName(), actionByUser.getLastName()).getOutput();
						if (actionByObj){
							var userID = actionByObj.getUserID();
							break;
						}
				}
			}
		}else{
			logDebug("**ERROR: Failed to get workflow object");			
		}

		if (!matches(userID,null,undefined,"")){
			assignTask("LAU Assessment",userID);
		}
	}
	if (wfTask == "LAU Assessment" && wfStatus == "LAU Executed - Suspension") { 
		//Assign to user who set LAU Assessment task to LAU Exected - Suspension
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess()){
			wfObj = workflowResult.getOutput();
			for (var i in wfObj) {
				fTask = wfObj[i];
				logDebug(fTask.getTaskDescription() + " | " + fTask.getDisposition() + " | " + fTask.getActiveFlag());
				if (fTask.getTaskDescription() == "Licensing Case Assessment" && matches(fTask.getDisposition(),"Suspension Lift Requested","Refer to LAU")){
						var actionByUser=fTask.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel
						var actionByObj = aa.person.getUser(actionByUser.getFirstName(), actionByUser.getMiddleName(), actionByUser.getLastName()).getOutput();
						if (actionByObj){
							var userID = actionByObj.getUserID();
							break;
						}
				}
			}
		}else{
			logDebug("**ERROR: Failed to get workflow object");			
		}

		if (!matches(userID,null,undefined,"")){
			assignTask("Licensing Case Assessment",userID);
		}
	}
	if (wfTask == "LAU Assessment" && wfStatus == "Refer to Legal") {
		editAppSpecific("Case Renewal Type","Renewal Hold");
		editAppName("Renewal Hold");
	}
	if (wfTask == "Licensing Case Assessment" && matches(wfStatus,"Refer to LAU","Notice of Violation","Local Non-Compliance","Owner Conviction")) {
		if (AInfo['Case Renewal Type'] == "Renewal Allowed"){
			editAppSpecific("Case Renewal Type", "Renewal Review");
			editAppName("Renewal Review");
		}
	}
	if (matches(wfTask,"LAU Assessment","Licensing Case Assessment") && wfStatus == "Resolved") {
		editAppSpecific("Case Renewal Type","Renewal Allowed");
		editAppName("Renewal Allowed");
	}
	
	if (matches(wfTask,"LAU Assessment","Licensing Case Assessment") && matches(wfStatus,"Resolved","Closed")) {
		fastTrack = renewalProcessLC();
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE CASE/NA: " + err.message);
	logDebug(err.stack);
}
