//lwacht
//send other notifications
try{
	if(matches(appStatus, "Disqualified", "Denied")){
		emailDrpPriContacts("ASUA", "LCA_GENERAL_NOTIFICATION", "ACA Permit", false, appStatus, capId, "agencyid", servProvCode, "capid", capId.getCustomID());
	}
	// Run withdrawal report for each contact and either email notice or send message to mail notice.
	if(appStatus == "Withdrawn") {
		pMsg = "";
		postal = false;
		var	conArray = getContactArray(capId);
		for (thisCon in conArray) {
			var conEmail = false;
			thisContact = conArray[thisCon];
			if(matches(thisContact["contactType"],"Primary Contact", "Designated Responsible Party")) {
		// Run report letter and attach to record for each contact type
				if(thisContact["contactType"] == "Primary Contact") 
					var addrType = "Mailing";
				if(thisContact["contactType"] == "Designated Responsible Party") 
					var addrType = "Home";	
				runReportAttach(capId,"Final Denial Letter", "p1value",capId.getCustomID(),"p2value",thisContact["contactType"],"p3value",addrType);
				pContact = getContactObj(capId,thisContact["contactType"]);
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ pContact.capContact.getPreferredChannel());
				if(!matches(priChannel,null,"",undefined) && priChannel.indexOf("Email") >=0) {
					conEmail = thisContact["email"];
					if (conEmail) {
						altId = capId.getCustomID();
						eParams = aa.util.newHashtable();
						addParameter(eParams,"$$ALTID$$",altId);
						addParameter(eParams,"$$firstName$$",thisContact["firstName"]);
						addParameter(eParams,"$$lastName$$",thisContact["lastName"]);
						var rFiles = [];
						sendNotification(sysFromEmail,conEmail,"","LCA_APP_WITHDRAWAL",eParams, rFiles,capId);
						logDebug("Mail Sent");
					}
				}
				if(!matches(priChannel,null,"",undefined) && priChannel.indexOf("Postal") >-1) {
					postal = true;
					pMsg = pMsg + thisContact["contactType"] + " has requested postal service.  Please print the Wtihdrawal letter and mail.  ";
				}
			}
		}
		if(postal) {
				showMessage = true;
				comment(pMsg);
		}
	}	
}catch(err){
	logDebug("An error has occurred in ASUA:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}

