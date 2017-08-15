//lwacht
//send other notifications
try{
	if(matches(appStatus, "Disqualified", "Denied")){
		var priContact = getContactObj(capId,"Primary Contact");
		//var drpContact = getContactObj(capId,"Designated Responsible Party");
		var showReport = false;
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(priChannel.indexOf("Postal") > -1){
				showReport = true;
			}
		}
		if(showReport){
			showDebug=false;
			displayReport("ACA Permit", "agencyid", servProvCode,"capid", capId.getCustomID());
		}
	}
	if(matches(appStatus, "Withdrawn")){
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		var showReport = false;
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(priChannel.indexOf("Postal") > -1){
				showReport = true;
			}
		}
		if(showReport){
			showDebug=false;
			displayReport("Withdrawn Application Letter", "p1value",capId.getCustomID());
		}
	}
}catch(err){
	logDebug("An error has occurred in ASUB:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}

