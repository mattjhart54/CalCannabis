try {
	if(wfStatus == "Amendment Approved") {
		if (typeof(OWNERS) == "object") {
			for(o in OWNERS) {
				var ownEmail = ""+ OWNERS[o]["Email Address"];
				ownEmail = ownEmail.toUpperCase();
				logDebug("owner " + ownEmail);
				if(matches(OWNERS[o]["Change Status"],"Delete","Modify")) {
					var licContactResult = aa.people.getCapContactByCapID(parentCapId);
					if (licContactResult.getSuccess()){
						var licContacts = licContactResult.getOutput();
						licFnd = false;
						for (i in licContacts){
							if(licContacts[i].getCapContactModel().getContactType() == "Owner") {
								var licCont = licContacts[i].getCapContactModel();
								logDebug("license " + licCont.refContactNumber + " " + licCont.contactType + " " + licCont.email + " " + licCont.lastName);
								if(ownEmail == licCont.email.toUpperCase()) {
										licFnd = true;
										break;
								}
							}
						}
						if(licFnd) {
							if(OWNERS[o]["Change Status"],"Delete") {
								var endDate = new Date();
								licCont.setEndDate(endDate);
								logDebug("update contact1 " + licCont.email);
								var peopleModel = licCont.getPeople();
		//						var licAddressrs = aa.address.getContactAddressListByCapContact(licCont);
		//						peopleModel.setContactAddressList(amendAddressModelArr);
								aa.people.editCapContactWithAttribute(licCont);
							}
							var eParams = aa.util.newHashtable(); 
							addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
							var contPhone = licCont.phone1;
							if(contPhone){
								var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
							}else{
								var fmtPhone = "";
							}
							addParameter(eParams, "$$altId$$", capId.getCustomID());
							addParameter(eParams, "$$contactPhone1$$", fmtPhone);
							addParameter(eParams, "$$contactFirstName$$", licCont.firstName);
							addParameter(eParams, "$$contactLastName$$", licCont.lastName);
							addParameter(eParams, "$$contactEmail$$", licCont.email);
							addParameter(eParams, "$$parentId$$", parentCapId);
							var priEmail = ""+licCont.email;
							var rFiles = [];
							if(OWNERS[o]["Change Status"],"Delete")
								sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_DELETED",eParams, rFiles,capId);
							else
								sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_MODIFIED",eParams, rFiles,capId);
							var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",licCont.preferredChannel);
							if(!matches(priChannel, "",null,"undefined", false)){
								if(priChannel.indexOf("Postal") > -1 ){
									if(OWNERS[o]["Change Status"],"Delete")
										var sName = createSet("Amendment Owner Deleted","Amendment Notifications", "New");
									else
										var sName = createSet("Amendment Owner Modified","Amendment Notifications", "New");
									if(sName){
										setAddResult=aa.set.add(sName,parentCapId);
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
				}
				if(OWNERS[o]["Change Status"] == "New" ) {
					var cIds = getChildren("Licenses/Cultivator/Medical/Owner Application");
					for(c in cIds) {
						cId = cIds[c];
						cContact = getContactObj(cId,"Owner");
						var ownAppEmail = ""+ cContact.capContact.email;
						ownAppEmail = ownAppEmail.toUpperCase();
						logDebug("OA email " + ownAppEmail);
						if(ownEmail == ownAppEmail) {
							copyContactsByType_rev(cId,parentCapId,"Owner");
							var eParams = aa.util.newHashtable(); 
							addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
							var contPhone = cContact.capContact.phone1;
							if(contPhone){
								var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
							}else{
								var fmtPhone = "";
							}
							addParameter(eParams, "$$altId$$", capId.getCustomID());
							addParameter(eParams, "$$contactPhone1$$", fmtPhone);
							addParameter(eParams, "$$contactFirstName$$", cContact.capContact.firstName);
							addParameter(eParams, "$$contactLastName$$", cContact.capContact.lastName);
							addParameter(eParams, "$$contactEmail$$", cContact.capContact.email);
							addParameter(eParams, "$$parentId$$", parentCapId);
							var priEmail = ""+cContact.capContact.getEmail();
							var rFiles = [];
							sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_NEW",eParams, rFiles,capId);
//							emailRptContact("", "LCA_AMENDMENT_APPROVAL", "", false, capStatus, capId, "Designated Responsible Party");
							var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ cContact.capContact.getPreferredChannel());
							if(!matches(priChannel, "",null,"undefined", false)){
								if(priChannel.indexOf("Postal") > -1 ){
									var sName = createSet("Amendment New Owner","Amendment Notifications", "New");
									if(sName){
										setAddResult=aa.set.add(sName,parentCapId);
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
				}
			}
		}
		amendOwners = loadASITable("OWNERS");
		removeASITable("OWNERS",parentCapId);
		addASITable("OWNERS",amendOwners,parentCapId);
//  Send approval email notification to DRP
		var priContact = getContactObj(parentCapId,"Designated Responsible Party");
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
			var priEmail = ""+priContact.capContact.getEmail();
			var rFiles = [];
			sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_REJECTED",eParams, rFiles,capId);
//			emailRptContact("", "LCA_AMENDMENT_APPROVAL", "", false, capStatus, capId, "Designated Responsible Party");
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
				var sName = createSet("Amendment Approval","Amendment Notifications", "New");
				if(sName){
					setAddResult=aa.set.add(sName,parentCapId);
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
	//  Send rejected email notification to DRP
			var priContact = getContactObj(parentCapId,"Designated Responsible Party");
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
				var priEmail = ""+priContact.capContact.getEmail();
				var rFiles = [];
				sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_REJECTED",eParams, rFiles,capId);
		//		emailRptContact("", "LCA_AMENDMENT_APPROVAL", "", false, capStatus, capId, "Designated Responsible Party");
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						var sName = createSet("Amendment Approval","Amendment Notifications", "New");
						if(sName){
							setAddResult=aa.set.add(sName,parentCapId);
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
} catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/AMENDMENT/OWNER CHANGE: Amendmeth Approved/Rejected " + err.message);
	logDebug(err.stack);
}