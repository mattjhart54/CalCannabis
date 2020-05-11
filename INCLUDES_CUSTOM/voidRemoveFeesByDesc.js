function voidRemoveFeesByDesc(itemCap, feeDesc) {
try {
	var arrFeesResult = aa.finance.getFeeItemByCapID(capId);
	if (arrFeesResult.getSuccess()) {
		var arrFees = arrFeesResult.getOutput();
		for (xx in arrFees) {
			var targetFee = arrFees[xx];
			var fDesc = targetFee.getFeeDescription();
			if (fDesc.equals(feeDesc)) {
				if (targetFee..getFeeitemStatus() == "INVOICED") {
					var editResult = aa.finance.voidFeeItem(itemCap, targetFee.getFeeSeqNbr());
					if (editResult.getSuccess())
						logDebug("Voided existing Fee Item: " + targetFee.getFeeCod());
					else{ 
						logDebug( "**ERROR: voiding fee item (" + targetFee.getFeeCod() + "): " + editResult.getErrorMessage()); 
						return false; 
					}
					var feeSeqArray = new Array();
					var paymentPeriodArray = new Array();
					feeSeqArray.push(targetFee.getFeeSeqNbr());
					paymentPeriodArray.push(targetFee.getPaymentPeriod());
					var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
					if (!invoiceResult_L.getSuccess()) {
						logDebug("**ERROR: Invoicing the fee items voided " + thisFee.getFeeCod() + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
						return false;
					}
				}
				if (targetFee..getFeeitemStatus() == "NEW") {
					var editResult = aa.finance.removeFeeItem(itemCap, targetFee.getFeeSeqNbr());
					if (editResult.getSuccess())
						logDebug("Removed existing Fee Item: " + targetFee.getFeeCod());
					else
						{ logDebug( "**ERROR: removing fee item (" + targetFee.getFeeCod() + "): " + editResult.getErrorMessage()); return false; }
				}
			}
	
		} // for xx
	}else { 
		logDebug("Error getting fee schedule " + arrFeesResult.getErrorMessage());
		return false;
	}
}catch(err){
	logDebug("An error has occurred in voidRemoveFeesByDesc: " + err.message);
	logDebug(err.stack);
}}