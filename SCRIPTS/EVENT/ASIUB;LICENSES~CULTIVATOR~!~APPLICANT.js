try{
	if(matches(AInfo["Local Authority Response"],"In Compliance","No Response") && capStatus == "Pending - Local Authorization") {
		var showReport = false;
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(!matches(priChannel,"",null,"undefined")){
				if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
					showReport = true;
				}
			}
		}
		if(showReport){
			showDebug=false;
			//lwacht 171218 drp now uses mailing address, different report for temp and annual
			//displayReport("Submitted Application", "Record ID", capIDString, "Contact Type", "Designated Responsible Party", "Address Type", "Home", "servProvCode", "CALCANNABIS");
			if(appTypeArray[2] == "Temporary") {
				displayReport("Submitted Application", "Record ID", capIDString, "Contact Type", "Designated Responsible Party", "Address Type", "Mailing", "servProvCode", "CALCANNABIS");
			}else{
				displayReport("Submitted Annual Application", "Record ID", capIDString, "Contact Type", "Designated Responsible Party", "Address Type", "Mailing", "servProvCode", "CALCANNABIS");
			}
			//lwacht 171218 end
		}
	}
}catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Local Auth Check: " + err.message);
	logDebug(err.stack);
}