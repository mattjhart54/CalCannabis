try{
	if(balanceDue<=0 && !isTaskComplete("Renewal Review")){
		activateTask("Renewal Review")
    	updateAppStatus("Submitted", "Updated via PPA:LICENSES/CULTIVATOR/*/Renewal.");
	}
}catch(err){
	logDebug("An error has occurred in PPA:LICENSES/CULTIVATOR/*/Renewal: Renewal Fees Paid: " + err.message);
	logDebug(err.stack);
}