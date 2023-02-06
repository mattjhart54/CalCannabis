//do not allow license to be issued if fees are not paid
try{
	if(balanceDue>0 && "Issued".equals(wfStatus)){
		cancel=true;
		showMessage=true;
		comment("The fee balance of $" + balanceDue + " must be paid before the license can be issued.");
	}
}catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/ADULT USE/APPLICATION: FEE CHECK: "+ err.message);
	logDebug(err.stack);
}