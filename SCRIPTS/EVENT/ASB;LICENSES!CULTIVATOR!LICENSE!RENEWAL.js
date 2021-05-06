try {
	//mhart: 012320: story 6378: check License cases before submittal
	var AInfo = [];
	loadAppSpecific(AInfo);
	var licenseId = AInfo["License Number"];
	var licId = aa.cap.getCapID(licenseId);
	licId = licId.getOutput();
	childIds  = getChildren("Licenses/Cultivator/License Case/*",licId);
	holdId = capId;
	var caseHold = false
	for(c in childIds) {
		capId = childIds[c];
		cCap = aa.cap.getCap(capId).getOutput();
		cStatus = cCap.getCapStatus();
		cInfo = new Array;
		loadAppSpecific(cInfo);
		logDebug(cInfo["Case Renewal Type"] + " - " + cStatus);
		if(cInfo["Case Renewal Type"] == "Renewal Hold") 
			if(!matches(cStatus, "Resolved", "Closed")) {
				caseHold = true;
				break;
			}
	}
	capid = holdId;
	if(caseHold) {
		cancel = true;
		showMessage = true;
		if(publicUser)
			logMessage("The renewal of this license has been placed on hold. Please contact the Department of Cannabis Control by calling 1 (844) 61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.");
		else
			comment("The renewal of this license has been placed on hold. A Renewal record cannot be created.")
	}	
			
}catch (err){
	logDebug("A JavaScript Error occurred: ASB:Licenses/Cultivator/License Case/ " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivator/License Case/ " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}