//lwacht
//remove conditions after documents are uploaded
try{
	var cType = "License Required Documents";
	var capCondResult = aa.capCondition.getCapConditions(capId,cType);
	if (!capCondResult.getSuccess()){
		logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()) ; 
	}else{
		var ccs = capCondResult.getOutput();
		for (pc1 in ccs){
			var rmCapCondResult = aa.capCondition.deleteCapCondition(capId,ccs[pc1].getConditionNumber()); 
			if (rmCapCondResult.getSuccess())
				logDebug("Successfully removed condition to CAP : " + capId + "  (" + cType + ") ");
			else
				logDebug( "**ERROR: removing condition  (" + cType + "): " + rmCapCondResult.getErrorMessage());
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Remove Conditions: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Remove Conditions: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
//mhart
//send local auth notification and update work description with Legal Business Name
//lwacht: don't run for temporary app 
try {
	if(appTypeArray[2]!="Temporary"){
//		sendLocalAuthNotification();
		updateLegalBusinessName();
		editAppName(AInfo["License Type"]);
		updateShortNotes(AInfo["Premise County"]);
	}
}catch (err){
	logDebug("A JavaScript Error occurred: CTRCA: Licenses/Cultivation/*/Application: Local Auth: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/*/Application: Local Auth: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//mhart 05/03/18 user story 5447 - remove rletaed record relation between Temp and annual applications
//lwacht
//add child if app number provided
/*
try{
	if(!matches(AInfo["Temp App Number"],null,"", "undefined")){
		var tmpID = aa.cap.getCapID(AInfo["Temp App Number"]);
		if(tmpID.getSuccess()){
			var childCapId = tmpID.getOutput();
			var parId = getParentByCapId(childCapId);
			if(parId){
				var linkResult = aa.cap.createAppHierarchy(capId, parId);
				if (!linkResult.getSuccess()){
					logDebug( "Error linking to parent application parent cap id (" + capId + "): " + linkResult.getErrorMessage());
				}
			}else{
				var linkResult = aa.cap.createAppHierarchy(capId, childCapId);
				if (!linkResult.getSuccess()){
					logDebug( "Error linking to temp application(" + childCapId + "): " + linkResult.getErrorMessage());
				}
			}				
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR//APPLICATION: Relate Temp Record: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR//APPLICATION: Relate Temp Record: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
*/
//mhart 05/03/18 user story 5447 - end

//lwacht: if defer payment is used, then re-invoice the fees and turn the associated forms into real records
//lwacht: 171108: and send email
//lwacht: 171112: moving from CTRCB for time being
//lwacht: 171115: CTRCB runs in av.preprod so modifying the code based on evironment
//lwacht: 171116: CTRCB doesn't invoice fees. 
try{
//	if(matches(currEnv, "av.test", "av.supp")){
		newFeeFound = false;
		var targetFees = loadFees(capId);
		for (tFeeNum in targetFees) {
			targetFee = targetFees[tFeeNum];
				if (targetFee.status == "NEW") {
					newFeeFound = true;
				}
		}
		if(newFeeFound){
			var invNbr = invoiceAllFees();
			var chIds = getChildren("Licenses/Cultivator/*/*",capId);
			for(rec in chIds){
				var chCapId = chIds[rec];
				logDebug("chCapId: " + chCapId.getCustomID());
				if(getCapIdStatusClass(chCapId) == "INCOMPLETE EST"){
					var chCapModel = aa.cap.getCapViewBySingle4ACA(chCapId);
					if(chCapModel==null){
						var chCapModel = aa.cap.getCapViewBySingle(chCapId);
					}
					if(chCapModel!=null){
						var newRec = convert2RealCAP(chCapModel);
						if(newRec){
							var docObj = aa.cap.transferRenewCapDocument(chCapId,newRec.getCapID(), true); 
							if(!docObj.getSuccess()){
								aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Migrate Documents: "+ startDate, capId + br + "docObj: " + docObj.getErrorMessage() + br + currEnv);
							}
						}
					}else{
						aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Convert to real records: "+ startDate, capId + br + "docObj: " + "chCapId: " + chCapId.getCustomID() + br + currEnv);
					}
				}
			}
			//do not put this in CTRCB
			runReportAttach(capId,"CDFA_Invoice_Params", "capID", capId, "invoiceNbr", ""+invNbr, "agencyid","CALCANNABIS");
			runReportAttach(capId,"Cash Payment Due Letter", "altId", capId.getCustomID(), "contactType", "Designated Responsible Party");
			emailRptContact("CTRCA", "LCA_GENERAL_NOTIFICATION", "CDFA_Invoice_Params", true, capStatus, capId, "Designated Responsible Party", "capID", capId.getCustomID(), "invoiceNbr", ""+invNbr, "agencyid","CALCANNABIS");
			updateAppStatus("Application Fee Due", "Updated via CTRCA:LICENSES/CULTIVATOR/* /APPLICATION.");
			deactivateTask("Owner Application Reviews");
			var priContact = getContactObj(capId,"Designated Responsible Party");
			if(priContact){
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Email") > -1 || priChannel.indexOf("E-mail") > -1){
						deactivateTask("Administrative Review");
					}
				}
			}
			//lwacht: the order of CTRCA for parent and associated forms seems to be random, so updating alt ID here as well.
			//declarations
			var arrDecChild = getChildren("Licenses/Cultivator/*/Declaration", capId);
			if(arrDecChild){
				for(ch in arrDecChild){
					var chCapId =arrDecChild[ch];
					var newAltId = capId.getCustomID() + "-DEC";
					var updateResult = aa.cap.updateCapAltID(chCapId, newAltId);
					var newIdErrMsg = updateResult.getErrorMessage() +"; ";
					if (updateResult.getSuccess()) {
						logDebug("Updated Declaration record AltId to " + newAltId + ".");
					}else {
						logDebug("Error renaming declar record " + capId + ":  " + newIdErrMsg);
						//aa.sendMail(sysFromEmail, debugEmail, "", " CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Error renaming declar record : " + startDate, capId + ": "+ newIdErrMsg);
					}
				}
			}
			//declarations
			var arrOwnChild = getChildren("Licenses/Cultivator/*/Owner Application", capId);
			if(arrOwnChild){
				for(ch in arrOwnChild){
					var chCapId =arrOwnChild[ch];
					nbrToTry = 1;
					//because owners can be added and deleted, need a way to number the records
					//but only if they haven't been numbered before
					if(chCapId.getCustomID().substring(0,3)!="LCA"){
						var ownerGotNewAltId = false;
						var newIdErrMsg = "";
						for (i = 0; i <= 100; i++) {
							if(nbrToTry<10){
								var nbrOwner = "00" + nbrToTry;
							}else{
								if(nbrToTry<100){
									var nbrOwner = "0" + nbrToTry
								}
								var nbrOwner = ""+ nbrToTry;
							}
							var newAltId = capId.getCustomID() + "-" + nbrOwner + "O";
							var updateResult = aa.cap.updateCapAltID(chCapId, newAltId);
							if (updateResult.getSuccess()) {
								logDebug("Updated owner record AltId to " + newAltId + ".");
								ownerGotNewAltId = true;
								break;
							}else {
								newIdErrMsg += updateResult.getErrorMessage() +"; ";
								nbrToTry++;
							}
						}
						if(!ownerGotNewAltId){
							logDebug("Error renaming owner record " + capId + ":  " + newIdErrMsg);
							//aa.sendMail(sysFromEmail, debugEmail, "", "CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Error renaming owner record " + capId + ": " + startDate, newIdErrMsg);
						}
					}else{
						logDebug("Owner record AltId already updated: "+ capId.getCustomID());
					}
				}
			}			//end do not put this in CTRCB
		}
	//}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Convert Assoc Forms: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Convert Assoc Forms: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht 180208: story 5200: updating file date
try{
	editAppSpecific("Created Date", fileDate);
	updateFileDate(null);
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Force file date to be submission date: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Force file date to be submission date: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//lwacht 180208: story 5200: end

//mhart 180321: story 5376: add live scan required condition
try{
	if(appTypeArray[2]!="Temporary"){
		lScan = lookup("LIVESCAN_NOT_AVAILABLE","LIVESCAN_NOT_AVAILABLE");
		if (lScan == true) {
			addStdCondition("Application Condition","LiveScan Required");
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Add livescan required condition: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Add livescan required condition: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart 180321: story 5376: end

//lwacht: 180216: story 5177: adding this back in
// mhart: Comment out report to test payment processor time out issue
//lwacht: create submission report

try{
	//lwacht: 180108: defect 5120: don't run for temporary
	if(appTypeArray[2]!="Temporary"){
		//lwacht: 180220: story 5177: completed app report needs to run in a (un)specified amount of time
		var eTxt = "";
		var sDate = new Date();
		var sTime = sDate.getTime();
		var scriptName = "asyncRunComplApplicRpt";
		var envParameters = aa.util.newHashMap();
		envParameters.put("sendCap",capIDString); 
		envParameters.put("currentUserID",currentUserID);
		aa.runAsyncScript(scriptName, envParameters);
		var thisDate = new Date();
		var thisTime = thisDate.getTime();
		var eTime = (thisTime - sTime) / 1000;
		logDebug("elapsed time: " + eTime + " seconds.");
		//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: "+ startDate, capId + br +"elapsed time: " + eTime + " seconds. " + br + "capIDString: " + capIDString + br + currEnv);
	}
	//lwacht: 180108: defect 5120: end
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//lwacht: 180216: story 5177: end

//lwacht: if defer payment is used, then re-invoice the fees and turn the associated forms into real records
//lwacht: 171108: and send email

/*lwacht: 180419: story 5441: report only populates in async mode -moving back to PRA in hopes it works there to make the logic easier
//mhart 180409 user story 5391 - Send submitted application notice when the application fee is paid in full
try {
	if(appTypeArray[2]!="Temporary"){
		//using logic from above
		//no new fee = not selecting cash payment
		if(!newFeeFound){
			contType = "Designated Responsible Party";
			addrType = "Mailing";
			var liveScanNotActive = lookup("LIVESCAN_NOT_AVAILABLE","LIVESCAN_NOT_AVAILABLE");
			if(!matches(liveScanNotActive,true, "true")){
				//runReportAttach(capId,"Submitted Annual Application", "Record ID", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
				var scriptName = "asyncRunSubmittedApplicRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("sendCap",capIDString); 
				envParameters.put("reportName","Submitted Annual Application"); 
				envParameters.put("contType",contType); 
				envParameters.put("addrType",addrType); 
				envParameters.put("currentUserID",currentUserID);
				aa.runAsyncScript(scriptName, envParameters);
			}else{
				var scriptName = "asyncRunSubmittedApplicRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("sendCap",capIDString); 
				envParameters.put("reportName","Submitted Annual App No LiveScan"); 
				envParameters.put("contType",contType); 
				envParameters.put("addrType",addrType); 
				envParameters.put("currentUserID",currentUserID);
				aa.runAsyncScript(scriptName, envParameters);
			}	
			emailRptContact("ASIUA", "LCA_APPLICATION _SUBMITTED", "", false, capStatus, capId, contType);	
			//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY : CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: " + startDate, "capId: " + capId + ": " + br + contType + br + addrType + br + capId.getCustomID() + br + debug);
		}
	}
}catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Attach submitted letter: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Attach submitted letter: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart 180409 user story 5391 - end
//lwacht: 180419: story 5441: end */



//lwacht: 171113: commenting out until CTRCB is figured out
//lwacht: 171115: CTRCB runs in preprod, so going to have this set up to not run in av.supp and av.test.
//lwacht: 171116: CTRCB doesn't invoice fees. Commenting this out for now
/*
try{
//	if(!matches(currEnv, "av.test", "av.supp")){
		if(balanceDue>0){
			var targetFees = loadFees(capId);
			for (tFeeNum in targetFees) {
				targetFee = targetFees[tFeeNum];
				if (targetFee.status == "INVOICED") {
					var feeSeq = targetFee.sequence;
				}
			}
			var invResObj = aa.finance.getFeeItemInvoiceByFeeNbr(capId, parseFloat(feeSeq), null);
			var X4invoices = invResObj.getOutput();
			var X4invoice = X4invoices[0]; 
			var invNbr=X4invoice.getInvoiceNbr(); 
			logDebug(invNbr);
			runReportAttach(capId,"CDFA_Invoice_Params", "capID", capId, "invoiceNbr", ""+invNbr, "agencyid","CALCANNABIS");
			runReportAttach(capId,"Cash Payment Due Letter", "altId", capId.getCustomID());
			emailRptContact("CTRCA", "LCA_GENERAL_NOTIFICATION", "CDFA_Invoice_Params", true, capStatus, capId, "Designated Responsible Party", "capID", capId.getCustomID(), "invoiceNbr", ""+invNbr, "agencyid","CALCANNABIS");
			updateAppStatus("Application Fee Due", "Updated via CTRCA:LICENSES/CULTIVATOR/* /APPLICATION.");
			deactivateTask("Owner Application Reviews");
			var priContact = getContactObj(capId,"Designated Responsible Party");
			if(priContact){
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Email") > -1 || priChannel.indexOf("E-mail") > -1){
						deactivateTask("Administrative Review");
					}
				}
			}
			//declarations
			var arrDecChild = getChildren("Licenses/Cultivator/* /Declaration", capId);
			if(arrDecChild){
				for(ch in arrDecChild){
					var chCapId =arrDecChild[ch];
					var newAltId = capId.getCustomID() + "-DEC";
					var updateResult = aa.cap.updateCapAltID(chCapId, newAltId);
					var newIdErrMsg = updateResult.getErrorMessage() +"; ";
					if (updateResult.getSuccess()) {
						logDebug("Updated Declaration record AltId to " + newAltId + ".");
					}else {
						logDebug("Error renaming declar record " + capId + ":  " + newIdErrMsg);
						aa.sendMail(sysFromEmail, debugEmail, "", " CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Error renaming declar record : " + startDate, capId + ": "+ newIdErrMsg);
					}
				}
			}
			//declarations
			var arrOwnChild = getChildren("Licenses/Cultivator/* /Owner Application", capId);
			if(arrOwnChild){
				for(ch in arrOwnChild){
					var chCapId =arrOwnChild[ch];
					nbrToTry = 1;
					//because owners can be added and deleted, need a way to number the records
					//but only if they haven't been numbered before
					if(chCapId.getCustomID().substring(0,3)!="LCA"){
						var ownerGotNewAltId = false;
						var newIdErrMsg = "";
						for (i = 0; i <= 100; i++) {
							if(nbrToTry<10){
								var nbrOwner = "00" + nbrToTry;
							}else{
								if(nbrToTry<100){
									var nbrOwner = "0" + nbrToTry
								}
								var nbrOwner = ""+ nbrToTry;
							}
							var newAltId = capId.getCustomID() + "-" + nbrOwner + "O";
							var updateResult = aa.cap.updateCapAltID(chCapId, newAltId);
							if (updateResult.getSuccess()) {
								logDebug("Updated owner record AltId to " + newAltId + ".");
								ownerGotNewAltId = true;
								break;
							}else {
								newIdErrMsg += updateResult.getErrorMessage() +"; ";
								nbrToTry++;
							}
						}
						if(!ownerGotNewAltId){
							logDebug("Error renaming owner record " + capId + ":  " + newIdErrMsg);
							aa.sendMail(sysFromEmail, debugEmail, "", "CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Error renaming owner record " + capId + ": " + startDate, newIdErrMsg);
						}
					}else{
						logDebug("Owner record AltId already updated: "+ capId.getCustomID());
					}
				}
			}
		}
//	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Convert Assoc Forms: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Convert Assoc Forms: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
*/
