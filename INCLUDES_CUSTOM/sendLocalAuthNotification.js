function sendLocalAuthNotification() {
	try{
		var br = "<BR>";
		editAppSpecific("Local Authority Notification Sent", jsDateToASIDate(new Date()));
		if(wfStatus == "10 day Auth") {
			editAppSpecific("Local Authority Notification Expires", dateAdd(jsDateToASIDate(new Date()),10));
		}
		else {
			editAppSpecific("Local Authority Notification Expires", dateAdd(jsDateToASIDate(new Date()),60,"Y"));
		}
		//lwacht: 180426: story 5436: reset the assigned task
		var asgnDateAR = getAssignedDate("Local Verification Review");
		if(asgnDateAR){
			updateTaskAssignedDate("Local Verification Review", asgnDateAR);
		}else{
			logDebug("No assigned date found for Local Verification Review");
		}
		//lwacht: 180426: story 5436: end
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
			if(!matches(AInfo["Premise Address"], null,"",undefined)) {
				addParameter(eParams,"$$premisesAddress$$", AInfo["Premise Address"] + ",  " + AInfo["Premise City"] + ", " + AInfo["Premise County"]);
			}
			else {
				addParameter(eParams,"$$premisesAddress$$", AInfo["Premise City"] + ", " + AInfo["Premise County"]);
			}
			addParameter(eParams, "$$APN$$", AInfo["APN"]);
	// MHART 08/07/18 Story 5617 and 5618: Local Authority e-mail content update - List Additional Premises addresses
			if (typeof(PREMISESADDRESSES) == "object") {
				var msgAddr = "";
				for(x in PREMISESADDRESSES){
					msgAddr = msgAddr + "APN: " + PREMISESADDRESSES[x]["APN"];
					if(!matches(PREMISESADDRESSES[x]["Premises Address"], null,"",undefined)) {
						msgAddr = msgAddr + ", " + PREMISESADDRESSES[x]["Premises Address"];
					}
					if(!matches(PREMISESADDRESSES[x]["Premises City"], null,"",undefined)) {
						msgAddr = msgAddr + ", " + PREMISESADDRESSES[x]["Premises City"];
					}
					msgAddr = msgAddr + ", " + PREMISESADDRESSES[x]["Premises County"] + ";  ";

				}
			}
			if(msgAddr != null) {
				addParameter(eParams, "$$additionalAddresses$$", msgAddr);
			}
	// MHART 08/07/18 Story 5617 and 5618:  End
		
			if(wfStatus == "10 day Auth") {
				addParameter(eParams, "$$days$$", "10 calendar");
				updateAppStatus("Pending Local Authorization 10");
			}
			else {
				addParameter(eParams, "$$days$$", "60 business");
				updateAppStatus("Pending Local Authorization 60");
			}
	// MHART 01/24/18 Story  5125: Local Authority e-mail content update
	// Added parameters for DRP Name.  Changed format of displaying Business Name.  
			var priContact = getContactObj(capId,"Business");
			if(priContact) {
				if(!matches(priContact.capContact.middleName,null,"",undefined))
					addParameter(eParams, "$$businessName$$", priContact.capContact.middleName);
			}
			if(appTypeArray[2] == "Temporary") 
				var drpContact = getContactObj(capId,"DRP - Temporary License");
			else
				var drpContact = getContactObj(capId,"Designated Responsible Party");
			if(drpContact) {
				if(!matches(drpContact.capContact.firstName,null,"",undefined))
						addParameter(eParams, "$$drpName$$", drpContact.capContact.firstName + " " + drpContact.capContact.lastName);
			}
			if(currEnv != "av6 (prod)") {
				var sysEmailCC =  "localverification@cannabis.ca.gov";
			} 
			else {
				var sysEmailCC =  "localverification@cannabis.ca.gov";
			}
			if(appTypeArray[2] == "Temporary") {
				var licType = "";
				var licType1 = "a temporary";
				var licType2 = "temporary";
				addParameter(eParams, "$$appType$$", AInfo["App Type"] + " " + AInfo["License Type"]);
				addParameter(eParams, "$$licType$$", licType);
				addParameter(eParams, "$$licType1$$", licType1);
				addParameter(eParams, "$$licType2$$", licType2);
// MHART 01/24/18 Story  5125: Local Authority e-mail content update
				sendNotification("localverification@cannabis.ca.gov",locEmail,sysEmailCC,"LIC_CC_NOTIFY_LOC_AUTH",eParams, rFiles,capId);
			}
			else {
				var appType = "Adult-Use"
				if(appTypeArray[2] == "Medical") 
					appType = "Medicinal"
				var licType = "Annual";
				varlicType1 = "an annual";
				var licType2 = "annual";

				addParameter(eParams, "$$appType$$", appType + " " + AInfo["License Type"]);
				addParameter(eParams, "$$licType$$", licType);
				addParameter(eParams, "$$licType1$$", licType1);
				addParameter(eParams, "$$licType2$$", licType2);
				if(wfStatus == "Local Auth Sent - 10")
					sendNotification("localverification@cannabis.ca.gov",locEmail,sysEmailCC,"LIC_CC_NOTIFY_LOC_AUTH_10",eParams, rFiles,capId);
				else
					sendNotification("localverification@cannabis.ca.gov",locEmail,sysEmailCC,"LIC_CC_NOTIFY_LOC_AUTH_60",eParams, rFiles,capId);				
			}
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
