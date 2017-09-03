//lwacht
//notify assigned user of active tasks that a document has been uploaded
try{
	aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY DUA:LICENSES/CULTIVATOR/*/Application: Notify of Uploaded Document: "+ startDate, capId + br +  currEnv);
	wf = aa.workflow.getTaskItemByCapID(capId,null).getOutput();
	for(x in wf) {
		fTask = wf[x]; 
		taskName=fTask.getTaskDescription();
		if(fTask.getActiveFlag()=="Y") {
			var caseMgr = wf[x].getAssignedStaff().getFirstName()+ " " +wf[x].getAssignedStaff().getLastName();
			var assignedUserID = aa.person.getUser(wf[x].getAssignedStaff().getFirstName(),wf[x].getAssignedStaff().getMiddleName(),wf[x].getAssignedStaff().getLastName()).getOutput();
			if(assignedUserID!=null){
				var staffEmail = assignedUserID.getEmail();
				aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY DUA:LICENSES/CULTIVATOR/*/Application: Notify of Uploaded Document: "+ startDate, capId + br +  caseMgr + br + staffEmail);
				if(staffEmail){
					email(staffEmail, sysFromEmail, "A new document has been uploaded.", "TA new document has been uploaded for license application " + capIDString + ". Please review this new document before taking any action on the application.");
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in DUA:LICENSES/CULTIVATOR/*/APPLICATION: Notify of Uploaded Document: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUA:LICENSES/CULTIVATOR/*/Application: Notify of Uploaded Document: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}

