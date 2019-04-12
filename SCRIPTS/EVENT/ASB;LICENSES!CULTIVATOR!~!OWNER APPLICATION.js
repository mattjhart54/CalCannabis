//lwacht: 171122: don't allow submission until everything is completed
try{
	var incompleteApp = false;
	//page 1
	if(matches(AInfo["Percent Ownership"],"",null,"undefined")){
		incompleteApp = true;
	}
	//page 2
	if(matches(AInfo["Convicted of a Crime"],"",null,"undefined")){
		incompleteApp = true;
	}
	if(incompleteApp){
		showMessage = true;
		cancel = true;
		comment("The owner record " + capName + " has not been completed.  Please edit each page to ensure all required fields are populated.");
	}
//MJH 190412 story 5979 - validate that each email address in owner table is unique 
	var tblOwner = [];
	var emailDuplicate = false;
	for(row in OWNERS){
		tblOwner.push(OWNERS[row]);
	}
	for(x in tblOwner) {
		var tblEmail = ""+ tblOwner[x]["Email Address"];
		tblEmail = tblEmail.toUpperCase();
		for(o in OWNERS) {
			if( x == o) 
				continue;
			var ownEmail = ""+ OWNERS[o]["Email Address"];
			ownEmail = ownEmail.toUpperCase();
			logDebug("tblEmail " + tblEmail + " ownEmail " + ownEmail);
			if (tblEmail == ownEmail) {
				emailDuplicate = true;
			}
		}
		if(emailDuplicate) {
			cancel = true;
			showMessage = true;
			comment("Each Owner in the table must have a unique email address.");
			break;
		}
	}
//MJH 190412 story 5979 - end
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivation/*/Owner Application: Doc check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/*/OwnerApplication: Doc check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}