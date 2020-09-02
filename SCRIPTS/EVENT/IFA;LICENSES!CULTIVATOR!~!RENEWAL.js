try {
	var feeDesc = AInfo["License Type"] + " - Late Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
	if(thisFee){
		var feeResult = aa.fee.getFeeItems(capId, thisFee.feeCode, null);
		if (feeResult.getSuccess()) {
			var feeObjArr = feeResult.getOutput();
		} else {
			logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
		}
		for(f in feeObjArr) {
			feeSeq = feeObjArr[f].getFeeSeqNbr();
			feeStatus = feeObjArr[f].getFeeitemStatus();
			feeItemDesc = feeObjArr[f].getFeeDescription();
		//	logDebug("fee status " + feeStatus + " fee Desc " + feeItemDesc + " " + feeDesc); 
			if (feeStatus == "CREDITED" && feeDesc == feeItemDesc) {
				var invoiceResult = aa.finance.getFeeItemInvoiceByFeeNbr(capId, feeSeq, null);
				if (invoiceResult.getSuccess()) {
					var invoiceItem = invoiceResult.getOutput();
					for (i in invoiceItem) {
						iDate = invoiceItem[i].getApplyDate();
						iStatus = invoiceItem[i].getFeeitemStatus();
						var feeDesc = AInfo["License Type"] + " - Late Fee";
						invDate =  dateFormatted(iDate.getMonth()+1,iDate.getDate(),iDate.getYear(),"YY-MM-DD");
						cDate = new Date();
						curDate =  dateFormatted(cDate.getMonth()+1,cDate.getDate(),cDate.getYear(),"YY-MM-DD");
						logDebug("Inv " + invoiceItem[i].getInvoiceNbr() + " status " + iStatus + "inv date " + invDate + " cur date " + curDate);
						if(curDate == invDate && iStatus == "CREDITED" ) {
							var rParams = aa.util.newHashMap(); 
							rParams.put("altId", capId.getCustomID());
							emailRptContact("IFA", "LCA_BALANCE_DUE", "Balance Due Report", true,"","","Designated Responsible Party","altId",capId.getCustomID());
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