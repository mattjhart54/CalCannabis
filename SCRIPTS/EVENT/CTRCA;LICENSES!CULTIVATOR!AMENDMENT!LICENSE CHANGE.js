try{
// Make the amendment record accessible in ACA	
	aa.cap.updateAccessByACA(capId,"Y");
// Update alt id on amendment record
	logDebug("parentCapId " + parentCapId);
	if (matches(parentCapId,null,undefined,"")){
		var parentASINum = AInfo["License Number"];
		parentCapId = aa.cap.getCapID(parentASINum).getOutput();
	}
	logDebug("parentCapId " + parentCapId);
	if (parentCapId != null) {
		pAltId = parentCapId.getCustomID();
		cIds = getChildren("Licenses/Cultivator/Amendment/License Change",parentCapId);
		if(matches(cIds, null, "", undefined)) 
			amendNbr = "0" + 1;
		else {
			cIdLen = cIds.length 
			if(cIds.length <= 9) {
				amendNbr = cIdLen + 1;
				amendNbr = "0" +  amendNbr;
			}else {
				amendNbr = cIdLen + 1;
			}
		}
		newAltId = pAltId + "-CLC" + amendNbr;
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		aa.env.setValue("capAltID", newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
	}
//If no balance Due Update License Record
	if (balanceDue <= 0){
	// Update License Expiration Date
		var vNewExpDate = new Date(AInfo['New Expiration Date']);
		logDebug("Updating Expiration Date to: " + vNewExpDate);
		vLicenseObj = new licenseObject(null, parentCapId);
		vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
		editAppSpecific("Expiration Date Changed","CHECKED",parentCapId);
		editAppSpecific("Date Expiration Date Changed",fileDate,parentCapId);
	
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
			if(appHasCondition_rev("License Notice","Applied","Suspension Lift Notice",null,parentCapId)){
				editCapConditionStatus("License Notice","Suspension Lift Notice","Condition Met","Not Applied","",parentCapId);
			}
			vLicenseObj.setStatus("Active");
		}
		if (vCapStatus == "Suspended" || savedCapStatus == "Suspended"){
			updateAppStatus("Suspended","License Change",parentCapId);
		}
	// Update Canopy Size on the license record
		if(AInfo['License Change'] == "Yes"){
			editAppSpecific("License Type",AInfo["New License Type"],parentCapId);
			editAppSpecific("Canopy SF",AInfo["Aggragate Canopy Square Footage"],parentCapId);
			editAppSpecific("Canopy Plant Count",AInfo["Canopy Plant Count"],parentCapId);
			var licType = AInfo["New License Type"];
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
		histRow["Record number of source"] = "" + String(newAltId);
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
		var scriptName = "asyncRunOfficialLicenseRpt";
		var envParameters = aa.util.newHashMap();
		var feeNotification = "LCA_CLC_FEE_PAID";
		if (AInfo["Net Due/Refund"] < 0){
			renArray = getChildren("Licenses/Cultivator/*/Renewal",parentCapId);
			if (renArray && renArray.length > 0) {
				renArray.reverse();
			 	if(!appHasCondition_rev("License Notice","Applied","SB 833 Refund",null,renArray[0])){
					addStdCondition("License Notice","SB 833 Refund",renArray[0]);
				}
			 }else{
			 	appArray = getChildren("Licenses/Cultivator/*/Application",parentCapId);
			 	if(!appHasCondition_rev("License Notice","Applied","SB 833 Refund",null,appArray[0])){
					addStdCondition("License Notice","SB 833 Refund",appArray[0]);
				}
			 }
			feeNotification = "LCA_CLC_NO_FEE";
		}
		envParameters.put("licType",licType);
		envParameters.put("appCap",capId.getCustomID());
		envParameters.put("licCap",pAltId);
		envParameters.put("reportName","Official License Certificate");
		envParameters.put("approvalLetter", "");
		envParameters.put("emailTemplate", feeNotification);
		envParameters.put("reason", "");
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
//Send Balance Due Notification
	if (balanceDue){
		//SEND NOTIFICATIONS HERE
		updateAppStatus("License Change Fee Due"," ");
		editAppSpecific("Payment Due Date",nextWorkDay(dateAdd(null,29)));
	}

} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
