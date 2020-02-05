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
		var licAltId = parentCapId.getCustomID();
		var renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
		if (renewalCapProject != null) {
			var renCapId = renewalCapProject.getCapID();
			var capDetailObjResult = aa.cap.getCapDetail(renCapId);
			if (capDetailObjResult.getSuccess()){
				capDetail = capDetailObjResult.getOutput();
				var balanceDue = capDetail.getBalance();
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
					//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
					if (licIssueType == "Provisional"){
						var approvalLetter = "Provisional Renewal Approval";
					}else{
						var approvalLetter = "Approval Letter Renewal";
					}
					//********************Testing**************************
					var reportName = "Official License Certificate";
					var emailTemplate = "LCA_RENEWAL_APPROVAL";
					var reason =  "";
					var br = "<BR>";
					var eTxt = "";
					var rFiles = [];
					// Run the official license report
					reportResult = aa.reportManager.getReportInfoModelByName(reportName);
					if (!reportResult.getSuccess()){
						logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
						eTxt+="**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage() +br; 
					}
					var report = reportResult.getOutput();
					var altId = parentCapId.getCustomID();
					cap = aa.cap.getCap(parentCapId).getOutput();
					capStatus = cap.getCapStatus();
					appTypeResult = cap.getCapType();
					appTypeString = appTypeResult.toString(); 
					appTypeArray = appTypeString.split("/");
					report.setModule(appTypeArray[0]); 
					//report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3()); 
					report.setCapId(parentCapId); 
					report.getEDMSEntityIdModel().setAltId(licAltId);
					eTxt+="reportName: " + reportName + br;
					eTxt+="reportName: " + typeof(reportName) + br;
					var parameters = aa.util.newHashMap(); 
					parameters.put("altId",licAltId);
					report.setReportParameters(parameters);
					var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
					if(permit.getOutput().booleanValue()) { 
						var reportResult = aa.reportManager.getReportResult(report); 
						if(reportResult) {
							reportOutput = reportResult.getOutput();
							var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
							rFile=reportFile.getOutput();
							rFiles.push(rFile);
							logDebug("Report '" + reportName + "' has been run for " + licAltId);
							eTxt+=("Report '" + reportName + "' has been run for " + licAltId) +br;
						}else {
							logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
						}
					}else{
						logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
						eTxt+="No permission to report: "+ reportName + " for user: " + currentUserID;
					}
					// Run the Approval Letter
					
					if(!matches(approvalLetter,"",null,undefined)) {
						reportName = approvalLetter;
						reportResult = aa.reportManager.getReportInfoModelByName(reportName);
						if (!reportResult.getSuccess()){
							logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
							eTxt+="**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage() +br; 
						}
						var report = reportResult.getOutput(); 
						report.setModule(appTypeArray[0]); 
						//report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3()); 
						report.setCapId(parentCapId); 
						report.getEDMSEntityIdModel().setAltId(altId);
						eTxt+="reportName: " + reportName + br;
						eTxt+="reportName: " + typeof(reportName) + br;
						var parameters = aa.util.newHashMap(); 
						parameters.put("p1value",altId);
						parameters.put("p2value","Designated Responsible Party");
						parameters.put("p3value","Mailing");
						report.setReportParameters(parameters);
						var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
						eTxt+="Has Permission: " + permit.getOutput().booleanValue() + br;
						if(permit.getOutput().booleanValue()) { 
							var reportResult = aa.reportManager.getReportResult(report); 
							eTxt+="Get Report: " + reportResult.getOutput() + br;
							if(reportResult) {
								reportOutput = reportResult.getOutput();
								var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
								eTxt+="Store Report to Disk: " + reportFile + br;
								rFile=reportFile.getOutput();
								rFiles.push(rFile);
								logDebug("Report '" + reportName + "' has been run for " + altId);
								eTxt+=("Report '" + reportName + "' has been run for " + altId) +br;
							}else {
								logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
							}
						}else{
							logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
							eTxt+="No permission to report: "+ reportName + " for user: " + currentUserID;
						}
					}

					//*************************Test Complete*******************************
					var priContact = getContactObj(parentCapId,"Designated Responsible Party");
					// If DRP preference is Postal add license record to Annual/Provisional Renewal A set
					if(priContact){
						var eParams = aa.util.newHashtable(); 
						addParameter(eParams, "$$altID$$", parentCapId.getCustomID());
						addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
						addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
						addParameter(eParams, "$$parentId$$", parentCapId);
						addParameter(eParams, "$$licType$$", licType);
						addParameter(eParams, "$$reason$$", reason);
						var priEmail = ""+priContact.capContact.getEmail();
						sendApprovalNotification("calcannabislicensing@cdfa.ca.gov",priEmail,"",emailTemplate,eParams, rFiles,parentCapId);
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
					}else{
						logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
					}
					// Add record to the CAT set
					addToCat(parentCapId);
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE CASE/NA: " + err.message);
	logDebug(err.stack);
}