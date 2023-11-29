try {
//MJH 082719 Story 6162,6163 - Updated script to create License record type License/Cultivator/License/License, set the record Id prefix to CCL, 
//update new custom fields Cultivator Type and License Issued Type and to include Cultivator type in the application name.
	// JS 01312023 7315 - Need to get PaymentTotalPaidAmount for Deferral Approved Script Since Mater Script is not run
	var PaymentTotalPaidAmount  = aa.env.getValue("PaymentTotalPaidAmount");
	if((balanceDue<=PaymentTotalPaidAmount  && isTaskActive("Application Disposition")) || AInfo['Deferral Approved'] == "CHECKED"){
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
			editAppSpecific("Original License Type", AInfo["License Type"], licCapId);
			if (appTypeArray[2] != "Temporary") {
				addToCat(licCapId); //send active license to CAT
			}
			
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
// Story 7700: Update License Renewal History table upon license
		var LICENSERENEWALHISTORY = new Array();
		var toRow = new Array();
	
		var expDateObj = new Date(expDate);
		var renYear = expDateObj.getFullYear();
	
		toRow["Renewal Year"] = "" + String(renYear);
		toRow["License Expiration"] = "" + String(expDate);
		toRow["License Status"] = "Active";
		toRow["Limited Operation"] = "";
		toRow["License Type"] = "" + (AInfo['License Type'] || ""); 
		toRow["Canopy Square Feet"] = "" + (AInfo['Canopy SF'] || "");
		toRow["Canopy Plant Count"] = "" + (AInfo['Canopy Plant Count'] || "");
		toRow["Canopy Square Footage Limit"] = "" + (AInfo['Canopy SF Limit'] || "");
		
		LICENSERENEWALHISTORY.push(toRow);
		addASITable("LICENSE RENEWAL HISTORY", LICENSERENEWALHISTORY, licCapId);
// Story 7750: Create Equity Fee Relief Table Entry
		var recordASIGroup = aa.appSpecificInfo.getByCapID(capId);
		if (recordASIGroup.getSuccess()){
			var recordASIGroupArray = recordASIGroup.getOutput();
			var equityTable = new Array();
			var equityRow = new Array(); 

			for (i in recordASIGroupArray) {
				var group = recordASIGroupArray[i];
				if (String(group.getCheckboxType()) == "EQUITY FEE RELIEF"){
					recordField = String(group.getCheckboxDesc());
					fieldValue = group.getChecklistComment();
					if (!matches(fieldValue,null,undefined,"")){
						equityRow[recordField] = "" + String(fieldValue);
					}
									
				}
			}
			if (Object.keys(equityRow).length > 0){
				equityRow["Relief Record Number"] = "" + capId.getCustomID();
				equityTable.push(equityRow);
				addASITable("EQUITY FEE RELIEF", equityTable, licCapId);
			}
		}
	}	
}catch(err){
	logDebug("An error has occurred in PRB:LICENSES/CULTIVATOR/*/APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}

//mhart 082719 Story 6162 and 6163 end

//lwacht 171112
//user cannot over or under pay
/* lwacht 171207 not doing
try{
	var amtFee = 0;
	var amtPaid = 0;
	var ttlFee = 0;
	var feeSeq_L = new Array(); 
	var paymentPeriod_L = new Array(); 
	var invoiceResult_L = false;
	var retVal = false;
	var feeResult = aa.finance.getFeeItemByCapID(capId);
	if (feeResult.getSuccess()) {
		var feeArray = feeResult.getOutput();
		for (var f in feeArray) {
			var thisFeeObj = feeArray[f];
			if (thisFeeObj.getFeeitemStatus() == "INVOICED") {
				amtFee += thisFeeObj.getFee();
				var pfResult = aa.finance.getPaymentFeeItems(capId, null);
				if (pfResult.getSuccess()) {
					var pfObj = pfResult.getOutput();
					for (ij in pfObj){
						if (thisFeeObj.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()){
							amtPaid += pfObj[ij].getFeeAllocation();
						}
					}
				}
			}
		}
		ttlFee = amtFee - amtPaid;
		//logDebug("ttlFee: " + ttlFee) 
		if(parseFloat(ttlFee)!= parseFloat(PaymentTotalPaidAmount)){
			//showMessage = true;
			//cancel = true;
			//comment("Amount applied ($" + parseFloat(PaymentTotalPaidAmount).toFixed(2) +") is not equal to the balance due of $" + ttlFee.toFixed(2) + ".");
		}
	}
}catch(err){
	logDebug("An error has occurred in PRB:LICENSES/CULTIVATOR/* /APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}
*/
