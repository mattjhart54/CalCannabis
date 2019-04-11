// lwacht
// set altId based on application parent
try{
	updateAppStatus("Submitted","Updated via CTRCA:Licenses/Cultivator//Owner Application");
	appId = AInfo["Application ID"];
	addParent(appId);
	var ownerEmail = null
//MJH 190221 User Story 5884 - validate owner table using public user email instead of owner contact email
	var currUser = aa.people.getPublicUserByUserName(publicUserID);
	if(currUser.getSuccess()){
		var ownerUser = currUser.getOutput();
		var ownerEmail = ownerUser.email;
		ownerEmail = String(ownerEmail).toUpperCase();
	}
//	contacts = getContactArray();
//	for(c in contacts) {
//		if(contacts[c]["contactType"] == "Owner")
//			ownerEmail = ""+ contacts[c]["email"];
//			ownerEmail = ownerEmail.toUpperCase();
//	}
// MJH MJH 190221 User Story 5884 - end
	parentId = getApplication(appId);
	ownerTable = loadASITable("OWNERS",parentId);
	var allOwnersSubmitted = true;
	for(x in ownerTable) {
		var tblEmail = ""+ ownerTable[x]["Email Address"];
		tblEmail = tblEmail.toUpperCase();
		logDebug("OwnerEmail " + ownerEmail + " email " + tblEmail);
		if(ownerEmail == tblEmail) {
			 ownerTable[x]["Status"] = "Submitted";
		}
		else{
			if(ownerTable[x]["Status"] != "Submitted") {
			allOwnersSubmitted = false;
			}
		}
	}
	removeASITable("OWNERS",parentId)
	addASITable("OWNERS",ownerTable,parentId);
	
	if(allOwnersSubmitted){
		updateAppStatus("Pending Final Affidavit","Updated via CTRCA:Licenses/Cultivator//Owner Application",parentId);
		var drpContact = getContactByType("Designated Responsible Party",parentId);
		if(drpContact){
			var drpFirst = drpContact.getFirstName();
			var drpLast =  drpContact.getLastName();
			var drpEmail = drpContact.getEmail();
			if(!matches(drpEmail,null,"","undefined")){
				emailParameters = aa.util.newHashtable();
				var sysDate = aa.date.getCurrentDate();
				var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
				addParameter(emailParameters, "$$altID$$", parentId.getCustomID());
				addParameter(emailParameters, "$$firstName$$", ""+drpFirst);
				addParameter(emailParameters, "$$lastName$$", ""+drpLast);
				addParameter(emailParameters, "$$today$$", sysDateMMDDYYYY);
				addParameter(emailParameters, "$$ACAUrl$$", getACAlinkForEdit(parentId, "Licenses", "1005"));
				sendNotification(sysEmail,drpEmail,"","LCA_DRP_DECLARATION_NOTIF",emailParameters,null,parentId);
			}
		}
	}
	if(parentId){
		nbrToTry = 1;
		//because owners can be added and deleted, need a way to number the records
		//but only if they haven't been numbered before
		if(capId.getCustomID().substring(0,3)!="LCA"){
			var ownerGotNewAltId = false;
			var newIdErrMsg = "";
			for (i = 0; i <= 100; i++) {
				if(nbrToTry<10){
					var nbrOwner = "00" + nbrToTry;
				}else{
					if(nbrToTry<100){
						var nbrOwner = "0" + nbrToTry
					}
					var nbrOwner = ""+ nbrToTry;
				}
				var newAltId = parentId.getCustomID() + "-" + nbrOwner + "O";
				var updateResult = aa.cap.updateCapAltID(capId, newAltId);
				if (updateResult.getSuccess()) {
					logDebug("Updated owner record AltId to " + newAltId + ".");
					ownerGotNewAltId = true;
					break;
				}else {
					newIdErrMsg += updateResult.getErrorMessage() +"; ";
					nbrToTry++;
				}
			}
			if(!ownerGotNewAltId){
				logDebug("Error renaming owner record " + capId + ":  " + newIdErrMsg);
				//aa.sendMail(sysFromEmail, debugEmail, "", "Error renaming owner record " + capId + ": " + startDate, newIdErrMsg);
			}
		}else{
			logDebug("Owner record AltId already updated: "+ capId.getCustomID());
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/OWNER APPLICATION:  AltID Logic: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}

//lwacht 180208: story 5200: updating file date 
try{
	editAppSpecific("Created Date", fileDate);
	updateFileDate(null);
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Force file date to be submission date: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Force file date to be submission date: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//lwacht 180208: story 5200: end
//MJH 190411 story 5978 - Update app name with owner name and email
try {
	var priContact = getContactObj(capId,"Owner");
	if(priContact){	
		ownName = priContact.capContact.firstName + " " + priContact.capContact.lastName + " (" + priContact.capContact.email + ")";
		logDebug(" Owner Name " + ownName);
		editAppName(ownName);
	}
}catch (err){
	logDebug("A JavaScript Error occurred: CTRCA: Licenses/Cultivation/*/Owner Application: edit app name: " + err.message);
	logDebug(err.stack);
}
//MJH 190411 story 5978 -