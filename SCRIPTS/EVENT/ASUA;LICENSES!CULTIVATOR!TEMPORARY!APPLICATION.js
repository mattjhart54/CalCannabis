//lwacht: 171226: adding logic for a voided temp application
try{
	// Run withdrawal report for each contact and either email notice or send message to mail notice.
	if(matches(appStatus, "Voided")){
		taskCloseAllActive("Voided","Task Closed by script. Record status was updated to Voided");
	}
}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Voided Notifications: " + err.message);
	logDebug(err.stack);
}
//lwacht 171226: end
