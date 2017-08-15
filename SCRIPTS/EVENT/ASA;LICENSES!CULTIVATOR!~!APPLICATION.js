//lwacht: add the owner applications
processOwnerApplications();

//lwacht
// send an email to the designated responsible party, letting them know the
// record is ready for approval
try{
	createRefContactsFromCapContactsAndLink(capId,["Designated Responsible Party"], null, false, false, comparePeopleStandard);
	var drpUser = createPublicUserFromContact("Designated Responsible Party");
/*  DRP is now in the owner table so do not send email separately to the DRP
	if(publicUser){
		if(!matches(drpUser, "", null, "undefined", false)){
			var drpPubUser = ""+drpUser.email;
			var resCurUser = aa.person.getUser(publicUserID);	
			if(resCurUser.getSuccess()){
				var currUser = resCurUser.getOutput();
				var currUserEmail = ""+currUser.email;
				logDebug("drpPubUser: " + drpPubUser);
				logDebug("currUserEmail: " + currUserEmail);
				var cArray = getContactArray();
				for (con in cArray) {
					if(cArray[con].contactType == "Designated Responsible Party"){
						var vFirst = cArray[con].firstName;
						var vLast = cArray[con].lastName; 
						emailParameters = aa.util.newHashtable();
						addParameter(emailParameters, "$$AltID$$", capId.getCustomID());
						addParameter(emailParameters, "$$firstName$", vFirst);
						addParameter(emailParameters, "$$lastName$", vLast);						
						addParameter(emailParameters, "$$ACAUrl$$", getACAUrl());
					//no email gets sent to the DRP if they are the applicant
						if(drpPubUser!=currUserEmail){
							//cancel=true;
							//showMessage=true;
							//var drpName = drpPubUser.firstName + " " + drpPubUser.lastName;
							//logMessage("<span style='font-size:16px'> Only the Designated Responsible Party can complete the application.  An email has been sent to " + drpPubUser + ".  You will be notified via email when the application has been submitted. </span><br/>");
							sendNotification(sysEmail,drpPubUser,"","LCA_OWNER_APP_NOTIF",emailParameters,null,capId);
						}
					}
				}
			}else{
				logDebug("Error getting current public user: " + resCurUser.getErrorMessage());
			}
		}else{
			logDebug("Error creating public user for Designated Responsible Party.");
		}
	}
*/
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: DRP Notification: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application:  DRP Notification: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart
//update work description with Legal Business Name
//lwacht: don't run for temporary app 
try {
	if(appTypeArray[2]!="Temporary"){
		updateLegalBusinessName();
		editAppName(AInfo["License Type"]);
		updateShortNotes(AInfo["Premise County"]);
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: Edit App Name: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Edit App Name: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht
//send the application notification letter
try{
	runReportAttach(capId,"Submitted Application", "p1value", capId.getCustomID());
	emailDrpPriContacts("PRA", "LCA_GENERAL_NOTIFICATION", "", false, "Application Received", capId, "RECORD_ID", capId.getCustomID());
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/APPLICATION: Application Submitted: Send Notif Letter: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Send Notif Letter: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht
//add fees
try{
	var feeDesc = AInfo["License Type"] + " - Application Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_CULTIVATOR", feeDesc);
	if(thisFee){
		updateFee(thisFee.feeCode,"LIC_CC_CULTIVATOR", "FINAL", 1, "Y", "N");
	}else{
		logDebug("An error occurred retrieving fee item: " + feeDesc);
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
	}
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/APPLICATION: Application Submitted: Add Fees: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}