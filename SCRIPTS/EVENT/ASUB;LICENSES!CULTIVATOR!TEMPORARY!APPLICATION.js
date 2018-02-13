// mhart story 5261 02/13/2018 Commenting out code as there is a bug in scripting that does not stop the update.  Changing security to User Group
//lwacht
//send other notifications
/*
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
*/
