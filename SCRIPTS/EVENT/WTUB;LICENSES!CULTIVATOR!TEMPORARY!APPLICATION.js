//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
//note license record creation has to be in WTUB so the license record exists when the license report is created
try{
	if(wfStatus=="Temporary License Issued"){
		var licCapId = createLicense("Active", true);
		if(licCapId){
			var expDate = dateAdd(null,120);
			setLicExpirationDate(licCapId,null,expDate,"Active");
			/* will configure once there's an altId 
			var newAltFirst = "LCT" + sysDateMMDDYYYY.substr(8,2);
			var newAltLast = capIDString.substr(3,capIDString.length());
			var newAltId = newAltFirst + newAltLast;
			var updAltId = aa.cap.updateCapAltID(licCapId,newAltId);
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			}else{
				logDebug("License record ID updated to : " + newAltId);
			}
			*/
			var newAppName = "Temporary Cultivator License - " + AInfo["License Type"];
			//logDebug("workDescGet(capId): " + workDescGet(capId));
			//logDebug("getShortNotes(): " + getShortNotes());
			logDebug("newAppName: " + newAppName);
			editAppName(newAppName,licCapId);
			var newAltId = licCapId.getCustomID();
			var updateResult = aa.cap.updateCapAltID(licCapId, newAltId);
			if (updateResult.getSuccess()) {
				logDebug("Updated license record AltId to " + newAltId + ".");
			}else {
				logDebug("Error updating alt ID: " + updateResult.getErrorMessage() );
			}
			//updateShortNotes(getShortNotes(),licCapId);
			//updateWorkDesc(workDescGet(capId),licCapId);
			capContactResult = aa.people.getCapContactByCapID(capId);
			if (capContactResult.getSuccess()){
				Contacts = capContactResult.getOutput();
				for (yy in Contacts){
					var theContact = Contacts[yy].getCapContactModel();
					if(theContact.getContactType() == "Applicant"){
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





