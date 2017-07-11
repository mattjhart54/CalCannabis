/*===========================================
Title: emailDrpPriContacts
Purpose: Email the DRP and/or Primary contact 
		 depending on their preferred channel
		Note: This is intended for a very 
		specific purpose and will not be able
		to be used outside of that
Author: Lynda Wacht		
Functional Area : Notifications
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis
Parameters:
	callingPgm: Text: Master script calling this function
	notName: Text: Name of the email template notification
	rptName: Text: Name of the report
	curStatus: Text: Status to use for general notification template
	acaCapId: capId: The capId to use for the ACA URL
	rptParams: Optional report parameter(s): "agencyid",servProvCode,"capid",myCapId
============================================== */
function emailDrpPriContacts(callingPgm, notName, rptName, curStatus, acaCapId) {
try{
	// create a hashmap for report parameters
	var rptParams = aa.util.newHashMap();
	for (var i = 5; i < arguments.length; i = i + 2) {
		rptParams.put(arguments[i], arguments[i + 1]);
	}
	//logDebug("rptParams: " + rptParams);
	var emailPriReport = false;
	var emailDRPReport = false;
	var priContact = getContactObj(capId,"Primary Contact");
	var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
	if(priChannel.indexOf("Email") >= 0 || priChannel.indexOf("E-mail") >= 0){
		emailPriReport = true;
	}else{
		showMessage=true;
		comment("The Primary Contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the displayed report.");
	}
	var drpContact = getContactObj(capId,"Designated Responsible Party");
	var drptChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
	if(drptChannel.indexOf("Email") >= 0 || drptChannel.indexOf("E-mail") >= 0){
		emailDRPReport = true;
	}else{
		showMessage=true;
		comment("The Designated Responsible Party, " + drpContact.capContact.firstName + " " + drpContact.capContact.lastName + ", has requested all correspondence be mailed.  Please mail the displayed report.");
	}
	if(emailPriReport || emailDRPReport){
		//populate the email notification that will go to the primary contact
		var eParams = aa.util.newHashtable(); 
		//logDebug("callingPgm: " + callingPgm);
		if(callingPgm=="WTUA"){
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			var currCapId = capId;
			capId = acaCapId;
			getACARecordParam4Notification(eParams,acaUrl);
			capId = currCapId;
			var staffUser = new userObj(wfStaffUserID);
			staffUser.getEmailTemplateParams(eParams,"scientist")
			getWorkflowParams4Notification(eParams);
		}
		var contPhone = priContact.capContact.phone1;
		if(contPhone){
			var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
		}else{
			var fmtPhone = "";
		}
		addParameter(eParams, "$$contactPhone1$$", fmtPhone);
		addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
		addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
		addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
		addParameter(eParams, "$$status$$", curStatus);
		priAddresses = priContact.addresses;
		for (x in priAddresses){
			thisAddr = priAddresses[x];
			if(thisAddr.getAddressType()=="Mailing"){
				addParameter(eParams, "$$priAddress1$$", thisAddr.addressLine1);
				addParameter(eParams, "$$priCity$$", thisAddr.city);
				addParameter(eParams, "$$priState$$", thisAddr.state);
				addParameter(eParams, "$$priZip$$", thisAddr.zip);
			}
		}
		//logDebug("eParams: " + eParams);
		var drpEmail = ""+drpContact.capContact.getEmail();
		var priEmail = ""+priContact.capContact.getEmail();
		var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
		if(matches(rptName, null, "", "undefined")){
			var rFiles = null;
		}else{
			var rFile;
			rFile = generateReport(capId,rptName,"Licenses",rptParams);
			if (rFile) {
				var rFiles = [];
				rFiles.push(rFile);
			}
		}
		if(priContact.capContact.getEmail()==drpContact.capContact.getEmail()){
			sendNotification(sysFromEmail,drpEmail,"",notName,eParams, rFiles,capId);
		}else{
			if(emailPriReport){
				aa.document.sendEmailAndSaveAsDocument(sysFromEmail, priEmail + ";" + priEmail, "", notName, eParams, capId4Email, rFiles,capId);
			}
			if(emailDRPReport){
				aa.document.sendEmailAndSaveAsDocument(sysFromEmail, drpEmail + ";" + priEmail, "", notName, eParams, capId4Email, rFiles,capId);

			}
		}
	}
}catch(err){
	logDebug("An error occurred in emailDrpPriContacts: " + err.message);
	logDebug(err.stack);
}}