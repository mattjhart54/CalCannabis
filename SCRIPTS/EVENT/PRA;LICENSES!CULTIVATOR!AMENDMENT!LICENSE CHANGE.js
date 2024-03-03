try{
	if (balanceDue <= 0){
	// Update License Expiration Date
		altId = capId.getCustomID();
		var vNewExpDate = new Date(AInfo['New Expiration Date']);
		logDebug("Updating Expiration Date to: " + vNewExpDate);
		vLicenseObj = new licenseObject(null, parentCapId);
		vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
		editAppSpecific("Expiration Date Changed","CHECKED",parentCapId);
		editAppSpecific("Date Expiration Date Changed",fileDate,parentCapId);
		editAppSpecific("Payment Due Date","");
		updateAppStatus("Fee Paid - Approved", "Updated via PRA Script after payment.");
	
	//Set license status Apply Suspension Lift Notice - Verify Needed	
		savedCapStatus = getAppSpecific("Saved License Status",parentCapId);
		vCapStatus = aa.cap.getCap(parentCapId).getOutput().getCapStatus();
		limitedOp = AInfo['Limited Operation'] == "Yes";
		if(limitedOp){
			editAppSpecific("Limited Operations","Yes",parentCapId);
			if (vCapStatus == "Suspended" || savedCapStatus == "Suspended"){
				if(!appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,parentCapId)){
		 			addStdCondition("License Notice","Suspension Lift Notice",parentCapId);
		 		}
	 		}else{
	 			updateAppStatus("Limited Operations","License Change",parentCapId);
				if(appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,parentCapId)){
					editCapConditionStatus("License Notice","Suspension Lift Notice","Condition Met","Not Applied","",parentCapId);
				}
			}
		}else{
			editAppSpecific("Limited Operations","No",parentCapId);
			if (vCapStatus == "Limited Operations"){
				updateAppStatus("Active","License Change",parentCapId);
			}
			if(appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,parentCapId)){
				editCapConditionStatus("License Notice","Suspension Lift Notice","Condition Met","Not Applied","",parentCapId);
			}
		}
		if (vCapStatus == "Suspended" || savedCapStatus == "Suspended"){
			updateAppStatus("Suspended","License Change",parentCapId);
		}
		
		if(AInfo['License Change'] == "Yes")
			var licType = AInfo["New License Type"];
		else
			var licType = AInfo["License Type"];
		
	// Update Canopy Size on the license record
		if(AInfo['License Change'] == "Yes"){
			editAppSpecific("License Type",AInfo["New License Type"],parentCapId);
			editAppSpecific("Canopy SF",AInfo["Aggragate Canopy Square Footage"],parentCapId);
			editAppSpecific("Canopy Plant Count",AInfo["Canopy Plant Count"],parentCapId);
			
			var cultType = AInfo["Cultivator Type"];
			editAppName(AInfo["License Issued Type"] + " " + cultType + " - " + licType,parentCapId);	
		}
	// Update License Renewal History table upon license
		var LICENSERENEWALHISTORY = new Array();
		var histRow = new Array();
	
		var renYear = vNewExpDate.getFullYear();
		var newExpStatus = aa.cap.getCap(parentCapId).getOutput().getCapStatus();
		var expDateForamatted = dateFormatted(vNewExpDate.getMonth()+1, vNewExpDate.getDate(), vNewExpDate.getFullYear(), "MM/DD/YYYY");
	
		histRow["Renewal Year"] = "" + String(renYear);
		histRow["Record number of source"] = "" + String(altId);
		histRow["License Expiration"] = "" + String(expDateForamatted);
		histRow["License Status"] = "" + newExpStatus;
		histRow["Limited Operation"] = "" + AInfo['Limited Operation'];
		histRow["License Type"] = "" + String(licType); 
		histRow["Canopy Square Feet"] = "" + (getAppSpecific("Canopy SF",parentCapId) || "");
		histRow["Canopy Plant Count"] = "" + (getAppSpecific("Canopy Plant Count",parentCapId) || "");
		histRow["Canopy Square Footage Limit"] = "" + (getAppSpecific("Canopy SF Limit",parentCapId) || "");
		
		LICENSERENEWALHISTORY.push(histRow);
		addASITable("LICENSE RENEWAL HISTORY", LICENSERENEWALHISTORY, parentCapId);
	
	
	//Run Official License Certificate 
		var scriptName = "asyncRunOfficialLicenseRptForAmendment";
		var envParameters = aa.util.newHashMap();
		envParameters.put("reportName","Official License Certificate");
		envParameters.put("appCap",capId.getCustomID());
		envParameters.put("licCap",parentCapId.getCustomID());
		envParameters.put("licType",licType);
		envParameters.put("emailTemplate", "LCA_CLC_FEE_PAID");
		envParameters.put("refundAmount", "");
		envParameters.put("currentUserID",currentUserID);
		envParameters.put("contType","Designated Responsible Party");
		envParameters.put("fromEmail",sysFromEmail);
		
		aa.runAsyncScript(scriptName, envParameters);
	
	// Add record to the CAT set
		addToCat(parentCapId);
	
	//Update Active Science Amendments
		var scienceArr = getChildren("Licenses/Cultivator/Amendment/Science",parentCapId);
		if (scienceArr) {
			if (scienceArr.length > 0) {
				for (x in scienceArr){
					var scienceCap = scienceArr[x];
					var saAppStatus = aa.cap.getCap(scienceCap).getOutput().getCapStatus();
					if (!matches(saAppStatus,"Transition Amendment Approved", "Amendment Rejected", "Amendment Approved")){
						if(AInfo['License Change'] == "Yes"){
							editAppSpecific("License Type",licType,scienceCap);
							editAppName(AInfo["License Issued Type"] + " " + cultType + " - " + licType,scienceCap);
						}
						if(AInfo['License Change'] == "Yes") {
							editAppSpecific("Canopy SF",AInfo["Aggragate Canopy Square Footage"],scienceCap);
							editAppSpecific("Canopy Plant Count",AInfo["Canopy Plant Count"],scienceCap);
						}
					}
				}
			}
		}
	}

} catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in PRA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
