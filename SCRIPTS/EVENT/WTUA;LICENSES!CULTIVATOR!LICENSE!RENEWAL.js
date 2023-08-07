try {
	if (matches(wfTask,"Renewal Review","Annual Renewal Review","Provisional Renewal Review") && wfStatus == "Approved") {
		var vLicenseID;
		var vIDArray;
		var renewalCapProject;
		var vExpDate;
		var vNewExpDate;
		var vLicenseObj;
	// Get the parent license
		vLicenseID = getParentLicenseCapID(capId);
		vIDArray = String(vLicenseID).split("-");
		vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
		licAltId = vLicenseID.getCustomID();
		altId = capId.getCustomID();
		if (vLicenseID != null) {
	// Get current expiration date.
			vLicenseObj = new licenseObject(null, vLicenseID);
			vExpDate = vLicenseObj.b1ExpDate;
			vExpDate = new Date(vExpDate);
			expYear = vExpDate.getFullYear();
	// Extend license expiration by 1 year
			vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
	// Update license expiration date
			logDebug("Updating Expiration Date to: " + vNewExpDate);
			vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
	// Set license record expiration and status to active
			vLicenseObj.setStatus("Active");
			vCapStatus = aa.cap.getCap(vLicenseID).getOutput().getCapStatus()	
			savedCapStatus = getAppSpecific("Saved License Status",vLicenseID);
			if (savedCapStatus == "Suspended"){
				updateAppStatus("Suspended","License Renewed",vLicenseID);
			}else {
				if (vCapStatus != "Inactive"){
					updateAppStatus("Active","License Renewed",vLicenseID);
				}
			}
	// Update the Cultivation Type on the license record
			if(AInfo["Designation Change"] == "Yes") {
				editAppSpecific("Cultivator Type",AInfo["Designation Type"],vLicenseID);
				editAppName(AInfo["License Issued Type"] + " " + AInfo["Designation Type"] + " - " + AInfo["License Type"],vLicenseID);
			}else{
				editAppName(AInfo["License Issued Type"] + " " + AInfo["Cultivator Type"] + " - " + AInfo["License Type"],vLicenseID);
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
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
			if (renewalCapProject != null) {
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);
			}
			
		//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP
		//MJH: 04032023 Story 7355:  Add code to send a defferal approval notification with Invoice(s) and License Certificate
			if(AInfo["Deferral Approved"] == "CHECKED"){
				var scriptName = "asyncDeferralApprovedRenewal";
				envParameters = aa.util.newHashMap();
				envParameters.put("appCap",altId); 
				envParameters.put("licCap",licAltId); 
				if (AInfo["License Issued Type"] == "Annual")
					envParameters.put("issueType","an Annual");
				else
					envParameters.put("issueType","a Provisional");
				envParameters.put("emailTemplate","LCA_ANNUAL_RENEWAL_DEFERRED");
				envParameters.put("reportName","Official License Certificate"); 
				envParameters.put("balanceDue",balanceDue); 
				envParameters.put("deferralDue", AInfo["Deferral Expiration Date"]);
				envParameters.put("currentUserID",currentUserID);
				envParameters.put("contType","Designated Responsible Party");
				envParameters.put("fromEmail",sysFromEmail);
				aa.runAsyncScript(scriptName, envParameters);
			}
			else {			
				if (AInfo["License Issued Type"] == "Provisional"){
					var approvalLetter = "Provisional Renewal Approval";
					var emailTemplate = "LCA_RENEWAL_APPROVAL";
				}else{
					var approvalLetter = "";
					var emailTemplate = "LCA_ANNUAL_RENEWAL_APPROVAL";
				}
				var scriptName = "asyncRunOfficialLicenseRpt";
					var envParameters = aa.util.newHashMap();
				envParameters.put("licType", "");
				envParameters.put("appCap",altId);
				envParameters.put("licCap",licAltId); 
				envParameters.put("reportName","Official License Certificate");
				envParameters.put("approvalLetter", approvalLetter);
				envParameters.put("emailTemplate", emailTemplate);
				envParameters.put("reason", "");
				envParameters.put("currentUserID",currentUserID);
				envParameters.put("contType","Designated Responsible Party");
				envParameters.put("fromEmail",sysFromEmail);
					aa.runAsyncScript(scriptName, envParameters);
			}
			
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
							setAddResult=aa.set.add(sName,vLicenseID);
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
			addToCat(vLicenseID);
	//	7088: Create License Case Record for all Renewals when a Science Amendment associated to the License Parent Record has not been submitted prior to submission of a Provisional Renewal for that corresponding renewal year
			if (getAppSpecific("License Issued Type", vLicenseID) == "Provisional"){
				var scienceArr = getChildren("Licenses/Cultivator/Amendment/Science",vLicenseID);
				var issueDate = getAppSpecific("Valid From Date",vLicenseID);
				var approvedRen = false;
				var licCaseExclusion = false;
				if (scienceArr) {
					if (scienceArr.length > 0) {
						for (x in scienceArr){
							var scienceCap = scienceArr[x];
							if (getAppSpecific("Associated Renewal",scienceCap) == "Yes"){
								var correspondingYear = getAppSpecific("Renewal Year",scienceCap)
								logDebug("expYear: " + expYear);
								if (String(correspondingYear) == String(expYear)){
									var saAppStatus = aa.cap.getCap(scienceCap).getOutput().getCapStatus();
									var workflowResult = aa.workflow.getTasks(scienceCap);
									if (workflowResult.getSuccess()){
										wfObj = workflowResult.getOutput();		
										for (i in wfObj) {
											fTask = wfObj[i];
											var status = fTask.getDisposition();
											var taskDesc = fTask.getTaskDescription();
											if((status != null && taskDesc != null) && (taskDesc == "Science Amendment Review" && status != "Physical Modification Approved")){
												licCaseExclusion = true;
											}
										}
									}else{
										logDebug("**ERROR: Failed to get workflow object: "+wfObj );
									}
								}
							}
						}
					}
				}
			}else{
				licCaseExclusion = true;
			}
			if (!licCaseExclusion){
				var licCaseId = createChild("Licenses","Cultivator","License Case","NA","",vLicenseID);
				if (licCaseId){
					// Set alt id for the case record based on the number of child case records linked to the license record
					cIds = getChildren("Licenses/Cultivator/License Case/*",vLicenseID);
					if(matches(cIds, null, "", undefined)){
						amendNbr = "000" + 1;
					}else{
						var cIdLen = cIds.length
						if(cIds.length <= 9){
							amendNbr = "000" +  cIdLen;
						}else{
							if(cIds.length <= 99){
								amendNbr = "00" +  cIdLen;
							}else{
								if(cIds.length <= 999){
									amendNbr = "00" +  cIdLen;
								}else{
									amendNbr = cIdLen
								}
							}
						}
					}
					licCaseAltId = licCaseId.getCustomID();
					yy = licCaseAltId.substring(0,2);
					newLCAltId = vLicenseID.getCustomID() + "-LC"+ yy + "-" + amendNbr;
					var updateResult = aa.cap.updateCapAltID(licCaseId, newLCAltId);
					if (updateResult.getSuccess()){
						logDebug("Created License Case: " + newLCAltId + ".");
					}else{ 
						logDebug("Error renaming amendment record " + licCaseId);
					}
					// Copy the Designated resposible Party contact from the License Record to the Case record
					//copyContactsByType_rev(vLicenseID,licCaseId,"Designated Responsible Party");
					
					// Copy custom fields from the license record to the Case record
					holdId = capId;
					capId = vLicenseID;
					PInfo = new Array;
					loadAppSpecific(PInfo);
					capId = holdId;
					editAppSpecific("License Number",vLicenseID.getCustomID(),licCaseId);
					editAppSpecific("License Type",PInfo["License Type"],licCaseId);
					editAppSpecific("Legal Business Name",PInfo["Legal Business Name"],licCaseId);
					editAppSpecific("Premises City",PInfo["Premise City"],licCaseId);
					editAppSpecific("Premises County",PInfo["Premise County"],licCaseId);
					editAppSpecific("Local Authority Type",PInfo["Local Authority Type"],licCaseId);
					editAppSpecific("Case Renewal Type","Renewal Allowed",licCaseId);
					editAppSpecific("Case Description",AInfo["License Issued Type"] + " Renewal Missing Science Amendment",licCaseId);
					editAppSpecific("Case Opened By","Science - " + AInfo["License Issued Type"],licCaseId);
					editAppSpecific("Priority","Moderate",licCaseId);
					editAppName("Renewal Allowed",licCaseId);
					editCapConditionStatus("Application Condition","Provisional Renewal Missing Science Amendment","Condition Met","Not Applied");
				}else{
					logDebug("Failed to create License Case Record for " + vLicenseID.getCustomID());
				}
			}	
		}
		if(balanceDue>0){
			// Remove Late Fees
			if (AInfo['Waive Late Fee'] == "CHECKED"){
				var feeDesc = AInfo["License Type"] + " - Late Fee";
				var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
				if(thisFee){
					var hasFee = feeExists(thisFee.feeCode);
					if(hasFee) {
						voidRemoveFeesByDesc(feeDesc);
						var scriptName = "asyncRunBalanceDueRpt";
						var envParameters = aa.util.newHashMap();
						envParameters.put("altId",capId.getCustomID()); 
						envParameters.put("reportName","Balance Due Report"); 
						envParameters.put("contType","Designated Responsible Party"); 
						envParameters.put("currentUserID",currentUserID);
						envParameters.put("fromEmail",sysFromEmail);
						aa.runAsyncScript(scriptName, envParameters);
					}
				}
			}
			updateAppStatus("Deferral Approved", "Updated via WTUA:LICENSES/CULTIVATOR/*/Renewal.");
		}
	}
	//Removing as per 6355, 6313, 6314, 6315
	/*if (matches(wfTask,"Annual Renewal Review","Provisional Renewal Review") && wfStatus == "Recommended for Denial") {
		var vLicenseID;
		var vIDArray;
		var renewalCapProject;
		var vExpDate;
		var vNewExpDate;
		var vLicenseObj;
	// Get the parent license
		vLicenseID = getParentLicenseCapID(capId);
		vIDArray = String(vLicenseID).split("-");
		vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
		licAltId = vLicenseID.getCustomID();
		if (vLicenseID != null) {
	// Set license record expiration and status to inactive
			vLicenseObj = new licenseObject(null, vLicenseID);
			vLicenseObj.setStatus("Inactive");
	//		updateAppStatus("Inactive","License Renewed",vLicenseID);
	//Set renewal to complete, used to prevent more than one renewal record for the same cycle
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
			if (renewalCapProject != null) {
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);
			}
	// Add record to the CAT set
			addToCat(vLicenseID);
		}
	}*/
	if (wfTask == "License Manager" && wfStatus == "Revisions Required") {
		reactivateActiveTasksWithStatus("Recommended for Denial");
		deactivateTask("License Manager");
	}			
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: " + err.message);
	logDebug(err.stack);
}
