try {
	if(wfStatus == "Amendment Approved") {
		pIds = getParents("Licenses/Cultivator/License/License");
		if(!matches(pIds,null,'',undefined)) {
			parentCapId = pIds[0];
			parentAltId = parentCapId.getCustomID();
			editAppSpecific("License Number",parentAltId);
		}
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
						DRPFnd = false;
						for (i in licContacts){
							if(matches(licContacts[i].getCapContactModel().getContactType(),"Owner","Designated Responsible Party")) {
								var thisContactModel = licContacts[i].getCapContactModel();
								if(ownEmail == thisContactModel.email.toUpperCase() && matches(thisContactModel.endDate, null, "", undefined)) {
									if (thisContactModel.getContactType() == "Owner"){
										var licCont = thisContactModel;
										logDebug("license " + licCont.refContactNumber + " " + licCont.contactType + " " + licCont.email + " " + licCont.lastName);
										licFnd = true;
									}else{
										var DRPCont = thisContactModel;
										logDebug("license " + DRPCont.refContactNumber + " " + DRPCont.contactType + " " + DRPCont.email + " " + DRPCont.lastName);
										DRPFnd = true;
									}
								}
							}
						}
						if(licFnd) {
							var eParams = aa.util.newHashtable(); 
							var acaSite = getACABaseUrl();   
							addParameter(eParams, "$$acaURL$$", acaSite);
							addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
							addParameter(eParams, "$$altId$$", capId.getCustomID());
							addParameter(eParams, "$$contactFirstName$$", licCont.firstName);
							addParameter(eParams, "$$contactLastName$$", licCont.lastName);
							addParameter(eParams, "$$contactEmail$$", licCont.email);
							addParameter(eParams, "$$business$$", workDescGet(parentCapId));
							addParameter(eParams, "$$parentId$$", parentCapId.getCustomID());
							var priEmail = ""+licCont.email;
							var rFiles = [];
							if(OWNERS[o]["Change Status"] == "Delete"){
								var licContSeq = licCont.contactSeqNumber;
								var removeResult = aa.people.removeCapContact(parentCapId, licContSeq); 
								if (removeResult.getSuccess()){
									logDebug("(contactObj) contact removed : " + licContSeq + " from record " + parentCapId.getCustomID());
								}else{
									logDebug("(contactObj) error removing contact : " + licContSeq + " : from record " + parentCapId.getCustomID() + " : " + removeResult.getErrorMessage());
								}
								sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_DELETED",eParams, rFiles,capId);
							}else{
								//Modify Contact Name
								if ((licCont.email.equals(OWNERS[o]["Email Address"])) || (licCont.lastName != OWNERS[o]["Last Name"])){
									var licContSeq = licCont.contactSeqNumber;
									var theContact = getContactObjsBySeqNbr(parentCapId,licContSeq);
									doNameAmendment(theContact,OWNERS[o]["First Name"],OWNERS[o]["Last Name"],parentCapId);
									if (DRPFnd){
										var DRPContSeq = DRPCont.contactSeqNumber;
										var DRPContact = getContactObjsBySeqNbr(parentCapId,DRPContSeq);
										DRPContact.people.setFirstName(OWNERS[o]["First Name"]);
										DRPContact.people.setLastName(OWNERS[o]["Last Name"]);	
										DRPContact.save();
									}
										
								}
								sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_APPROVAL",eParams, rFiles,capId);
							}
							var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",licCont.preferredChannel);
							if(!matches(priChannel, "",null,"undefined", false)){
								if(priChannel.indexOf("Postal") > -1 ){
									if(OWNERS[o]["Change Status"] == "Delete") {
										var amendAltId = capId.getCustomID();
										var licAltId = parentCapId.getCustomID();
										var scriptName = "asyncRunAmendmentLetterRpt";
										var envParameters = aa.util.newHashMap();
										envParameters.put("amendCap",amendAltId);
										envParameters.put("licCap",licAltId); 
										envParameters.put("reportName","Amendment Owner Change Removal"); 
										envParameters.put("currentUserID",currentUserID);
										envParameters.put("email",priEmail);
										envParameters.put("fromEmail",sysFromEmail);
										aa.runAsyncScript(scriptName, envParameters, 5000);
									}
									else {
										var amendAltId = capId.getCustomID();
										var licAltId = parentCapId.getCustomID();
										var scriptName = "asyncRunAmendmentLetterRpt";
										var envParameters = aa.util.newHashMap();
										envParameters.put("amendCap",amendAltId);
										envParameters.put("licCap",licAltId); 
										envParameters.put("reportName","Amendment Owner Change New"); 
										envParameters.put("currentUserID",currentUserID);
										envParameters.put("email",priEmail);
										envParameters.put("fromEmail",sysFromEmail);
										aa.runAsyncScript(scriptName, envParameters, 5000);
										var sName = createSet("Amendment Owner Modified","Amendment Notifications", "New");
									}	
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
				}
				if(OWNERS[o]["Change Status"] == "New" ) {
					var cIds = getChildren("Licenses/Cultivator/Medical/Owner Application");
					for(c in cIds) {
						cId = cIds[c];
						cContact = getContactObj(cId,"Owner");
						var ownAppEmail = ""+ cContact.capContact.email;
						ownAppEmail = ownAppEmail.toUpperCase();
						logDebug("ownAppEmail " + ownAppEmail + " ownEmail " + ownEmail);
						if(ownEmail == ownAppEmail) {
							copyContactsByType_rev(cId,parentCapId,"Owner");
							var eParams = aa.util.newHashtable(); 
							var acaSite = getACABaseUrl();   
							addParameter(eParams, "$$acaURL$$", acaSite);
							addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
							addParameter(eParams, "$$altId$$", capId.getCustomID());
							addParameter(eParams, "$$contactFirstName$$", cContact.capContact.firstName);
							addParameter(eParams, "$$contactLastName$$", cContact.capContact.lastName);
							addParameter(eParams, "$$contactEmail$$", cContact.capContact.email);
							addParameter(eParams, "$$business$$", workDescGet(parentCapId));
							addParameter(eParams, "$$parentId$$", parentCapId.getCustomID());
							var priEmail = ""+cContact.capContact.getEmail();
							var rFiles = [];
							sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_APPROVAL",eParams, rFiles,capId);
							var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ cContact.capContact.getPreferredChannel());
							if(!matches(priChannel, "",null,"undefined", false)){
								if(priChannel.indexOf("Postal") > -1 ){
//	Run report and attach to record for conatact with postal preference	then add to set					
									var amendAltId = capId.getCustomID();
									var licAltId = parentCapId.getCustomID();
									var scriptName = "asyncRunAmendmentLetterRpt";
									var envParameters = aa.util.newHashMap();
									envParameters.put("amendCap",amendAltId);
									envParameters.put("licCap",licAltId); 
									envParameters.put("reportName","Amendment Owner Change New"); 
									envParameters.put("currentUserID",currentUserID);
									envParameters.put("email",priEmail);
									envParameters.put("fromEmail",sysFromEmail);
									aa.runAsyncScript(scriptName, envParameters, 5000);
									var sName = createSet("Amendment New Owner","Amendment Notifications", "New");
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
				}
			}
		}
		amendOwners = loadASITable("OWNERS");
		for(i in amendOwners) {
			if(amendOwners[i]["Change Status"] == "Delete") 
				amendOwners[i]["Status"] = "Deleted";
		}
		removeASITable("OWNERS",parentCapId);
		addASITable("OWNERS",amendOwners,parentCapId);
//  Send approval email notification to DRP
		var priContact = getContactObj(parentCapId,"Designated Responsible Party");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			var acaSite = getACABaseUrl();   
			addParameter(eParams, "$$acaURL$$", acaSite);
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			var contPhone = priContact.capContact.phone1;
			addParameter(eParams, "$$altId$$", capId.getCustomID());
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$parentId$$", parentCapId.getCustomID());
			var priEmail = ""+priContact.capContact.getEmail();
			var rFiles = [];
			sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_APPROVAL",eParams, rFiles,capId);
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
	//  Send rejected email notification to DRP
		var priContact = getContactObj(parentCapId,"Designated Responsible Party");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			var acaSite = getACABaseUrl();   
			addParameter(eParams, "$$acaURL$$", acaSite);
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
} catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/AMENDMENT/OWNER CHANGE: Amendmeth Approved/Rejected " + err.message);
	logDebug(err.stack);
}
