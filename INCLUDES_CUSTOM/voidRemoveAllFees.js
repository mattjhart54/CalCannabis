/*===========================================
Title: voidRemoveAllFees
Purpose: Voids or removes all fees, depending on if they're 
	invoiced or not
Author: Lynda Wacht		
Functional Area : Reports
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Parameters:
	capId (Optional): capId: To remove fees from a 
		record that isn't the current one
============================================== */
function voidRemoveAllFees() {
try{
	var feeSeqArray = new Array();
	var invoiceNbrArray = new Array();
	var feeAllocationArray = new Array();
	var itemCap = capId;
	if (arguments.length > 0)
	itemCap = arguments[0];
	var targetFees = loadFees(itemCap);
	for (tFeeNum in targetFees) {
		targetFee = targetFees[tFeeNum];
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
	}  // each  fee
}catch(err){
	logDebug("An error occurred in voidRemoveAllFees: " + err.message);
	logDebug(err.stack);
}}  // function
