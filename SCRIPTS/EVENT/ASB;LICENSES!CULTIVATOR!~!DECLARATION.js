//lwacht: 171122: don't allow submission until everything is completed
try{
	var incompleteApp = false;
	//page 2
	if(matches(AInfo["Conflicting License"],"",null,"undefined")){
		incompleteApp = true;
	}
	if(incompleteApp){
		showMessage = true;
		cancel = true;
		comment("The declaration record has not been completed.  Please edit each page to ensure all required fields are populated.");
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivation/*/Declaration: Doc check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/*/OwnerApplication: Doc check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}