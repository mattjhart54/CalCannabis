function getFeeDefByDesc (fsched, feeDesc) {
try {
	var arrFeesResult = aa.finance.getFeeItemList(null,fsched,null);
	if (arrFeesResult.getSuccess()) {
		var arrFees = arrFeesResult.getOutput();
		for (xx in arrFees) {
			var fDesc = arrFees[xx].getFeeDes();
			if (fDesc.equals(feeDesc)) {
				var f = new FeeDef();
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

function FeeDef () { // Fee Definition object 
try{
	this.formula = null;
	this.feeUnit = null;
	this.feeDesc = null;
	this.feeCode = null;
	this.comments = null;
	this.calcProc = null;
	this.subGroup = null;
	this.minFee = null;
	this.maxFee = null;
	this.feeAllocationType = null;
	this.displayOrder = null;
	this.unitDesc = null;
	this.accountCode1 = null;
	this.accountCode2 = null;
	this.accountCode3 = null;
	this.defaultFlag = null;
}catch(err){
	logDebug("An error has occurred in FeeDef: " + err.message);
	logDebug(err.stack);
}}