try{
//lwacht: add the owner applications
	//lwacht 171215: don't run for temp apps
	if(appTypeArray[2]!="Temporary"){
	//lwacht 171215: end
		if(publicUser){
			processOwnerApplications();
		}
		//lwacht: create reference contact and public user account for the DRP		
		createRefContactsFromCapContactsAndLink(capId,["Designated Responsible Party"], null, false, false, comparePeopleStandard);
		var drpUser = createPublicUserFromContact("Designated Responsible Party");
		//lwacht: create reference contact and public user account for the business contact		
		createRefContactsFromCapContactsAndLink(capId,["Business"], null, false, false, comparePeopleStandard);
		var bsnsUser = createPublicUserFromContact("Business");
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: DRP Notification: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application:  DRP Notification: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart
//update work description with Legal Business Name
//lwacht: don't run for temporary app
//lwacht: 170929 adding legal business name logic 
try {
	updateLegalBusinessName();
	editAppName(AInfo["License Type"]);
	updateShortNotes(AInfo["Premise County"]);
	if(appTypeArray[2]!="Temporary"){
		var priContact = getContactObj(capId,"Business");
		if(priContact){
			editAppSpecific("Legal Business Name", priContact.capContact.middleName);
		}else{
			editAppSpecific("Legal Business Name", "No Legal Business Name provided");
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: Edit App Name: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Edit App Name: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht
//add fees
//lwacht: don't run for temporary app 
try{
	if(appTypeArray[2]!="Temporary"){
		voidRemoveAllFees();
		var feeDesc = AInfo["License Type"] + " - Application Fee";
		var thisFee = getFeeDefByDesc("LIC_CC_CULTIVATOR", feeDesc);
		if(thisFee){
			updateFee(thisFee.feeCode,"LIC_CC_CULTIVATOR", "FINAL", 1, "Y", "N");
		}else{
			logDebug("An error occurred retrieving fee item: " + feeDesc);
			aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		}
		//lwacht: 180118: story 5149: set application status on new record submitted via AV
		if(!publicUser){
			updateAppStatus("Application Fee Due", "Updated via ASA:LICENSES/CULTIVATOR/* /APPLICATION.");
			deactivateTask("Owner Application Reviews");
			deactivateTask("Administrative Review");
		}
		//lwacht: 180118: story 5149: end
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

//lwacht: create submission report
try{
	//lwacht: 180108: defect 5120: don't run for temporary
	if(appTypeArray[2]!="Temporary"){
		if(!publicUser){
			runReportAttach(capId,"Completed Application", "altId", capId.getCustomID());
		}
	}
	//lwacht: 180108: defect 5120: end
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: " + err.message);
	logDebug(err.stack);
}
//mhart 180321: story 5376: add live scan required condition
try{
	if(!publicUser){
		if(appTypeArray[2]!="Temporary"){
			lScan = lookup("LIVESCAN_NOT_AVAILABLE","LIVESCAN_NOT_AVAILABLE");
			if (lScan) {
				addStdCondition("Application Condition","LiveScan Required");
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/APPLICATION: Add livescan required condition: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Add livescan required condition: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart 180321: story 5376: end