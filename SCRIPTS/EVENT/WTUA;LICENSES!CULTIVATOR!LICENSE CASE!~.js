try{
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Notice Of Violation") {
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("License Hold","Applied","Notice of Violation",null)){
			addStdCondition("License Hold","Notice of Violation");
		}
		capId = holdId;
	}
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Owner Conviction") {
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("License Hold","Applied","Owner Subsequent Convictions",null)){
			addStdCondition("License Hold","Owner Subsequent Convictions");
		}
		capId = holdId;
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE CASE/NA: " + err.message);
	logDebug(err.stack);
}