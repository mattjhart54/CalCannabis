//lwacht
//send notification
//note license record creation has to be in WTUB so the license record exists when the license report is created
try{
	if(wfStatus=="Temporary License Issued"){
		var arrCaps = getParentsRev("Licenses/Cultivator/Temporary/License");
		if(arrCaps){
			for(cap in arrCaps){
				var parCapId = arrCaps[cap];
				logDebug("parCapId: " + parCapId);
				//var rParams = aa.util.newHashMap(); 
				//rParams.put("p1value", parCapId.getCustomID());
				//var module = appTypeArray[0];
				runReportAttach(parCapId,"Temporary License", "p1value",parCapId.getCustomID() );
				//generateReport(parCapId,"Temporary License",module,rParams)
				emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "", false, wfStatus, capId, "Business", "RECORD_ID", capId.getCustomID());
				//emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "", false, wfStatus, capId, "Owner", "RECORD_ID", capId.getCustomID());
			}
		}else{
			logDebug("Error retrieving parent License record. ");
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Send Approval Email: " + err.message);
	logDebug(err.stack);
}

//lwacht
//assign the application disposition task to the person who completed the admin review task
try{
	if(isTaskActive("Application Disposition") && wfTask!="Application Disposition"){
		var taskItemScriptModel=aa.workflow.getTask(capId, "Administrative Review");
		if(taskItemScriptModel.getSuccess()){
			var taskItemScript = taskItemScriptModel.getOutput();
			var actionByUser=taskItemScript.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel 
			var assgnUserId = aa.person.getUser(actionByUser.getFirstName(),actionByUser.getMiddleName(),actionByUser.getLastName()).getOutput();
			assignTask("Application Disposition", assgnUserId.userID);
		}else{
			logDebug("Error occurred getting taskItemScriptModel: Administrative Review: " + taskItemScriptModel.getErrorMessage());
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Assign Disposition: " + err.message);
	logDebug(err.stack);
}
