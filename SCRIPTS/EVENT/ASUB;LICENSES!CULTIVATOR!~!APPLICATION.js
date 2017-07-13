//lwacht
//send other notifications
try{
	if(matches(appStatus, "Disqualified", "Withdrawn", "Denied")){
		showDebug=false;
		var priContact = getContactObj(capId,"Primary Contact");
		//var drpContact = getContactObj(capId,"Designated Responsible Party");
		var showReport = false;
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(priChannel.indexOf("Postal") > -1){
				showReport = true;
			}
		}
		//if(drpContact){
		//	var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
		//	if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
		//		showReport = true;
		//	}
		//}
		if(showReport){
			displayReport("ACA Permit", "agencyid", servProvCode,"capid", capId.getCustomID());
		}
	}
}catch(err){
	logDebug("An error has occurred in ASUB:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}

