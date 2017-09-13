try{
//lwacht: add the owner applications
	if(publicUser){
		processOwnerApplications();
//lwacht: create reference contact and public user account for the DRP		
		createRefContactsFromCapContactsAndLink(capId,["Designated Responsible Party"], null, false, false, comparePeopleStandard);
		var drpUser = createPublicUserFromContact("Designated Responsible Party");
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: DRP Notification: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application:  DRP Notification: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart
//update work description with Legal Business Name
//lwacht: don't run for temporary app 
try {
	if(appTypeArray[2]!="Temporary"){
		updateLegalBusinessName();
		editAppName(AInfo["License Type"]);
		updateShortNotes(AInfo["Premise County"]);
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: Edit App Name: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Edit App Name: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//mhart
//send the local authorization noticifation
//lwacht: don't run for temporary app 
try{
	if(!publicUser) {
		if(appTypeArray[2]!="Temporary"){
			editAppSpecific("Local Authority Notification Sent", jsDateToASIDate(new Date()));
			if(AInfo["Local Authority Type"] == "County")
				var locAuth = AInfo["Local Authority County"];
			if(AInfo["Local Authority Type"] == "City")
				var locAuth = AInfo["Local Authority City"];
			if(AInfo["Local Authority Type"] == "City and County")
				var locAuth = AInfo["Local Authority City"] + "-" + AInfo["Local Authority County"];
			var locEmail = lookup("LIC_CC_LOCAL_AUTH_CONTACTS", locAuth);
			if(!matches(locAuth, null, "", undefined)) {
				var eParams = aa.util.newHashtable();
				rFiles = []				
				addParameter(eParams, "$$altID$$", capId.getCustomID());
				var priContact = getContactObj(capId,"Business");
				if(priContact)
					addParameter(eParams, "$$businessName$$", priContact.capContact.middleName);
				sendNotification(sysFromEmail,locEmail,"","LIC_CC_NOTIFY_LOC_AUTH",eParams, rFiles,capId);
			}
			else {
				showmessage = true;
				comment("Local Authority Notification not sent.  No email address found for the local authority " + locAuth)
			}
	//		runReportAttach(capId,"Submitted Application", "p1value", capId.getCustomID());			
	//		emailRptContact("PRA","LCA_GENERAL_NOTIFICATION","",false,"Application Received",capId,"Designated Responsible Party")
		}
	}
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/APPLICATION: Application Submitted: Send Notif Letter: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Send Notif Letter: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht
//add fees
//lwacht: don't run for temporary app 
try{
	if(appTypeArray[2]!="Temporary"){
		var feeDesc = AInfo["License Type"] + " - Application Fee";
		var thisFee = getFeeDefByDesc("LIC_CC_CULTIVATOR", feeDesc);
//		if(thisFee){
//			updateFee(thisFee.feeCode,"LIC_CC_CULTIVATOR", "FINAL", 1, "Y", "N");
//		}else{
//			logDebug("An error occurred retrieving fee item: " + feeDesc);
//			aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
//		}
	}
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/APPLICATION: Application Submitted: Add Fees: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht
//add child if app number provided
try{
	logDebug("publicUser " + AInfo["Temp App Number"])
	if(!publicUser){
		if(!matches(AInfo["Temp App Number"],null,"", "undefined")){
			var tmpID = aa.cap.getCapID(AInfo["Temp App Number"]);
			if(tmpID.getSuccess()){
				var childCapId = tmpID.getOutput();
				var parId = getParentByCapId(childCapId);
				if(parId){
					var linkResult = aa.cap.createAppHierarchy(capId, parId);
					if (!linkResult.getSuccess()){
						logDebug( "Error linking to parent application parent cap id (" + capId + "): " + linkResult.getErrorMessage());
					}
				}else{
					var linkResult = aa.cap.createAppHierarchy(capId, childCapId);
					if (!linkResult.getSuccess()){
						logDebug( "Error linking to temp application(" + childCapId + "): " + linkResult.getErrorMessage());
					}
				}				
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/APPLICATION: Relate Temp Record: " + err.message);
	logDebug(err.stack);
}