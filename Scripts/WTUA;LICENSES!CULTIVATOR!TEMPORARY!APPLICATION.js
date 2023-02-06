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
				runReportAttach(parCapId,"Official Temporary License", "altId",parCapId.getCustomID());
				//generateReport(parCapId,"Temporary License",module,rParams);
				var currCap = capId;
				capId = parCapId;
				//lwacht 171214: changing who gets emailed
				//lwacht 180229: story : email the report to the DRP
				emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "Official Temporary License", true, wfStatus, parCapId, "DRP - Temporary License", "altId", capId.getCustomID());
				//emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "Official Temporary License", false, wfStatus, parCapId, "DRP - Temporary License", "altId", capId.getCustomID());
				//lwacht 180229: story : email the report to the DRP
				//emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "Official Temporary License", false, wfStatus, parCapId, "Business", "altId", capId.getCustomID());
				//lwacht: 171214: end
				//emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "", false, wfStatus, capId, "Owner", "RECORD_ID", capId.getCustomID());
				capId = currCap;
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

//lwacht
//disqualification notice
try{
	if(matches(wfStatus, "Disqualification Letter Sent")){
		var rptName = "";
		var notName = "LCA_TEMP_APP_DISQUALIFIED";
		//lwacht 171214: emailing new drp contact
		//emailRptContact("WTUA", notName, "", false, capStatus, capId, "Business");
		emailRptContact("WTUA", notName, "", false, capStatus, capId, "DRP - Temporary License");
		//lwacht 171214 end
	}
}catch(err){
logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Disqualification notification: " + err.message);
logDebug(err.stack);
}


//mhart
//denial notice
try{
	//lwacht 171214: status changed
	//if(matches(wfStatus, "Denied - No Appeal")){
	if(matches(wfStatus, "Denial Letter Sent")){
	//lwacht 171214: end
		closeTask("Application Disposition", "Denial Letter Sent","Updated by script Application Denied","");
		var rptName = "Temporary Denial Letter";
		var notName = "LCA_GENERAL_NOTIFICATION";
		runReportAttach(capId,rptName, "p1value",capId.getCustomID());
		//lwacht 171214: emailing new drp contact
		//emailRptContact("WTUA", notName, "", false, capStatus, capId, "Business");
		emailRptContact("WTUA", notName, "", false, capStatus, capId, "DRP - Temporary License");
		//lwacht 171214 end
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Denial notification: " + err.message);
	logDebug(err.stack);
}