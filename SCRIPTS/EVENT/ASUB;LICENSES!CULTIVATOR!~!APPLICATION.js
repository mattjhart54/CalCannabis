//lwacht
//send other notifications
try{
	/*lwacht 171226: not being used--this is a manual process
	if(matches(appStatus, "Disqualified", "Denied")){
		//lwacht: 170823: removing primary contact
		//var priContact = getContactObj(capId,"Primary Contact");
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
			displayReport("ACA Permit", "agencyid", servProvCode,"capid", capId.getCustomID());
		}
	}
	lwacht 171226:end */
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
//MJH 190411 story 5977 - Only License Manager or Legal staff can revoke a license
	if(capStatus == "Revoked") { 
		if(!matches(currentUserGroup,"License Manager","Legal Staff")) {
			showMessage = true
			cancel = true;
			comment("Only the License Manager or Legal staff can Revoke a license");
		}
	}
	//MJH 190411 story 5977 - end
}catch(err){
	logDebug("An error has occurred in ASUB:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}

