function verifyFeePayment(fCode) { //To Be used in Payment Events, or edit PaymentDate var
	var assessedFees = aa.fee.getFeeItems(capId);
	if (assessedFees.getSuccess()) {
		var feeObjArr = assessedFees.getOutput();
		var origSeq = null;
		for (var ff = 0; ff < feeObjArr.length; ff++) {
			fee = feeObjArr[ff];
			logDebug("FeeCode: " + fee.getFeeCod());
			if (fee.getFeeCod() == fCode && fee.getFeeitemStatus() != "CREDITED") {
				origSeq = fee.getFeeSeqNbr();
				logDebug("origSeq: " + origSeq);
			}
		}
		if (origSeq != null) {
			var paidfees = aa.finance.getPaymentFeeItems(capId, null);
			if (paidfees.getSuccess()) {
				feeObjArr = paidfees.getOutput();
				for (var ff = 0; ff < feeObjArr.length; ff++) {
					fee = feeObjArr[ff].getPaymentFeeItem();
					logDebug("fee: " + fee);
					feeSeqNbr = fee.getFeeSeqNbr();
					logDebug("feeSeqNbr: " + feeSeqNbr);
					if (origSeq == feeSeqNbr) {
						paySeqNbr = feeObjArr[ff].getPaymentSeqNbr();
						logDebug("paySeqNbr: " + paySeqNbr);
						invoiceNbr = feeObjArr[ff].getInvoiceNbr();
						logDebug("invoiceNbr: " + invoiceNbr);
						var auditDateScript = feeObjArr[ff].getAuditDate();
						var auditDate = new Date(auditDateScript.getMonth() + 1 + "/" + auditDateScript.getDayOfMonth() + "/" + auditDateScript.getYear());
						logDebug(feeObjArr[ff].getAuditDate());
						logDebug(auditDate);
						var yyyy = auditDate.getFullYear();
						logDebug(yyyy);
						var mm = String(auditDate.getMonth());
						logDebug(mm)
						var dd = String(auditDate.getDate());
						if (mm.length == 1) {
							mm = '0' + mm;
						}
						if (dd.length == 1) {
							dd = '0' + dd;
						}
						var formattedAuditDate =  yyyy + '-' + mm + '-' + dd;
						logDebug("auditDate: " + formattedAuditDate + " " +  typeof(formattedAuditDate));
						logDebug("PaymentDate: " + PaymentDate + " " + typeof(PaymentDate)); 
						if (formattedAuditDate == PaymentDate) {
							return true;
						}else{
							return false;
					}
				}
			} else {
				return false;
				logDebug("Failed to retrieve payment fee items: " + paidfees.getErrorMessage());
			}
		} else {
			return false;
			logDebug("No assessed fees found with fee code " + fCode);
		}
	} else {
		return false;
		logDebug("Failed to retrieve assessed fees: " + assessedFees.getErrorMessage());
	}
}
