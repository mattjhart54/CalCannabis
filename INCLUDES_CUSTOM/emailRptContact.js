/*===========================================
Title: emailRptContact
Purpose: Email the  contact type provided
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
	emailRpt: true/false: whether or not the report should be attached to the email
	curStatus: Text: Status to use for general notification template
	acaCapId: capId: The capId to use for the ACA URL
	contactType: text: The type of contact to whom the email/report should be sent
	rptParams: Optional report parameter(s): "agencyid",servProvCode,"capid",myCapId
============================================== */
function emailRptContact(callingPgm, notName, rptName, emailRpt, curStatus, acaCapId, contactType) {
try{
	// create a hashmap for report parameters
	var rptParams = aa.util.newHashMap();
	for (var i = 7; i < arguments.length; i = i + 2) {
		rptParams.put(arguments[i], arguments[i + 1]);
	}
	//logDebug("rptParams: " + rptParams);
	var emailPriReport = false;
	//var emailDRPReport = false;
	var priContact = getContactObj(capId,contactType);
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(priChannel.indexOf("Email") >= 0 || priChannel.indexOf("E-mail") >= 0){
			emailPriReport = true;
		}
		if(priChannel.indexOf("Postal") > -1){
			var addrString = "";
			var contAddr = priContact.addresses;
			for(ad in contAddr){
				var thisAddr = contAddr[ad];
				for (a in thisAddr){
					if(!matches(thisAddr[a], "undefined", "", null)){
						if(!matches(thisAddr[a].addressType, "undefined", "", null)){
							addrString += "Address Type: " + thisAddr[a].addressType + br + thisAddr[a].addressLine1 + br + thisAddr[a].city + ", " + thisAddr[a].state +  " " + thisAddr[a].zip + br;
						}
					}
				}
			}
			if(addrString==""){
				addrString = "No addresses found.";
			}
			showMessage=true;
			comment("The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the displayed report to : " + br + addrString);
		}
		//only the primary contact sets their preferred channel, so only use that
		//var drptChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
		//if(drptChannel.indexOf("Email") >= 0 || drptChannel.indexOf("E-mail") >= 0){
		//	emailDRPReport = true;
		//}else{
		//	showMessage=true;
		//	comment("The Designated Responsible Party, " + drpContact.capContact.firstName + " " + drpContact.capContact.lastName + ", has requested all correspondence be mailed.  Please mail the displayed report.");
		//}
		//if(emailPriReport || emailDRPReport){
		if(emailPriReport){
			//populate the email notification that will go to the primary contact
			var eParams = aa.util.newHashtable(); 
			//logDebug("callingPgm: " + callingPgm);
			if(callingPgm=="WTUA"){
				addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
				var currCapId = capId;
				capId = acaCapId;
				//getACARecordParam4Notification(eParams,acaUrl);
				var acaUrlForAmend = "https://aca.supp.accela.com/CALCANNABIS/urlrouting.ashx?type=1008&Module=Licenses&capID1="+capId.ID1+"&capID2="+capId.ID2+"&capID3="+capId.ID3+"&agencyCode=CALCANNABIS&HideHeader=true";
				addParameter(eParams, "$$acaRecordUrl$$", acaUrlForAmend);
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
			addParameter(eParams, "$$altID$$", capId.getCustomID());
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$status$$", curStatus);
			drpAddresses = priContact.addresses;
			for (x in drpAddresses){
				thisAddr = drpAddresses[x];
				if(thisAddr.getAddressType()=="Home"){
					addParameter(eParams, "$$priAddress1$$", thisAddr.addressLine1);
					addParameter(eParams, "$$priCity$$", thisAddr.city);
					addParameter(eParams, "$$priState$$", thisAddr.state);
					addParameter(eParams, "$$priZip$$", thisAddr.zip);
				}
			}
			//logDebug("eParams: " + eParams);
			var drpEmail = ""+priContact.capContact.getEmail();
			var priEmail = ""+priContact.capContact.getEmail();
			var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
			var rFiles = [];
			if(!matches(rptName, null, "", "undefined")){
				var rFile;
				rFile = generateReport(capId,rptName,"Licenses",rptParams);
				if (rFile) {
					rFiles.push(rFile);
				}
			}
			if(emailRpt){
				if(priContact.capContact.getEmail()==priContact.capContact.getEmail()){
					sendNotification(sysFromEmail,drpEmail,"",notName,eParams, rFiles,capId);
				}else{ 
					sendNotification(sysFromEmail,drpEmail,"",notName,eParams, rFiles,capId);
					sendNotification(sysFromEmail,priEmail,"",notName,eParams, rFiles,capId);
				}
			}else{
				rFiles = [];
				if(priContact.capContact.getEmail()==priContact.capContact.getEmail()){
					sendNotification(sysFromEmail,drpEmail,"",notName,eParams, rFiles,capId);
				}else{ 
				//emails have to be sent separately in order to appear in ACA
					sendNotification(sysFromEmail,drpEmail,"",notName,eParams, rFiles,capId);
					sendNotification(sysFromEmail,priEmail,"",notName,eParams, rFiles,capId);
				}

			}
		}
	}else{
		logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
	}
}catch(err){
	logDebug("An error occurred in emailDrpPriContacts: " + err.message);
	logDebug(err.stack);
}}