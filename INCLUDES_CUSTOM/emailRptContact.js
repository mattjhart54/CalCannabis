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
	rptParams: Optional report parameter(s): 
		var rParams = aa.util.newHashMap(); 
		rParams.put("capID", capId);
		rParams.put("invoiceNbr", "450");
		rParams.put("agencyid", "CALCANNABIS");

============================================== */
function emailRptContact(callingPgm, notName, rptName, emailRpt, curStatus, acaCapId, contactType) {
try{
	// create a hashmap for report parameters
	var rptParams = aa.util.newHashMap();
	for (var i = 7; i < arguments.length; i = i + 2) {
		rptParams.put(arguments[i], arguments[i + 1]);
	}
	//logDebug("rptParams: " + rptParams);
	//lwacht: defect 4810: everyone gets an email.
	//var emailPriReport = false;
	var emailPriReport = true;
	//lwacht: defect4810 end
	//var emailDRPReport = false;
	var priContact = getContactObj(capId,contactType);
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(priChannel.indexOf("Email") > -1 || priChannel.indexOf("E-mail") > -1){
				emailPriReport = true;
			}else{
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
					if(callingPgm!="BATCH"){
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the displayed report to : " + br + addrString + "</font>");
					}
				}
			}
		}
		if(emailPriReport){
			var eParams = aa.util.newHashtable(); 
			//logDebug("callingPgm: " + callingPgm);
			if(callingPgm=="WTUA"){
				var staffUser = new userObj(wfStaffUserID);
				staffUser.getEmailTemplateParams(eParams,"scientist")
				getWorkflowParams4Notification(eParams);
			}
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			var currCapId = capId;
			capId = acaCapId;
			//getACARecordParam4Notification(eParams,acaUrl);
// mhart 20180215 added if statement for notifications to use ACA deep links.
			if(matches(notName,"LCA_XXXXX")) 
				acaUrlForAmend = getACAlinkForEdit(acaCapId,"Licenses","1008");
			else {
				var acaBase = getACABaseUrl();
				var acaUrlForAmend = acaBase;
			}
// mhart 20180215 							
			addParameter(eParams, "$$acaRecordUrl$$", acaUrlForAmend);
			capId = currCapId;	
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
// mhart 20180503 story - 5392 added code to get the parent record to display on notification
// mhart 20181012 story - 5729 added code to display annual or provisional on notification
			var parentId = getParentByCapId(capId);
			if(!matches(parentId, null, "", "undefined")) {
				var pId = parentId.getCustomID()
				addParameter(eParams, "$$parentId$$", pId);
				if(pId.substring(0,1) == 'C')
					var annualProv = 'annual'
				else
					var annualProv = 'provisional'
			}
			addParameter(eParams, "$$licType$$", annualProv);	
// mhart 20180503 story - 5392 end	
// mhart 20181012 story - 5729 end
			//jshear 20220817 story - 7216 Start
			recCap = aa.cap.getCap(capId).getOutput();
			recType = recCap.getCapType();
			recTypeString = recType.toString();
			recTypeArray = recTypeString.split("/");
			if(recTypeArray[3]=="Application"){
				addParameter(eParams, "$$appType$$", getAppSpecific("License Type",capId));
			}
			//jshear 20220817 story - 7216 end
			//jshear 20181219 story - 6311 Start
			if(callingPgm=="BATCH"){
				if(recTypeArray[3]=="License"){
					var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
					if(b1ExpResult.getSuccess()){
						b1ExpObj = b1ExpResult.getOutput();
						expDate = b1ExpObj.getExpDate();
						if (expDate) {
							var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
							addParameter(eParams, "$$expDate$$",b1ExpDate);
						}
					}
				}
			}
			//jshear 20181219 story - 6311 end
			drpAddresses = priContact.addresses;
			var addrType = false;
			for (x in drpAddresses){
				thisAddr = drpAddresses[x];
				//lwacht 171214: should use mailing address if it exists
				if(thisAddr.getAddressType()=="Mailing"){
					addrType = "Mailing";
					addParameter(eParams, "$$priAddress1$$", thisAddr.addressLine1);
					addParameter(eParams, "$$priCity$$", thisAddr.city);
					addParameter(eParams, "$$priState$$", thisAddr.state);
					addParameter(eParams, "$$priZip$$", thisAddr.zip);
				}else{
				if(thisAddr.getAddressType()=="Business"){
					addrType = "Business";
					addParameter(eParams, "$$priAddress1$$", thisAddr.addressLine1);
					addParameter(eParams, "$$priCity$$", thisAddr.city);
					addParameter(eParams, "$$priState$$", thisAddr.state);
					addParameter(eParams, "$$priZip$$", thisAddr.zip);
				}else{
				if(thisAddr.getAddressType()=="Home"){
					addrType = "Home";
					addParameter(eParams, "$$priAddress1$$", thisAddr.addressLine1);
					addParameter(eParams, "$$priCity$$", thisAddr.city);
					addParameter(eParams, "$$priState$$", thisAddr.state);
					addParameter(eParams, "$$priZip$$", thisAddr.zip);
				}
				}
				}
			}
			//if the primary ones cannot be found, use whatever is there
			if(!addrType){
				//addrType = "Mailing";
				for (x in drpAddresses){
					thisAddr = drpAddresses[x];
					//if(thisAddr.getAddressType()==addrType){
						addParameter(eParams, "$$priAddress1$$", thisAddr.addressLine1);
						addParameter(eParams, "$$priCity$$", thisAddr.city);
						addParameter(eParams, "$$priState$$", thisAddr.state);
						addParameter(eParams, "$$priZip$$", thisAddr.zip);
					//}
				}
			}
			//lwacht: 171214: end
			//logDebug("eParams: " + eParams);
			//var drpEmail = ""+priContact.capContact.getEmail();
			var priEmail = ""+priContact.capContact.getEmail();
			//var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
			var rFiles = [];
			if(!matches(rptName, null, "", "undefined")){
				//Story 6611 allowing rptName to be string value or array;
				var rFile;
				if (typeof(rptName) == "object"){
					for (i = 0; i < rptName.length; i++) {
						var thisRptName = String(rptName[i]);
						rFile = generateReport(capId,thisRptName,"Licenses",rptParams);
						if (rFile) {
							rFiles.push(rFile);
						}
					}
				}else{
					rFile = generateReport(capId,rptName,"Licenses",rptParams);
					if (rFile) {
						rFiles.push(rFile);
					}
				}
			}
			if(emailRpt){
				sendNotification(sysFromEmail,priEmail,"",notName,eParams, rFiles,capId);
			}else{
				rFiles = [];
				sendNotification(sysFromEmail,priEmail,"",notName,eParams, rFiles,capId);
			}
		}
	}else{
		logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
	}
}catch(err){
	logDebug("An error occurred in emailRptContact: " + err.message);
	logDebug(err.stack);
}}