try {
	if(wfTask == 'Science Manager Review' && wfStatus == 'Conversion Approved') {
		var qty = 0;
		var days = 0;
		var credit = 0;
		var feeAmt = 0;
		var dFeeAmt = 0
		var pFeeAmt = 0;
		var tFeeAmt = 0;
    
// Access new license fee
		var licType = AInfo["Proposed License Type"];
		if(licType.substring(0,5) == "Large")
			qty = AInfo["Canopy SF"];
		else
			qty = 1;
		var licFeeDesc = licType + " - License Fee";
		var thisFee = getFeeDefByDesc("LIC_CC_Conversion", licFeeDesc);
		if(thisFee){
			licFeeCode = thisFee.feeCode; 
			logDebug("Lic Fee Code " + licFeeCode);
			addFee(licFeeCode,"LIC_CC_CONVERSION", "FINAL", parseInt(qty), "N");
		}else{
			aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: WTUA:Licenses/Cultivation/Consion Request/NA: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
			logDebug("An error occurred retrieving fee item: " + licFeeDesc);
		}
    
// pro rate the fee on the primary license 
		crCapId = capId;
		pId = AInfo["License Number"]; 
		capId = aa.cap.getCapID(pId).getOutput();
		PInfo = [];
		loadAppSpecific(PInfo);
		var vLicenseObj;
		vLicenseObj = new licenseObject(null,capId);
		vExpDate = vLicenseObj.b1ExpDate;
		days = parseInt(dateDiff(sysDate,vExpDate));
		logDebug("days " + days);
		if(days > 0) {
			var feeDesc = PInfo["License Type"] + " - License Fee";
			var thisFee = getFeeDefByDesc("LIC_CC_CULTIVATOR", feeDesc);
			feeAmt = thisFee.formula
			logDebug("fee " + feeDesc + " amt " + feeAmt);
			dFeeAmt = feeAmt / 365;
			pFeeAmt = dFeeAmt * days;
			tFeeAmt = tFeeAmt + pFeeAmt;
			logDebug("pFeeAmt " + pFeeAmt);
		}
    
// pro rate the fee on all the converted licenses
		for(i in LICENSERECORDSFORCONVERSION) {
			cId = LICENSERECORDSFORCONVERSION[i]["License Record ID"];
			capId = aa.cap.getCapID(cId).getOutput();
			cCap = aa.cap.getCap(capId).getOutput();
			cStatus = cCap.getCapStatus();
			logDebug("record " +cId + " status " + cStatus);
			if(matches(cStatus,"Active","About to Expire","Suspended")) {
				PInfo = [];
				loadAppSpecific(PInfo);
				var vLicenseObj;
				vLicenseObj = new licenseObject(null,capId);
				vExpDate = vLicenseObj.b1ExpDate;
				days = dateDiff(sysDate,vExpDate);
				logDebug("days " + days);
				if(days > 0) {
					var feeDesc = PInfo["License Type"] + " - License Fee";
					var thisFee = getFeeDefByDesc("LIC_CC_CULTIVATOR", feeDesc);
					feeAmt = thisFee.formula
					logDebug("fee " + feeDesc + " amt " + feeAmt);
					dFeeAmt = feeAmt / 365;
					pFeeAmt = dFeeAmt * days;
					tFeeAmt = tFeeAmt + pFeeAmt;
					logDebug("pFeeAmt " + pFeeAmt);
				}
			}
		}
    
// Assess the prorated license conversion credit and invoice fees
		capId = crCapId;
		licFeeAmt = feeAmount(licFeeCode,"NEW");
		logDebug(" lic fee " + licFeeAmt + " tFee " + tFeeAmt);
		if(tFeeAmt > 0 && tFeeAmt < licFeeAmt) {
			addFee("LIC_CCR_CRD","LIC_CC_CONVERSION", "FINAL", tFeeAmt.toFixed(2), "N");
			licFeeAmt = licFeeAmt + feeAmount("LIC_CCR_CRD","NEW");
			invNbr = invoiceAllFees();
			updateAppStatus("License Fee Due","Conversion fees due");
    
// Run invoice report and email approval email to DRP		
			var scriptName = "asyncRunInvoiceParamsRpt";
			var envParameters = aa.util.newHashMap();
			envParameters.put("licCap",capId.getCustomID()); 
			envParameters.put("invNbr", invNbr);
			envParameters.put("feeAmount", licFeeAmt);
			envParameters.put("currentUserID",currentUserID);
			envParameters.put("licType",licType);
			envParameters.put("templateName", "LIC_CC_CCR_APPROVED");
			aa.runAsyncScript(scriptName, envParameters);	
		}else {
		
// Fee balance zero.  Update Primary record, generate License Certificate and email with Approval Letter

			voidRemoveFeesByDesc(licFeeDesc);
			plId = aa.cap.getCapID(pId).getOutput();
			updateConvRecs(plId);
			
//run the License Report and send approval email
			var appAltId = capId.getCustomID();
			var licAltId = plId.getCustomID();
			var scriptName = "asyncRunOfficialLicenseRpt";
			var envParameters = aa.util.newHashMap();
			envParameters.put("licType", licType);
			envParameters.put("appCap",appAltId);
			envParameters.put("licCap",licAltId); 
			envParameters.put("reportName","Official License Certificate"); 
			//envParameters.put("approvalLetter", "");
			if(AInfo["No Transition"] == "CHECKED") {
				var templateName = "LIC_CC_CCR_APPR_NO_FEE_PROV";
				envParameter.put("reason", AInfo["Reason for Provisional Renewal"]);
			}else {
				envParameters.put("reason", "");
				var templateName = "LIC_CC_CCR_APPR_NO_FEE";
			}
			envParameters.put("emailTemplate", templateName);
			envParameters.put("currentUserID",currentUserID);
			envParameters.put("contType","Designated Responsible Party");
			envParameters.put("fromEmail",sysFromEmail);
			aa.runAsyncScript(scriptName, envParameters);
		}
	}	
}catch(err){
	logDebug("An error has occurred in ASB:LICENSES/CULTIVATOR/Batch/Conversion: " + err.message);
	logDebug(err.stack);
}