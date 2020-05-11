function voidRemoveFeesByDesc(fsched, feeDesc) {
try {
	var arrFeesResult = aa.finance.getFeeItemList(null,fsched,null);
	if (arrFeesResult.getSuccess()) {
		var arrFees = arrFeesResult.getOutput();
		for (xx in arrFees) {
			var targetFee = arrFees[xx];
			var fDesc = targetFee.getFeeDes();
			if (fDesc.equals(feeDesc)) {
				if (targetFee.status == "INVOICED") {
					var editResult = aa.finance.voidFeeItem(itemCap, targetFee.sequence);
					if (editResult.getSuccess())
						logDebug("Voided existing Fee Item: " + targetFee.code);
					else{ 
						logDebug( "**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); 
						return false; 
					}
					var feeSeqArray = new Array();
					var paymentPeriodArray = new Array();
					feeSeqArray.push(targetFee.sequence);
					paymentPeriodArray.push(targetFee.period);
					var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
					if (!invoiceResult_L.getSuccess()) {
						logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
						return false;
					}
				}
				if (targetFee.status == "NEW") {
					var editResult = aa.finance.removeFeeItem(itemCap, targetFee.sequence);
					if (editResult.getSuccess())
						logDebug("Removed existing Fee Item: " + targetFee.code);
					else
						{ logDebug( "**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }
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