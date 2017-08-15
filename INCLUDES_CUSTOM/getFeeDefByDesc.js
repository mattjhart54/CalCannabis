function getFeeDefByDesc (fsched, feeDesc) {
try {
	var arrFeesResult = aa.finance.getFeeItemList(null,fsched,null);
	if (arrFeesResult.getSuccess()) {
		var arrFees = arrFeesResult.getOutput();
		for (xx in arrFees) {
			var fDesc = arrFees[xx].getFeeDes();
			if (fDesc.equals(feeDesc)) {
				var f = new FEE_UTILS_MODULE.FeeDef();
				f.feeCode = arrFees[xx].getFeeCod();
				f.feeDesc = fDesc;
				f.formula = arrFees[xx].getFormula();
				f.calcProc = arrFees[xx].getCalProc();
				var rft = arrFees[xx].getrFreeItem();
				f.comments = rft.getComments();
				return f;
			}
	
		} // for xx
	}else { 
		logDebug("Error getting fee schedule " + arrFeesResult.getErrorMessage());
		return false;
	}
}catch(err){
	logDebug("An error has occurred in getFeeDefByDesc: " + err.message);
	logDebug(err.stack);
}}