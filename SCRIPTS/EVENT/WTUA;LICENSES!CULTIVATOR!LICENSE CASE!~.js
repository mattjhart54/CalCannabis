try{
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Notice of Violation") {
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("License Hold","Applied","Notice of Violation",null)){
			addStdCondition("License Hold","Applied","Notice of Violation");
		}
		capId = holdId;
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE CASE/NA: " + err.message);
	logDebug(err.stack);
}