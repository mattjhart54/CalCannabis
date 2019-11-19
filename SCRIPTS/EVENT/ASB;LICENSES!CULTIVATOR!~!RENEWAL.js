try{
	if(balanceDue<=0 && !isTaskComplete("Renewal Review")){
		activateTask("Renewal Review")
		updateAppStatus("Pending Payment", "Updated via PRA:LICENSES/CULTIVATOR/*/Renewal.");
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/Renewal: Renewal Fees Paid: " + err.message);
	logDebug(err.stack);
}