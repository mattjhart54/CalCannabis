//lwacht: send a deficiency email when the status is "Additional Information Needed"
try{
	if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
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
			var newDefId = aa.cap.createSimplePartialRecord(ctm,newAppName, "INCOMPLETE CAP").getOutput();
			if(newDefId){
				//relate amendment to application
				var resCreateRelat = aa.cap.createAppHierarchy(capId, newDefId); 
				if (resCreateRelat.getSuccess()){
					logDebug("Child application successfully linked");
				}else{
					logDebug("Could not link applications: " + resCreateRelat.getErrorMessage());
				}
				copyASITables(capId,newDefId,["CANNABIS FINANCIAL INTEREST", "OWNERS", "ATTACHMENTS"]);
				copyContactsByType(capId, newDefId,"Applicant");
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
				//create the email text that will go to the primary contact
				var eText = "Your application " + capIDString + " needs more information.  Please log into ACA, find the following records, and supply the required information: " + br;
				eText += br + "Deficiencies for Application Record " + capName + " (" + newAltId + ") : ";
				for(row in DEFICIENCIES){
					if(DEFICIENCIES[row]["Status"]=="Deficient"){
						eText += br + "     - " + DEFICIENCIES[row]["Field or Document Name"] + ": " + DEFICIENCIES[row]["Deficiency Details"];
					}
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
						//populate the email
						var tblDefic = loadASITable("DEFICIENCIES",thisOwnCapId);
						if(tblDefic.length>0){
							eText += br + "Deficiencies for Owner Record " + ownAppName + " (" + newOAltId + ") : ";
							for(row in tblDefic){
								if(tblDefic[row]["Status"]=="Deficient"){
									eText += br + "     - " + tblDefic[row]["Field or Document Name"] + ": " + tblDefic[row]["Deficiency Details"];
								}
							}
						}
					}
				}
				eText += br + br + "Thank you. " + br + "Your Friendly Cannabis Processor";
				var priContact = getContactObj(capId,"Primary Contact");
				var appContact = getContactObj(capId,"Applicant");
				logDebug("email content: " + eText);
				if(priContact.capContact.getEmail()==appContact.capContact.getEmail()){
					email(appContact.capContact.getEmail(), sysFromEmail, "Deficiency Notice for " +capIDString, eText);
				}else{
					email(appContact.capContact.getEmail() +"; " + priContact.capContact.getEmail(), sysFromEmail, "Deficiency Notice for " +capIDString, eText);
				}
			}
		}else{
			showMessage = true; 
			comment("The Deficiency tables on this table and the child owner applications are empty.  No email will be sent.");
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
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