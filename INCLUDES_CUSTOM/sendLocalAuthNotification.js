function sendLocalAuthNotification() {
	try{
		editAppSpecific("Local Authority Notification Sent", jsDateToASIDate(new Date()));
		if(wfStatus == "Local Auth Sent - 10") {
			editAppSpecific("Local Authority Notification Expires", dateAdd(jsDateToASIDate(new Date()),10));
		}
		else {
			editAppSpecific("Local Authority Notification Expires", dateAdd(jsDateToASIDate(new Date()),60,"Y"));
		}
		//lwacht: 180426: story 5436: reset the assigned task
		var asgnDateAR = getAssignedDate("Administrative Review");
		var asgnDateOR = getAssignedDate("Owner Application Reviews");
		deactivateTask("Administrative Review");
		deactivateTask("Owner Application Reviews");
		if(asgnDateAR){
			updateTaskAssignedDate("Administrative Review", asgnDateAR);
		}else{
			logDebug("No assigned date found for Administrative Review");
		}
		if(asgnDateOR){
			updateTaskAssignedDate("Owner Application Reviews", asgnDateOR);
		}else{
			logDebug("No assigned date found for Owner Application Reviews");
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

			if(appTypeArray[2] == "Temporary") {
				licType = "";
				licType1 = "a temporary";
				licType2 = "temporary";
				addParameter(eParams, "$$appType$$", AInfo["App Type"] + " " + AInfo["License Type"]);
				addParameter(eParams, "$$licType$$", licType);
				addParameter(eParams, "$$licType1$$", licType1);
				addParameter(eParams, "$$licType2$$", licType2);
			}
			else {
				licType = "Annual";
				licType1 = "an annual";
				licType2 = "annual";				
				addParameter(eParams, "$$appType$$", appTypeArray[2] + " " + AInfo["License Type"]);
				addParameter(eParams, "$$licType$$", licType);
				addParameter(eParams, "$$licType1$$", licType1);
				addParameter(eParams, "$$licType2$$", licType2);
			}
			
			if(!matches(AInfo["Premise Address"], null,"",undefined)) {
				addParameter(eParams,"$$premisesAddress$$", AInfo["Premise Address"] + " " + AInfo["Premise City"] + " with APN: " + AInfo["APN"]);
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
// MHART 01/24/18 Story  5125: Local Authority e-mail content update
// Added parameters for DRP Name.  Chnaged format of displaying Business Name.  Changed format of display the Address and APN
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
// MHART 01/24/18 Story  5125: Local Authority e-mail content update
			sendNotification("cdfa.CalCannabis_Local_Verification@cdfa.ca.gov",locEmail,"cdfa.CalCannabis_Local_Verification@cdfa.ca.gov","LIC_CC_NOTIFY_LOC_AUTH",eParams, rFiles,capId);
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