try {
	updateLegalBusinessName();

}catch (err){
	logDebug("A JavaScript Error occurred: CEA: Licenses/Cultivation/*/License: updateLegalBusinessName: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CEA:Licenses/Cultivation/*/Application: updateLegalBusinessName: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}
//lwacht: 170929 adding legal business name logic 
try {
	var priContact = getContactObj(capId,"Business");
	if(priContact){
		editAppSpecific("Legal Business Name", priContact.capContact.middleName);
	}else{
		editAppSpecific("Legal Business Name", "No Legal Business Name provided");
	}
}catch (err){
	logDebug("A JavaScript Error occurred: CEA: Licenses/Cultivation/*/License: Edit Legal Business Name: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CEA:Licenses/Cultivation/*/License: Edit Legal Business Name: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}