try{
//lwacht: add the owner applications
	if(publicUser){
		processOwnerApplications();
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Owner Application: Process Owner App: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Process Owner App: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
//lwacht
// if this is the last owner record to be submitted, create a temp affidavit record and email the DRP
try{
	updateAppStatus("Submitted","Updated via ASA:Licenses/Cultivator/*/Owner Application");
	logDebug("parentCapId: " + parentCapId);
	if(parentCapId && publicUser){
		var childRecs = [];
		var allKidsComplete = true;
		var chArray = [];
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application", parentCapId);
		if(!matches(arrChild, null, "", "undefined")&& arrChild.length>0){
			for(ch in arrChild){
				thisChild = arrChild[ch];
				capChild = aa.cap.getCap(thisChild).getOutput();
				//logDebug("capChild.getCapStatus: " + capChild.getCapStatus());
				if(!matches(capChild.getCapStatus(), "Submitted")){
					allKidsComplete=false;
				}
				//logDebug("capChild.getCapModel().getAppTypeAlias(): " + capChild.getCapModel().getAppTypeAlias());
				//logDebug("capChild.getCapID().getCustomID(): " + capChild.getCapID().getCustomID());
				chArray.push({
					"ID" : ch,
					"Alias" : String(capChild.getCapModel().getAppTypeAlias()),
					"recordId" : String(capChild.getCapID().getCustomID())
				});
			}
		}
		var capFaChild = false;
		var arrFaChild = getChildren("Licenses/Cultivator/*/Declaration", parentCapId);
		if(!matches(arrFaChild, null, "", "undefined")&& arrFaChild.length>0){
			for(ch in arrFaChild){
				thisFaChild = arrFaChild[ch];
				capFaChild = aa.cap.getCap(thisFaChild).getOutput();
				chArray.push({
					"ID" : ch,
					"Alias" : String(capFaChild.getCapModel().getAppTypeAlias()),
					"recordId" : String(capFaChild.getCapID().getCustomID())
				});
				var drpContact = getContactByType("Designated Responsible Party",parentCapId);
				//lwacht: 171204: make the DRP the person who created the record so no one else
				// cannot see their info;
				editCreatedBy(drpContact.auditID,thisFaChild);
				//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: ASA:Licenses/Cultivation/*/Owner Application: Reset Cap Status:  " + startDate, "capId: " + capId + ": " + "thisFaChild: " + thisFaChild + br + "drpContact.auditID" + drpContact.auditID + br + currEnv);
				//lwacht: 171204: end
				//lwacht: 171204: reset the DRP record if it exists
				var faCapStatus = getCapIdStatusClass(thisFaChild);
				if(faCapStatus == "INCOMPLETE EST"){
					var resReset = resetCapIdStatusClass("INCOMPLETE CAP",thisFaChild);
					if(typeof(resReset)!="undefined"){
						if(!resReset.getSuccess()){
							aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Owner Application: Reset Cap Status:  " + startDate, "capId: " + capId + ": " + "resReset: " + resReset.getErrorMessage() + br + currEnv);
						}
					}
				}
				//lwacht: 171204: end
			}
		}
		if(chArray.length>0){
			editAppSpecific("childRecs", JSON.stringify(chArray));
		}
		if(allKidsComplete){
			var currCap = capId;
			capId = parentCapId;
			var recTypeAlias = "Declarations and Final Affidavit";  // must be a valid record type alias
			var recordNum = 1;
			var afArray = [];  // array describing the associated form records
			for (var i = 0; i < recordNum; i++) {
				var af = {};  // empty object
				af.ID = String(i + 1);  // give it an id number
				af.Alias = recTypeAlias;  
				af.recordId = "";		// define a place to store the record ID when the record is created
				afArray.push(af); 		// add the record to our array
			}
			var arrForms = (doAssocFormRecs("childRecs",afArray));
			capId = currCap;
			for (i in arrForms){0
				thisForm =  arrForms[i];
				var desigRec =  thisForm["recordId"];
				var desigRecId = aa.cap.getCapID(desigRec).getOutput();
				var drpContact = getContactByType("Designated Responsible Party",parentCapId);
				if(drpContact){
					var drpFirst = drpContact.getFirstName();
					var drpLast =  drpContact.getLastName();
					var drpEmail = drpContact.getEmail();
					editAppName(drpFirst + " " + drpLast + " (" + drpEmail + ")", desigRecId);
					updateShortNotes(drpFirst + " " + drpLast + " (" + drpEmail + ")",desigRecId);
					copyContactsByType(parentCapId, desigRecId, "Designated Responsible Party");
					//lwacht: 171204: make the DRP the person who created the record so no one else
					// cannot see their info;
					editCreatedBy(drpContact.auditID,desigRecId);
					//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: ASA:Licenses/Cultivation/*/Owner Application: Reset Cap Status:  " + startDate, "capId: " + capId + ": " + "thisFaChild: " + thisFaChild + br + "drpContact.auditID" + drpContact.auditID + br + currEnv);
					//lwacht: 171204: end
					if(!matches(drpEmail,null,"","undefined")){
						emailParameters = aa.util.newHashtable();
						var sysDate = aa.date.getCurrentDate();
						var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
						addParameter(emailParameters, "$$altID$$", desigRecId.getCustomID());
						addParameter(emailParameters, "$$firstName$$", ""+drpFirst);
						addParameter(emailParameters, "$$lastName$$", ""+drpLast);
						addParameter(emailParameters, "$$today$$", sysDateMMDDYYYY);
						addParameter(emailParameters, "$$ACAUrl$$", getACAlinkForEdit(desigRecId, "Licenses", "1005"));
						sendNotification(sysEmail,drpEmail,"","LCA_DRP_DECLARATION_NOTIF",emailParameters,null,desigRecId);
					}
				}
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA:Licenses/Cultivator/*/Owner Application: Declaration logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Owner Application: Declaration logic:  " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack + br + currEnv);
}

// lwacht
// if not ACA, set altId based on application parent
try{
	if(!publicUser){
		if(parentCapId){
			nbrToTry = 1;
			//because owners can be added and deleted, need a way to number the records
			//but only if they haven't been numbered before
			if(capId.getCustomID().substring(0,3)!="LCA"){
				var ownerGotNewAltId = false;
				var newIdErrMsg = "";
				for (i = 0; i <= 100; i++) {
					if(nbrToTry<10){
						var nbrOwner = "00" + nbrToTry;
					}else{
						if(nbrToTry<100){
							var nbrOwner = "0" + nbrToTry
						}
						var nbrOwner = ""+ nbrToTry;
					}
					var newAltId = parentCapId.getCustomID() + "-" + nbrOwner + "O";
					var updateResult = aa.cap.updateCapAltID(capId, newAltId);
					if (updateResult.getSuccess()) {
						logDebug("Updated owner record AltId to " + newAltId + ".");
						ownerGotNewAltId = true;
						break;
					}else {
						newIdErrMsg += updateResult.getErrorMessage() +"; ";
						nbrToTry++;
					}
				}
				if(!ownerGotNewAltId){
					logDebug("Error renaming owner record " + capId + ":  " + newIdErrMsg);
					aa.sendMail(sysFromEmail, debugEmail, "", "Error renaming owner record " + capId + ": " + startDate, newIdErrMsg);
				}
			}else{
				logDebug("Owner record AltId already updated: "+ capId.getCustomID());
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Owner Application: AltID Logic:  " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}

//lwacht: 180416: story 5175: create a reference contact for the Owner contact
try{
	if(!publicUser){
		//lwacht: create reference contact and public user account for the Owner		
		var capContactResult = aa.people.getCapContactByCapID(capId);
		var ownExists = false;
		var ownEmail = false;
		if (capContactResult.getSuccess()){
			Contacts = capContactResult.getOutput();
			for (yy in Contacts){
				var thisCont = Contacts[yy].getCapContactModel();
				var contType = thisCont.contactType;
				showMessage=true;
				if(contType =="Owner") {
					var ownRefContNrb = thisCont.refContactNumber;
					ownEmail = thisCont.email.toLowerCase();
					logDebug("ownEmail: " + ownEmail);
					var ownCont = Contacts[yy].getCapContactModel();
				}
			}
		}
		if(ownEmail){
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
			qryPeople.setEmail(ownEmail);
			var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
			if (!qryResult.getSuccess()){ 
				logDebug("WARNING: error searching for people : " + qryResult.getErrorMessage());
			}else{
				var peopResult = qryResult.getOutput();
				if (peopResult.length > 0){
					ownExists = true;
				}
			}
		}
		if(!ownExists){
			createRefContactsFromCapContactsAndLink(capId,["Owner"], null, false, false, comparePeopleGeneric);
			//lwacht 180425: COMMENTING OUT FOR AVTEST6
			var ownUser = createPublicUserFromContact("Owner");
			logDebug("Successfully created Owner");
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Owner Application: Create Owner: " + err.message);
	logDebug(err.stack);
}
//lwacht: 180416: story 5175: end
