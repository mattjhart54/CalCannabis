//lwacht: add the owner applications
processOwnerApplications();

//lwacht
// send an to the designated responsible party, letting them know the
// record is ready for approval
try{
	createRefContactsFromCapContactsAndLink(capId,["Designated Responsible Party"], null, false, false, comparePeopleStandard);
	var drpUser = createPublicUserFromContact("Designated Responsible Party");
	if(publicUser){
		if(!matches(drpUser, "", null, "undefined", false)){
			var drpPubUser = ""+drpUser.email;
			var resCurUser = aa.person.getUser(publicUserID);	
			if(resCurUser.getSuccess()){
				var currUser = resCurUser.getOutput();
				var currUserEmail = ""+currUser.email;
				logDebug("drpPubUser: " + drpPubUser);
				logDebug("currUserEmail: " + currUserEmail);
				emailParameters = aa.util.newHashtable();
				addParameter(emailParameters, "$$AltID$$", capId);
				addParameter(emailParameters, "$$ProjectName$$", capName);
				addParameter(emailParameters, "$$ACAUrl$$", getACAUrl());
				//no email gets sent to the DRP if they are the applicant
				if(drpPubUser!=currUserEmail){
					//cancel=true;
					//showMessage=true;
					//var drpName = drpPubUser.firstName + " " + drpPubUser.lastName;
					//logMessage("<span style='font-size:16px'> Only the Designated Responsible Party can complete the application.  An email has been sent to " + drpPubUser + ".  You will be notified via email when the application has been submitted. </span><br/>");
					sendNotification(sysEmail,drpPubUser,"","LCA_OWNER_APP_NOTIF",emailParameters,null,capId);
				}
			}else{
				logDebug("Error getting current public user: " + resCurUser.getErrorMessage());
			}
		}else{
			logDebug("Error creating public user for Designated Responsible Party.");
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}
//mhart
//update work description with Legal Business Name
try {
	updateLegalBusinessName();
	editAppName(AInfo["License Type"]);
	updateShortNotes(AInfo["Premise County"]);

}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}
//lwacht
//remove conditions after documents are uploaded
/* not working here so trying in CTRCA
try{
	var docsList = [];
	var allDocsLoaded = true;
	//docsList = getDocumentList();//Get all Documents on a Record
	var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
	var arrMissingDocs = [];
	for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
		var thisDocument = capDocResult.getOutput().get(docInx);
		//var thisDocument = docsList[dl];
		var docCategory = thisDocument.getDocCategory();
		removeCapCondition("License Required Documents", docCategory);
	}
		//aa.sendMail(sysFromEmail, debugEmail, "", "Info Only: ASA:LICENSES/CULTIVATOR/* /APPLICATION: Required Documents: "+ startDate, capId + br + "docCategory: " + docCategory);
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/* /APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/* /APPLICATION: Required Documents: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
*/