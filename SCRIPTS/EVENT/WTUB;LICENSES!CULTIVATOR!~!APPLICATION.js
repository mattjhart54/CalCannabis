//lwacht: when the status is "Additional Information Needed" and the preferred channel is *not* email,
//display the deficiency report for printing
try{
	if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		showDebug=false;
		var priContact = getContactObj(capId,"Primary Contact");
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
				displayReport("ACA Permit", "agencyid", servProvCode,"capid", capId.getCustomID());
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	logDebug(err.stack);
}
