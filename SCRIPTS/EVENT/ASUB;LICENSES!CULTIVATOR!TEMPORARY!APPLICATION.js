//lwacht
//send other notifications
try{
	if(appStatus =="Voided" && currentUserGroup!="LicensesAdminMgr"){
		showMessage = true;
		comment("Only an Admin Manager can void an application.");
		cancel = true;
	}
}catch(err){
	logDebug("An error has occurred in ASUB:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Voided Security: " + err.message);
	logDebug(err.stack);
}

