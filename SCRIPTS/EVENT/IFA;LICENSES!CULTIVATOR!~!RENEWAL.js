try {
	var feeDesc = AInfo["License Type"] + " - Late Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
	if(thisFee){
		var invoiceResult = aa.finance.getInvoiceByCapID(capId,null);
		if (invoiceResult.getSuccess()) {
			var invoiceItem = invoiceResult.getOutput();
			for (i in invoiceItem) {
	//			describeObject(invoiceItem[i]);
				iDate = new Date 
				iDate.setTime(invoiceItem[i].getInvDate().getEpochMilliseconds());
				iNbr = invoiceItem[i].getInvNbr();
				var feeResult = aa.finance.getFeeItemInvoiceByInvoiceNbr(capId,iNbr,null);
				if(feeResult.getSuccess()) {
					feeItem = feeResult.getOutput();
					for(f in feeItem) {
						var feeStatus = feeItem[f].getFeeitemStatus();
						var feeItemDesc = feeItem[f].getFeeDescription();
						invDate =  dateFormatted(iDate.getMonth()+1,iDate.getDate(),iDate.getYear(),"YY-MM-DD");
						cDate = new Date();
						curDate =  dateFormatted(cDate.getMonth()+1,cDate.getDate(),cDate.getYear(),"YY-MM-DD");
						logDebug("Inv " + iNbr + " status " + feeStatus + "inv date " + invDate + " cur date " + curDate);
						if(curDate == invDate && feeStatus == "CREDITED" && feeDesc == feeItemDesc) {
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
		}
	}
}catch(err){
	logDebug("An error has occurred in IFA:LICENSES/CULTIVATOR/*/RENEWAL: " + err.message);
	logDebug(err.stack);
}