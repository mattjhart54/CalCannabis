/*===========================================
Title: invoiceAllFees
Purpose: invoices all fees
Author: Lynda Wacht		
Functional Area : Fees
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Parameters:
	capId (Optional): capId: To remove fees from a 
		record that isn't the current one
============================================== */
function invoiceAllFees () {
try{
	var itemCap = capId;
	if (arguments.length > 0)
		itemCap = arguments[0];
	var feeSeq_L = new Array(); 
	var paymentPeriod_L = new Array(); 
	var invoiceResult_L = false;
	var retVal = false;
	var feeResult = aa.finance.getFeeItemByCapID(itemCap);
	if (feeResult.getSuccess()) {
		var feeArray = feeResult.getOutput();
		for (var f in feeArray) {
			var thisFeeObj = feeArray[f];
			if (thisFeeObj.getFeeitemStatus() == "NEW") {
				paymentPeriod_L.push(thisFeeObj.getPaymentPeriod());
				feeSeq_L.push(thisFeeObj.getFeeSeqNbr());
				}
			}
		invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeq_L, paymentPeriod_L);
		if (invoiceResult_L.getSuccess()){
			var invoiceResult = aa.finance.getFeeItemInvoiceByFeeNbr(itemCap, feeSeq_L[0], null);
			if (invoiceResult.getSuccess()) {
				var invoiceItem = invoiceResult.getOutput();
				retVal = invoiceItem[0].getInvoiceNbr();
			}
		}
	}else {
		logDebug("Error getting fees " + feeResult.getErrorMessage());
	}
	return retVal;
}catch(err){
	logDebug("An error occurred in invoiceAllFees: " + err.message);
	logDebug(err.stack);
}}  
