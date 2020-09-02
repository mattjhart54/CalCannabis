try {
	var invoiceItem = aa.env.getValue("InvoiceNbrArray");
	var feeDesc = AInfo["License Type"] + " - Late Fee";
	for (i in invoiceItem) {
		var feeResult = aa.finance.getFeeItemInvoiceByInvoiceNbr(capId,invoiceItem[i],null);
		if(feeResult.getSuccess()) {
			feeItem = feeResult.getOutput();
			for(f in feeItem) {
				var feeStatus = feeItem[f].getFeeitemStatus();
				var feeItemDesc = feeItem[f].getFeeDescription();
				logDebug("Inv " + invoiceItem[i] + " status " + feeStatus + "fee desc " + feeItemDesc);
				if(feeStatus == "CREDITED" && feeDesc == feeItemDesc) {
					logDebug("Run Report");
					var scriptName = "asyncRunBalanceDueRpt";
					var envParameters = aa.util.newHashMap();
					envParameters.put("recNum",capId.getCustomID()); 
					envParameters.put("reportName","Balance Due Report"); 
					envParameters.put("contType","Designated Responsible Party"); 
					envParameters.put("currentUserID",currentUserID);
					envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
					aa.runAsyncScript(scriptName, envParameters);
				} 
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in IFA:LICENSES/CULTIVATOR/*/RENEWAL: " + err.message);
	logDebug(err.stack);
}