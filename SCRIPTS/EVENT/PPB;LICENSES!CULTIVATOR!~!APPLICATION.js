try {
//MJH 082719 Story 6162,6163 - Updated script to create License record type License/Cultivator/License/License, set the record Id prefix to CCL, 
//                             update new custom fields Cultivator Type and License Issued Type and to include Cultivator type in the application name.
	if(balanceDue<=ppPaymentAmount  && isTaskActive("Application Disposition")){
		var annualLic = false;
		if(isTaskStatus("Final Review","Approved for Annual License")) {
			annualLic = true;
		}
		var licCapId = createLicenseBySubtype("Active","License",false);
		if(licCapId){
			var currCapId = capId;
			var arrChild = getChildren("Licenses/Cultivator/*/Owner Application");
			var childSupport = false;
			for(ch in arrChild){
				capId = arrChild[ch];
				if(appHasCondition("Owner History","Applied","Non-compliant Child Support",null)){
					childSupport = true;
				}
				//logDebug("arrChild[ch]: " + arrChild[ch].getCustomID());
				copyContactsByType(arrChild[ch], licCapId, "Owner");
			}
			capId = currCapId;
			if(childSupport){
				var expDate = dateAdd(null,120);
				setLicExpirationDate(licCapId,null,expDate,"Active");
			}else{
				var expDate = dateAddMonths(null,12);
				setLicExpirationDate(licCapId,null,expDate,"Active");
			}
			
			var newAltLast = capIDString.substr(3,capIDString.length());
			var newAltId = "CCL" + newAltLast;
			var updAltId = aa.cap.updateCapAltID(licCapId,newAltId);
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			}else{
				logDebug("License record ID updated to : " + newAltId);
			}

			//mhart removed county from the app name
			if(appTypeArray[2] == "Medical") {
				var cultivatorType =  "Medicinal";
			}
			else {
				var cultivatorType = "Adult-Use";
			}
			if(annualLic) {
				var issueType =  "Annual";
				closeTask("Application Disposition","License Issued","Updated via PRA:LICENSES/CULTIVATOR/*/APPLICATION","");
			} else {
				var issueType = "Provisional";
				closeTask("Application Disposition","Provisional License Issued","Updated via PRA:LICENSES/CULTIVATOR/*/APPLICATION","");
			}
			if(childSupport){
				var newAppName = "TEMPORARY - " + cultivatorType + " - " + AInfo["License Type"];
			}else{
				var newAppName = issueType + " " + cultivatorType + " - " + AInfo["License Type"];
			}
			editAppName(newAppName,licCapId);
			
// mhart 180326 User Story 5193 - add city to short notes that already displays county
			if(matches(AInfo["Premise City"], null, "")) {
				updateShortNotes(AInfo["Premise County"],licCapId);
			}
			else {
				updateShortNotes(AInfo["Premise City"] + " - " + AInfo["Premise County"],licCapId);
			}
// mhart 180326 User Story 5193 
			updateWorkDesc(workDescGet(capId),licCapId);
			copyAppSpecific(licCapId);
			copyASITables(capId,licCapId,"DEFICIENCIES","DENIAL REASONS");
			editAppSpecific("Valid From Date", sysDateMMDDYYYY, licCapId);
			editAppSpecific("Premise State", "CA", licCapId);
			editAppSpecific("Cultivator Type", cultivatorType, licCapId);
			editAppSpecific("License Issued Type", issueType, licCapId);
			if (appTypeArray[2] != "Temporary") {
				addToCat(licCapId); //send active license to CAT
			}
			
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}	
}catch(err){
	logDebug("An error has occurred in PRB:LICENSES/CULTIVATOR/*/APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}
//mhart 082719 Story 6162 and 6163 end
