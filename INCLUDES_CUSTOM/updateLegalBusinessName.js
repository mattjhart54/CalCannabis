function updateLegalBusinessName() {
try{
	cList = getContactArray();
	for(c in cList) {
		if(cList[c]["contactType"] == "Business") {
			if(!matches(cList[c]["middleName"], null, "", undefined)) {
				updateWorkDesc(cList[c]["middleName"]);
			}
			else {
				updateWorkDesc("No legal business name provided");
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: updateLegalBusinessName: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: updateLegalBusinessName: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}}