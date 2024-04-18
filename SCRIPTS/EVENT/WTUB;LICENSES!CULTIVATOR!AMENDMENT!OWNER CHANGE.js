try{
	if(wfStatus == "Amendment Approved"){
		var currCap = capId;
		var ownerApprv=true;
		var notUpdated="Yes"
		var arrChild = getChildren("Licenses/Cultivator/Medical/Owner Application");
		if(arrChild){
			for(ch in arrChild){
				capId = arrChild[ch];
				if(taskStatus("Owner Application Review") != "Review Completed"){
					ownerApprv=false;
					if(notUpdated=="Yes"){
						notUpdated= arrChild[ch].getCustomID();
					}else {
						notUpdated += "; " + arrChild[ch].getCustomID();
					}
				}
			}
			capId = currCap;
			if(!ownerApprv){
				cancel=true;
				showMessage=true;
				comment("The following owner amendment record(s) have not been approved: " + notUpdated);
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/AMENDMENT/OWNER CHANGE: Check owner apps approved: " + err.message);
	aa.print(err.stack);
}
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
								if(ownEmail == licCont.email.toUpperCase() && matches(licCont.endDate, null, "", undefined)) {
										licFnd = true;
										break;
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
							if(OWNERS[o]["Change Status"] == "Delete")
								sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_DELETED",eParams, rFiles,capId);
							else
								sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_OWNER_APPROVAL",eParams, rFiles,capId);
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
										aa.runAsyncScript(scriptName, envParameters);
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
										aa.runAsyncScript(scriptName, envParameters);
										var sName = createSet("Amendment Owner Modified","Amendment Notifications", "New");
									}	
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
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/AMENDMENT/OWNER CHANGE: process owner table and generate reports: " + err.message);
	aa.print(err.stack);
}