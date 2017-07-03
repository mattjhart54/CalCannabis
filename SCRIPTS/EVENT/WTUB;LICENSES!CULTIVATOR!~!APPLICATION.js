//lwacht: when the status is "Additional Information Needed" and the preferred channel is *not* email,
//display the deficiency report for printing
try{
	if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		showDebug=false;
		var priContact = getContactObj(capId,"Primary Contact");
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		var showReport = false;
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
				showReport = true;
			}
		}
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
				showReport = true;
			}
		}
		if(showReport){
			displayReport("ACA Permit", "agencyid", servProvCode,"capid", capId.getCustomID());
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	logDebug(err.stack);
}
