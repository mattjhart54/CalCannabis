try{
	if(matches(AInfo["Local Authority Response"],"In Compliance","No Response") && capStatus == "Pending - Local Authorization") {
		var showReport = false;
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(!matches(priChannel,"",null,"undefined")){
				if(priChannel.indexOf("Postal") > -1){
					showReport = true;
				}
			}
		}
		if(showReport){
			showDebug=false;
			displayReport("Submitted Application", "p1value", capIDString);
		}
	}
}catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: " + err.message);
	logDebug(err.stack);
}