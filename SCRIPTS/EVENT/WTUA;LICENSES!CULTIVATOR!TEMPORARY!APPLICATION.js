//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
//note license record creation has to be in WTUB so the license record exists when the license report is created
try{
	if(wfStatus=="Temporary License Issued"){
/*		var licCapId = createLicense("Active", true);
		if(licCapId){
			var expDate = dateAdd(null,120);
			setLicExpirationDate(licCapId,null,expDate,"Active");
			//will configure once there's an altId 
			//var newAltFirst = "LCT" + sysDateMMDDYYYY.substr(8,2);
			//var newAltLast = capIDString.substr(3,capIDString.length());
			//var newAltId = newAltFirst + newAltLast;
			//var updAltId = aa.cap.updateCapAltID(licCapId,newAltId);
			//if(!updAltId.getSuccess()){
			//	logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			//}else{
			//	logDebug("License record ID updated to : " + newAltId);
			//}
			var newAppName = "Temporary Cultivator License - " + AInfo["License Type"];
			//logDebug("workDescGet(capId): " + workDescGet(capId));
			//logDebug("getShortNotes(): " + getShortNotes());
			logDebug("newAppName: " + newAppName);
			editAppName(newAppName,licCapId);
			var newAltId = licCapId.getCustomID();
			var updateResult = aa.cap.updateCapAltID(licCapId, newAltId);
			if (updateResult.getSuccess()) {
				logDebug("Updated license record AltId to " + newAltId + ".");
			}else {
				logDebug("Error updating alt ID: " + updateResult.getErrorMessage() );
			}
			//updateShortNotes(getShortNotes(),licCapId);
			//updateWorkDesc(workDescGet(capId),licCapId);
			capContactResult = aa.people.getCapContactByCapID(capId);
			if (capContactResult.getSuccess()){
				Contacts = capContactResult.getOutput();
				for (yy in Contacts){
					var theContact = Contacts[yy].getCapContactModel();
					if(theContact.getContactType() == "Applicant"){
						var peopleModel = theContact.getPeople();
						var editChannel =  peopleModel.setPreferredChannel(1);
						var editChannel =  peopleModel.setPreferredChannelString("Email");
						aa.people.editCapContactWithAttribute(theContact);
					}
				}
			}
*/
		var parCapId = getParents("LICENSES/CULTIVATOR/TEMPORARY/LICENSE");
		if(parCapId){
			for(cap in parCapId){
				//var rParams = aa.util.newHashMap(); 
				//rParams.put("p1value", parCapId.getCustomID());
				//var module = appTypeArray[0];
				runReportAttach(parCapId[cap],"Temporary License", "p1value",parCapId[cap].getCustomID() );
				//generateReport(parCapId,"Temporary License",module,rParams)
				emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "", false, wfStatus, capId, "Applicant", "RECORD_ID", capId.getCustomID());
				emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "", false, wfStatus, capId, "Owner", "RECORD_ID", capId.getCustomID());
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




