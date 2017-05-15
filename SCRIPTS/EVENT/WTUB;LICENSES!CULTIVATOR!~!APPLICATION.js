//lwacht
//do not allow the application intake task to be closed until all
//documents have been uploaded
try{
	if("Application Intake".equals(wfTask) && matches(wfStatus, "Complete", "Ready to Pay", "Board Review Required" &&!isTaskStatus("Application Intake", "All Documents Received"))){
		cancel=true;
		showMessage=true;
		showDebug = false;
		comment("<font color='blue'; size='8px'>All documents must be uploaded before continuing.</font");
	}
}catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
}