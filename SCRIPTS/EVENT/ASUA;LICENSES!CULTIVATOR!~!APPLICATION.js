//lwacht
//send other notifications
try{
	if(matches(appStatus, "Disqualified", "Withdrawn", "Denied"){
		var emailPriReport = false;
		var emailDRPReport = false;
		var priContact = getContactObj(capId,"Primary Contact");
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(priChannel.indexOf("Email") >= 0 || priChannel.indexOf("E-mail") >= 0){
			emailPriReport = true;
		}else{
			showMessage=true;
			comment("The Primary Contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the displayed report.");
		}
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		var drptChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
		if(drptChannel.indexOf("Email") >= 0 || drptChannel.indexOf("E-mail") >= 0){
			emailDRPReport = true;
		}else{
			showMessage=true;
			comment("The Designated Responsible Party, " + drpContact.capContact.firstName + " " + drpContact.capContact.lastName + ", has requested all correspondence be mailed.  Please mail the displayed report.");
		}
		if(emailPriReport || emailDRPReport){
			//populate the email notification that will go to the primary contact
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$wfDateMMDDYYYY$$", wfDateMMDDYYYY);
			currCapId = capId;
			capId = newDefId;
			getACARecordParam4Notification(eParams,acaUrl);
			capId = currCapId;
			var staffUser = new userObj(wfStaffUserID);
			staffUser.getEmailTemplateParams(eParams,"scientist")
			getWorkflowParams4Notification(eParams);
			var contPhone = priContact.capContact.phone1;
			var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			priAddresses = priContact.addresses;
			for (x in priAddresses){
				thisAddr = priAddresses[x];
				if(thisAddr.getAddressType()=="Mailing"){
					addParameter(eParams, "$$priAddress1$$", thisAddr.addressLine1);
					addParameter(eParams, "$$priCity$$", thisAddr.city);
					addParameter(eParams, "$$priState$$", thisAddr.state);
					addParameter(eParams, "$$priZip$$", thisAddr.zip);
				}
			}
			//logDebug("eParams: " + eParams);
			var drpEmail = ""+drpContact.capContact.getEmail();
			var priEmail = ""+priContact.capContact.getEmail();
			var rParams = aa.util.newHashMap(); 
			rParams.put("agencyid", servProvCode);
			rParams.put("capid", capId.getCustomID());
			var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
			var rFile;
			rFile = generateReport(capId,"ACA Permit","Licenses",rParams);
			if (rFile) {
				var rFiles = [];
				rFiles.push(rFile);
				if(priContact.capContact.getEmail()==drpContact.capContact.getEmail()){
					sendNotification(sysFromEmail,drpEmail,"","LCA_GENERAL_NOTIFICATION",eParams, rFiles,capId);
				}else{
					if(emailPriReport){
						aa.document.sendEmailAndSaveAsDocument(sysFromEmail, priEmail + ";" + priEmail, "", "LCA_GENERAL_NOTIFICATION", eParams, capId4Email, rFiles,capId);
					}
					if(emailDRPReport){
						aa.document.sendEmailAndSaveAsDocument(sysFromEmail, drpEmail + ";" + priEmail, "", "LCA_GENERAL_NOTIFICATION", eParams, capId4Email, rFiles,capId);

					}
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}

