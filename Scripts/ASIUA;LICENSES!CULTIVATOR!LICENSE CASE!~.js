try {
	
	editAppName(AInfo["Case Renewal Type"]);
	
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/License Case/*: " + err.message);
	logDebug(err.stack);
}