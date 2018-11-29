// ASA:   if this is the last owner record to be submitted, create a temp affidavit record and email the DRP
try{
	updateAppStatus("Submitted","Updated via ASA:Licenses/Cultivator//Owner Application");
	appId = AInfo["Application ID"];
	addParent(appId);
	var ownerEmail = null
	contacts = getContactArray();
	for(c in contacts) {
		if(contacts[c]["contactType"] == "Owner")
			ownerEmail = contacts[c]["email"];
	}
	parentId = getApplication(appId);
	ownerTable = loadASITable("Owners",parentId);
	var allOwnersSubmitted = true;
	for(x in ownerTable) {
		if(ownerEmail == ownerTable[c]["Email Address"]) {
			 ownerTable[c]["Status"] = "Submitted";
			 continue;
		}
		if(ownerTable[c]["Status"] != "Submitted") {
			allOwnersSubmitted = false;
		}
	}
	removeASITable("Owners",parentId)
	addASITable("Owners",ownerTable,parentId);
	
	if(allOwnersSubmitted){
		updateAppStatus("Pending Declaration","Updated via ASA:Licenses/Cultivator//Owner Application",parentId);
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
}catch (err){
	logDebug("A JavaScript Error occurred: ASA:Licenses/Cultivator//Owner Application: Update owner table logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation//Owner Application: Declaration logic:  " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack + br + currEnv);
}	

// if not ACA, set altId based on application parent
try{
	if(!publicUser){
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
				aa.sendMail(sysFromEmail, debugEmail, "", "Error renaming owner record " + capId + ": " + startDate, newIdErrMsg);
				
			}else{
				logDebug("Owner record AltId already updated: "+ capId.getCustomID());
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Owner Application: AltID Logic:  " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}

//lwacht: 180416: story 5175: create a reference contact for the Owner contact
try{
	if(!publicUser){
		//lwacht: create reference contact and public user account for the Owner		
		var capContactResult = aa.people.getCapContactByCapID(capId);
		var ownExists = false;
		var ownEmail = false;
		if (capContactResult.getSuccess()){
			Contacts = capContactResult.getOutput();
			for (yy in Contacts){
				var thisCont = Contacts[yy].getCapContactModel();
				var contType = thisCont.contactType;
				showMessage=true;
				if(contType =="Owner") {
					var ownRefContNrb = thisCont.refContactNumber;
					ownEmail = thisCont.email.toLowerCase();
					logDebug("ownEmail: " + ownEmail);
					var ownCont = Contacts[yy].getCapContactModel();
				}
			}
		}
		if(ownEmail){
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
			qryPeople.setEmail(ownEmail);
			var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
			if (!qryResult.getSuccess()){ 
				logDebug("WARNING: error searching for people : " + qryResult.getErrorMessage());
			}else{
				var peopResult = qryResult.getOutput();
				if (peopResult.length > 0){
					ownExists = true;
				}
			}
		}
		if(!ownExists){
			createRefContactsFromCapContactsAndLink(capId,["Owner"], null, false, false, comparePeopleGeneric);
			//lwacht 180425: COMMENTING OUT FOR AVTEST6
			var ownUser = createPublicUserFromContact("Owner");
			logDebug("Successfully created Owner");
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Owner Application: Create Owner: " + err.message);
	logDebug(err.stack);
}
//lwacht: 180416: story 5175: end

