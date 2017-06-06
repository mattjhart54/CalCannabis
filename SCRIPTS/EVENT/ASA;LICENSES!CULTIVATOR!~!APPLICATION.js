// lwacht
//compare the documents uploaded to the documents required in the "attachment" event
// if any documents are required, send an email.
/* lwacht : start : not using, but leaving for now
try{
	if(!publicUser){
		var docsList = [];
		var allDocsLoaded = true;
		//var docsList = aa.env.getValue("DocumentModelList"); //Get all Documents on a Record
		var docsList = getDocumentList();
		logDebug("docsList: " + docsList);
		reqDocs = getReqdDocs("Application");
		var tblRow = [];
		if(reqDocs.length>0){
			for (x in reqDocs){
				var docName = reqDocs[x];
				var tblRow = [];
				tblRow["Document Type"] = ""+docName; 
				tblRow["Document Description"]= ""+lookup("LIC_CC_ATTACHMENTS", docName); 
				var docFound=false; 
				if(docsList.length>0){
					for (dl in docsList){
						var thisDocument = docsList[dl];
						var docCategory = thisDocument.getDocCategory();
						if (docName.equals(docCategory)){
							docFound = true;
							tblRow["Uploaded"] = "CHECKED";
							tblRow["Status"] = "Under Review";
						}else{
							tblRow["Uploaded"] = "UNCHECKED";
							tblRow["Status"] = "Not Submitted";
						}
					}
				}else{
					tblRow["Uploaded"] = "UNCHECKED";
					tblRow["Status"] = "Not Submitted";
				}
				if(!docFound){
					addStdCondition("License Required Documents", docName);
				}
				addToASITable("ATTACHMENTS",tblRow);
			}
		}
	}
} catch(err){ 
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/ * /APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
}
lwacht : end
*/

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
