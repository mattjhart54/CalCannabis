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

//lwacht: 180824: set the preferred channel to be email
try{
	capContactResult = aa.people.getCapContactByCapID(capId);
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
//lwaht 171214: update app name with legal business name
try{
	updateLegalBusinessName()
}catch (err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Set Legal Bsns Name: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Set Legal Bsns Name: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);

}

//lwacht: 171214: create a reference contact for the temp drp, so they can be emailed
try{
	//lwacht: create reference contact and public user account for the DRP		
	createRefContactsFromCapContactsAndLink(capId,["Designated Responsible Party"], null, false, false, comparePeopleStandard);
	var drpUser = createPublicUserFromContact("Designated Responsible Party");
	//lwacht: create reference contact and public user account for the business contact		
}catch (err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create DRP: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create DRP: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}