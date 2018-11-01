//lwacht: when the status is "Additional Information Needed" and the preferred channel is *not* email,
//display the deficiency report for printing. Note: only use the primary contact's preferred channel
try{ 
	//lwacht: 171205: deficiency record needs to be created for both science and admin tasks
	//if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
	if("Deficiency Letter Sent".equals(wfStatus)){
	//lwacht: 171205: end
		//lwacht 171129 start
		var newAppName = "Deficiency: " + capName;
		//create child amendment record
		ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
		ctm.setGroup("Licenses");
		ctm.setType("Cultivator");
		ctm.setSubType("Medical");
		ctm.setCategory("Amendment");
		var resDefId = aa.cap.createSimplePartialRecord(ctm,newAppName, "INCOMPLETE CAP");
		if(resDefId.getSuccess()){
			var newDefId = resDefId.getOutput();
			//emailRptContact("WTUA", "LCA_DEFICIENCY", "", false, capStatus, capId, "Primary Contact", "p1value", capId.getCustomID());
			//if(emailReport){
			//	runReportAttach(capId,"Deficiency Report", "p1value", capId.getCustomID());
			//	emailDrpPriContacts("WTUA", "LCA_GENERAL_NOTIFICATION", "", false, wfStatus, newDefId);
			//}
			//relate amendment to application
			var resCreateRelat = aa.cap.createAppHierarchy(capId, newDefId); 
			if (resCreateRelat.getSuccess()){
				logDebug("Child application successfully linked");
			}else{
				logDebug("Could not link applications: " + resCreateRelat.getErrorMessage());
			}
			editAppSpecific("ParentCapId", capIDString,newDefId);
			//copyASITables(capId,newDefId,["CANNABIS FINANCIAL INTEREST", "OWNERS", "ATTACHMENTS"]);
			var tblODefic = [];
			var arrDef = [];
			for (row in DEFICIENCIES){
				if(DEFICIENCIES[row]["Status"]=="Deficient"){
					arrDef.push(DEFICIENCIES[row]);
				}
			}
			//logDebug("newDefId: " + newDefId.getCustomID());
			addASITable("DEFICIENCIES", arrDef, newDefId);
			copyContactsByType(capId, newDefId,"Designated Responsible Party");
			//copyContactsByType(capId, newDefId,"Primary Contact");
			//find out how many amendment records there have been so we can create an AltId
			var childAmend = getChildren("Licenses/Cultivator/Medical/Amendment");
			var cntChild = childAmend.length;
			//cntChild ++;
			//logDebug("cntChild: " + cntChild);
			if(cntChild<10){
				cntChild = "0" +cntChild;
			}
			var newAltId = capIDString +"-DEF"+ cntChild;
			var defAltIdT = newAltId + "T"
			logDebug("newAltId: " + newAltId);
			var updAltId = aa.cap.updateCapAltID(newDefId,defAltIdT);
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + defAltIdT + ":: " +updAltId.getErrorMessage());
			}else{
				editAppSpecific("AltId", newAltId,newDefId);
				logDebug("Deficiency record ID updated to : " + newAltId);
			}
			//runReportAttach(capId,"Deficiency Report", "p1value", capId.getCustomID(), "p2value",newAltId);
			//emailRptContact("WTUA", "LCA_DEFICIENCY", "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
		}
		//lwacht 171129 end
		var showReport = false;
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(!matches(priChannel,"",null,"undefined")){
				if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
					showReport = true;
				}
			}
		}
		if(showReport){
			showDebug=false;
			displayReport("Deficiency Report", "p1value", capIDString,"p2value",defAltIdT);
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	aa.print(err.stack);
}

//lwacht: when the status is set to a status that requires notification and the preferred channel is *not* email,
//display the appropriate report for printing
try{
	if(matches(wfStatus, "Deficiency Letter Sent")){
		showDebug=false;
		//lwacht : 170823 : removing primary contact
		//var priContact = getContactObj(capId,"Primary Contact");
		//var showReport = false;
		//if(priContact){
		//	var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		//	if(priChannel.indexOf("Postal") >-1){
		//		showReport = true;
		//	}
		//}
		//lwacht: 170815: uncommenting in preparation for Primary Contact going away
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(!matches(priChannel,"",null,"undefined")){
				if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
					showReport = true;
				}
			}
		}
		if(showReport){
			var rptName = "Deficiency Report";
			displayReport(rptName, "Record Id", capIDString);
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	aa.print(err.stack);
}

//lwacht: all owner records need to be updated before this task can be updated
try{
	if("Owner Application Reviews".equals(wfTask) && "Owner Application Reviews Completed".equals(wfStatus)){
		var currCap = capId;
		var ownerUpdated=true;
		var notUpdated = "Yes";
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application");
		if(arrChild){
			for(ch in arrChild){
				capId = arrChild[ch];
				if(isTaskActive("Owner Application Review")){
					ownerUpdated=false;
					if(notUpdated=="Yes"){
						notUpdated= arrChild[ch].getCustomID();
					}else {
						notUpdated += "; " + arrChild[ch].getCustomID();
					}
				}
			}
			capId = currCap;
			if(!ownerUpdated){
				cancel=true;
				showMessage=true;
				comment("The following owner record(s) need to be updated before continuing: " + notUpdated);
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Check owner update: " + err.message);
	aa.print(err.stack);
}


//lwacht: license can only be issued from PRA
try{
	if("Application Disposition".equals(wfTask) && "License Issued".equals(wfStatus)){
		cancel=true;
		showMessage=true;
		comment("The license can only be issued upon payment of fees.");
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Stop license issuance: " + err.message);
	aa.print(err.stack);
}
//lwacht
//add fees
//lwacht: don't run for temporary app 
try{
	if(appTypeArray[2]!="Temporary" && wfTask == "Final Review" && matches(wfStatus,"Approved for Annual License","Approved for Provisional License")){
		var feeDesc = AInfo["License Type"] + " - License Fee";
		var thisFee = getFeeDefByDesc("LIC_CC_CULTIVATOR", feeDesc);
		if(thisFee){
			updateFee_Rev(thisFee.feeCode,"LIC_CC_CULTIVATOR", "FINAL", 1, "Y", "N");
		}else{
			aa.print("An error occurred retrieving fee item: " + feeDesc);
			aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: WTUB:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Application Submitted: Add Fees: " + err.message);
	aa.print(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: WTUB:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht: if cash has been selected as a payment type, the letter must be sent before anything else can be done on the record
try{
	var priContact = getContactObj(capId,"Designated Responsible Party");
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(priChannel.indexOf("Postal") > -1){
				if("Application Fee Due".equals(capStatus) && wfStatus!="Cash Payment Due Letter Sent"){
					cancel=true;
					showMessage=true;
					comment("The 'Cash Payment Due Letter' must be sent before this record can be processed.");
				}
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Cash Payment Required: " + err.message);
	aa.print(err.stack);
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
			showMessage = true;		
			cancel = true;
			comment("Local Authority Notification not sent.  No email address found for the local authority " + locAuth)
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Local Auth Notice: " + err.message);
	aa.print(err.stack);
}
//MJH: 180809 Story 5607 - Close Owner records when application Disqualified. 
try{
	if(wfStatus == "Disqualified"){
		showDebug=false;
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(!matches(priChannel,"",null,"undefined")){
				if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
					showReport = true;
				}
			}
		}
		if(showReport){
			var rptName = "Final Deficiency Disqualification Letter";
			displayReport(rptName, "altId", capIDString, "addressType", "Mailing", "contactType", "Designated Responsible Party");
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Final Disqualification Notice: " + err.message);
	aa.print(err.stack);
}
//MJH: 180809 Story 5607 - End

//MJH 181016 Story 5749 - Check that all deficiency records completed before Manager Review task completed
try{
	if("Administrative Review".equals(wfTask)){
		var currCap = capId;
		var ownerUpdated=true;
		var notUpdated = "Yes";
		var arrChild = getChildren("Licenses/Cultivator/Medical/Amendment");
		if(arrChild){
			for(ch in arrChild){
				capId = arrChild[ch];
				if(isTaskActive("Amendment Review")){
					ownerUpdated=false;
					if(notUpdated=="Yes"){
						notUpdated= arrChild[ch].getCustomID();
					}else {
						notUpdated += "; " + arrChild[ch].getCustomID();
					}
				}
			}
			capId = currCap;
			if(!ownerUpdated){
				cancel=true;
				showMessage=true;
				comment("The following owner amendment record(s) need to be updated before continuing: " + notUpdated);
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Check owner update: " + err.message);
	aa.print(err.stack);
}
try{
	if("Administrative Manager Review".equals(wfTask) && "Administrative Manager Review Completed".equals(wfStatus)){
		var currCap = capId;
		var amendUpdated=true;
		var arrAmend = getChildren("Licenses/Cultivator/*/Amendment");
		if(arrAmend){
			for(ch in arrAmend){
				capId = arrAmend[ch];
				capAmend = aa.cap.getCap(capId).getOutput();
				amendStatus = capAmend.getCapStatus();
				if(matches(amendStatus ,"Pending", "Submitted", "Under Review")){
					amendUpdated=false;
				}
			}
			capId = currCap;
			if(isTaskStatus("Owner Application Reviews", "Additional Information Needed") || isTaskStatus("Owner Application Reviews", "Incomplete Response") || isTaskStatus("Owner Application Reviews", "Under Review")) {
				amendUpdated=false;
			}
			if(!amendUpdated){
				cancel=true;
				showMessage=true;
				comment("There are deficiency record(s) that need to be updated before continuing.");
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Check owner update: " + err.message);
	aa.print(err.stack);
}
//MJH 181016 Story 5749 end

//MJH 181031 Story 5776 add Adhoc task for final review
try {
	if(wfTask == "Final Review" && !matches(currentUserGroup,"LicensesAdmin","LicensesAdminMgr","LicensesManager","LicensesScienceMgr")) {
		cancel = true;
		showMessage = true;
		comment("Only the Administrative Manager, License Manager or Science Manger can update the Final Review")
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Final Review update: " + err.message);
	aa.print(err.stack);
}
//MJH 181031 Story 5776 end