function verifyFeePayment(fCode, PaymentDate) { //payment Date formatted or payment event var YYYY-MM-DD
	var assessedFees = aa.fee.getFeeItems(capId);
	if (assessedFees.getSuccess()) {
		var feeObjArr = assessedFees.getOutput();
		var origSeq = null;
		for (var ff = 0; ff < feeObjArr.length; ff++) {
			fee = feeObjArr[ff];
			if (fee.getFeeCod() == fCode && fee.getFeeitemStatus() != "CREDITED") {
				origSeq = fee.getFeeSeqNbr();
			}
		}
		if (origSeq != null) {
			var paidfees = aa.finance.getPaymentFeeItems(capId, null);
			if (paidfees.getSuccess()) {
				feeObjArr = paidfees.getOutput();
				for (var ff = 0; ff < feeObjArr.length; ff++) {
					fee = feeObjArr[ff].getPaymentFeeItem();
					feeSeqNbr = fee.getFeeSeqNbr();
					if (origSeq == feeSeqNbr) {
						var auditDateScript = feeObjArr[ff].getAuditDate();
						var auditDate = new Date(auditDateScript.getMonth() + "/" + auditDateScript.getDayOfMonth() + "/" + auditDateScript.getYear());
						var yyyy = auditDate.getFullYear();
						var mm = String(auditDate.getMonth() + 1);
						var dd = String(auditDate.getDate());
						if (mm.length == 1) {
							mm = '0' + mm;
						}
						if (dd.length == 1) {
							dd = '0' + dd;
						}
						var formattedAuditDate =  yyyy + '-' + mm + '-' + dd;
						if (formattedAuditDate == PaymentDate) {
							return true;
						}else{
							return false;
						}
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
