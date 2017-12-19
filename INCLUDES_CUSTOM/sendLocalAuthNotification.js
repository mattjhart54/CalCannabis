function sendLocalAuthNotification() {
	try{
		editAppSpecific("Local Authority Notification Sent", jsDateToASIDate(new Date()));
		if(wfStatus == "Local Auth Sent - 10") {
			editAppSpecific("Local Authority Notification Expires", dateAdd(jsDateToASIDate(new Date()),10));
		}
		else {
			editAppSpecific("Local Authority Notification Expires", dateAdd(jsDateToASIDate(new Date()),60,"Y"));
		}

		deactivateTask("Administrative Review");
		deactivateTask("Owner Application Reviews");
		if(AInfo["Local Authority Type"] == "County")
			var locAuth = AInfo["Local Authority County"];
		if(AInfo["Local Authority Type"] == "City")
			var locAuth = AInfo["Local Authority City"];
		if(AInfo["Local Authority Type"] == "City and County")
			var locAuth = AInfo["Local Authority City"] + "-" + AInfo["Local Authority County"];
		var locEmail = lookup("LIC_CC_LOCAL_AUTH_CONTACTS", locAuth);
		if(!matches(locEmail, null, "", undefined)) {
			var eParams = aa.util.newHashtable();
			rFiles = []				
			addParameter(eParams, "$$altID$$", capId.getCustomID());
			addParameter(eParams, "$$appType$$", appTypeArray[1] + " " + AInfo["License Type"]);
			if(appTypeArray[2] == "Temporary") 
				licType = "temporary";
			else
				licType = "annual";
			addParameter(eParams, "$$licType$$", licType);
			if(!matches(AInfo["Premise Address"], null,"",undefined)) {
				addParameter(eParams,"$$premisesAddress$$", AInfo["Premise Address"] + " APN: " + AInfo["APN"]);
			}
			else {
				addParameter(eParams,"$$premisesAddress$$", "APN: " + AInfo["APN"]);
			}
			if(wfStatus == "Local Auth Sent - 10") {
				addParameter(eParams, "$$days$$", "10 calendar");
				updateAppStatus("Pending Local Authorization 10");
			}
			else {
				addParameter(eParams, "$$days$$", "60 business");
				updateAppStatus("Pending Local Authorization 60");
			}
			var priContact = getContactObj(capId,"Business");
			if(priContact) {
				if(!matches(priContact.capContact.firstName,null,"",undefined) && !matches(priContact.capContact.middleName,null,"",undefined))
					addParameter(eParams, "$$businessName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName + ", " + priContact.capContact.middleName);
				else 
					if(!matches(priContact.capContact.firstName,null,"",undefined))
						addParameter(eParams, "$$businessName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
					else	
						if(!matches(priContact.capContact.middleName,null,"",undefined))
							addParameter(eParams, "$$businessName$$", priContact.capContact.middleName);
			}			
			sendNotification(sysFromEmail,locEmail,"calcannabislicensing@cdfa.ca.gov; calcannabislocalverification@cdfa.ca.gov","LIC_CC_NOTIFY_LOC_AUTH",eParams, rFiles,capId);
		}
		else {
			showmessage = true;
			comment("Local Authority Notification not sent.  No email address found for the local authority " + locAuth)
		}
	}catch(err){
		logDebug("An error has occurred in function sendLocAuthNotifications: " + err.message);
		logDebug(err.stack);
	}
}