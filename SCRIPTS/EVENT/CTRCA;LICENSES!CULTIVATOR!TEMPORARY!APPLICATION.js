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
			if(theContact.getContactType() == "Business"){
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
