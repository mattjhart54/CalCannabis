//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
try{
	if(balanceDue<=0 && isTaskActive("License Issuance"){
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
			var arrChild = getChildren("Licenses/Cultivator/*/Owner Application");
			for(ch in arrChild){
				copyContactsByType(arrChild[ch], licCapId, "Individual");
			}
			editContactType("Individual", "Owner",licCapId);
			var contApp = getContactObj(capId, "Applicant");
			var newAppName = AInfo["Premise County"] + " - " + AInfo["License Type"];
			editAppName();
			var contPri = getContactObj(licCapId,"Primary Contact");
			var currCapId = capId;
			capId = licCapId;
			contactSetPrimary(contPri.seqNumber);
			capId = currCapId;
			closeTask("License Issuance","Issued","Updated via PRA:LICENSES/CULTIVATOR/*/APPLICATION","");
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}