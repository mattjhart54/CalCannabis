//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
try{
	if(wfStatus=="Approved"){
		var licCapId = createLicense("Active", true);
		if(licCapId){
			var expDate = ateAdd(null,120);
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
			//updateShortNotes(getShortNotes(),licCapId);
			//updateWorkDesc(workDescGet(capId),licCapId);
			var contPri = getContactObj(licCapId,"Applicant");
			//capId = licCapId;
			//contactSetPrimary(contPri.seqNumber);
			//capId = currCapId;
			editContactType("Applicant", "Primary Contact",licCapId);
			var priContact = getContactObj(capId,"Primary Contact");
			var editChannel =  priContact.capContact.setPreferredChannel("Email");
			runReportAttach(capId,"Temp License Approval Letter", "p1value", capId.getCustomID());
			emailDrpPriContacts("WTUA", "LCA_GENERAL_NOTIFICATION", "", false, wfStatus, capId);
			editContactType("Primary Contact","Applicant", licCapId);
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create License Record: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in WTUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create License Record: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
