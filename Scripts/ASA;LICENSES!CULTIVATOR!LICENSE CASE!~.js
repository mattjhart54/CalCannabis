try {
	if(appTypeArray[3] == 'NA') {
		updateLicCase(AInfo["License Number"], capId)
	}
	else {
		for(i in LICENSENUMBERS) {
			lcId = createCap("Licenses/Cultivator/License Case/NA",AInfo["Case Renewal Type"])
			editAppSpecific("License number",LICENSENUMBERS[i]["License Number"],lcId);
			editAppSpecific("Case Renewal Type",AInfo["Case Renewal Type"],lcId);
			editAppSpecific("Priority",AInfo["Priority"],lcId);
			editAppSpecific("Case Opened By",AInfo["Case Opened By"],lcId);
			editAppSpecific("Case Description",AInfo["Case Description"],lcId);
			editAppSpecific("Scientific Case Description",AInfo["Scientific Case Description"],lcId);
			editAppSpecific("Referred By",AInfo["Referred By"],lcId);
			editAppSpecific("County",AInfo["County"],lcId);
			editAppSpecific("City",AInfo["City"],lcId);
			editAppSpecific("Referred By Other Description",AInfo["Referred By Other Description"],lcId);
			updateLicCase(LICENSENUMBERS[i]["License Number"], lcId);
		}
	}
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/License Case/*: " + err.message);
	logDebug(err.stack);
}

