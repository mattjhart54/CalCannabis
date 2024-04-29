try{
// Make the amendment record accessible in ACA	
	aa.cap.updateAccessByACA(capId,"Y");
// Update alt id on amendment record
	logDebug("parentCapId " + parentCapId);
	if (matches(parentCapId,null,undefined,"")){
		var licNum = AInfo["License Number"];
		parentCapId = getApplication(licNum);
		var pLic = getParent();
		if (!pLic) {
			addParent(licNum);
		}
	}
	logDebug("parentCapId " + parentCapId);
	if (parentCapId != null) {
		pAltId = parentCapId.getCustomID();
		cIds = getChildren("Licenses/Cultivator/Amendment/License Change",parentCapId);
		var cIdLen = 0;
		for (x in cIds) {
			cId = cIds[x];
			altId = cId.getCustomID();
			if(altId.indexOf("TMP") == -1)
				cIdLen = cIdLen + 1;
		}
		if(matches(cIds, null, "", undefined)) 
			amendNbr = "0" + 1;
		else {
			if(cIdLen <= 9) {
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
// Add Contacts
	copyContactsByType_rev(parentCapId,capId,"Designated Responsible Party");
	copyContactsByType_rev(parentCapId,capId,"Business");
// Invoice fees if fees are only assessed
	var feeDue = false;
	var invNbr = 0;
	var feeAmount = 0;
	var feeSeq = 0;
	var feeCode = "";
	var feePeriod = "";
	var vFeeSeqArray = new Array();
	var vPaymentPeriodArray = new Array();
	var newFeeFound = false;
	var targetFees = loadFees(capId);
	for (tFeeNum in targetFees) {
		targetFee = targetFees[tFeeNum];
		logDebug("fee status is " + targetFee.status);
		if (targetFee.status == "NEW") {
			feeSeq = targetFee.sequence;
			feePeriod = targetFee.period;

			vFeeSeqArray.push(feeSeq);
			vPaymentPeriodArray.push(feePeriod);

			var invoiceResult_L = aa.finance.createInvoice(capId, vFeeSeqArray, vPaymentPeriodArray);
			if (!invoiceResult_L.getSuccess())
				logDebug("**ERROR: Invoicing the fee items was not successful. Reason: " + invoiceResult_L.getErrorMessage());
			else
				feeDue = true;
		}
	}
//get fee details
//retrieve a list of invoices by capID
	logDebug("Checking invoices")
	var iListResult = aa.finance.getInvoiceByCapID(capId,null);
	if (iListResult.getSuccess()) {
		var iList = iListResult.getOutput();			
		for (var iNum in iList) {
			var fList = aa.invoice.getFeeItemInvoiceByInvoiceNbr(iList[iNum].getInvNbr()).getOutput();
			for (var fNum in fList) {	
				invNbr = iList[iNum].getInvNbr();
				feeAmount = fList[fNum].getFee();
			}
		}
	} else {
		logDebug("Error: could not retrieve invoice list: " + iListResult.getErrorMessage());
	}
	
	logDebug("Invoice Number Found: " + invNbr);
	logDebug("Fee Amount: " + feeAmount);
	if(AInfo['License Change'] == "Yes"){
		licType = AInfo["New License Type"];
	}else{
		licType = AInfo["License Type"];
	}
	updateWorkDesc(getAppSpecific("Legal Business Name",parentCapId));
	editAppName("License Change - " + licType);
	updateShortNotes(getAppSpecific("Premise City",parentCapId) + " - " + getAppSpecific("Premise County",parentCapId));
//If no balance Due Update License Record
	if (!feeDue){
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
		var scriptName = "asyncRunOfficialLicenseRptForAmendment";
		var envParameters = aa.util.newHashMap();
		var feeNotification = "LCA_CLC_FEE_PAID";
		var refundAmount = 0;
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
			refundAmount = maskTheMoneyNumber(Math.abs(AInfo["Net Due/Refund"]).toFixed(2));
		}
		envParameters.put("reportName","Official License Certificate");
		envParameters.put("appCap",newAltId);
		envParameters.put("licCap",pAltId);
		envParameters.put("licType",licType);
		envParameters.put("emailTemplate", feeNotification);
		envParameters.put("refundAmount", refundAmount);
		envParameters.put("currentUserID",currentUserID);
		envParameters.put("contType","Designated Responsible Party");
		envParameters.put("fromEmail",sysFromEmail);
		
		aa.runAsyncScript(scriptName, envParameters, 5000);
	
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
//Send Invoice Params Rpt Notification
	if (feeDue){
		var scriptName = "asyncRunInvoiceParamsRpt";
		var envParameters = aa.util.newHashMap();
		var feeNotification = "LCA_CLC_FEE_DUE";
		
		envParameters.put("licCap",newAltId);
		envParameters.put("licType",licType);
		envParameters.put("invNbr",invNbr);
		envParameters.put("feeAmount", maskTheMoneyNumber(feeAmount));
		envParameters.put("currentUserID",currentUserID);
		envParameters.put("templateName", feeNotification);
		
		aa.runAsyncScript(scriptName, envParameters, 5000);
	
		updateAppStatus("License Change Fee Due"," ");
		editAppSpecific("Payment Due Date",nextWorkDay(dateAdd(null,29)));
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/AMENDMENT/LICENSE CHANGE: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/AMENDMENT/LICENSE CHANGE: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
