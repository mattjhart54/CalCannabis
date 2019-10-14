try {
	if(matches(wfStatus,"Physical Modification Approved","Approved for Provisional Renewal","Transition Amendment Approved")) {
		// Copy custom fields from the license record to the parent record
		pIds = getParents("Licenses/Cultivator/License/License");
		if(!matches(pIds,null,'',undefined)) {
			parentCapId = pIds[0];
			parentAltId = parentCapId.getCustomID();
			editAppSpecific("License Number",parentAltId,capId);
		}else {
			parentAltId = parentCapId.getCustomID();
		}
		var updateCat = false;
		if(!matches(AInfo["PA Update"],null,"",undefined)) {
			editAppSpecific("Premise Address",AInfo["PA Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["PC Update"],null,"",undefined)) {
			editAppSpecific("Premise City",AInfo["PC Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["PZ Update"],null,"",undefined)) {
			editAppSpecific("Premise Zip",AInfo["PZ Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["PCNTY Update"],null,"",undefined)) {
			editAppSpecific("Premise County",AInfo["PCNTY Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["APN Update"],null,"",undefined)) {
			editAppSpecific("APN",AInfo["APN Update"],parentCapId);
			updateCat = true;
		}
		editAppSpecific("Grid",AInfo["Grid Update"],parentCapId);
		editAppSpecific("Solar",AInfo["Solar Update"],parentCapId);
		editAppSpecific("Generator",AInfo["Generator Update"],parentCapId);
		editAppSpecific("Generator Under 50 HP",AInfo["G50 Update"],parentCapId);
		editAppSpecific("Other",AInfo["Other Update"],parentCapId);
		if(matches(AInfo["Other Update"],null,"",undefined)){
			editAppSpecific("Other Source Description","",parentCapId);
		}
		else {
			if(!matches(AInfo["OSD Update"],null,"",undefined)) {
				editAppSpecific("Other Source Description",AInfo["OSD Update"],parentCapId);
			}
		}

		removeASITable("Premises Addresses",parentCapId);
		removeASITable("Source of Water Supply",parentCapId);
		copyASITables(capId,parentCapId);
		if(updateCat)
			addToCat(capId);
//  Send approval email notification to DRP
		var priContact = getContactObj(capId,"Designated Responsible Party");
		if(priContact){
			if(wfStatus == "Physical Modification Approved") {
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
				addParameter(eParams, "$$parentId$$", parentAltId);
				var priEmail = ""+priContact.capContact.getEmail();
				var rFiles = [];
				emailTemplate = "LCA_PHYSICAL_MOD_APPROVED";
				sendNotification(sysFromEmail,priEmail,"",emailTemplate,eParams, rFiles,capId);
//				emailRptContact("", "emailTemplate", "", false, capStatus, capId, "Designated Responsible Party");
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						var sName = createSet("Physical Modification Amendment Approval","Amendment Notifications", "New");
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
			if(wfStatus == "Transition Amendment Approved") {
				if(AInfo["Transition"] == "Yes") {
					editAppSpecific("License Issued Type", "Annual",parentCapId);
					var licType = getAppSpecific("License Type",parentCapId);
					var cType = getAppSpecific("Cultivator Type",parentCapId);
					editAppName("Annual " + cType + " - " + licType,parentCapId);
					editAppSpecific("Transition Date",jsDateToASIDate(new Date()),parentCapId);
					updateCat = true;
				}
				//Run Official License Certificate and Transistion Approval Letter and email the DRP	
				var scriptName = "asyncRunOfficialLicenseRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("licType", "Transition");
				envParameters.put("appCap",capId.getCustomID());
				envParameters.put("licCap",parentAltId); 
				envParameters.put("reportName","Official License Certificate"); 
				envParameters.put("currentUserID",currentUserID);
				envParameters.put("contType","Designated Responsible Party");
				envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
				aa.runAsyncScript(scriptName, envParameters);
				
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						var sName = createSet("Transistion Amendment Approval","Amendment Notifications", "New");
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
			sendNotification(sysFromEmail,priEmail,"","LCA_SCIENCE_AMENDMENT_REJECTED",eParams, rFiles,capId);
	//		emailRptContact("", "LCA_AMENDMENT_APPROVAL", "", false, capStatus, capId, "Designated Responsible Party");
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
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: " + err.message);
	logDebug(err.stack);
}