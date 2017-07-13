//lwacht
//send other notifications
try{
	if(matches(appStatus, "Disqualified", "Withdrawn", "Denied")){
		emailDrpPriContacts("ASUA", "LCA_GENERAL_NOTIFICATION", "ACA Permit", false, appStatus, capId, "agencyid", servProvCode, "capid", capId.getCustomID());
	}
}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}

