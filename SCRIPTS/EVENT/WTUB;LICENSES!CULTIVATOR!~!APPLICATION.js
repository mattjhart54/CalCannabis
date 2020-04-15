try{
// MJH 20190212 US 5864 and 5865 - update application expiration date, deficiency letter sent and task due dates. US 5868 - Move from WTUA to WTUB.
	if(((wfTask == "Administrative Review" && wfStatus == "Administrative Review Completed") && 
		(taskStatus("Owner Application Reviews")  == "Owner Application Reviews Completed")) ||
		((wfTask == "Owner Application Reviews" && wfStatus == "Owner Application Reviews Completed") &&
		(taskStatus("Administrative Review") == "Administrative Review Completed"))) {
			editAppSpecific("App Expiry Date", "");
// MJH 201900305 US 5891- update Record status to Administrative Review Completed.
			updateAppStatus("Administrative Review Complete","updated by script"); 
// MJH 201900305 US 5891 end
	}
	if(wfTask == "Scientific Review" && wfStatus == "Scientific Review Completed")  {
			editAppSpecific("App Expiry Date", "")
// ees 20190320 US 5945 - update Record status to Under Scientific Review.
			updateAppStatus("Under Scientific Review","updated by script"); 
// ees 20190320 US 5945 end
	}
	if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		//set due date and expiration date
		var nextDueDay = dateAdd(null,89);
		if(matches(AInfo["App Expiry Date"],null,"",undefined)) {
			editAppSpecific("App Expiry Date", nextWorkDay(nextDueDay));
			var expDate = getAppSpecific("App Expiry Date");
			logDebug("exp Date " + expDate);
		}
		if(matches(AInfo["Admin Deficiency Letter Sent"],null,"",undefined)) {
			editAppSpecific("Admin Deficiency Letter Sent", jsDateToASIDate(new Date()));
			if(matches(taskStatus("Administrative Review"), "Additional Information Needed", "Incomplete Response")){
				editTaskDueDate("Administrative Review", nextWorkDay(nextDueDay));
			}
			if(matches(taskStatus("Owner Application Reviews"), "Additional Information Needed" , "Incomplete Response")){
				editTaskDueDate("Owner Application Reviews", nextWorkDay(nextDueDay));
			}
		}
        deactivateTask("Administrative Manager Review");
	}
	if("Science Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		//set due date and expiration date
		var nextDueDay = dateAdd(null,89);
		if(matches(AInfo["App Expiry Date"],null,"",undefined)) {
			editAppSpecific("App Expiry Date", nextWorkDay(nextDueDay));
			var expDate = getAppSpecific("App Expiry Date");
			logDebug("exp Date " + expDate + " nextDueDay " + nextDueDay);
		}
		if(matches(AInfo["Science Deficiency Letter Sent"],null,"",undefined)) {
			editAppSpecific("Science Deficiency Letter Sent", jsDateToASIDate(new Date()));
			if(matches(taskStatus("Scientific Review"), "Additional Information Needed","Incomplete Response")){
				editTaskDueDate("Scientific Review", nextWorkDay(nextDueDay));
			}
			if(matches(taskStatus("CEQA Review"),"Additional Information Needed","Incomplete Response")){
				editTaskDueDate("CEQA Review", nextWorkDay(nextDueDay));
			}
		}
	//eshanower 20190207: US 5826 start deactivate Science Mgr Review task
		deactivateTask("Science Manager Review");
	//eshanower 20190207: US 5826 end deactivate Science Mgr Review task
	}
	// MJH US 5864 and 5865 - update application expiration date, deficiency letter sent and task due dates.
}catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Expiration Dates: " + err.message);
	logDebug(err.stack);
}

try{ 
//lwacht: 171205: deficiency record needs to be created for both science and admin tasks
	if("Deficiency Letter Sent".equals(wfStatus)){
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
				displayReport("Deficiency Letter", "altId", capIDString,"newAltId",defAltIdT);
			}
		}
	}
//lwacht 171129 end
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	aa.print(err.stack);
}
/*
//lwacht: when the status is set to a status that requires notification and the preferred channel is *not* email,
//display the appropriate report for printing
try{
	if(matches(wfStatus, "Deficiency Letter Sent")){
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
			var rptName = "Deficiency Report";
			displayReport(rptName, "Record Id", capIDString);
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/~/APPLICATION: Deficiency Notice: " + err.message);
	aa.print(err.stack);
}
*/
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
// ees 20190215 US 5885: add Provisional License Issued status to prevent issuance w/o payment
try{
	if("Application Disposition".equals(wfTask) && ("License Issued".equals(wfStatus) || "Provisional License Issued".equals(wfStatus))){
		cancel=true;
		showMessage=true;
		comment("The license can only be issued upon payment of fees.");
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Stop license issuance: " + err.message);
	aa.print(err.stack);
}
//MJH 180408 Story 5896 check for incomplete children records
try {
	if(wfTask == "Final Review" && matches(wfStatus,"Approved for Provisional License","Approved for Annual License")) { 
		childId = getChildren("Licenses/Cultivator/*/*");
		var br = "<br>";
		var openOwnRec = false;
		var openAmendRec = false;
		var ownMsg = "The following owner records have not been completed:" + br;
		var amendMsg = "The following Amendment records have not been completed:" + br;
		for (c in childId) {
			childCap = aa.cap.getCap(childId[c]).getOutput();
			childStatus = childCap.getCapStatus();
			childTypeResult = childCap.getCapType();	
			childTypeString = childTypeResult.toString();	
			childTypeArray = childTypeString.split("/");
			childAltId = childId[c].getCustomID();
			if(childTypeArray[3] == "Owner Application") { 
				if(matches(childStatus,"Additional Information Needed", "Incomplete Response", "Under Review", "Submitted")) {
					openOwnRec = true;
					ownMsg = ownMsg + " " + childAltId + " Status " + childStatus + br;
				}
			}
			if(childTypeArray[3] == "Amendment") { 
				if(matches(childStatus,"Under Review", "Pending")) {
					openAmendRec = true;
					amendMsg = amendMsg + " " + childAltId + " Status " + childStatus + br;
				}
			}
		}
		if(openAmendRec) {
			showMessage = true;
			comment(amendMsg);
		}
		if(openOwnRec) {
			showMessage = true;
			comment(ownMsg);
		}
		if(openAmendRec || openOwnRec)
			cancel = true;
	} 
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Final Review child check: " + err.message);
	aa.print(err.stack);
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
	if("Administrative Review".equals(wfTask)&& wfStatus != "Under Review"){
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
				comment("The following amendment record(s) need to be updated before continuing: " + notUpdated);
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

//MJH 181031 Story 5776 validate user updating final review
try {
	if(wfTask == "Final Review" && !matches(currentUserGroup,"LicensesAdmin","LicensesAdminMgr","LicensesManager","LicensesScienceMgr","LicensesAgencyAdmin","LicensesISS")) {
		cancel = true;
		showMessage = true;
		comment("Only the Administrative Manager, License Manager or Science Manager can update the Final Review")
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Final Review update: " + err.message);
	aa.print(err.stack);
}
//MJH 181031 Story 5776 end

