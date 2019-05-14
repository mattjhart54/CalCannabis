try {
	if(wfStatus == "Amendment Approved") {
// Copy custom fields from the license record to the parent record
		holdId = capId;
		capId = parentCapId;
		editAppSpecific("Cooperative Association",AInfo["CA Update"],holdId);
		editAppSpecific("Name of Cannabis Cooperative",AInfo["NCA Update"]);
		editAppSpecific("Business Entity Structure",AInfo["BEA Update"],holdId);
		editAppSpecific("Other Entity",AInfo["OE Update"],holdId);
		editAppSpecific("Foreign Corporation",AInfo["FC Update"],holdId);
		editAppSpecific("Legal Business Name",AInfo["LBN Update"],holdId);
		editAppSpecific("EIN/ITIN",AInfo["EIN/ITIN Update"],holdId);
		editAppSpecific("SSN/ITIN",AInfo["SSN/ITIN Update"],holdId);
		editAppSpecific("BOE Seller's Permit Number",AInfo["BSP Update"],holdId);
		editAppSpecific("Secretary of State Registration Entity ",AInfo["SSRE Update"],holdId);
		editAppSpecific("Date of Intitial Operation",AInfo["DOI Update"],holdId);
		editAppSpecific("Records on Premise Acknowledgement",AInfo["RPA Update"],holdId);
		editAppSpecific("Legal Possession",AInfo["LP Update"],holdId);
		editAppSpecific("Other Possession",AInfo["OLP Update"],holdId);
		editAppSpecific("Property Owner's Mailing Address",AInfo["POMA Update"],holdId);
		editAppSpecific("Property Owner's Phone Number",AInfo["POPN Update"],holdId);
		editAppSpecific("Local Authority Type",AInfo["LAT Update"],holdId);
		editAppSpecific("Local Authority Name",AInfo["LAn Update"],holdId);
		editAppSpecific("Local Authorization Number",AInfo["LANBR Update"],holdId);
		editAppSpecific("Expiration Date",AInfo["LAED Update"],holdId);
		editAppSpecific("Local Authority Address",AInfo["LAA Update"],holdId);
		editAppSpecific("Local Authority City",AInfo["LAC Update"],holdId);
		editAppSpecific("Local Authorizaton Zip",AInfo["LAZ Update"],holdId);
		editAppSpecific("Local Authority County",AInfo["LACO Update"],holdId);
		editAppSpecific("Local Authority Phone",AInfo["LAP Update"],holdId);
		copyASITables(holdId,capId,"DEFICIENSIES","DENIAL REASONS","Premises Addresses","Owners","Source of Water Supply");
		capId = holdId;
// Update contacts
	var amendContactResult = aa.people.getCapContactByCapID(capId);
	if (amendContactResult.getSuccess()){
		var amendContacts = amendContactResult.getOutput();
		for (i in amendContacts){
			if(matches(amendContacts[i].getCapContactModel().getContactType(),"Business","Agent for Service of Process")) {
				var amendCont = amendContacts[i].getCapContactModel();
				var amendRefNbr = amendCont.refContactNumber;
				var amendType = amendCont.contactType;
				var amendEmail = amendCont.email;
				var amendLast = amendCont.lastName;
				var amendFirst = amendCont.firstName;
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
					for (i in licContacts){
						if(licContacts[i].getCapContactModel().getContactType() == amendType) {
							if(amendRefNbr == licContacts[i].getCapContactModel().getRefContactNumber()) {
								logDebug("update contact " + amendRefNbr + " " + amendType);
								var licCont = licContacts[i].getCapContactModel();
								licCont.setEmail(amendEmail);
								licCont.setLastName(amendLast);
								licCont.setFirstName(amendFirst);
								licCont.setMiddleName(amendLBN);
								licCont.setTitle(amendTitle);
								licCont.setPhone3(amendPhone);
				//				licCont.setPreferredChannel(amendChannel);
								licCont.setEndDate(amendEnd);
								var peopleModel = licCont.getPeople();
								var licAddressrs = aa.address.getContactAddressListByCapContact(licCont);
								peopleModel.setContactAddressList(amendAddressModelArr);
								aa.people.editCapContactWithAttribute(licCont);
							}
							else {
								logDebug("add contact " + amendRefNbr + " " + amendType);
								copyContactsByType_rev(capId,parentCapId,"Business");
							}
						}
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
			addParameter(eParams, "$$parentId$$", parentCapId);
			emailRptContact("", "LCA_AMENDMENT_APPROVAL", "", false, capStatus, capId, "Designated Responsible Party");
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
		
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/ADMINISTRATIVE: " + err.message);
	logDebug(err.stack);
}