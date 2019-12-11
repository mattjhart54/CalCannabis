try{
	if(balanceDue<=0){
		if (getAppStatus() != "Submitted"){
			updateAppStatus("Submitted", "Updated via PRA:LICENSES/CULTIVATOR/*/Renewal.");
		}
		if(!isTaskComplete("Annual Renewal Review") && !isTaskComplete("Provisional Renewal Review")){
			if (AInfo["License Issued Type"] == "Provisional") {
				activateTask("Provisional Renewal Review");
				deactivateTask("Annual Renewal Review");
			}else{
				activateTask("Annual Renewal Review");
				deactivateTask("Provisional Renewal Review");
			}
		}
		//	6316: If Parent record of Provisional license does not have science Amendment with Status of "Approved for Provisional Renewl" within last year
		if (AInfo['License Issued Type'] == "Provisional"){
			var vLicenseID = getParentLicenseCapID(capId);
			var vIDArray = String(vLicenseID).split("-");
			var vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
			var scienceArr = getChildren("Licenses/Cultivator/Amendment/Science",vLicenseID);
			var issueDate = getAppSpecific("Valid From Date",vLicenseID);
			var approvedRen = false;
			if (scienceArr) {
				if (scienceArr.length > 0) {
					for (x in scienceArr){
						var scienceCap = scienceArr[x];
						var workflowResult = aa.workflow.getTasks(scienceCap);
						if (workflowResult.getSuccess()){
							wfObj = workflowResult.getOutput();
						}else {
							logDebug("**ERROR: Failed to get workflow object: "+wfObj );
						}
						
						for (i in wfObj) {
							fTask = wfObj[i];
							var status = fTask.getDisposition();
							var taskDesc = fTask.getTaskDescription();
							if(status != null && taskDesc != null && status.equals("Approved for Provisional Renewal")){
								if((getDateDiff(issueDate) > 0) && (getDateDiff(issueDate) <= 365)){
									approvedRen = true;
								}
							}	
						}
					}
				}
			}
			if (!approvedRen){
				addStdCondition("Application Conditions", "Provisional Renewal Missing Science Amendment");
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/Renewal: Renewal Fees Paid: " + err.message);
	logDebug(err.stack);
}
