try{
	if(balanceDue<=0){
		if (getAppStatus() != "Submitted"){
			updateAppStatus("Submitted", "Updated via PRA:LICENSES/CULTIVATOR/*/Renewal.");
		}
		if(!isTaskComplete("Annual Renewal Review") && !isTaskComplete("Provisional Renewal Review")){
			if (AInfo["License Issued Type"] == "Provisional") {
				activateTask("Provisional Renewal Review");
				deactivateTask("Annual Renewal Review");
			}else{
				activateTask("Annual Renewal Review");
				deactivateTask("Provisional Renewal Review");
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in PPA:LICENSES/CULTIVATOR/*/Renewal: Renewal Fees Paid: " + err.message);
	logDebug(err.stack);
}
