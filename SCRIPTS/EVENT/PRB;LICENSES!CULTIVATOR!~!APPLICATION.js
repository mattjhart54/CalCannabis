//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
try{
	if(balanceDue<=PaymentTotalPaidAmount  && isTaskActive("Application Disposition")){
		var licCapId = createLicense("Active",false);
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
			setLicExpirationDate(licCapId,null,expDate,"Active");
			if(appTypeArray[2]=="Adult Use"){
				var newAltFirst = "CAL" ;
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
			//editContactType("Individual", "Owner",licCapId);
			//var contApp = getContactObj(capId, "Applicant");
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
			editAppSpecific("Valid From Date", sysDateMMDDYYYY, licCapId);
			//lwacht: 170823: removing primary contact
			//var contPri = getContactObj(licCapId,"Primary Contact");
			//capId = licCapId;
			//contactSetPrimary(contPri.seqNumber);
			//capId = currCapId;
			if (appTypeArray[2] != "Temporary") {
				addToCat(licCapId); //send active license to CAT
			}
			closeTask("Application Disposition","License Issued","Updated via PRA:LICENSES/CULTIVATOR/*/APPLICATION","");
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
}catch(err){
	logDebug("An error has occurred in PRB:LICENSES/CULTIVATOR/*/APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}

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
//lwacht: when the status is "Additional Information Needed" and the preferred channel is *not* email,
//display the deficiency report for printing
//lwacht: 170817: this isn't going to work because this is PRP, so just going to display a message in PRA that they will have 
//run the report themselves
/*
try{
	if(balanceDue<=0 && isTaskActive("Application Disposition")){
		showDebug=false;
		var priContact = getContactObj(capId,"Primary Contact");
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		var showReport = false;
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
				showReport = true;
			}
		}
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
				showReport = true;
			}
		}
		if(showReport){
			displayReport("ACA Permit", "agencyid", servProvCode,"capid", capId.getCustomID());
		}
	}
}catch(err){
	logDebug("An error has occurred in PRB:LICENSES/CULTIVATOR/* /APPLICATION: License Issuance Report: " + err.message);
	logDebug(err.stack);
}
*/
