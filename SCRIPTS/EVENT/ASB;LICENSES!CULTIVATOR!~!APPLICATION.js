try {
	if(AInfo["Producing Dispensary"] == "CHECKED") {
		fnd = "N";
		loadASITables();
		if(typeof(CANNABISFINANCIALINTEREST) == "object") {
			for(x in CANNABISFINANCIALINTEREST) {
				if(CANNABISFINANCIALINTEREST[x]["Type of License"] == "Producing Dispensary") 
					fnd ="Y";
			}
		}
		if (fnd == "N") {
			showMessage = true;
			cancel = true;
			comment("When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
		}
	}
}
catch (err) {
    logDebug("A JavaScript Error occurred: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
}

//lwacht
// verify the person attempting to submit the record is the designated responsible party
// if not, stop the submission.  also, send an to the designated responsible party, letting them know the
// record is ready for approval
try{
	createRefContactsFromCapContactsAndLink(capId,["Designated Responsible Party"], null, false, false, comparePeopleStandard);
	var drpUser = createPublicUserFromContact("Designated Responsible Party");
	if(!matches(drpUser, "", null, "undefined", false)){
		var drpPubUser = ""+drpUser.email;
		var resCurUser = aa.person.getUser(publicUserID);
		if(resCurUser.getSuccess()){
			var currUser = resCurUser.getOutput();
			var currUserEmail = ""+currUser.email;
			logDebug("drpPubUser: " + drpPubUser);
			logDebug("currUserEmail: " + currUserEmail);
			if(drpPubUser!=currUserEmail){
				//showDebug = true;
				cancel=true;
				showMessage=true;
				var drpName = drpPubUser.firstName + " " + drpPubUser.lastName;
				logMessage("<span style='font-size:16px'> Only the Designated Responsible Party can complete the application.  An email has been sent to " + drpPubUser + ".  You will be notified via email when the application has been submitted. </span><br/>");
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
}