try {
	if(wfTask == 'Conversion Review' && wfStatus == 'Not Converted') {
		var priContact = getContactObj(capId,"Designated Responsible Party");
		if(priContact){
			rFiles = [];
			priEmail = priContact.capContact.email;
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$altId$$", capId.getCustomID());
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$priEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$reason$$", AInfo["Reason Not Converted"]);
			sendApprovalNotification(sysFromEmail,priEmail,"","LIC_CC_CCR_NOT_CONVERTED",eParams,rFiles,capId);
		}else{
			logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
		}
	}
	if(wfTask == 'Conversion Review' && wfStatus == 'Closed') {
		var priContact = getContactObj(capId,"Designated Responsible Party");
		if(priContact){
			rFiles = [];
			priEmail = priContact.capContact.email;
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$altId$$", capId.getCustomID());
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$priEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$reason$$", AInfo["Reason for Closure"]);
			sendApprovalNotification(sysFromEmail,priEmail,"","LIC_CC_CCR_CLOSED",eParams,rFiles,capId);
		}else{
			logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
		}
	}
	if(wfTask == 'Science Manager Review' && wfStatus == 'Conversion Approved') {
		var qty = 0;
		var days = 0;
		var credit = 0;
		var feeAmt = 0;
		var dFeeAmt = 0
		var pFeeAmt = 0;
		var tFeeAmt = 0;
		var licFeeAmt = 0;

// Access new license fee
		var licType = AInfo["Proposed License Type"];
		var feeDesc = licType + " - License Fee";
		var thisFee = getFeeDefByDesc("LIC_CC_CONVERSION", feeDesc);
		if(thisFee){
		licFeeCode = thisFee.feeCode;
			feeSeqNbr = addFee(licFeeCode,"LIC_CC_CONVERSION", "FINAL", 1, "N");
			licFeeAmt = feeAmount(licFeeCode,"NEW");
		}else{
			aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: WTUA:Licenses/Cultivation/Consion Request/NA: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
			logDebug("An error occurred retrieving fee item: " + feeDesc);
		}
		if(licType.substring(0,5) == "Large") {
			lType = lookup("LIC_CC_LICENSE_TYPE", licType);
			if(!matches(lType,"", null, undefined)){
				licTbl = lType.split(";");
				var base = parseInt(licTbl[3]);
				feeDesc = licType + " - Per 2,000 sq ft over " + maskTheMoneyNumber(base);
				logDebug("feeDesc " + feeDesc);
				thisFee = getFeeDefByDesc("LIC_CC_CONVERSION", feeDesc);
				overFeeCode = thisFee.feeCode;
				if(!matches(AInfo["Canopy SF-NEW"], "", null, undefined))
					var sqft = AInfo["Canopy SF-NEW"];
				else
					var sqft = AInfo["Canopy SF"];
				logDebug("SQ FT " + sqft + " Base " + base);
				qty = (parseInt(sqft) - base) / 2000;
				logDebug("qty " + parseInt(qty));
				if(qty > 0){		
					if(thisFee){	
						feeSeqNbr = addFee(overFeeCode,"LIC_CC_CULTIVATOR", "FINAL", parseInt(qty),"N");
					}else{
						aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: WTUA:Licenses/Cultivation/Conversion Request/NA: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
						logDebug("An error occurred retrieving fee item: " + feeDesc);
					}
				}
			}
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
			if(matches(cStatus,"Active","About to Expire","Suspended")) {
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

				}
			}
		}
    
// Assess the prorated license conversion credit and invoice fees
		capId = crCapId;
		licFeeAmt = feeAmount(licFeeCode,"NEW");
		if(licType.substring(0,5) == "Large") {
			licFeeAmt = licFeeAmt + feeAmount(overFeeCode,"NEW");
		}	
		logDebug("pFeeAmt " + pFeeAmt + " licFeeAmt " + licFeeAmt);
		if(tFeeAmt > 0 && tFeeAmt < licFeeAmt) {
			addFee("LIC_CCR_CRD","LIC_CC_CONVERSION", "FINAL", tFeeAmt.toFixed(2), "N");
			licFeeAmt = licFeeAmt + feeAmount("LIC_CCR_CRD","NEW");
			licFeeAmt =licFeeAmt.toFixed(2);
			licFeeAmt = "$" + Number(licFeeAmt);
			licFeeAmt = maskTheMoneyNumber(licFeeAmt);
			logDebug("Number LicFee " + licFeeAmt);
			invNbr = invoiceAllFees();
			updateAppStatus("License Fee Due","Conversion fees due");
			editAppSpecific("License Fee Due", dateAdd(jsDateToASIDate(new Date),30));
			
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
			addFee("LIC_CCR_CRD","LIC_CC_CONVERSION", "FINAL", licFeeAmt, "N");
			invNbr = invoiceAllFees();
			plId = aa.cap.getCapID(pId).getOutput();
			updateConvRecs(plId);
			
			var result1 = aa.cap.removeProjectChild(capId, plId);
			if (result1.getSuccess())
				logDebug("Child Primary License successfully removed");
			else
				logDebug("Could not remove child Primary License");
			
			var result = aa.cap.createAppHierarchy(plId, capId);
			if (result.getSuccess())
				logDebug("Primary License successfully linked as parent");
			else
				logDebug("Could not link Primary License as a parent");
			
// Run the Sceintific Checklist Report
			var appAltId = capId.getCustomID();
			var licAltId = plId.getCustomID();
//			runReportAttach(capId,"Scientific Review Checklist","altId",licAltId);
			var scriptName = "asyncRunScientificChecklist";
			var envParameters = aa.util.newHashMap();
			envParameters.put("saCap",licAltId);
			envParameters.put("licCap",licAltId); 
			envParameters.put("reportName","Scientific Review Checklist"); 
			envParameters.put("currentUserID",currentUserID);
			aa.runAsyncScript(scriptName, envParameters);								
			
//run the License Report and send approval email
			var scriptName = "asyncRunOfficialLicenseRpt";
			var envParameters = aa.util.newHashMap();
			envParameters.put("licType", licType);
			envParameters.put("appCap",appAltId);
			envParameters.put("licCap",licAltId); 
			envParameters.put("reportName","Official License Certificate"); 
			//envParameters.put("approvalLetter", "");
			if(AInfo["No Transition"] == "CHECKED") {
				var templateName = "LIC_CC_CCR_APPR_NO_FEE_PROV";
				envParameters.put("reason", AInfo["Reason for Provisional Conversion"]);
			}else {
				envParameters.put("reason", "");
				var templateName = "LIC_CC_CCR_APPR_NO_FEE";
			}
			envParameters.put("emailTemplate", templateName);
			envParameters.put("currentUserID",currentUserID);
			envParameters.put("contType","Designated Responsible Party");
			envParameters.put("fromEmail",sysFromEmail);
			aa.runAsyncScript(scriptName, envParameters);
					
//notify processor that converion request has been paid and new license issued		
			wf = aa.workflow.getTaskItemByCapID(capId,null).getOutput();
			for(x in wf) {
				fTask = wf[x]; 
				taskName=fTask.getTaskDescription();
				if (taskName == "Conversion Review"){
				var caseMgr = wf[x].getAssignedStaff().getFirstName()+ " " +wf[x].getAssignedStaff().getLastName();
					var assignedUserID = aa.person.getUser(wf[x].getAssignedStaff().getFirstName(),wf[x].getAssignedStaff().getMiddleName(),wf[x].getAssignedStaff().getLastName()).getOutput();
					if(assignedUserID!=null){
						var staffEmail = assignedUserID.getEmail();
						if(staffEmail){
							email(staffEmail, sysFromEmail, "CLS - Converted License has been issued", "Conversion Request Record " + appAltId + " has been approved and payment is complete. The converted license has been issued for License Record " + licAltId + ".");
						}
					}
				}
			}		
		}
	}			
}catch(err){
	logDebug("An error has occurred in ASB:LICENSES/CULTIVATOR/Batch/Conversion: " + err.message);
	logDebug(err.stack);
}
