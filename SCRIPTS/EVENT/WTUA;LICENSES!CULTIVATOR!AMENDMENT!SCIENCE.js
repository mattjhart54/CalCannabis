try {
	if(wfStatus == "Amendment Approved") {
		// Copy custom fields from the license record to the parent record
		holdId = capId;
		capId = parentCapId;
		var updateCat = false;
		if(!matches(AInfo["PA Update"],null,"",undefined)) {
			editAppSpecific("Premise Address",AInfo["PA Update"]);
			updateCat = true;
		}
		if(!matches(AInfo["PC Update"],null,"",undefined)) {
			editAppSpecific("Premise City",AInfo["PC Update"]);
			updateCat = true;
		}
		if(!matches(AInfo["PZ Update"],null,"",undefined)) {
			editAppSpecific("Premise Zip",AInfo["PZ Update"]);
			updateCat = true;
		}
		if(!matches(AInfo["PCNTY Update"],null,"",undefined)) {
			editAppSpecific("Premise County",AInfo["PCNTY Update"]);
			updateCat = true;
		}
		if(!matches(AInfo["APN Update"],null,"",undefined)) {
			editAppSpecific("APN",AInfo["APN Update"]);
			updateCat = true;
		}
		editAppSpecific("Grid",AInfo["Grid Update"]);
		editAppSpecific("Solar",AInfo["Solar Update"]);
		editAppSpecific("Generator",AInfo["Generator Update"]);
		editAppSpecific("Generator Under 50 HP",AInfo["G50 Update"]);
		editAppSpecific("Other",AInfo["Other Update"]);
		if(matches(AInfo["Other Update"],null,"",undefined)){
			editAppSpecific("Other Source Description","");
		}
		else {
			if(!matches(AInfo["OSD Update"],null,"",undefined)) {
				editAppSpecific("Other Source Description",AInfo["OSD Update"]);
			}
		}
		removeASITable("Premises Addresses");
		removeASITable("Source of Water Supply");
		copyASITables(holdId,capId);
		if(updateCat)
			addToCat(capId);
		capId = holdId;
//  Send approval email notification to DRP
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
//			emailRptContact("", "LCA_AMENDMENT_APPROVAL", "", false, capStatus, capId, "Designated Responsible Party");
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
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: " + err.message);
	logDebug(err.stack);
}