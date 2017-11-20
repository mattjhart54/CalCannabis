//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
//note license record creation has to be in WTUB so the license record exists when the license report is created
try{
	if(wfStatus=="Temporary License Issued"){
		var licCapId = createLicense("Active", true);
		if(licCapId){
			var toDay = new Date();
			var jsToDay = toDay.getTime();
			var janOne = new Date("01/01/2018");
			var jsJanOne = janOne.getTime();
			if(jsToDay < janOne){
				var expDate = new Date("05/01/2018");
				editFirstIssuedDate(janOne);
				editAppSpecific("Valid From Date", "01/01/2018", licCapId);
			}else{
				var expDate = dateAdd(null,120);
				editAppSpecific("Valid From Date", sysDateMMDDYYYY, licCapId);
			}
			setLicExpirationDate(licCapId,null,expDate,"Active");
			if(""+AInfo["App Type"]=="Temporary Adult-Use Cannabis Cultivation"){
				var newAltId = capIDString.replace("TCA", "TAL");
			}else{
				var newAltId = capIDString.replace("TCA", "TML");
			}
			var updAltId = aa.cap.updateCapAltID(licCapId,newAltId);
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			}else{
				logDebug("License record ID updated to : " + newAltId);
			}
			var newAppName = "Temporary Cultivator License - " + AInfo["License Type"];
			//logDebug("workDescGet(capId): " + workDescGet(capId));
			//logDebug("getShortNotes(): " + getShortNotes());
			//logDebug("newAppName: " + newAppName);
			editAppName(newAppName,licCapId);
			//updateShortNotes(getShortNotes(),licCapId);
			//updateWorkDesc(workDescGet(capId),licCapId);
			capContactResult = aa.people.getCapContactByCapID(capId);
			if (capContactResult.getSuccess()){
				Contacts = capContactResult.getOutput();
				for (yy in Contacts){
					var theContact = Contacts[yy].getCapContactModel();
					if(theContact.getContactType() == "Business"){
						var peopleModel = theContact.getPeople();
						var editChannel =  peopleModel.setPreferredChannel(1);
						var editChannel =  peopleModel.setPreferredChannelString("Email");
						aa.people.editCapContactWithAttribute(theContact);
					}
				}
			}
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create License Record: " + err.message);
	logDebug(err.stack);
}
//mhart - check for local auth email
try {
	if(matches(wfStatus,"Local Auth Sent - 10","Local Auth Sent - 60") && AInfo["Manually Send Local Authority Notification"] != "CHECKED"){
		if(AInfo["Local Authority Type"] == "County")
			var locAuth = AInfo["Local Authority County"];
		if(AInfo["Local Authority Type"] == "City")
			var locAuth = AInfo["Local Authority City"];
		if(AInfo["Local Authority Type"] == "City and County")
			var locAuth = AInfo["Local Authority City"] + "-" + AInfo["Local Authority County"];
		var locEmail = lookup("LIC_CC_LOCAL_AUTH_CONTACTS", locAuth);
		if(matches(locEmail, null, "", undefined)) {
			cancel = true;
			showmessage = true;
			comment("Local Authority Notification not sent.  No email address found for the local authority " + locAuth)
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Local Auth Notice: " + err.message);
	aa.print(err.stack);
}
