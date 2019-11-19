try{
	if(balanceDue<=0){
		updateAppStatus("Submitted", "Updated via PRA:LICENSES/CULTIVATOR/*/Renewal.");
		if(!isTaskComplete("Renewal Review")){
			activateTask("Renewal Review")
		}
	}
}catch(err){
	logDebug("An error has occurred in PPA:LICENSES/CULTIVATOR/*/Renewal: Renewal Fees Paid: " + err.message);
	logDebug(err.stack);
}
