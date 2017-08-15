//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
try{
	if(wfStatus=="Temporary License Issued"){
		var licCapId = createLicense("Active", true);
		if(licCapId){
			var expDate = dateAdd(null,120);
			setLicExpirationDate(licCapId,null,expDate,"Active");
			/* will configure once there's an altId 
			var newAltFirst = "LCT" + sysDateMMDDYYYY.substr(8,2);
			var newAltLast = capIDString.substr(3,capIDString.length());
			var newAltId = newAltFirst + newAltLast;
			var updAltId = aa.cap.updateCapAltID(licCapId,newAltId);
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			}else{
				logDebug("License record ID updated to : " + newAltId);
			}
			*/
			var newAppName = "Temporary Cultivator License - " + AInfo["License Type"];
			//logDebug("workDescGet(capId): " + workDescGet(capId));
			//logDebug("getShortNotes(): " + getShortNotes());
			logDebug("newAppName: " + newAppName);
			editAppName(newAppName,licCapId);
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
			runReportAttach(licCapId,"Temporary License", "p1value", licCapId);
			emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "", false, wfStatus, capId, "Applicant", "RECORD_ID", capId.getCustomID());
			emailRptContact("WTUA", "LCA_TEMP_LIC_APPROVAL", "", false, wfStatus, capId, "Owner", "RECORD_ID", capId.getCustomID());
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create License Record: " + err.message);
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




