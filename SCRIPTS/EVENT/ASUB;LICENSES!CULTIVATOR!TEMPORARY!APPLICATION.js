//lwacht
//send other notifications
try{
	if(appStatus =="Voided" && currentUserGroup!="LicensesAdminMgr"){
		cancel = true;
		showMessage = true;
		comment("Only an Admin Manager can void an application.");
	}
}catch(err){
	logDebug("An error has occurred in ASUB:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Voided Security: " + err.message);
	logDebug(err.stack);
}

