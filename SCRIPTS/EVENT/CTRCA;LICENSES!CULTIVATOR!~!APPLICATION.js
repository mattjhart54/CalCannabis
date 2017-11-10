//lwacht
//remove conditions after documents are uploaded
try{
	var cType = "License Required Documents";
	var capCondResult = aa.capCondition.getCapConditions(capId,cType);
	if (!capCondResult.getSuccess()){
		logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()) ; 
	}else{
		var ccs = capCondResult.getOutput();
		for (pc1 in ccs){
			var rmCapCondResult = aa.capCondition.deleteCapCondition(capId,ccs[pc1].getConditionNumber()); 
			if (rmCapCondResult.getSuccess())
				logDebug("Successfully removed condition to CAP : " + capId + "  (" + cType + ") ");
			else
				logDebug( "**ERROR: removing condition  (" + cType + "): " + rmCapCondResult.getErrorMessage());
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Remove Conditions: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Remove Conditions: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
//mhart
//send local auth notification and update work description with Legal Business Name
//lwacht: don't run for temporary app 
try {
	if(appTypeArray[2]!="Temporary"){
		sendLocalAuthNotification();
		updateLegalBusinessName();
		editAppName(AInfo["License Type"]);
		updateShortNotes(AInfo["Premise County"]);
	}
}catch (err){
	logDebug("A JavaScript Error occurred: CRTCA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/*/Application: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht
//add child if app number provided
try{
	if(!matches(AInfo["Temp App Number"],null,"", "undefined")){
		var tmpID = aa.cap.getCapID(AInfo["Temp App Number"]);
		if(tmpID.getSuccess()){
			var childCapId = tmpID.getOutput();
			var parId = getParentByCapId(childCapId);
			if(parId){
				var linkResult = aa.cap.createAppHierarchy(capId, parId);
				if (!linkResult.getSuccess()){
					logDebug( "Error linking to parent application parent cap id (" + capId + "): " + linkResult.getErrorMessage());
				}
			}else{
				var linkResult = aa.cap.createAppHierarchy(capId, childCapId);
				if (!linkResult.getSuccess()){
					logDebug( "Error linking to temp application(" + childCapId + "): " + linkResult.getErrorMessage());
				}
			}				
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Relate Temp Record: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Relate Temp Record: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht: if defer payment is used, then re-invoice the fees and turn the associated forms into real records
//lwacht: 171108: and send email
try{
	if(feeBalance>0){
		var targetFees = loadFees(capId);
		for (tFeeNum in targetFees) {
			targetFee = targetFees[tFeeNum];
			if (targetFee.status == "INVOICED") {
				var feeSeq = targetFee.sequence;
			}
		}
		var invResObj = aa.finance.getFeeItemInvoiceByFeeNbr(capId, parseFloat(feeSeq), null);
		var X4invoices = invResObj.getOutput();
		var X4invoice = X4invoices[0]; 
		invoiceNbr=X4invoice.getInvoiceNbr(); 
		logDebug(invoiceNbr);
		runReportAttach(capId,"CDFA_Invoice_Params", "capID", capId, "invoiceNbr", invoiceNbr, "agencyid","CALCANNABIS");
		runReportAttach(capId,"CDFA_AppFeesDue", "altId", capId.getCustomID());
		emailRptContact("CTRCA", "LCA_GENERAL_NOTIFICATION", "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
		deactivateTask("Administrative Review");
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Convert Assoc Forms: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Convert Assoc Forms: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
