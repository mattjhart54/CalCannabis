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
//lwacht
// adding associated forms for owner records then adding owners to those records
try {
	//capId = cap.getCapID();
	var recTypeAlias = "Owner Application";  // must be a valid record type alias
	var recordNum = 0;
	//loadASITables4ACA();
	loadASITables();
	for(row in OWNERS){
		recordNum++;
	}
	var afArray = [];  // array describing the associated form records

	for (var i = 0; i < recordNum; i++) {
		var af = {};  // empty object
		af.ID = String(i + 1);  // give it an id number
		af.Alias = recTypeAlias;  
		af.recordId = "";		// define a place to store the record ID when the record is created
		afArray.push(af); 		// add the record to our array
	}
	var arrForms = (doAssocFormRecs(null,afArray));
	for (y in arrForms){
		thisForm =  arrForms[y];
		var childRecId =  thisForm["recordId"];
		var vFirst = OWNERS[y]["First Name"];
		var vLast = OWNERS[y]["Last Name"];
		var vEmail = OWNERS[y]["Email Address"];
		var vMiddle = null;
		//logDebug("vFirst: " + vFirst);
		var currCapId = capId;
		capId = aa.cap.getCapID(childRecId).getOutput();
		var arrContacts = getContactArray(capId);
		if(arrContacts.length>0){ //if there are contacts then remove them--easier than trying to figure who's been added/removed
			var removeResult = aa.people.removeCapContact(capId, arrContacts[0]["contactSeqNumber"]); //should only be one
			if (removeResult.getSuccess()){
				logDebug("(contactObj) contact removed : " + this + " from record " + this.capId.getCustomID());
			}else{
				logDebug("(contactObj) error removing contact : " + this + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
			}
		}
		var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
		//for(bb in qryPeople){
		//	if(typeof(qryPeople[bb])=="function"){
		//		logDebug(bb);
		//	}
		//}
		qryPeople.setServiceProviderCode(aa.getServiceProviderCode()) ; 
		qryPeople.setEmail(vEmail);
		qryPeople.setContactTypeFlag("Individual");
		qryPeople.setContactType("Owner");
		var resQryPpl = aa.people.getPeopleByPeopleModel(qryPeople);
		if(resQryPpl.getSuccess()){
			logDebug("Found reference contact matching email, so adding to new owner record.");
			var ownerSeqNum = addReferenceContactByName(vFirst, vMiddle, vLast);
			emailParameters = aa.util.newHashtable();
			addParameter(emailParameters, "$$AltID$$", capId);
			addParameter(emailParameters, "$$ProjectName$$", capName);
			addParameter(emailParameters, "$$ACAUrl$$", getACAUrl());
			sendNotification(sysEmail,vEmail,"","LCA_OWNER_APP_NOTIF",emailParameters,rFiles,capId);
		}else{
			qryPeople.setFirstName(vFirst);
			qryPeople.setLastName(vLast);
			var resPpl = aa.people.createPeople(pm);
			if(!resPpl.getSuccess()){
				logDebug("Error creating people: " + resPpl.getErrorMessage());
			}else{
				logDebug("Succesfully create ref contact, so adding to record");
				var ownerSeqNumAgain = addReferenceContactByName(vFirst, vMiddle, vLast);
				if(!ownerSeqNumAgain){
					logDebug("Error adding ref contact: "+ ownerSeqNumAgain);
				}
			}
		}
		capId = currCapId;
	}
}catch (err) {
	logDebug("A JavaScript Error occurred:ASA:LICENSES/CULTIVATOR/*/APPLICATION: associated forms: " + err.message);
	logDebug(err.stack);
}


//lwacht
// verify the person attempting to submit the record is the designated responsible party
// if not, stop the submission.  also, send an to the designated responsible party, letting them know the
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
					sendNotification(sysEmail,drpPubUser,"","LCA_OWNER_APP_NOTIF",emailParameters,rFiles,capId);
				}
			}else{
				logDebug("Error getting current public user: " + resCurUser.getErrorMessage());
			}
		}else{
			logDebug("Error creating public user for Designated Responsible Party.");
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "A JavaScript Error occurred: Licenses/Cultivation/*/Application: " + startDate, err);
}
