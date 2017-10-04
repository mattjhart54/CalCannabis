//lwacht
//send other notifications
try{
	if(matches(appStatus, "Disqualified", "Denied")){
		emailDrpPriContacts("ASUA", "LCA_GENERAL_NOTIFICATION", "ACA Permit", false, appStatus, capId, "agencyid", servProvCode, "capid", capId.getCustomID());
	}
	// Run withdrawal report for each contact and either email notice or send message to mail notice.
	if(appStatus == "Withdrawn") {
		var	conArray = getContactArray(capId);
		runReportAttach(capId,"Withdrawn Application Letter", "p1value",capId.getCustomID());
		for (thisCon in conArray) {
			thisContact = conArray[thisCon];
			if(thisContact["contactType"] == "Designated Responsible Party") {
				emailRptContact("ASUA","LCA_APP_WITHDRAWAL","Withdrawn Application Letter",false,"Withdrawn",capId,"Designated Responsible Party")
			}
		}
		taskCloseAllActive("Withdrawn","Task Closed by script. Record status was updated to Withdrawn")
	}
}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}

