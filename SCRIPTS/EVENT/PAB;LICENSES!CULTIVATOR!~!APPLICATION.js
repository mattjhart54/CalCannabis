//lwacht 171120
//user cannot over or under pay
try{
	var amtFee = 0;
	var amtPaid = 0;
	var ttlFee = 0;
	var feeSeq_L = new Array(); 
	var paymentPeriod_L = new Array(); 
	var invoiceResult_L = false;
	var retVal = false;
	var feeResult = aa.finance.getFeeItemByCapID(capId);
	if (feeResult.getSuccess()) {
		var feeArray = feeResult.getOutput();
		for (var f in feeArray) {
			var thisFeeObj = feeArray[f];
			if (thisFeeObj.getFeeitemStatus() == "INVOICED") {
				amtFee += thisFeeObj.getFee();
				var pfResult = aa.finance.getPaymentFeeItems(capId, null);
				if (pfResult.getSuccess()) {
					var pfObj = pfResult.getOutput();
					for (ij in pfObj){
						if (thisFeeObj.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()){
							amtPaid += pfObj[ij].getFeeAllocation();
						}
					}
				}
			}
		}
		ttlFee = amtFee - amtPaid;
		//logDebug("ttlFee: " + ttlFee) 
		if(parseFloat(ttlFee)!= parseFloat(TotalAppliedAmount)){
			showMessage = true;
			cancel = true;
			comment("Amount applied ($" + parseFloat(TotalAppliedAmount).toFixed(2) +") is not equal to the balance due of $" + ttlFee.toFixed(2) + ".");
		}
	}
}catch(err){
	logDebug("An error has occurred in PAB:LICENSES/CULTIVATOR/*/APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}