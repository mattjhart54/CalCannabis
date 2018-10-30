//lwacht: send a deficiency email when the status is "Deficiency Letter Sent" 
try{
	if("Deficiency Letter Sent".equals(wfStatus)){
/* lwacht 171129: moving to WTUB to try to get report to work
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
*/
			var childAmend = getChildren("Licenses/Cultivator/Medical/Amendment");
			var cntChild = childAmend.length;
			logDebug("cntChild: " + cntChild);
			if(cntChild<10){
				cntChild = "0" +cntChild;
			}
			var newAltId = capIDString +"-DEF"+ cntChild+"T";
			var drpContact = getContactObj(capId,"Designated Responsible Party");
			if(drpContact){
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
				if(!matches(priChannel,"",null,"undefined")){
					if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
						comment("<font color='purple'>Use this value for the Deficiency Record ID on the report: " + newAltId + "</font>");
					}
				}
			}
			runReportAttach(capId,"Deficiency Report", "p1value", capId.getCustomID(), "p2value",newAltId);
			emailRptContact("WTUA", "LCA_DEFICIENCY", "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
		//}
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
						var defAltIdT = newOAltId + "T";
						//logDebug("newOAltId: " + newOAltId);
						//lwacht adding a 't' because something quit working 
						var updOAltId = aa.cap.updateCapAltID(newODefId,defAltIdT);
						if(!updOAltId.getSuccess()){
							logDebug("Error updating Owner Alt Id: " + newOAltId + ":: " +updOAltId.getErrorMessage());
						}else{
							logDebug("newOAltId: " + newOAltId);
							editAppSpecific("AltId", newOAltId,newODefId);
							logDebug("Deficiency owner record ID updated to : " + newOAltId);
						}
// mhart 20180214 user story 4873 - Run deficincy report and send notification to the owner.
						var ownerContact = getContactObj(thisOwnCapId,"Owner");
						if(ownerContact){
							var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ ownerContact.capContact.getPreferredChannel());
							if(!matches(priChannel,"",null,"undefined")){
								if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
									comment("<font color='purple'>Use this value for the Deficiency Record ID on the report: " + newAltId + "</font>");
								}
							}
						}
						runReportAttach(thisOwnCapId,"Deficiency Report - Owner", "p1value", thisOwnCapId.getCustomID(), "p2value",defAltIdT);
						holdCapId = capId;
						capId = thisOwnCapId;
						emailRptContact("", "LCA_DEFICIENCY_OWNER", "", false, capStatus, thisOwnCapId, "Owner", "p1value", thisOwnCapId.getCustomID());
						capId = holdCapId;
// mhart 20180214 user story 4873 
					}
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	logDebug(err.stack);
}

//mhart 100818 story 5725 Revise workflow to add Final Review step and sending Pending payment notice
//send other notifications
try{
	if(matches(wfStatus, "Approved for Annual License", "Approved for Provisional License") && appTypeArray[2]!="Temporary"){
		rptName = "Approval Letter and Invoice"; 
		notName = "LCA_GENERAL_NOTIFICATION"; 
		runReportAttach(capId,rptName, "p1value", capId.getCustomID());
		emailRptContact("WTUA", notName, "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
		activateTask("Application Disposition");
		updateTask("Application Disposition", "Pending Payment","Updated by Script","");
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}
//mhart 100818 story 5725 end

// lwacht: set expiration dates
try{
	if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		//set due date and expiration date
		editAppSpecific("App Expiry Date", dateAdd(null,90));
                deactivateTask("Administrative Manager Review");
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
				//lwacht: 180426: story 5436: reset the assigned task
				var asgnDateAR = getAssignedDate("Administrative Review");
				activateTask("Administrative Manager Review");
				deactivateTask("License Manager");
				if(asgnDateAR){
					updateTaskAssignedDate("Administrative Review", asgnDateAR);
				}else{
					logDebug("No assigned date found for Administrative Review");
				}
				//lwacht: 180426: story 5436: end
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
//mhart: send local auth notice
try{
	if(matches(wfStatus,"Local Auth Sent - 10","Local Auth Sent - 60")){
		sendLocalAuthNotification();
	}
}catch(err){
	aa.print("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Local Auth Notice: " + err.message);
	aa.print(err.stack);
}

//lwacht: once the cash letter has been sent, close the workflow until the payment has been received
try{
	if(wfStatus=="Cash Payment Due Letter Sent"){
		//lwacht: 180426: story 5436: reset the assigned task
		var asgnDateAR = getAssignedDate("Administrative Review");
		deactivateTask("Administrative Review");
		if(asgnDateAR){
			updateTaskAssignedDate("Administrative Review", asgnDateAR);
		}else{
			logDebug("No assigned date found for Administrative Review");
		}
		//lwacht: 180426: story 5436: end
	}
}catch(err){
	aa.print("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Cash Payment Required: " + err.message);
	aa.print(err.stack);
}

//lwacht: 180207: story 2896: add a generic condition when a denial is appealed and remove when denial is done
//lwacht: 180227: story 5291: add reference contact information to the condition as well
try{
	if(wfStatus=="Appealed" && wfTask =="Application Disposition"){
		var condComment = capIDString;
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var drpSeqNbr = drpContact.refSeqNumber;
			condComment += "; Contact " + drpContact.people.firstName + " " + drpContact.people.lastName + " (ref ID: " + drpSeqNbr + ")";
			addContactStdCondition_rev(drpSeqNbr,"Application Condition", "Appeal Pending",condComment);
		}
		var busContact = getContactObj(capId,"Business");
		if(busContact){
			var busSeqNbr = busContact.refSeqNumber;
			if(busSeqNbr!=drpSeqNbr){
				condComment += "; Contact " + busContact.people.firstName + " " + busContact.people.lastName + " (ref ID: " + busSeqNbr + ")";
				addContactStdCondition_rev(busSeqNbr,"Application Condition", "Appeal Pending",condComment);
			}else{
				logDebug("Business and DRP are the same, not adding condition again.")
			}
		}
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application");
		for(ch in arrChild){
			var oCapId = arrChild[ch];
			var ownContact = getContactObj(oCapId,"Owner");
			if(ownContact){
				var ownSeqNbr = ownContact.refSeqNumber;
				if(ownSeqNbr!=busSeqNbr && ownSeqNbr!=drpSeqNbr){
					condComment += "; Contact " + ownContact.people.firstName + " " + ownContact.people.lastName + " (ref ID: " + ownSeqNbr + ")";
					addContactStdCondition_rev(ownSeqNbr,"Application Condition", "Appeal Pending",condComment);
				}else{
					logDebug("Owner and (Business and/or DRP) are the same, not adding condition again.")
				}
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Add appeal denial condition: " + err.message);
	aa.print(err.stack);
}
//lwacht: 180227: story 5291: end
try{
	if( wfTask =="Appeal"){
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		var drpSeqNbr = drpContact.refSeqNumber;
		var busContact = getContactObj(capId,"Business");
		var busSeqNbr = busContact.refSeqNumber;
		var arrCond = getContactConditions_rev("Application Condition", "Applied", "Appeal Pending", null);
		if(arrCond.length>0){
			for (con in arrCond){
				var thisCond = arrCond[con];
				if(thisCond.comment.indexOf(capIDString) > -1){
					var condResult = aa.commonCondition.removeCommonCondition("CONTACT", drpSeqNbr, thisCond.condNbr);
					if(condResult.getSuccess()){
						logDebug("Successfully removed condition from DRP Contact " + thisCond.comment);
					}else{
						logDebug("Error removing condition from DRP Contact: " + condResult.getErrorMessage());
					}
					if(busSeqNbr!=drpSeqNbr){
						var condResult = aa.commonCondition.removeCommonCondition("CONTACT", busSeqNbr, thisCond.condNbr);
						if(condResult.getSuccess()){
							logDebug("Successfully removed condition from Business Contact: " + thisCond.comment);
						}else{
							logDebug("Error removing condition from Business Contact: " + condResult.getErrorMessage());
						}
					}else{
						logDebug("Business and DRP are the same, not removing condition again.")
					}
				}else{
					logDebug("Condition is not for record " + capIDString + ": " + thisCond.comment);
				}
			}
		}else{
			logDebug("Search returned no conditions.");
		}
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application");
		for(ch in arrChild){
			var oCapId = arrChild[ch];
			var ownContact = getContactObj(oCapId,"Owner");
			if(ownContact){
				var ownSeqNbr = ownContact.refSeqNumber;
				if(ownSeqNbr!=busSeqNbr && ownSeqNbr!=drpSeqNbr){
					var arrCondOwn = getContactConditions_rev("Application Condition", "Applied", "Appeal Pending", null, oCapId);
					if(arrCondOwn.length>0){
						for (con in arrCondOwn){
							var thisCond = arrCondOwn[con];
							if(thisCond.comment.indexOf(capIDString) > -1){
								var condResult = aa.commonCondition.removeCommonCondition("CONTACT", ownSeqNbr, thisCond.condNbr);
								if(condResult.getSuccess()){
									logDebug("Successfully removed condition from Owner Contact: " + thisCond.comment);
								}else{
									logDebug("Error removing condition from Owner Contact: " + condResult.getErrorMessage());
								}
							}else{
								logDebug("Owner and (Business and/or DRP) are the same, not removing condition again.")
							}
						}
					}
				}
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Remove appeal denial condition: " + err.message);
	aa.print(err.stack);
}

//MJH: 180809 Story 5607 - Close Owner records when application Disqualified. 
try {

	if(wfStatus == "Disqualified") {
		holdId = capId;
		childArray = getChildren("Licenses/Cultivator/Medical/Owner Application");
		for (x in childArray) {
			capId = childArray[x];
			updateAppStatus("Disqualified", "set by script");
			deactivateTask("Owner Application Review");
		}
		capId = holdId;
		runReportAttach(capId,"Final Deficiency Disqualification Letter", "altId", capId.getCustomID(), "addressType", "Mailing", "contactType", "Designated Responsible Party");
		emailRptContact("WTUA", "LCA_GENERAL_NOTIFICATION", "", false, capStatus, capId, "Designated Responsible Party", "altId", capId.getCustomID());
	}
}catch(err){
	aa.print("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: CLose Owner Records: " + err.message);
	aa.print(err.stack);
}
//MJH: 180809 Story 5607 - End
try{
	if(wfStatus == "Science Manager Review Completed" && appTypeArray[2]!="Temporary"){
		openDate = new Date(fileDate);
		checkDate = new Date(lookup("LIC_CC_FINAL_REVIEW_IMPLEMENTATION_DATE","Effective Date"));
		if(openDate < checkDate) {
			addAdHocTask("ADHOC_WORKFLOW", "Final Review", "");
			deactivateTask("License Manager");
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Check owner update: " + err.message);
	aa.print(err.stack);
}

//lwacht: 180207: story 2896: end


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

