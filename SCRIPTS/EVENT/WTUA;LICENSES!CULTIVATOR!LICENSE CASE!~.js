try{
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Notice Of Violation") {
		editAppSpecific("Case Renewal Type","Renewal Review");
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("License Hold","Applied","Notice of Violation",null)){
			addStdCondition("License Hold","Notice of Violation");
		}
		capId = holdId;
	}
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Owner Conviction") {
		editAppSpecific("Case Renewal Type","Renewal Review");
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("License Hold","Applied","Owner Subsequent Convictions",null)){
			addStdCondition("License Hold","Owner Subsequent Convictions");
		}
		capId = holdId;
	}
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Local Non-Compliance") {
		editAppSpecific("Case Renewal Type","Renewal Review");
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("License Hold","Applied","Local Non-Compliance",null)){
			addStdCondition("License Hold","Local Non-Compliance");
		}
		capId = holdId;
	}
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Refer to LAU") {
		editAppSpecific("Case Renewal Type","Renewal Review");
	}
	if (wfTask == "LAU Assessment" && wfStatus == "Refer to Legal") {
		editAppSpecific("Case Renewal Type","Renewal Hold");
	}
	if (wfTask == "Licensing Case Assessmentt" && matches(wfStatus,"Refer to LAU","Notice of Violation","Local Non-Compliance","Owner Conviction")) {
		if (AInfo['Case Renewal Type'] == "Renewal Allowed"){
			editAppSpecific("Case Renewal Type", "Renewal Review");
		}
	}
	if (matches(wfTask,"LAU Assessment","Licensing Case Assessment") && matches(wfStatus,"Resolved","Closed")) {
		var parentCapId = getParent();
		var renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
		var renCapId = renewalCapProject.getCapID();
		var licAltId = parentCapId.getCustomID();
		var altId = renCapId.getCustomID();
		if (renewalCapProject != null) {
			var capDetailObjResult = aa.cap.getCapDetail(renCapId);
			if (capDetailObjResult.getSuccess()){
				capDetail = capDetailObjResult.getOutput();
				var balanceDue = capDetail.getBalance();
			}
			if (balanceDue == 0){
				// Get current expiration date.
				vLicenseObj = new licenseObject(null, parentCapId);
				vExpDate = vLicenseObj.b1ExpDate;
				vExpDate = new Date(vExpDate);
				// Extend license expiration by 1 year
				vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
				// Update license expiration date
				logDebug("Updating Expiration Date to: " + vNewExpDate);
				vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
				// Set license record expiration and status to active
				vLicenseObj.setStatus("Active");
				updateAppStatus("Active","License Renewed",parentCapId);
				// Update the Cultivation Type on the license record
				var desChange = getAppSpecific("Designation Change",renCapId);
				var licType = getAppSpecific("License Type",renCapId);
				var licIssueType = getAppSpecific("License Issued Type",renCapId);
				if(desChange == "Yes") {
					editAppSpecific("Cultivator Type",desChange,parentCapId);
					editAppName(desChange + " - " + licType,parentCapId);
				}
				//Set renewal to complete, used to prevent more than one renewal record for the same cycle
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);			
				//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
				if (licIssueType == "Provisional"){
					var approvalLetter = "Provisional Renewal Approval";
				}else{
					var approvalLetter = "Approval Letter Renewal";
				}
				var scriptName = "asyncRunOfficialLicenseRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("licType", "");
				envParameters.put("appCap",altId);
				envParameters.put("licCap",licAltId); 
				envParameters.put("reportName","Official License Certificate");
				envParameters.put("approvalLetter", approvalLetter);
				envParameters.put("emailTemplate", "LCA_RENEWAL_APPROVAL");
				envParameters.put("reason", "");
				envParameters.put("currentUserID",currentUserID);
				envParameters.put("contType","Designated Responsible Party");
				envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
				aa.runAsyncScript(scriptName, envParameters);
				
				var priContact = getContactObj(renCapId,"Designated Responsible Party");
				// If DRP preference is Postal add license record to Annual/Provisional Renewal A set
				if(priContact){
					var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
					if(!matches(priChannel, "",null,"undefined", false)){
						if(priChannel.indexOf("Postal") > -1 ){
							
							if (licIssueType == "Provisional") {
								var sName = createSet("PROVISIONAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
							}
							if (licIssueType == "Annual"){
								var sName = createSet("ANNUAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
							}
							if(sName){
								setAddResult=aa.set.add(sName,parentCapId);
								if(setAddResult.getSuccess()){
									logDebug(parentCapId.getCustomID() + " successfully added to set " +sName);
								}else{
									logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
								}
							}
						}
					}
				}
				// Add record to the CAT set
				addToCat(parentCapId);
				//Update Renewal Workflow and Record Status to Approved
				var workflowResult = aa.workflow.getTasks(renCapId);
				if (workflowResult.getSuccess()){
					var wfObj = workflowResult.getOutput();
				}else{ 
					logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
				}
				var fTask;
				var stepnumber;
				var dispositionDate = aa.date.getCurrentDate();
				var wfnote = " ";
				var wftask;
				var taskArray = ['Renewal Review','Provisional Renewal Review','Annual Renewal Review'];
				for (i in wfObj) {
					fTask = wfObj[i];
					wftask = fTask.getTaskDescription();
					stepnumber = fTask.getStepNumber();
					if (exists(wftask,taskArray)) {
						if(fTask.getActiveFlag() == "Y") {
							updateTask(wftask,"Approved","","");
							deactivateTask(wftask)
							logDebug("Deactivating Workflow Task " + wftask + " with status Approved");
						}
					}
				}
				updateAppStatus("Approved","",renCapId);
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE CASE/NA: " + err.message);
	logDebug(err.stack);
}