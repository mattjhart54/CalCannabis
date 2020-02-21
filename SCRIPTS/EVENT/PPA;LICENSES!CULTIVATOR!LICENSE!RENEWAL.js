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
		//	6316: Add cond If Parent record of Provisional license does not have science Amendment with Status of "Approved for Provisional Renewl" year of last renewal
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
							for (i in wfObj) {
								fTask = wfObj[i];
								var status = fTask.getDisposition();
								var taskDesc = fTask.getTaskDescription();
								if(status != null && taskDesc != null && status.equals("Approved for Provisional Renewal")){
									var taskDate = fTask.getStatusDate()
									var taskDateMMDDYYYY = dateFormatted(taskDate.getMonth()+1, taskDate.getDate(), taskDate.getYear()+1900, "MM/DD/YYYY");
									var issueDateObj = new Date(issueDate);
									var taskDateObj = new Date(taskDateMMDDYYYY);
									var thisLic = new licenseObject(null,vLicenseID);
									var licExpDateObj = new Date(thisLic.b1ExpDate);
									licExpDateObj.setFullYear(licExpDateObj.getFullYear() - 1);
									var diffDays = parseInt((taskDateObj - licExpDateObj) / (1000 * 60 * 60 * 24));
									if(diffDays >= 0){
										approvedRen = true;
									}
								}	
							}
						}else {
							logDebug("**ERROR: Failed to get workflow object: "+wfObj );
						}
					}
				}
			}
			if (!approvedRen){
				if	(!appHasCondition("Application Condition","Applied","Provisional Renewal Missing Science Amendment",null)){
					addStdCondition("Application Condition", "Provisional Renewal Missing Science Amendment");
				}
			}
		}
	}
	if(!publicUser) {
		// Check License Cases to see if renewal can be fast tracked
				var licenseId = AInfo["License Number"];
				var licId = aa.cap.getCapID(licenseId);
				licId = licId.getOutput();
				childIds  = getChildren("Licenses/Cultivator/License Case/*",licId);
				holdId = capId;
				capId = licId;
				var caseReview = false;
				if(appHasCondition("Owner History","Applied","DOJ LiveScan Match",null))
					caseReview = true;
				if(appHasCondition("License Hold","Applied","Local Non-Compliance",null))
					caseReview = true;
				for(c in childIds) {
					capId = childIds[c];
					cCap = aa.cap.getCap(capId).getOutput();
					cStatus = cCap.getCapStatus();
					cInfo = new Array;
					loadAppSpecific(cInfo);
					logDebug(cInfo["Case Renewal Type"] + " - " + cStatus);
					if(cInfo["Case Renewal Type"] == "Renewal Review") {
						if(!matches(cStatus, "Resolved", "Closed")) {
							caseReview = true;
							break;
						}
					}
				}	
				capId = holdId;
			// Fast track license if qualified and fees paid
				if(!caseReview && balanceDue <= 0) {	
					var renewalCapProject;
					var vExpDate;
					var vNewExpDate;
					var vLicenseObj;
					licAltId = licId.getCustomID();
					altId = capId.getCustomID();
					if (licId != null) {
			// Get current expiration date.
						vLicenseObj = new licenseObject(null, licId);
						vExpDate = vLicenseObj.b1ExpDate;
						vExpDate = new Date(vExpDate);
			// Extend license expiration by 1 year
						vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
			// Update license expiration date
						logDebug("Updating Expiration Date to: " + vNewExpDate);
						vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
			// Set license record expiration and status to active
						vLicenseObj.setStatus("Active");
						updateAppStatus("Active","License Renewed",licId);
			// Update the Cultivation Type on the license record
						if(AInfo["Designation Change"] == "Yes") {
							editAppSpecific("Cultivator Type",AInfo["Designation Type"],licId);
							editAppName(AInfo["Designation Type"] + " - " + AInfo["License Type"],licId);
						}
			//Set renewal to complete, used to prevent more than one renewal record for the same cycle
						renewalCapProject = getRenewalCapByParentCapIDForIncomplete(licId);
						if (renewalCapProject != null) {
							renewalCapProject.setStatus("Complete");
							renewalCapProject.setRelationShip("R");  // move to related records
							aa.cap.updateProject(renewalCapProject);
						}
			// Update the workflow on the Renewal record to approved
						if (AInfo["License Issued Type"] == "Provisional") {
							closeTask("Provisional Renewal Review","Approved","Renewal Fast Tracked","");
						}else{
							closeTask("Annual Renewal Review","Approved","Renewal Fast Tracked","");
						}
						updateAppStatus("Approved","Renewal Fast Tracked");
						editAppSpecific("Fast Track","CHECKED");
					
			//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
						if (AInfo["License Issued Type"] == "Provisional")
							var approvalLetter = "Provisional Renewal Approval";
						else
							var approvalLetter = "Approval Letter Renewal";
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
					
						var priContact = getContactObj(capId,"Designated Responsible Party");
				// If DRP preference is Postal add license record to Annual/Provisional Renewal A set
						if(priContact){
							var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
							if(!matches(priChannel, "",null,"undefined", false)){
								if(priChannel.indexOf("Postal") > -1 ){
									if (AInfo['License Issued Type'] == "Provisional") {
										var sName = createSet("PROVISIONAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
									}
									if (AInfo['License Issued Type'] == "Annual"){
										var sName = createSet("ANNUAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
									}
									if(sName){
										setAddResult=aa.set.add(sName,licId);
										if(setAddResult.getSuccess()){
											logDebug(capId.getCustomID() + " successfully added to set " +sName);
										}else{
											logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
										}
									}
								}
							}
						}
				// Add record to the CAT set
						addToCat(licId);
					}
				}
			}	
}catch(err){
	logDebug("An error has occurred in PPA:LICENSES/CULTIVATOR/*/Renewal: Renewal Fees Paid: " + err.message);
	logDebug(err.stack);
}
