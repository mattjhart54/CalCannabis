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
	if (matches(wfTask,"LAU Assessment","Licensing Case Assessment") && matches(wfStatus,"Resolved","Closed")) {
		var parentCapId = getParent();
		var licAltId = parentCapId.getCustomID();
		// Check License Cases to see if renewal can be fast tracked
		var caseReview = false;
		childIds  = getChildren("Licenses/Cultivator/License Case/*",parentCapId);
		if (childIds){
			for(c in childIds) {
				childCapId = childIds[c];
				cCap = aa.cap.getCap(childCapId).getOutput();
				cStatus = cCap.getCapStatus();
				if (!matches(cStatus,"Resolved","Closed")){
					if(matches(getAppSpecific("Case Renewal Type",childCapId),"Renewal Review","Renewal Hold")) {
						caseReview = true;
					}
				}
			}
		}
		if (!caseReview){
			var renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
			if (renewalCapProject != null) {
				var renCapId = renewalCapProject.getCapID();
				if (!renCapId.toString().contains("EST")){
					var renewalCap = aa.cap.getCap(renCapId).getOutput();
					var altId = String(renewalCap.getCapID().getCustomID());
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
							if (aa.cap.getCap(parentCapId).getOutput().getCapStatus() != "Inactive"){
								updateAppStatus("Active","License Renewed",parentCapId);
							}
							// Update the Cultivation Type on the license record
							var desChange = getAppSpecific("Designation Change",renCapId);
							var licType = getAppSpecific("License Type",renCapId);
							var licIssueType = getAppSpecific("License Issued Type",renCapId);
							if(desChange == "Yes") {
								editAppSpecific("Cultivator Type",getAppSpecific("Designation Type",renCapId),parentCapId);
								editAppName(getAppSpecific("Designation Type",renCapId) + " - " + licType,parentCapId);
							}
							// Update Financial Interest Table
							if (typeof(FINANCIALINTERESTHOLDERNEW) == "object"){
								if(FINANCIALINTERESTHOLDERNEW.length > 0){
									finTable = new Array();
									for(xx in FINANCIALINTERESTHOLDERNEW){
										var finNewRow = FINANCIALINTERESTHOLDERNEW[xx];
										finRow = new Array();
										finRow["Type of Interest Holder"] = finNewRow["Type of Interest Holder"];
										finRow["Legal First Name"] = finNewRow["Legal First Name"];
										finRow["Legal Last Name"] = finNewRow["Legal Last Name"];
										finRow["Email Address"] = finNewRow["Email Address"];
										finRow["Contact Phone Number"] = finNewRow["Contact Phone Number"];
										finRow["Type of Government ID"] = finNewRow["Type of Government ID"];
										finRow["Government ID Number"] = finNewRow["Government ID Number"];
										finRow["Legal Business Name"] = finNewRow["Legal Business Name"];
										finRow["Primary Contact Name"] = finNewRow["Primary Contact Name"];
										finRow["Primary Contact Phone Number"] = finNewRow["Primary Contact Phone Number"];
										finRow["Primary Contact Email Address"] = finNewRow["Primary Contact Email Address"];
										finRow["FEIN"] = finNewRow["FEIN"];
										finTable.push(finRow);
									}
									removeASITable("FINANCIAL INTEREST HOLDER",vLicenseID);
									addASITable("FINANCIAL INTEREST HOLDER",finTable,vLicenseID);
								}
							}
							// Update Electricity Usage Table
							if (typeof(ELECTRICITYUSAGE) == "object"){
								if(ELECTRICITYUSAGE.length > 0){
									elecTable = new Array();
									for(jj in ELECTRICITYUSAGE){
										var elecNewRow = ELECTRICITYUSAGE[jj];
										elecRow = new Array();
										elecRow["Reporting Year"] = "" + elecNewRow["Reporting Year"];
										elecRow["Usage Type"] = "" + elecNewRow["Usage Type"];
										elecRow["Type of Off Grid Renewable Source"] = "" + elecNewRow["Type of Off Grid Renewable Source"];
										elecRow["Type of Other Source"] = "" + elecNewRow["Type of Other Source"];
										elecRow["Other Source description"] = "" + elecNewRow["Other Source description"];
										elecRow["Name of Utility Provider"] = "" + elecNewRow["Name of Utility Provider"];
										elecRow["Total Electricity Supplied (kWh)"] = "" + elecNewRow["Total Electricity Supplied (kWh)"];
										elecRow["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"] = "" + elecNewRow["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"];
										elecRow["GGEI (lbs CO2e/kWh)"] = "" + elecNewRow["GGEI (lbs CO2e/kWh)"];
										elecTable.push(elecRow);
									}
									addASITable("ELECTRICITY USAGE",elecTable,vLicenseID);	
								}
							}
							// Update AVERAGE WEIGHTED GGEI Table
							if (typeof(AVERAGEWEIGHTEDGGEI) == "object"){
								if(AVERAGEWEIGHTEDGGEI.length > 0){
									weigtedTable = new Array();
									for(pp in AVERAGEWEIGHTEDGGEI){
										var weightedNewRow = AVERAGEWEIGHTEDGGEI[pp];
										weigtedRow = new Array();
										weigtedRow["Reporting year"] = "" + weightedNewRow["Reporting year"];
										weigtedRow["Average Weighted GGEI"] = "" + weightedNewRow["Average Weighted GGEI"];
										weigtedTable.push(weigtedRow);
									}
									addASITable("AVERAGE WEIGHTED GGEI",weigtedTable,vLicenseID);
								}
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
							var wfcomment = "";
							var wftask;
							var taskArray = ['Renewal Review','Provisional Renewal Review','Annual Renewal Review'];
							for (i in wfObj) {
								fTask = wfObj[i];
								wftask = fTask.getTaskDescription();
								stepnumber = fTask.getStepNumber();
								dispositionDate = aa.date.getCurrentDate();
								if (exists(wftask,taskArray)) {
									if(fTask.getActiveFlag() == "Y") {
										aa.workflow.handleDisposition(renCapId, stepnumber, "Approved", dispositionDate, wfnote, wfcomment, systemUserObj, "Y");
										logDebug("Results: "  + fTask.getTaskDescription() + " " + fTask.getDisposition());
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
							envParameters.put("fromEmail",sysFromEmail);
							aa.runAsyncScript(scriptName, envParameters);
							
							var priContact = getContactObj(parentCapId,"Designated Responsible Party");
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
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE CASE/NA: " + err.message);
	logDebug(err.stack);
}
