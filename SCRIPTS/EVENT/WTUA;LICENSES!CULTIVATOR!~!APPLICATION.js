//lwacht: send a deficiency email when the status is "Additional Information Needed"
try{
	if("Administrative Review".equals(wfTask) && "Additional Information Needed".equals(wfStatus)){
		if(DEFICIENCIES.length>0){
			var eText = "Your application " + capIDString + " needs more information.  Please log into ACA, create an amendment record, and supply the following information: " + br;
			for(row in DEFICIENCIES){
				if(DEFICIENCIES[row]["Status"]=="Deficient"){
					eText += br + "     - " + DEFICIENCIES[row]["Field or Document Name"] + ": " + DEFICIENCIES[row]["Deficiency Details"];
				}
			}
			eText += br + br + "Thank you. " + br + "Your friendly Cannabis processor";
			var appContact = getContactObj(capId,"Applicant");
			email(appContact.capContact.getEmail(), sysFromEmail, "Deficiency Notice for " +capIDString, eText);
		}else{
			showMessage = true; 
			comment("The Deficiency table is empty.  No email will be sent.");
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/* /APPLICATION: License Issuance: " + err.message);
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