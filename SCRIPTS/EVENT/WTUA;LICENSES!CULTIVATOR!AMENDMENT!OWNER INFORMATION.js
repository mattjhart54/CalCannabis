try {
	if(wfStatus == "Amendment Approved") {
		var amendContactResult = aa.people.getCapContactByCapID(capId);
		if (amendContactResult.getSuccess()){
			var amendContacts = amendContactResult.getOutput();
			for (i in amendContacts){
				if(matches(amendContacts[i].getCapContactModel().getContactType(),"Owner")) {
					var amendCont = amendContacts[i].getCapContactModel();
					var amendRefNbr = amendCont.refContactNumber;
					var amendType = amendCont.contactType;
					var amendEmail = amendCont.email;
					var amendLast = amendCont.lastName;
					var amendFirst = amendCont.firstName;
		//			logDebug(" amend " + amendRefNbr + " " + amendType + " " + amendEmail + " " + amendLast);
					var amendLBN = amendCont.middleName;
					var amendTitle = amendCont.title;
					var amendPhone = amendCont.phone3;
					var amendSSN = amendCont.maskedSsn;
					var amendNIN = amendCont.postOfficeBox;
					var amendChannel = amendCont.preferredChannel;
					var amendBirth = amendCont.birthDate;
					var amendEnd = amendCont.endDate;
					var amendAddressList = aa.address.getContactAddressListByCapContact(amendCont);
					var amendAddressModelArr = convertContactAddressModelArr(amendAddressList.getOutput());
					pIds = getParents("Licenses/Cultivator/License/License");
					if(!matches(pIds,null,'',undefined)) {
						parentCapId = pIds[0];
						parentAltId = parentCapId.getCustomID();
						editAppSpecific("License Number",parentAltId);
					}
					var licContactResult = aa.people.getCapContactByCapID(parentCapId);
					if (licContactResult.getSuccess()){
						var licContacts = licContactResult.getOutput();
						licFnd = false;
						for (i in licContacts){
							if(licContacts[i].getCapContactModel().getContactType() == amendType) {
								var licCont = licContacts[i].getCapContactModel();
								logDebug("license " + licCont.refContactNumber + " " + licCont.contactType + " " + licCont.email + " " + licCont.lastName);
								if(amendRefNbr != null && amendRefNbr == licCont.refContactNumber) {
									licFnd = true;
									break;
								}
								else {							
									if(amendRefNbr == null && amendEmail.toUpperCase() == licCont.email.toUpperCase()) {
										licFnd = true;
										break;
									}

								}
							}
						}
						if(licFnd) {
				//			licCont.setEmail(amendEmail);
				//			licCont.setLastName(amendLast);
				//			licCont.setFirstName(amendFirst);
							licCont.setMiddleName(amendLBN);
							licCont.setTitle(amendTitle);
							licCont.setPostOfficeBox(amendNIN);
							licCont.setMaskedSsn(amendSSN);
							licCont.setPhone3(amendPhone);
							licCont.setBirthDate(amendBirth);
							licCont.setEndDate(amendEnd);
							logDebug("update contact1 " + amendRefNbr + " " + amendType);
							var peopleModel = licCont.getPeople();
							peopleModel.setPreferredChannel(amendChannel)
							var licAddressrs = aa.address.getContactAddressListByCapContact(licCont);
							peopleModel.setContactAddressList(amendAddressModelArr);
							aa.people.editCapContactWithAttribute(licCont);
						}
						else {
							logDebug("No owner contact found" + amendRefNbr + " " + amendType + " " + amendEmail + " " + amendLast);
						}
					}
				}
			}
		}		
//  Send email notification to Owner
		var priContact = getContactObj(capId,"Owner");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			var contPhone = priContact.capContact.phone1;
			if(contPhone){
				var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
			}else{
				var fmtPhone = "";
			}
			addParameter(eParams, "$$altId$$", capId.getCustomID());
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$business$$", workDescGet(parentCapId));
			addParameter(eParams, "$$parentId$$", parentCapId.getCustomID());
			var priEmail = ""+priContact.capContact.getEmail();
			var rFiles = [];
			sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_APPROVAL",eParams, rFiles,capId);
	//		emailRptContact("", "LCA_AMENDMENT_APPROVAL", "", false, capStatus, capId, "Designated Responsible Party");
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("Amendment Approval","Amendment Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,capId);
						if(setAddResult.getSuccess()){
							logDebug(capId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
	}
	if(wfStatus == "Amendment Rejected") {
//  Send email notification to Owner
		var priContact = getContactObj(capId,"Owner");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			var contPhone = priContact.capContact.phone1;
			if(contPhone){
				var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
			}else{
				var fmtPhone = "";
			}
			TInfo = [];
			loadTaskSpecific(TInfo);
			addParameter(eParams, "$$rejectReason$$", TInfo["Rejection Reason"]);
			addParameter(eParams, "$$altId$$", capId.getCustomID());
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$parentId$$", parentCapId.getCustomID());
			var priEmail = ""+priContact.capContact.getEmail();
			var rFiles = [];
			sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_REJECTED",eParams, rFiles,capId);
//			emailRptContact("", "LCA_AMENDMENT_REJECTED", "", false, capStatus, capId, "Designated Responsible Party");
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("Amendment Rejected","Amendment Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,capId);
						if(setAddResult.getSuccess()){
							logDebug(capId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
	}		
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/AMENDMENT/Owner Information: " + err.message);
	logDebug(err.stack);
}
