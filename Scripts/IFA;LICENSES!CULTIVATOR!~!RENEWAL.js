try {
	var runRpt = false;
	var invoiceItem = aa.env.getValue("InvoiceNbrArray");
	appTypeArray = appTypeString.split("/");
	if(appTypeArray[3] == "Renewal") {
		for (i in invoiceItem) {
			var feeResult = aa.finance.getFeeItemInvoiceByInvoiceNbr(capId,invoiceItem[i],null);
			if(feeResult.getSuccess()) {
				feeItem = feeResult.getOutput();
				for(f in feeItem) {
					var feeStatus = feeItem[f].getFeeitemStatus();
					var feeItemDesc = feeItem[f].getFeeDescription();
					logDebug("Inv " + invoiceItem[i] + " status " + feeStatus + "fee desc " + feeItemDesc);
					if(feeStatus == "CREDITED") {
						runRpt = true;
					}
				}
				if(runRpt) {
					logDebug("Run Report");
					var scriptName = "asyncRunBalanceDueRpt";
					var envParameters = aa.util.newHashMap();
					envParameters.put("recNum",capId.getCustomID()); 
					envParameters.put("reportName","Balance Due Report"); 
					envParameters.put("contType","Designated Responsible Party"); 
					envParameters.put("currentUserID",currentUserID);
					envParameters.put("fromEmail",sysFromEmail);
					aa.runAsyncScript(scriptName, envParameters);
				} 
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in IFA:LICENSES/CULTIVATOR/*/RENEWAL: " + err.message);
	logDebug(err.stack);
}