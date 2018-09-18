try{
	var contactList = getContactArrayBefore();
	showMessage = true;
	cancel = true
	comment("Contact List " + contactList[0])
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivation/*/Declaration test: Doc check: " + err.message);
}

//lwacht: 171122: don't allow submission until everything is completed
try{
	var incompleteApp = false;
	//page 2
	if(matches(AInfo["Conflicting License"],"",null,"undefined")){
		incompleteApp = true;
	}
	if(incompleteApp){
		showMessage = true;
		cancel = true;
		comment("The declaration record has not been completed.  Please edit each page to ensure all required fields are populated.");
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivation/*/Declaration: Doc check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/*/OwnerApplication: Doc check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}
try{
	if(publicUser){
		var currEmail = "";
		var drpEmail = "";
		var resCurUser = aa.people.getPublicUserByUserName(publicUserID);
		if(resCurUser.getSuccess()){
			var currUser = resCurUser.getOutput();
			var currEmail = currUser.email;
		}
		var contactList = cap.getContactsGroup();
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				var contType = thisCont.contactType;
				if(contType =="Designated Responsible Party") {
					drpEmail = thisCont.email;
				}
			}
		}
		if(!matches(drpEmail,"",null,"undefined")){
			if(drpEmail.toUpperCase() != currEmail.toUpperCase()){
				showMessage = true;
				cancel = true;				
				logMessage("Only the Designated Responsible Party can submit this record")
			}
		}
		else {
			showMessage = true;
			cancel = true;				
			logMessage("Missing Designated Responsible Party contact on record")
		}
		showMessage = true;
		cancel = true;
		logMessage("publicUserID " + publicUserID + " currEmail " + currEmail + " drpEmail " + drpEmail);
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivation/*/Declaration: Doc check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/*/OwnerApplication: Doc check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}