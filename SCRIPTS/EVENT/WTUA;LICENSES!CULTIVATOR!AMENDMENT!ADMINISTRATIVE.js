try {
	if(wfStatus == "Amendment Approved") {
		// Copy custom fields from the license record to the parent record
		holdId = capId;
		pIds = getParents("Licenses/Cultivator/License/License");
		if(matches(pIds,null,'',undefined)) {
			capId = parentCapId;
		}
		else {
			capId = pIds[0];
			parentAltId = capId.getCustomID();
			editAppSpecific("License Number",parentAltId,holdId);
		}
		updateCat = false;
		if(!matches(AInfo["CA Update"],null,"",undefined))
			editAppSpecific("Cooperative Association",AInfo["CA Update"]);
		if(!matches(AInfo["NCA Update"],null,"",undefined))
			editAppSpecific("Name of Cannabis Cooperative",AInfo["NCA Update"]);
		if(!matches(AInfo["BEA Update"],null,"",undefined))
			editAppSpecific("Business Entity Structure",AInfo["BEA Update"]);
		if(!matches(AInfo["OE Update"],null,"",undefined))
			editAppSpecific("Other Entity",AInfo["OE Update"]);
		if(!matches(AInfo["FC Update"],null,"",undefined))
			editAppSpecific("Foreign Corporation",AInfo["FC Update"]);
		if(!matches(AInfo["LBN Update"],null,"",undefined)) {
			editAppSpecific("Legal Business Name",AInfo["LBN Update"]);
			updateCat = true;
		}
		if(!matches(AInfo["EIN/ITIN Update"],null,"",undefined))
			editAppSpecific("EIN/ITIN",AInfo["EIN/ITIN Update"]);
		if(!matches(AInfo["SSN/ITIN Update"],null,"",undefined))
			editAppSpecific("SSN/ITIN",AInfo["SSN/ITIN Update"]);
		if(!matches(AInfo["BSP Update"],null,"",undefined)) {
			editAppSpecific("BOE Seller's Permit Number",AInfo["BSP Update"]); 
			updateCat = true;
		}
		if(!matches(AInfo["SSRE Update"],null,"",undefined))
			editAppSpecific("Secretary of State Registration Entity",AInfo["SSRE Update"]);
		if(!matches(AInfo["DIO Update"],null,"",undefined))
			editAppSpecific("Date of Intitial Operation",AInfo["DIO Update"]);
//		if(!matches(AInfo["RPA Update"],null,"",undefined))
			editAppSpecific("Records on Premise Acknowledgement",AInfo["RPA Update"]);
		if(!matches(AInfo["LP Update"],null,"",undefined))
			editAppSpecific("Legal Possession",AInfo["LP Update"]);
		if(!matches(AInfo["OLP Update"],null,"",undefined))
			editAppSpecific("Other Possession",AInfo["OLP Update"]);
		if(!matches(AInfo["POMA Update"],null,"",undefined))
			editAppSpecific("Property Owner's Mailing Address",AInfo["POMA Update"]);
		if(!matches(AInfo["POPN Update"],null,"",undefined))
			editAppSpecific("Property Owner's Phone Number",AInfo["POPN Update"]);
		if(!matches(AInfo["LAT Update"],null,"",undefined))	
			editAppSpecific("Local Authority Type",AInfo["LAT Update"]);
		if(!matches(AInfo["LAN Update"],null,"",undefined))
			editAppSpecific("Local Authority Name",AInfo["LAN Update"]);
		if(!matches(AInfo["LANBR Update"],null,"",undefined))
			editAppSpecific("Local Authorization Number",AInfo["LANBR Update"]);
		if(!matches(AInfo["LAED Update"],null,"",undefined))
			editAppSpecific("Expiration Date",AInfo["LAED Update"]);
		if(!matches(AInfo["LAA Update"],null,"",undefined))
			editAppSpecific("Local Authority Address",AInfo["LAA Update"]);
		if(!matches(AInfo["LAC Update"],null,"",undefined))
			editAppSpecific("Local Authority City",AInfo["LAC Update"]);
		if(!matches(AInfo["LAZ Update"],null,"",undefined))
			editAppSpecific("Local Authorizaton Zip",AInfo["LAZ Update"]);
		if(!matches(AInfo["LACO Update"],null,"",undefined))
			editAppSpecific("Local Authority County",AInfo["LACO Update"]);
		if(!matches(AInfo["LAP Update"],null,"",undefined))
			editAppSpecific("Local Authority Phone",AInfo["LAP Update"]);
		if(!matches(AInfo["DBN Update"],null,"",undefined))
			editAppSpecific("Doing Business As",AInfo["DBN Update"]);
		removeASITable("CANNABIS FINANCIAL INTEREST");
		copyASITables(holdId,capId);
		updateWorkDesc(workDescGet(holdId));
		if(updateCat)
			addToCat(capId);
		capId = holdId;
// Update contacts
		var amendContactResult = aa.people.getCapContactByCapID(capId);
		if (amendContactResult.getSuccess()){
			var amendContacts = amendContactResult.getOutput();
			for (a in amendContacts){
				if(matches(amendContacts[a].getCapContactModel().getContactType(),"Business","Agent for Service of Process")) {
					var amendCont = amendContacts[a].getCapContactModel();
					var amendRefNbr = amendCont.refContactNumber;
					var amendType = amendCont.contactType;
					var amendEmail = amendCont.email;
					var amendLast = amendCont.lastName;
					var amendFirst = amendCont.firstName;
					logDebug(" amend " + amendRefNbr + " " + amendType + " " + amendEmail + " " + amendLast);
					var amendLBN = amendCont.middleName;
					var amendTitle = amendCont.title;
					var amendPhone = amendCont.phone3;
					var amendChannel = amendCont.preferredChannel;
					var amendEnd = amendCont.endDate;
					var amendAddressList = aa.address.getContactAddressListByCapContact(amendCont);
					var amendAddressModelArr = convertContactAddressModelArr(amendAddressList.getOutput());
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
							licCont.setEmail(amendEmail);
							licCont.setLastName(amendLast);
							licCont.setFirstName(amendFirst);
				//			licCont.setMiddleName(amendLBN);
							licCont.setTitle(amendTitle);
							licCont.setPhone3(amendPhone);
				//			licCont.setPreferredChannel(amendChannel);
							licCont.setEndDate(amendEnd);
							logDebug("update contact1 " + amendRefNbr + " " + amendType);
							var peopleModel = licCont.getPeople();
							peopleModel.setPreferredChannel(amendChannel);
							peopleModel.setMiddleName(amendLBN);
							var licAddressrs = aa.address.getContactAddressListByCapContact(licCont);
							peopleModel.setContactAddressList(amendAddressModelArr);
							aa.people.editCapContactWithAttribute(licCont);
						}
						else {
							logDebug("add contact " + amendRefNbr + " " + amendType + " " + amendEmail + " " + amendLast);
							copyContactsByType_rev(capId,parentCapId,amendType,amendEmail);
						}
					}
				}
			}
		}
//Check for deleted contact
		var licContactResult = aa.people.getCapContactByCapID(parentCapId);
		if (licContactResult.getSuccess()){
			var licContacts = licContactResult.getOutput();
			for (i in licContacts){
				if(matches(licContacts[i].getCapContactModel().getContactType(),"Business","Agent for Service of Process")) {
					var licCont = licContacts[i].getCapContactModel();
					var licRefNbr = licCont.refContactNumber;
					var licType = licCont.contactType;
					var licEmail = licCont.email;
					var licContSeq = licCont.contactSeqNumber;
					logDebug("license " + licRefNbr + " " + licType + " " + licEmail + " " + licContSeq);
					var amendContactResult = aa.people.getCapContactByCapID(capId);
					if (amendContactResult.getSuccess()){
						var amendContacts = amendContactResult.getOutput();
						var amendFnd = false;
						for (a in amendContacts){
							var amendCont = amendContacts[a].getCapContactModel();
							if(amendCont.contactType == licType) {
								logDebug(" amend " + amendCont.refContactNumber + " " + amendCont.contactType + " " + amendCont.email);
								if(licRefNbr != null && licRefNbr == amendCont.refContactNumber) {
									amendFnd = true;
									break;
								}
								else {							
									if(licRefNbr == null && licEmail.toUpperCase() == amendCont.email.toUpperCase()) {
										amendFnd = true;
										break;
									}

								}
							}
						}
						if(!amendFnd) {
							aa.people.removeCapContact(parentCapId,licContSeq);
							logDebug("removed contact " + licCont.contactSeqNumber);
						}
					}
					
				}
			}
		}		
//  Send email notification to DRP
		var priContact = getContactObj(capId,"Designated Responsible Party");
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
			addParameter(eParams, "$$parentId$$", parentCapId.getCustomID());
			var priEmail = ""+priContact.capContact.getEmail();
			var rFiles = [];
			sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_APPROVAL",eParams, rFiles,capId);
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
//  Send email notification to DRP
		var priContact = getContactObj(capId,"Designated Responsible Party");
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
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/AMENDMENT/ADMINISTRATIVE: " + err.message);
	logDebug(err.stack);
}
