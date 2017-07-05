//lwacht: send a deficiency email when the status is "Additional Information Needed" 
try{
	if("Deficiency Letter Sent".equals(wfStatus)){
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
			var deficFound = false;
			var childOwner = getChildren("Licenses/Cultivator/*/Owner Application");
			for (row in childOwner){
				var ownCap = aa.cap.getCap(childOwner[row]).getOutput();
				var ownAppStatus = ownCap.getCapStatus();
				if(ownAppStatus=="Additional Information Needed"){
					deficFound = true;
				}
			}
			logDebug("DEFICIENCIES.length"+DEFICIENCIES.length);
			logDebug("deficFound"+deficFound);
			if(DEFICIENCIES.length>0 || deficFound){
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
					//relate amendment to application
					var resCreateRelat = aa.cap.createAppHierarchy(capId, newDefId); 
					if (resCreateRelat.getSuccess()){
						logDebug("Child application successfully linked");
					}else{
						logDebug("Could not link applications: " + resCreateRelat.getErrorMessage());
					}
					copyASITables(capId,newDefId,["CANNABIS FINANCIAL INTEREST", "OWNERS", "ATTACHMENTS"]);
					copyContactsByType(capId, newDefId,"Designated Responsible Party");
					copyContactsByType(capId, newDefId,"Primary Contact");
					//find out how many amendment records there have been so we can create an AltId
					var childAmend = getChildren("Licenses/Cultivator/Medical/Amendment");
					var cntChild = childAmend.length;
					cntChild ++;
					logDebug("cntChild: " + cntChild);
					if(cntChild<10){
						cntChild = "0" +cntChild;
					}
					var newAltId = capIDString +"-DEF"+ cntChild;
					logDebug("newAltId: " + newAltId);
					var updAltId = aa.cap.updateCapAltID(newDefId,newAltId);
					if(!updAltId.getSuccess()){
						logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
					}else{
						logDebug("Deficiency record ID updated to : " + newAltId);
					}
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
							ctm.setSubType("Medical");
							ctm.setCategory("Amendment");
							var newODefId = aa.cap.createSimplePartialRecord(ctm,newOwnAppName, "INCOMPLETE CAP").getOutput();
							if(newODefId){
								var resOCreateRelat = aa.cap.createAppHierarchy(thisOwnCapId, newODefId); 
								if (resOCreateRelat.getSuccess()){
									logDebug("Child application successfully linked");
								}else{
									logDebug("Could not link applications: " + resOCreateRelat.getErrorMessage());
								}
								copyASITables(thisOwnCapId,newODefId,["CANNABIS FINANCIAL INTEREST", "CONVICTIONS", "ATTACHMENTS"]);
								copyContacts(capId, newDefId);
								editContactType("Owner","Primary Contact",newODefId);
								//get the current number of deficiency children to set the AltId
								var childOAmend = getChildren("Licenses/Cultivator/Medical/Amendment");
								var cntOChild = childOAmend.length;
								cntOChild ++;
								logDebug("childOAmend.length: " + childOAmend.length);
								logDebug("cntOChild: " + cntOChild);
								if(cntOChild<10){
									cntOChild = "0" +cntOChild;
								}
								var newOAltId = thisOwnCapId.getCustomID() +"-DEF"  + cntOChild;
								logDebug("newOAltId: " + newOAltId);
								var updOAltId = aa.cap.updateCapAltID(newODefId,newOAltId);
								if(!updOAltId.getSuccess()){
									logDebug("Error updating Owner Alt Id: " + newOAltId + ":: " +updOAltId.getErrorMessage());
								}else{
									logDebug("Deficiency owner record ID updated to : " + newOAltId);
								}
							}
						}
					}
					//populate the email notification that will go to the primary contact
					var eParams = aa.util.newHashtable(); 
					addParameter(eParams, "$$wfDateMMDDYYYY$$", wfDateMMDDYYYY);
					currCapId = capId;
					capId = newDefId;
					getACARecordParam4Notification(eParams,acaUrl);
					capId = currCapId;
					var staffUser = new userObj(wfStaffUserID);
					staffUser.getEmailTemplateParams(eParams,"scientist")
					getWorkflowParams4Notification(eParams);
					var contPhone = priContact.capContact.phone1;
					var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
					addParameter(eParams, "$$contactPhone1$$", fmtPhone);
					addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
					addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
					addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
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
					var rParams = aa.util.newHashMap(); 
					rParams.put("agencyid", servProvCode);
					rParams.put("capid", capId.getCustomID());
					var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
					var rFile;
					rFile = generateReport(capId,"ACA Permit","Licenses",rParams);
					if (rFile) {
						var rFiles = [];
						rFiles.push(rFile);
						if(priContact.capContact.getEmail()==drpContact.capContact.getEmail()){
							sendNotification(sysFromEmail,drpEmail,"","LCA_DEFICIENCY",eParams, rFiles,capId);
						}else{
							if(emailPriReport){
								aa.document.sendEmailAndSaveAsDocument(sysFromEmail, priEmail + ";" + priEmail, "", "LCA_DEFICIENCY", eParams, capId4Email, rFiles,capId);
							}
							if(emailDRPReport){
								aa.document.sendEmailAndSaveAsDocument(sysFromEmail, drpEmail + ";" + priEmail, "", "LCA_DEFICIENCY", eParams, capId4Email, rFiles,capId);

							}
						}
					}
				}else{
					logDebug("Error creating deficiency record: " +resDefId.getErrorMessage());
				}
			}else{
				showMessage = true; 
				comment("The Deficiency tables on this table and the child owner applications are empty.  No email will be sent.");
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	logDebug(err.stack);
}

// lwacht: set the expiration date and task due date to ninety days in the future
try{
	if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		//set due date and expiration date
		editAppSpecific("App Expiry Date", dateAddMonths(null,3));
		if(isTaskStatus("Administrative Review", "Additional Information Needed") || isTaskStatus("Administrative Review","Incomplete Response")){
			editTaskDueDate("Administrative Review", dateAddMonths(null,3));
			activateTask("Administrative Review");
		}
		if(isTaskStatus("Owner Application Reviews", "Additional Information Needed") || isTaskStatus("Owner Application Reviews","Incomplete Response")){
			editTaskDueDate("Owner Application Reviews", dateAddMonths(null,3));
			activateTask("Owner Application Reviews");
		}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Admin Expiry Date: " + err.message);
	logDebug(err.stack);
}

// lwacht: set the expiration date and task due date to ninety days in the future
try{
	if("Science Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		//set due date and expiration date
		editAppSpecific("App Expiry Date", dateAddMonths(null,3));
		if(isTaskStatus("Scientific Review", "Additional Information Needed") || isTaskStatus("Scientific Review","Incomplete Response")){
			editTaskDueDate("Scientific Review", dateAddMonths(null,3));
			activateTask("Scientific Review");
		}
		if(isTaskStatus("CEQA Review", "Additional Information Needed") || isTaskStatus("CEQA Review","Incomplete Response")){
			editTaskDueDate("CEQA Review", dateAddMonths(null,3));
			activateTask("CEQA Review");
		}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Science Expiry Date: " + err.message);
	logDebug(err.stack);
}


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