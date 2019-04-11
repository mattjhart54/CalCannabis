//lwacht: send a deficiency email when the status is "Deficiency Letter Sent" 
try{
	if("Deficiency Letter Sent".equals(wfStatus)){
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
// MJH 190222 User Story 5881 - run Defieciency report in async mode
			var scriptName = "asyncRunDeficiencyRpt";
			var envParameters = aa.util.newHashMap();
			envParameters.put("altId",capIDString); 
			envParameters.put("newAltId",newAltId);
			envParameters.put("reportName","Deficiency Letter"); 
			envParameters.put("currentUserID",currentUserID);
			logDebug("altId " + capIDString + " newAltId " + newAltId + " curentUser " + currentUserID)
			aa.runAsyncScript(scriptName, envParameters);
//			runReportAttach(capId,"Deficiency Report", "p1value", capId.getCustomID(), "p2value",newAltId);
// MJH 190222 User Story 5881 - end
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
// MJH 190222 User Story 5881 - run Defieciency report in async mode
						var scriptName = "asyncRunDeficiencyRpt";
						var envParameters = aa.util.newHashMap();
						envParameters.put("altId",thisOwnCapId.getCustomID()); 
						envParameters.put("newAltId",defAltIdT);
						envParameters.put("reportName","Deficiency Report - Owner"); 
						envParameters.put("currentUserID",currentUserID);
						logDebug("altId " + capIDString + " newAltId " + newAltId + " curentUser " + currentUserID)
						aa.runAsyncScript(scriptName, envParameters);
//						runReportAttach(thisOwnCapId,"Deficiency Report - Owner", "p1value", thisOwnCapId.getCustomID(), "p2value",defAltIdT);
// MJH 190222 User Story 5881 - end
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
//mhart 031319 story 5914 Move execution of the Approval Letter and License Fee Invoice report and DRP notification to WTUB		
//		rptName = "Approval Letter and Invoice"; 
//		notName = "LCA_GENERAL_NOTIFICATION"; 
//		runReportAttach(capId,rptName, "p1value", capId.getCustomID());
//		emailRptContact("WTUA", notName, "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
		//mhart 031319 story 5914 end		
		activateTask("Application Disposition");
		updateTask("Application Disposition", "Pending Payment","Updated by Script","");
		updateAppStatus("Pending Payment","Updated by Script","");
//MJH 201902-8 US 5866 Update License Fee Due date
		editAppSpecific("License Fee Due",nextWorkDay(dateAdd(null,89)));
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Generic notifications: " + err.message);
	logDebug(err.stack);
}
//mhart 100818 story 5725 end

// MJH 190305 story 5890 Set record status to Additional Information Needed
if(wfTask == "Administrative Review" || wfTask == "Owner Application Reviews") {
	adminStatus = taskStatus("Administrative Review");
	ownerStatus = taskStatus("Owner Application Reviews");
	if((adminStatus  == "Additional Information Needed" && ownerStatus  != "Incomplete Response") ||
		(ownerStatus == "Additional Information Needed" && adminStatus != "Incomplete Response")) {
			if(isTaskActive("Administrative Manager Review")) {
				updateAppStatus("Additional Information Needed", "Updated by Script");
			}
	}
}
//MJH 190305 story 5890 end

// ees 20190311 story 5894 start Set record status to Additional Information Needed in Scientific section
if(wfTask == "Scientific Review" || wfTask == "CEQA Review") {
	sciStatus = taskStatus("Scientific Review");
	ceqaStatus = taskStatus("CEQA Review");
	if((sciStatus  == "Additional Information Needed" && (ceqaStatus  != "Incomplete Response" || ceqaStatus == "undefined")) ||
		(ceqaStatus == "Additional Information Needed" && sciStatus != "Incomplete Response")) {
			if(isTaskActive("Science Manager Review")) {
				updateAppStatus("Additional Information Needed", "Updated by Script");
			}
	}
}
// ees 20190311 story 5894 end
try {
//mhart 190410 story 5954 - Close record and children records when workflow status Denied is entered.
	if(wfTask == "License Manager" && wfStatus == "Denied") { 
//		updateTask("Application Disposition", "Denied - Pending Appeal","Updated by script","");
//		editAppSpecific("Appeal Expiry Date",dateAdd(wfDateMMDDYYYY,30));
//		editAppSpecific("Denial Letter Sent",wfDateMMDDYYYY);
//		emailRptContact("WTUA", "LCA_APP_DENIAL_LETTER", "", false, capStatus, capId, "Designated Responsible Party", "p1value", capId.getCustomID());
		closeTask("Application Disposition", "Denied","Updated by script","");
		updateAppStatus("Denied", "Updated by script");
		childRecs = getChildren("Licenses/Cultivator/*/*");
		var holdId = capId;
		for (c in childRecs) {
			capId = childRecs[c];
			childCap = aa.cap.getCap(capId).getOutput();
			childStatus = childCap.getCapStatus();
			childTypeResult = childCap.getCapType();	
			childTypeString = childTypeResult.toString();	
			childTypeArray = childTypeString.split("/");
			childAltId = capId.getCustomID();
			if(childTypeArray[3] == "Owner Application") {
logDebug("got Here ");			
				if(matches(childStatus,"Under Review", "Pending","Additional Information Needed")) {
logDebug("got Here 2");	
					closeTask("Owner Application Review","Closed","updated by script","");
					updateAppStatus("Closed","updated by script",capId);
					ownChildRecs = getChildren("Licenses/Cultivator/Owner/Amendment",capId);
					for (o in ownChildRecs) {
						capId = ownChildRecs[o];
						ownChildCap = aa.cap.getCap(ownChildRecs[o]).getOutput();
						ownChildStatus = ownChildCap.getCapStatus();
						if(matches(ownChildStatus,"Under Review", "Pending")) {
							closeTask("Amendment Review","Closed","updated by script","");
							updateAppStatus("Closed","updated by script",ownChildRecs[o]);
						}
					}
				}
			}
			if(childTypeArray[3] == "Amendment") { 
				if(matches(childStatus,"Under Review", "Pending")) {
					closeTask("Amendment Review","Closed","updated by script","");
					updateAppStatus("Closed","updated by script",capId);
				}
			}
		}
		var capId = holdId;
	}
//mhart 190410 story 5954 - end
}catch(err){
	aa.print("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: License Manager Denial: " + err.message);
	aa.print(err.stack);
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
	aa.print("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Check date and add Final Review task: " + err.message);
	aa.print(err.stack);
}
//lwacht: 180207: story 2896: end

//mhart 190408 story 5953 - Activate tasks when Revision required status entered
try {
	if(wfTask == "License Manager" && wfStatus == "Revisions Required") { 
		altId = capId.getCustomID();
		var adminDate = null;
		var scienceDate = null;
		var adminReview = false;
		var ownerReview = false;
		var scienceReview = false;
		var ceqaReview = false;
		asgnDateAR = null;
		asgnDateOR = null;
		asgnDateSR = null;
		asgnDateCR = null;
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess())
			var wfObj = workflowResult.getOutput();
		else {
			logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		}
		for (i in wfObj) {
			var fTask = wfObj[i];
			if (fTask.getTaskDescription()== "Administrative Manager Review" && fTask.getDisposition() == "Recommended for Denial"){
				adminDate = fTask.getStatusDate();
				logDebug("status Date" + adminDate);
			}
			if (fTask.getTaskDescription()== "Science Manager Review" && fTask.getDisposition() == "Recommended for Denial") {
				scienceDate = fTask.getStatusDate();
				logDebug("status Date" + scienceDate);
			}
			if (fTask.getTaskDescription()== "Administrative Review" && fTask.getDisposition() == "Incomplete Response") {
				var tempdate = fTask.getAssignmentDate();
				asgnDateAR = new Date(tempdate.getMonth() + "/" + tempdate.getDayOfMonth() + "/" + tempdate.getYear());
				adminReview = true;
			}
			if (fTask.getTaskDescription()== "Owner Application Reviews" && fTask.getDisposition() == "Incomplete Response") {
				var tempdate = fTask.getAssignmentDate();
				asgnDateOR = new Date(tempdate.getMonth() + "/" + tempdate.getDayOfMonth() + "/" + tempdate.getYear());
				ownerReview = true;
			}
			if (fTask.getTaskDescription()== "Scientific Review" && fTask.getDisposition() == "Incomplete Response") {
				var tempdate = fTask.getAssignmentDate();
				asgnDateSR = new Date(tempdate.getMonth() + "/" + tempdate.getDayOfMonth() + "/" + tempdate.getYear());
				scienceReview = true;
			}
			if (fTask.getTaskDescription()== "CEQA Review" && fTask.getDisposition() == "Incomplete Response") {
				var tempdate = fTask.getAssignmentDate();
				asgnDateCR = new Date(tempdate.getMonth() + "/" + tempdate.getDayOfMonth() + "/" + tempdate.getYear());
				ceqaReview = true;
			}
		}
		if(scienceDate == null && adminDate == null) {
			showMessage = true;
			comment("No Recommended for Denial status found.  License Manager task remains active.");
		}
		if(scienceDate >= adminDate) {
			if(scienceReview == false && ceqaReview == false) {
				activateTask("Science Manager Review");
				showMessage = true;
				comment("No Incomplete Response status found.  Science Manager Review was activated.");
			}
			deactivateTask("License Manager");			
			if(scienceReview) {
				activateTask("Scientific Review");	
				if(asgnDateSR != null)
					updateTaskAssignedDate("Scientific Review", asgnDateSR);
			}
			if(ceqaReview) {
				activateTask ("CEQA Review");
				if(asgnDateCR != null)
					updateTaskAssignedDate("CEQA Review", asgnDateCR);
			}				
		}
		else {
			if(adminReview == false && ownerReview == false) {
				activateTask("Administrative Manager Review");
				showMessage = true;
				comment("No Incomplete Response status found.  Administrative Manager Review was activated.");
			}
			deactivateTask("License Manager");
			if(adminReview) {
				activateTask("Administrative Review");
				if(asgnDateAR != null)
					updateTaskAssignedDate("Administrative Review", asgnDateAR);
			}
			if(ownerReview) {
				activateTask ("Owner Application Reviews");
				if(asgnDateOR != null)
					updateTaskAssignedDate("Owner Application Review", asgnDateOR);
			}
		}
	}  
}catch(err){
	aa.print("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: activate task after Reviesions Required status: " + err.message);
	aa.print(err.stack);
}
//mhart 190408 story 5953 - end
