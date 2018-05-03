try{
//lwacht: add the owner applications
	//lwacht 171215: don't run for temp apps
	if(appTypeArray[2]!="Temporary"){
	//lwacht 171215: end
		if(publicUser){
			processOwnerApplications();
		}
		//lwacht: create reference contact and public user account for the DRP		
		createRefContactsFromCapContactsAndLink(capId,["Designated Responsible Party"], null, false, false, comparePeopleGeneric);
		var drpUser = createPublicUserFromContact("Designated Responsible Party");
		//lwacht: create reference contact and public user account for the business contact		
		createRefContactsFromCapContactsAndLink(capId,["Business"], null, false, false, comparePeopleGeneric);
		var bsnsUser = createPublicUserFromContact("Business");
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: DRP Notification: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/*/Application:  DRP Notification: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht: 180416: story 5175: create a reference contact for the temp drp and bsns contact
try{
	if(!publicUser){
		//lwacht: create reference contact and public user account for the DRP		
		var capContactResult = aa.people.getCapContactByCapID(capId);
		var drpExists = false;
		var tdrpExists = false;
		var bsnsExists = false;
		var asopExists = false;
		var drpEmail = false;
		var tdrpEmail = false;
		var bsnsEmail = false;
		var asopEmail = false;
		if (capContactResult.getSuccess()){
			Contacts = capContactResult.getOutput();
			for (yy in Contacts){
				var thisCont = Contacts[yy].getCapContactModel();
				var contType = thisCont.contactType;
				showMessage=true;
				if(contType =="Designated Responsible Party") {
					var drpRefContNrb = thisCont.refContactNumber;
					drpEmail = thisCont.email.toLowerCase();
					logDebug("drpEmail: " + drpEmail);
					var drpCont = Contacts[yy].getCapContactModel();
					var drpAddressList = aa.address.getContactAddressListByCapContact(thisCont).getOutput();
				}
				if(contType =="DRP - Temporary License") {
					var tdrpRefContNrb = thisCont.refContactNumber;
					tdrpEmail = thisCont.email.toLowerCase();
					logDebug("tdrpEmail: " + tdrpEmail);
					var tdrpCont = Contacts[yy].getCapContactModel();
					var tdrpAddressList = aa.address.getContactAddressListByCapContact(thisCont).getOutput();
				}
				if(contType =="Business") {
					//var refContNrb = thisCont.refContactNumber;
					bsnsEmail = thisCont.email.toLowerCase();
					logDebug("bsnsEmail: " + bsnsEmail);
					var bsnsFName = thisCont.firstName;
					var bsnsLName = thisCont.lastName;
					var bsnsCont = Contacts[yy].getCapContactModel();
					var bsnsAddressList = aa.address.getContactAddressListByCapContact(thisCont).getOutput();
				}
				if(contType =="Agent for Service of Process") {
					//var refContNrb = thisCont.refContactNumber;
					var asopEmail = thisCont.email.toLowerCase();
					logDebug("asopEmail: " + asopEmail);
					var asopFName = thisCont.firstName;
					var asopLName = thisCont.lastName;
					var asopCont = Contacts[yy].getCapContactModel();
					var asopAddressList = aa.address.getContactAddressListByCapContact(thisCont).getOutput();
				}
			}
		}
		if(tdrpEmail){
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
			qryPeople.setEmail(tdrpEmail);
			var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
			if (!qryResult.getSuccess()){ 
				logDebug("WARNING: error searching for people : " + qryResult.getErrorMessage());
			}else{
				var peopResult = qryResult.getOutput();
				if (peopResult.length > 0){
					tdrpExists = true;
				}
			}
		}
		if(drpEmail){
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
			qryPeople.setEmail(drpEmail);
			var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
			if (!qryResult.getSuccess()){ 
				logDebug("WARNING: error searching for people : " + qryResult.getErrorMessage());
			}else{
				var peopResult = qryResult.getOutput();
				if (peopResult.length > 0){
					drpExists = true;
				}
			}
		}
		if(bsnsEmail){
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
			qryPeople.setEmail(bsnsEmail);
			var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
			if (!qryResult.getSuccess()){ 
				logDebug("WARNING: error searching for people : " + qryResult.getErrorMessage());
			}else{
				var peopResult = qryResult.getOutput();
				if (peopResult.length > 0){
					bsnsExists = true;
				}
			}
		}
		if(asopEmail){
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
			qryPeople.setEmail(asopEmail);
			var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
			if (!qryResult.getSuccess()){ 
				logDebug("WARNING: error searching for people : " + qryResult.getErrorMessage());
			}else{
				var peopResult = qryResult.getOutput();
				if (peopResult.length > 0){
					asopExists = true;
				}
			}
		}
		if(drpEmail && !drpExists){
			var arrAddr = [];
			var peopleModel = drpCont.getPeople();
			for (ad in drpAddressList){
				thisAddr = drpAddressList[ad];
				logDebug("drpAddressList: " + thisAddr.addressLine1);
				arrAddr.push(thisAddr);
			}
			if(drpEmail==bsnsEmail || drpEmail==asopEmail){
				//if the contacts share the same email address and it isn't a reference contact already, 
				//add the address(s) to the drp that's to be created
				if(drpEmail==bsnsEmail){
					for (ad in bsnsAddressList){
						thisAddr = bsnsAddressList[ad];
						logDebug("bsnsAddressList: " + thisAddr.addressLine1);
						arrAddr.push(thisAddr);
					}
				}
				if(drpEmail==asopEmail){
					for (ad in asopAddressList){
						thisAddr = asopAddressList[ad];
						logDebug("asopAddressList: " + thisAddr.addressLine1);
						arrAddr.push(thisAddr);
					}
				}
			}
			var contactAddressModelArr = convertContactAddressModelArr(arrAddr);
			peopleModel.setContactAddressList(contactAddressModelArr);    
			var addResult = aa.people.editCapContactWithAttribute(drpCont);
			if (addResult.getSuccess()){
				logDebug("Successfully added addresses to DRP.");
				createRefContactsFromCapContactsAndLink(capId,["Designated Responsible Party"], null, false, false, comparePeopleGeneric);
				//lwacht 180425: COMMENTING OUT FOR AVTEST6
				var drpUser = createPublicUserFromContact("Designated Responsible Party");
				logDebug("Successfully created DRP");
			}else{
				logDebug("failure: " + addResult.getErrorMessage());
			}
		}
		if(appTypeArray[2]!="Temporary"){
			if(bsnsEmail && (!bsnsExists || bsnsEmail==drpEmail)){
				createRefContactsFromCapContactsAndLink(capId,["Business"], null, false, false, comparePeopleGeneric);
				//lwacht 180425: COMMENTING OUT FOR AVTEST6
				var bsnsUser = createPublicUserFromContact("Business");
				logDebug("Successfully created Business");
			}
			//not needed now but leaving for when they change their minds
			//if(asopEmail && (!asopExists || asopEmail==bsnsEmail || asopEmail==drpEmail)){
			//	createRefContactsFromCapContactsAndLink(capId,["Business"], null, false, false, comparePeopleGeneric);
			//	var asopUser = createPublicUserFromContact("Agent for Service of ProcessS");
			//	logDebug("Successfully created ASOP");
			//}
		}
		if(appTypeArray[2]=="Temporary"){
			if(tdrpEmail && !tdrpExists){
				var arrAddr = [];
				var peopleModel = tdrpCont.getPeople();
				for (ad in tdrpAddressList){
					thisAddr = tdrpAddressList[ad];
					logDebug("tdrpAddressList: " + thisAddr.addressLine1);
					arrAddr.push(thisAddr);
				}
				if(tdrpEmail==bsnsEmail){
					//if the contacts share the same email address and it isn't a reference contact already, 
					//add the address(s) to the drp that's to be created
					for (ad in bsnsAddressList){
						thisAddr = bsnsAddressList[ad];
						logDebug("bsnsAddressList: " + thisAddr.addressLine1);
						arrAddr.push(thisAddr);
					}
				}
				var contactAddressModelArr = convertContactAddressModelArr(arrAddr);
				peopleModel.setContactAddressList(contactAddressModelArr);    
				var addResult = aa.people.editCapContactWithAttribute(tdrpCont);
				if (addResult.getSuccess()){
					logDebug("Successfully added addresses to T0DRP.");
					createRefContactsFromCapContactsAndLink(capId,["DRP - Temporary License"], null, false, false, comparePeopleGeneric);
					//lwacht 180425: COMMENTING OUT FOR AVTEST6
					var tdrpUser = createPublicUserFromContact("DRP - Temporary License");
					logDebug("Successfully created Temp DRP");
				}else{
					logDebug("failure: " + addResult.getErrorMessage());
				}
			}
			if(bsnsEmail && (!bsnsExists || bsnsEmail==drpEmail)){
				logDebug("here");
				createRefContactsFromCapContactsAndLink(capId,["Business"], null, false, false, comparePeopleGeneric);
				//lwacht 180425: COMMENTING OUT FOR AVTEST6
				var bsnsUser = createPublicUserFromContact("Business");
				logDebug("Successfully created Business");
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA: Licenses/Cultivation/*/Application: Create DRP/Bsns/ASOP: " + err.message);
	logDebug(err.stack);
}
//lwacht: 180416: story 5175: end

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
// mhart 05/03/18 user story 5447 - remove rletaed record relation between Temp and annual applications
//lwacht
//add child if app number provided
/*
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
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR//APPLICATION: Relate Temp Record: " + err.message);
	logDebug(err.stack);
}
*/
// mhart 05/03/18 user story 5447 end
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