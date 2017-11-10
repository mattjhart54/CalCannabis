//lwacht: send a deficiency email when the status is "Deficiency Letter Sent" 
try{
	if("Deficiency Letter Sent".equals(wfStatus)){ 
		//lwacht: 170817: commenting in anticipation of primary contact going away
		//var emailReport = false;
		//var priContact = getContactObj(capId,"Primary Contact");
		//var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		//if(!matches(priChannel,null,"","undefined")){
		//	if(priChannel.indexOf("Email") >= 0 || priChannel.indexOf("E-mail") >= 0){
		//		emailReport = true;
		//	}else{
		//		showMessage=true;
		//		comment("The Primary Contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the displayed report.");
		//	}
		//}
		//var drpContact = getContactObj(capId,"Designated Responsible Party");
		//var drptChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
		//if(drptChannel.indexOf("Email") >= 0 || drptChannel.indexOf("E-mail") >= 0){
		//	emailReport = true;
		//}else{
		//	showMessage=true;
		//	comment("The Designated Responsible Party, " + drpContact.capContact.firstName + " " + drpContact.capContact.lastName + ", has requested all correspondence be mailed.  Please mail the displayed report.");
		//}
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
			runReportAttach(capId,"Deficiency Report", "p1value", capId.getCustomID());
			emailRptContact("WTUA", "LCA_DEFICIENCY", "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
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
			logDebug("newDefId: " + newDefId.getCustomID());
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
			//logDebug("newAltId: " + newAltId);
			var updAltId = aa.cap.updateCapAltID(newDefId,newAltId+"T");
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			}else{
				editAppSpecific("AltId", newAltId,newDefId);
				logDebug("Deficiency record ID updated to : " + newAltId);
			}
			//only create a record if the owner app task on the parent says you should
			if(taskStatus("Owner Application Reviews") == "Additional Information Needed" || taskStatus("Owner Application Reviews") == "Incomplete Response"){
				var childOwner = getChildren("Licenses/Cultivator/*/Owner Application");
				for(rec in childOwner){
					//now process the child owner applications for any deficiencies
					var thisOwnCapId = childOwner[rec];
					var ownCap = aa.cap.getCap(thisOwnCapId).getOutput();
					var ownAppStatus = ownCap.getCapStatus();
					var ownAppName = ownCap.getSpecialText();
					if(ownAppStatus=="Additional Information Needed"){
						var newOwnAppName = "Deficiency: " + ownAppName;
						//create child deficiency record for the owner
						ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
						ctm.setGroup("Licenses");
						ctm.setType("Cultivator");
						ctm.setSubType("Owner");
						ctm.setCategory("Amendment");
						var newODefId = aa.cap.createSimplePartialRecord(ctm,newOwnAppName, "INCOMPLETE CAP").getOutput();
						if(newODefId){
							var resOCreateRelat = aa.cap.createAppHierarchy(thisOwnCapId, newODefId); 
							if (resOCreateRelat.getSuccess()){
								logDebug("Child application successfully linked");
							}else{
								logDebug("Could not link applications: " + resOCreateRelat.getErrorMessage());
							}
							logDebug("thisOwnCapId.getCustomID(): " + thisOwnCapId.getCustomID());
							editAppSpecific("ParentCapId", thisOwnCapId.getCustomID(),newODefId);
							//copyASITables(thisOwnCapId,newODefId,["CANNABIS FINANCIAL INTEREST", "CONVICTIONS", "ATTACHMENTS"]);
							var tblODefic = loadASITable("DEFICIENCIES",thisOwnCapId);
							var arrDef = [];
							for (row in tblODefic){
								if(tblODefic[row]["Status"]=="Deficient"){
									arrDef.push(tblODefic[row]);
								}
							}
							addASITable("DEFICIENCIES", arrDef, newODefId);
							copyContacts(thisOwnCapId, newODefId);
							//editContactType("Owner","Primary Contact",newODefId);
							//get the current number of deficiency children to set the AltId
							var currCapId = capId;
							capId = thisOwnCapId;
							var childOAmend = getChildren("Licenses/Cultivator/Owner/Amendment");
							capId = currCapId;
							var cntOChild = childOAmend.length;
							//cntOChild ++;
							//logDebug("childOAmend.length: " + childOAmend.length);
							//logDebug("cntOChild: " + cntOChild);
							if(cntOChild<10){
								cntOChild = "0" +cntOChild;
							}
							var newOAltId = thisOwnCapId.getCustomID() +"-DEF"  + cntOChild;
							//logDebug("newOAltId: " + newOAltId);
							//lwacht adding a 't' because something quit working 
							var updOAltId = aa.cap.updateCapAltID(newODefId,newOAltId+"T");
							if(!updOAltId.getSuccess()){
								logDebug("Error updating Owner Alt Id: " + newOAltId + ":: " +updOAltId.getErrorMessage());
							}else{
								logDebug("newOAltId: " + newOAltId);
								editAppSpecific("AltId", newOAltId,newODefId);
								logDebug("Deficiency owner record ID updated to : " + newOAltId);
							}
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	logDebug(err.stack);
}

//lwacht
//send other notifications
try{
	//if(matches(wfStatus, "Disqualified", "Withdrawn", "Denied", "Science Manager Review Completed") && appTypeArray[2]!="Temporary"){
	if(matches(wfStatus, "Science Manager Review Completed") && appTypeArray[2]!="Temporary"){
		var rptName = "";
		var notName = "";
		switch(""+wfStatus){
			case "Science Manager Review Completed": 
				rptName = "Approval Letter and Invoice"; 
				notName = "LCA_GENERAL_NOTIFICATION"; 
				break;
			default: 
				rptName = "Deficiency Report";
				notName = "LCA_GENERAL_NOTIFICATION";
		}
		runReportAttach(capId,rptName, "p1value", capId.getCustomID());
		//emailDrpPriContacts("WTUA", "LCA_GENERAL_NOTIFICATION", "", false, capStatus, capId);
		emailRptContact("WTUA", notName, "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
		//emailRptContact("WTUA", notName, "", false, capStatus, capId, "Primary Contact", "p1value", capId.getCustomID());
		updateTask("Application Disposition", "Pending Payment","Updated by Script","");
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}


// lwacht: set expiration dates
try{
	if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		//set due date and expiration date
		editAppSpecific("App Expiry Date", dateAdd(null,90));
		if(matches(taskStatus("Administrative Review"), "Additional Information Needed", "Incomplete Response")){
			editTaskDueDate("Administrative Review", dateAdd(null,90));
			//activateTask("Administrative Review");
		}
		if(matches(taskStatus("Owner Application Reviews"), "Additional Information Needed" , "Incomplete Response")){
			editTaskDueDate("Owner Application Reviews", dateAdd(null,90));
			//activateTask("Owner Application Reviews");
		}
		//setTask("Administrative Manager Review", "N", "Y");
	}
	if("Science Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		//set due date and expiration date
		editAppSpecific("App Expiry Date", dateAdd(null,90));
		if(matches(taskStatus("Scientific Review"), "Additional Information Needed","Incomplete Response")){
			editTaskDueDate("Scientific Review", dateAdd(null,90));
			//activateTask("Scientific Review");
		}
		if(matches(taskStatus("CEQA Review"),"Additional Information Needed","Incomplete Response")){
			editTaskDueDate("CEQA Review", dateAdd(null,90));
			//activateTask("CEQA Review");
		}
		//setTask("Science Manager Review", "N", "Y");
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Expiration Dates: " + err.message);
	logDebug(err.stack);
}

//mhart
//If License Manager requires revisions to the denial reasons reeactivete the task the denial request came from.
try {
	if(wfTask == "License Manager" && wfStatus == "Revisions Required") { 
		altId = capId.getCustomID();
		var taskItemScriptModel=aa.workflow.getTask(capId, "Administrative Manager Review");
		if(taskItemScriptModel.getSuccess()){
			var taskItemScript = taskItemScriptModel.getOutput();
			if(matches(taskItemScript.disposition, "Recommended for Denial")){
				activateTask("Administrative Manager Review");
				deactivateTask("License Manager");
			}
		}
		var taskItemScriptModel=aa.workflow.getTask(capId, "Science Manager Review");
		if(taskItemScriptModel.getSuccess()){
			var taskItemScript = taskItemScriptModel.getOutput();
			if(matches(taskItemScript.disposition, "Recommended for Denial")){
				activateTask("Science Manager Review");
				deactivateTask("License Manager");
			}
		}	
	}
	if(wfTask == "License Manager" && wfStatus == "Denied") { 
		updateTask("Application Disposition", "Denied - Pending Appeal","Updated by script","");
		editAppSpecific("Appeal Expiry Date",dateAdd(wfDateMMDDYYYY,30));
		editAppSpecific("Denial Letter Sent",wfDateMMDDYYYY);
		emailRptContact("WTUA", "LCA_APP_DENIAL_LETTER", "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Denial Revisions Required: " + err.message);
	logDebug(err.stack);
}

//mhart
//Local Authorization Notice
try{
	if(matches(wfStatus, "Local Auth Sent - 10", "Local Auth Sent - 60")){
		sendLocalAuthNotification();
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Disqualification notification: " + err.message);
	logDebug(err.stack);
}

//lwacht
//if the perm application is set to denied, then close out any related temp licenses
//MJH User Story 3556 remove this functionality
/*
try{
	if(wfStatus== "Denied" && appTypeArray[2]!="Temporary"){
		var currCap = capId;
		var arrTemp = getChildren("Licenses/Cultivator/Temporary/Application");
		for(rec in arrTemp){
			capId = arrTemp[rec];
			var arrParId= getParentsRev("Licenses/Cultivator/Temporary/License");
			if(arrParId){
				for(row in arrParId){
					capId = arrParId[row];
					taskCloseAllExcept("Revoked","Updated via script WTUA:LICENSES/CULTIVATOR/* /APPLICATION: Close Temp License");
					updateAppStatus("Revoked","Updated via script WTUA:LICENSES/CULTIVATOR/* /APPLICATION: Close Temp License");
				}
			}
			capId = currCap;
		}
		var arrTemp = getChildren("Licenses/Cultivator/Temporary/License");
		for(rec in arrTemp){
			capId = arrTemp[rec];
			taskCloseAllExcept("Revoked","Updated via script WTUA:LICENSES/CULTIVATOR/* /APPLICATION: Close Temp License");
			updateAppStatus("Revoked","Updated via script WTUA:LICENSES/CULTIVATOR/* /APPLICATION: Close Temp License");
			capId = currCap;
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/* /APPLICATION: Close Temp License: " + err.message);
	logDebug(err.stack);
}
*/


//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
/* lwacht: moved to PRA, commenting out for now in case minds are changed.
try{
	if("License Issuance".equals(wfTask) && "Issued".equals(wfStatus)){
		var licCapId = createLicense("Active",false);
		if(licCapId){
			var expDate = dateAddMonths(null,12);
			setLicExpirationDate(licCapId,null,expDate,"Active");
			if(appTypeArray[2]=="Adult Use"){
				var newAltFirst = "CAL" + sysDateMMDDYYYY.substr(8,2);
			}else{
				var newAltFirst = "CML";
			}
			var newAltLast = capIDString.substr(3,capIDString.length());
			var newAltId = newAltFirst + newAltLast;
			var updAltId = aa.cap.updateCapAltID(licCapId,newAltId);
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			}else{
				logDebug("License record ID updated to : " + newAltId);
			}
			var arrChild = getChildren("Licenses/Cultivator/* /Owner Application");
			for(ch in arrChild){
				copyContactsByType(arrChild[ch], licCapId, "Individual");
			}
			editContactType("Individual", "Owner",licCapId);
			var newAppName = AInfo["Premise County"] + " - " + AInfo["License Type"];
			var contApp = getContactObj(capId, "Applicant");
			editAppName();
			var contPri = getContactObj(licCapId,"Primary Contact");
			var currCapId = capId;
			capId = licCapId;
			contactSetPrimary(contPri.seqNumber);
			capId = currCapId;
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/* /APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}
lwacht end */