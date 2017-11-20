//lwacht 171120
//user cannot over or under pay
try{
	if(balanceDue!=TotalAppliedAmount ){
		showMessage = true;
		cancel = true;
		comment("Amount applied (" + TotalAppliedAmount.toFixed(2) +") is not equal to the balance due of $" + balanceDue.toFixed(2) + ".");
	}
}catch(err){
	logDebug("An error has occurred in PAB:LICENSES/CULTIVATOR/*/APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}