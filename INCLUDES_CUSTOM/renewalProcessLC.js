function renewalProcessLC() {	
		var fastTrack = true;
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
					if(matches(getAppSpecific("Case Renewal Type",childCapId),"Renewal Hold")) {
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
							
							holdId = capId;
							capId = renCapId;
							AInfo = [];
							loadAppSpecific(AInfo);
							loadASITables;	
							
							// Get current expiration date.
							vLicenseObj = new licenseObject(null, parentCapId);
							vExpDate = vLicenseObj.b1ExpDate;
							vExpDate = new Date(vExpDate);
							// Update license expiration date and Extend license expiration by 1 year
							if (AInfo["License Expiration Date Change"] == "Yes" && !matches(AInfo["New Expiration Date"],null,undefined,"")){
								vNewExpDate = new Date(AInfo["New Expiration Date"]);
								logDebug("Updating Expiration Date to: " + vNewExpDate);
								vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
								editAppSpecific("Expiration Date Changed","CHECKED",parentCapId);
								editAppSpecific("Date Expiration Date Changed",fileDate,parentCapId);
							}else{
								vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
								logDebug("Updating Expiration Date to: " + vNewExpDate);
								vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
							}
							// Set license record expiration and status to active
							vLicenseObj.setStatus("Active");
							vCapStatus = aa.cap.getCap(parentCapId).getOutput().getCapStatus();	
							savedCapStatus = getAppSpecific("Saved License Status",parentCapId);
							
							limitedOp = AInfo['Limited Operation'] == "Yes";
							if(limitedOp){
								editAppSpecific("Limited Operations","Yes",parentCapId);
								if (vCapStatus == "Suspended" || savedCapStatus == "Suspended"){
									if(!appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,parentCapId)){
				 		 				addStdCondition("License Notice","Suspension Lift Notice",parentCapId);
				 		 			}
				 		 		}else{
				 		 			updateAppStatus("Limited Operations","License Renewed",licId);
									if(appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,parentCapId)){
										editCapConditionStatus("License Notice","Suspension Lift Notice","Condition Met","Not Applied","",parentCapId);
									}
								}
							}else{
								if(appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,parentCapId)){
									editCapConditionStatus("License Notice","Suspension Lift Notice","Condition Met","Not Applied","",parentCapId);
								}
							}
							if (vCapStatus == "Suspended" || savedCapStatus == "Suspended"){
								updateAppStatus("Suspended","License Renewed",parentCapId);
							}else {
								if (vCapStatus != "Inactive" && !limitedOp){
									updateAppStatus("Active","License Renewed",parentCapId);
								}
							}
							// Update Canopy Size on the license record
							if(getAppSpecific("License Change",renCapId) == "Yes"){
								editAppSpecific("License Type",AInfo["New License Type"],parentCapId);
				//				editAppSpecific("Aggregate square footage of noncontiguous canopy",AInfo["Aggragate Canopy Square Footage"],parentCapId);
								editAppSpecific("Canopy SF",AInfo["Aggragate Canopy Square Footage"],parentCapId);
								editAppSpecific("Canopy Plant Count",AInfo["Canopy Plant Count"],parentCapId);
								var licType = AInfo["New License Type"];
							}else{
								var licType = AInfo["icense Type"];
							}
							// Update the Cultivation Type on the license record
							var licIssueType = AInfo["License Issued Type"];
							var desChange = AInfo["Designation Change"];
							if(desChange == "Yes") {
								var cultType = AInfo["Designation Type"];
								editAppSpecific("Cultivator Type",cultType ,parentCapId);
							}else{
								var cultType = AInfo["Cultivator Type"];
							}
							editAppName(licIssueType + " " + cultType + " - " + licType,parentCapId);
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
									removeASITable("FINANCIAL INTEREST HOLDER",parentCapId);
									addASITable("FINANCIAL INTEREST HOLDER",finTable,parentCapId);
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
									addASITable("ELECTRICITY USAGE",elecTable,parentCapId);	
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
									addASITable("AVERAGE WEIGHTED GGEI",weigtedTable,parentCapId);
								}
							}
							// Story 7700: Update License Renewal History table upon license
							var LICENSERENEWALHISTORY = new Array();
							var histRow = new Array();
				
							var renYear = vNewExpDate.getFullYear();
							var newExpStatus = aa.cap.getCap(parentCapId).getOutput().getCapStatus();
							var expDateForamatted = dateFormatted(vNewExpDate.getMonth()+1, vNewExpDate.getDate(), vNewExpDate.getFullYear(), "MM/DD/YYYY");
				
							histRow["Renewal Year"] = "" + String(renYear);
							histRow["Record number of source"] = "" + altId;
							histRow["License Expiration"] = "" + String(expDateForamatted);
							histRow["License Status"] = "" + newExpStatus;
							histRow["Limited Operation"] = "" + AInfo['Limited Operation'];
							histRow["License Type"] = "" + String(licType); 
							histRow["Canopy Square Feet"] = "" + (getAppSpecific("Canopy SF",parentCapId) || "");
							histRow["Canopy Plant Count"] = "" + (getAppSpecific("Canopy Plant Count",parentCapId)  || "");
							histRow["Canopy Square Footage Limit"] = "" + (getAppSpecific("Canopy SF Limit",parentCapId)  || "");
							
							LICENSERENEWALHISTORY.push(histRow);
							addASITable("LICENSE RENEWAL HISTORY", LICENSERENEWALHISTORY, parentCapId);

							// Story 7750: Update Equity Fee Relief Tables
							var recordASIGroup = aa.appSpecificInfo.getByCapID(renCapId);
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
									equityRow["Relief Record Number"] = "" + renCapId.getCustomID();
									equityTable.push(equityRow);
									addASITable("EQUITY FEE RELIEF", equityTable, parentCapId);
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
							updateAppStatus("Approved","");				
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
							// 7694: On Renewal record when License Change Size, update open SA
							if (AInfo["License Change"] == "Yes" || desChange == "Yes"){
								var scienceArr = getChildren("Licenses/Cultivator/Amendment/Science",parentCapId);
								if (scienceArr) {
									if (scienceArr.length > 0) {
										for (x in scienceArr){
											var scienceCap = scienceArr[x];
											var saAppStatus = aa.cap.getCap(scienceCap).getOutput().getCapStatus();
											if (!matches(saAppStatus,"Transition Amendment Approved", "Amendment Rejected", "Amendment Approved")){
												editAppSpecific("License Type",licType,scienceCap);
												editAppName(AInfo["License Issued Type"] + " " + cultType + " - " + licType,scienceCap);
												if(AInfo['License Change'] == "Yes") {
						//							editAppSpecific("Aggregate square footage of noncontiguous canopy-NEW",AInfo["Aggragate Canopy Square Footage"],scienceCap);
													editAppSpecific("Canopy SF",AInfo["Aggragate Canopy Square Footage"],scienceCap);
													editAppSpecific("Canopy Plant Count",AInfo["Canopy Plant Count"],scienceCap);
												}
											}
										}
									}
								}
							}
						}
					// Add record to the CAT set
						addToCat(parentCapId);
						capId = holdId;
					}
				}
			}
		} else {
			fastTrack = false;
		}
	return fastTrack;
}
