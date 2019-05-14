//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
//mhart 100918 Story 5738 and 5739 Update code to create provisional license record.
try {
	if(balanceDue<=ppPaymentAmount  && isTaskActive("Application Disposition")){
		var annualLic = false;
		if(isTaskStatus("Final Review","Approved for Annual License")) {
			annualLic = true;
			var licCapId = createLicense("Active",false);
		}
		else {
			var licCapId = createParent("Licenses","Cultivator",appTypeArray[2],"Provisional",appTypeArray[2])
		}
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
			}else{
				var expDate = dateAddMonths(null,12);
			}
			if(annualLic) {
				setLicExpirationDate(licCapId,null,expDate,"Active");
				if(appTypeArray[2]=="Adult Use"){
					var newAltFirst = "CAL" ;
				}else{
					var newAltFirst = "CML";
				}
				closeTask("Application Disposition","License Issued","Updated via PRA:LICENSES/CULTIVATOR/*/APPLICATION","");
			}
			else {
				setLicExpirationDate(licCapId,null,expDate,"Active");
				if(appTypeArray[2]=="Adult Use"){
					var newAltFirst = "PAL" ;
				}else{
					var newAltFirst = "PML";
				}
				closeTask("Application Disposition","Provisional License Issued","Updated via PRA:LICENSES/CULTIVATOR/*/APPLICATION","");				
			}
			var newAltLast = capIDString.substr(3,capIDString.length());
			var newAltId = newAltFirst + newAltLast;
			var updAltId = aa.cap.updateCapAltID(licCapId,newAltId);
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			}else{
				logDebug("License record ID updated to : " + newAltId);
			}

			//mhart removed county from the app name
			if(childSupport){
				var newAppName = "TEMPORARY - " + AInfo["License Type"];
			}else{
				var newAppName = AInfo["License Type"];
			}
			//logDebug("workDescGet(capId): " + workDescGet(capId));
			//logDebug("getShortNotes(): " + getShortNotes());
			//logDebug("newAppName: " + newAppName);
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
//mhart 100918 Story 5738 and 5739 end