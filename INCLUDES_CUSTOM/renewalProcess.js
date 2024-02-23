function renewalProcess(rAltId, event, fees){	
	var fastTrack = 'Yes';
	var caseReview = false;
	if(event == 'WTUA') {
		var licenseId = AInfo["License Number"];
		var licId = aa.cap.getCapID(licenseId);
		licId = licId.getOutput();
	}else {
// Check License Cases to see if renewal can be fast tracked
		var licenseId = AInfo["License Number"];
		var licId = aa.cap.getCapID(licenseId);
		licId = licId.getOutput();
		childIds  = getChildren("Licenses/Cultivator/License Case/*",licId);
		holdId = capId;
		capId = licId;
		if(appHasCondition("Owner History","Applied","DOJ LiveScan Match",null))
			caseReview = true;
		if(appHasCondition("Notice","Applied","Local Non-Compliance",null))
			caseReview = true;
		for(c in childIds) {
			capId = childIds[c];
			cCap = aa.cap.getCap(capId).getOutput();
			cStatus = cCap.getCapStatus();
			cInfo = new Array;
			loadAppSpecific(cInfo);
			logDebug(cInfo["Case Renewal Type"] + " - " + cStatus);
			if(matches(cInfo["Case Renewal Type"], "Renewal Review", "Renewal Hold")) {
				if(!matches(cStatus, "Resolved", "Closed")) {
					caseReview = true;
					break;
				}	
			}
		}	
		capId = holdId;
	}
// Process renewal
	if((matches(event, "CTRCA","PPA","PRA") && !caseReview && !fees) || event == "WTUA") {	
		var renewalCapProject;
		var vExpDate;
		var vNewExpDate;
		var vLicenseObj;
		licAltId = licId.getCustomID();
		altId = rAltId;
		if (licId != null) {
	// Get current expiration date.
			vLicenseObj = new licenseObject(null, licId);
			vExpDate = vLicenseObj.b1ExpDate;
			vExpDate = new Date(vExpDate);
			expYear = vExpDate.getFullYear();
	// Extend license expiration by 1 year and change expiration date if necessary
			if (AInfo['License Expiration Date Change'] == "Yes" && !matches(AInfo['New Expiration Date'],null,undefined,"")){
					vNewExpDate = new Date(AInfo['New Expiration Date']);
					logDebug("Updating Expiration Date to: " + vNewExpDate);
					vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
					editAppSpecific("Expiration Date Changed","CHECKED",licId);
					editAppSpecific("Date Expiration Date Changed",fileDate,licId);
			}else{
				vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
				logDebug("Updating Expiration Date to: " + vNewExpDate);
				vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
			}
	// Set license record expiration and status
			vLicenseObj.setStatus("Active");
			vCapStatus = aa.cap.getCap(licId).getOutput().getCapStatus();	
			savedCapStatus = getAppSpecific("Saved License Status",licId);
			limitedOp = AInfo['Limited Operation'] == "Yes";
			if(limitedOp){
				editAppSpecific("Limited Operations","Yes",licId);
				if (vCapStatus == "Suspended" || savedCapStatus == "Suspended"){
					if(!appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,licId)){
 		 				addStdCondition("License Notice","Suspension Lift Notice",licId);
 		 			}
 		 		}else{
 		 			updateAppStatus("Limited Operations","License Renewed",licId);
					if(appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,licId)){
						editCapConditionStatus("License Notice","Suspension Lift Notice","Condition Met","Not Applied","",licId);
					}
				}
			}else{
				if(appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,licId)){
					editCapConditionStatus("License Notice","Suspension Lift Notice","Condition Met","Not Applied","",licId);
				}
			}
			if (vCapStatus == "Suspended" || savedCapStatus == "Suspended"){
				updateAppStatus("Suspended","License Renewed",licId);
			}else {
				if (vCapStatus != "Inactive" && !limitedOp){
					updateAppStatus("Active","License Renewed",licId);
				}
			}
	// Update Canopy Size on the license record
			if(AInfo['License Change'] == "Yes"){
				editAppSpecific("License Type",AInfo["New License Type"],licId);
	//			editAppSpecific("Aggregate square footage of noncontiguous canopy",AInfo["Aggragate Canopy Square Footage"],licId);
				editAppSpecific("Canopy SF",AInfo["Aggragate Canopy Square Footage"],licId);
				editAppSpecific("Canopy Plant Count",AInfo["Canopy Plant Count"],licId);
				var licType = AInfo["New License Type"];
			}else{
				var licType = AInfo["License Type"];
			}
	// Update the Cultivation Type on the license record
			if(AInfo["Designation Change"] == "Yes") {   
				editAppSpecific("Cultivator Type",AInfo["Designation Type"],licId);
				var cultType = AInfo["Designation Type"];
			}else{
				var cultType = AInfo["Cultivator Type"];
			}
			editAppName(AInfo["License Issued Type"] + " " + cultType + " - " + licType,licId);
			
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
					removeASITable("FINANCIAL INTEREST HOLDER",licId);
					addASITable("FINANCIAL INTEREST HOLDER",finTable,licId);
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
					addASITable("ELECTRICITY USAGE",elecTable,licId);	
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
					addASITable("AVERAGE WEIGHTED GGEI",weigtedTable,licId);
				}
			}
	// Story 7700: Update License Renewal History table upon license
			var LICENSERENEWALHISTORY = new Array();
			var histRow = new Array();

			var renYear = vNewExpDate.getFullYear();
			var newExpStatus = aa.cap.getCap(licId).getOutput().getCapStatus();
			var expDateForamatted = dateFormatted(vNewExpDate.getMonth()+1, vNewExpDate.getDate(), vNewExpDate.getFullYear(), "MM/DD/YYYY");

			histRow["Renewal Year"] = "" + String(renYear);
			histRow["Record number of source"] = "" + altId;
			histRow["License Expiration"] = "" + String(expDateForamatted);
			histRow["License Status"] = "" + newExpStatus;
			histRow["Limited Operation"] = "" + AInfo['Limited Operation'];
			histRow["License Type"] = "" + String(licType); 
			histRow["Canopy Square Feet"] = "" + (getAppSpecific("Canopy SF",licId) || "");
			histRow["Canopy Plant Count"] = "" + (getAppSpecific("Canopy Plant Count",licId) || "");
			histRow["Canopy Square Footage Limit"] = "" + (getAppSpecific("Canopy SF Limit",licId) || "");
			
			LICENSERENEWALHISTORY.push(histRow);
			addASITable("LICENSE RENEWAL HISTORY", LICENSERENEWALHISTORY, licId);	
			
	// Story 7750: Update Equity Fee Relief Tables
			var recordASIGroup = aa.appSpecificInfo.getByCapID(capId);
			if (recordASIGroup.getSuccess()){
				var recordASIGroupArray = recordASIGroup.getOutput();
				var equityTable = new Array();
				var equityRow = new Array(); 
	
				for (i in recordASIGroupArray) {
					var group = recordASIGroupArray[i];
					if (String(group.getCheckboxType()) == "EQUITY FEE RELIEF"){
						recordField = String(group.getCheckboxDesc());
						fieldValue = group.getChecklistComment();
						if (!matches(fieldValue,null,undefined,"")){
							equityRow[recordField] = "" + String(fieldValue);
						}
										
					}
				}
				if (Object.keys(equityRow).length > 0){
					equityRow["Relief Record Number"] = "" + capId.getCustomID();
					equityTable.push(equityRow);
					addASITable("EQUITY FEE RELIEF", equityTable, licId);
				}
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
			editAppSpecific("Fast Track","CHECKED",capId);	
	//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
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
			}else {	
				if (AInfo['Limited Operation'] == "Yes"){
					var approvalLetter = "";
					var emailTemplate = "LCA_LIMITED_OP_RENEWAL_APPROVAL";
				}else if (AInfo["License Issued Type"] == "Provisional"){
					var approvalLetter = "";
					var emailTemplate = "LCA_RENEWAL_APPROVAL";
				}else{
					var approvalLetter = "";
					var emailTemplate = "LCA_ANNUAL_RENEWAL_APPROVAL";
				}
				var scriptName = "asyncRunOfficialLicenseRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("licType",licType);
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
							setAddResult=aa.set.add(sName,licId);
							if(setAddResult.getSuccess()){
								logDebug(capId.getCustomID() + " successfully added to set " +sName);
							}else{
								logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
							}
						}
						var invoiceSet = createSet("POSTAL_RENEWAL INVOICE","Renewal Notifications", "New");
						if(invoiceSet){
							setAddResult=aa.set.add(invoiceSet,capId);
							if(setAddResult.getSuccess()){
								logDebug(capId.getCustomID() + " successfully added to set " +invoiceSet);
							}else{
								logDebug("Error adding record to set " + invoiceSet + ". Error: " + setAddResult.getErrorMessage());
							}
						}
					}
				}
			}
		// Add record to the CAT set
			addToCat(licId);
		// 7088: Create License Case Record for all Renewals when a Science Amendment associated to the License Parent Record has not been submitted prior to submission of a Provisional Renewal for that corresponding renewal year
			if (AInfo['License Change'] == "Yes" || AInfo["Designation Change"] == "Yes" || getAppSpecific("License Issued Type", licId) == "Provisional"){
				var scienceArr = getChildren("Licenses/Cultivator/Amendment/Science",licId);
				if (scienceArr) {
					if (scienceArr.length > 0) {
						for (x in scienceArr){
							var scienceCap = scienceArr[x];
							var saAppStatus = aa.cap.getCap(scienceCap).getOutput().getCapStatus();
							if (!matches(saAppStatus,"Transition Amendment Approved", "Amendment Rejected", "Amendment Approved")){
								if(AInfo['License Change'] == "Yes" || AInfo["Designation Change"] == "Yes"){
									editAppSpecific("License Type",licType,scienceCap);
									editAppName(AInfo["License Issued Type"] + " " + cultType + " - " + licType,scienceCap);
								}
								if(AInfo['License Change'] == "Yes") {
					//				editAppSpecific("Aggregate square footage of noncontiguous canopy-NEW",AInfo["Aggragate Canopy Square Footage"],scienceCap);
									editAppSpecific("Canopy SF",AInfo["Aggragate Canopy Square Footage"],scienceCap);
									editAppSpecific("Canopy Plant Count",AInfo["Canopy Plant Count"],scienceCap);
								}
							}
							if (getAppSpecific("License Issued Type", licId) == "Provisional"){
								if (getAppSpecific("Associated Renewal",scienceCap) == "Yes"){
									var correspondingYear = getAppSpecific("Renewal Year",scienceCap)
									logDebug("expYear: " + expYear);
									if (String(correspondingYear) == String(expYear)){
										var licCaseExclusion = false;
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
							}else{
								licCaseExclusion = true;
							}
						}
					}
				}
			}else{
				if (getAppSpecific("License Issued Type", licId) != "Provisional"){
					licCaseExclusion = true;
				}

			}
			if (!licCaseExclusion){
				var licCaseId = createChild("Licenses","Cultivator","License Case","NA","",licId);
				if (licCaseId){
					// Set alt id for the case record based on the number of child case records linked to the license record
					cIds = getChildren("Licenses/Cultivator/License Case/*",licId);
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
					newLCAltId = licId.getCustomID() + "-LC"+ yy + "-" + amendNbr;
					var updateResult = aa.cap.updateCapAltID(licCaseId, newLCAltId);
					if (updateResult.getSuccess()){
						logDebug("Created License Case: " + newLCAltId + ".");
					}else{ 
						logDebug("Error renaming amendment record " + licCaseId);
					}
					// Copy the Designated resposible Party contact from the License Record to the Case record
					//copyContactsByType_rev(licId,licCaseId,"Designated Responsible Party");
					
					// Copy custom fields from the license record to the Case record
					holdId = capId;
					capId = licId;
					PInfo = new Array;
					loadAppSpecific(PInfo);
					capId = holdId;
					editAppSpecific("License Number",licId.getCustomID(),licCaseId);
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
					logDebug("Failed to create License Case Record for " + licId.getCustomID());
				}
			}						
		}
	}else {
		fastTrack = 'No'
	}
	return fastTrack
}
