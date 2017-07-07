//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
try{
	if(balanceDue<=0 && isTaskActive("Application Disposition")){
		var licCapId = createLicense("Active",false);
		if(licCapId){
			var currCapId = capId;
			var arrChild = getChildren("Licenses/Cultivator/*/Owner Application");
			var childSupport = false;
			for(ch in arrChild){
				var capId = arrChild[ch];
				if(appHasCondition("Owner History","Applied","Non-compliant Child Support",null)){
					childSupport = true;
				}
				logDebug("arrChild[ch]: " + arrChild[ch].getCustomID());
				copyContactsByType(arrChild[ch], licCapId, "Individual");
			}
			capId = currCapId;
			if(childSupport){
				var expDate = dateAdd(null,120);
			}else{
				var expDate = dateAddMonths(null,12);
			}
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
			editContactType("Individual", "Owner",licCapId);
			var contApp = getContactObj(capId, "Applicant");
			if(childSupport){
				var newAppName = "TEMPORARY LICENSE - " + AInfo["Premise County"] + " - " + AInfo["License Type"];
			}else{
				var newAppName = AInfo["Premise County"] + " - " + AInfo["License Type"];
			}
			editAppName(newAppName);
			var contPri = getContactObj(licCapId,"Primary Contact");
			//capId = licCapId;
			//contactSetPrimary(contPri.seqNumber);
			//capId = currCapId;
			closeTask("License Issuance","Issued","Updated via PRA:LICENSES/CULTIVATOR/*/APPLICATION","");
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}
