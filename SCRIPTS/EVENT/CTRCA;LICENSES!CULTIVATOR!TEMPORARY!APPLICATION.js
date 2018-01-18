//lwacht
//add parent if app number provided
try{
	if(!matches(AInfo["App Number"],null,"", "undefined")){
		addParent(AInfo["App Number"]);
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Add Permanent Record: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Add Permanent Record: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}


//lwacht 171214: update app name with legal business name
try{
	updateLegalBusinessName()
	//lwacht 171220: and county field as well
	updateShortNotes(AInfo["Premise County"]);
	//lwacht 171220:  end
	//lwacht 171221: adding app name
	editAppName(AInfo["License Type"]);
	//lwacht 171221
}catch (err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Set Legal Bsns Name: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Set Legal Bsns Name: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);

}

//lwacht: 171214: create a reference contact for the temp drp, so they can be emailed
try{
	//lwacht: create reference contact and public user account for the DRP		
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess()){
		Contacts = capContactResult.getOutput();
		for (yy in Contacts){
			var thisCont = Contacts[yy].getCapContactModel();
			var contType = thisCont.contactType;
			showMessage=true;
			if(contType =="DRP - Temporary License") {
				//var refContNrb = thisCont.refContactNumber;
				var drpFName = thisCont.firstName;
				var drpLName = thisCont.lastName;
				var drpEmail = thisCont.email.toLowerCase();
				var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
				qryPeople.setEmail(drpEmail);
				var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
				if (!qryResult.getSuccess()){ 
					createRefContactsFromCapContactsAndLink(capId,["DRP - Temporary License"], null, false, false, comparePeopleStandard);
				}else{
					var peopResult = qryResult.getOutput();
					if (peopResult.length < 1){
						createRefContactsFromCapContactsAndLink(capId,["DRP - Temporary License"], null, false, false, comparePeopleStandard);
					}
				}
			}
		}
	}
	var drpUser = createPublicUserFromContact_Rev("DRP - Temporary License");
	//lwacht: create reference contact and public user account for the business contact		
}catch (err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create DRP: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create DRP: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht: 170824: set the preferred channel to be email
try{
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess()){
		Contacts = capContactResult.getOutput();
		for (yy in Contacts){
			var theContact = Contacts[yy].getCapContactModel();
			//lwacht 171214 set this on new tmp drp
			//if(theContact.getContactType() == "Business"){
			if(theContact.getContactType() == "DRP - Temporary License"){
			//lwacht 171214: end
				var peopleModel = theContact.getPeople();
				var editChannel =  peopleModel.setPreferredChannel(1);
				var editChannel =  peopleModel.setPreferredChannelString("Email");
				aa.people.editCapContactWithAttribute(theContact);
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Set Preferred Channel: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Set Preferred Channel: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
