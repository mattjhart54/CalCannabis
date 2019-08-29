//lwacht: if defer payment is used, then re-invoice the fees and turn the associated forms into real records
//lwacht: 171108: and send email
//lwacht: 171116: not sure what's going on but this doesn't work
/*
try{
	var newFeeFound = false;
	var targetFees = loadFees(capId);
	for (tFeeNum in targetFees) {
		targetFee = targetFees[tFeeNum];
			if (targetFee.status == "NEW") {
				newFeeFound = true;
			}
	}
	if(newFeeFound){
		var invNbr = invoiceAllFees();
		var chIds = getChildren("Licenses/Cultivator/* /*",capId);
		for(rec in chIds){
			var chCapId = chIds[rec]
			if(getCapIdStatusClass(chCapId) == "INCOMPLETE EST"){
				var chCapModel = aa.cap.getCapViewBySingle4ACA(chCapId);
				convert2RealCAP(chCapModel);
			}
		}
	}
	aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: CTRCB:LICENSES/CULTIVATOR/* /APPLICATION: Convert Assoc Forms: "+ startDate, capId + br + message + br + currEnv);
} catch(err){
	logDebug("An error has occurred in CTRCB:LICENSES/CULTIVATOR/* /APPLICATION: Convert Assoc Forms: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCB:LICENSES/CULTIVATOR/* /APPLICATION: Convert Assoc Forms: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
*/



// IAS User Story Prod Defect 6135 - record app, the business, DRP, and ASOP contacts are missing.

try {
	var applContactResult = aa.people.getCapContactByCapID(capId);
	if (applContactResult.getSuccess()){
		var applContacts = applContactResult.getOutput();
		var cntDRP = false;
		var cntBusiness =false;
		var cntASOP = false;
		
		for (a in applContacts){
			if(applContacts[a].getCapContactModel().getContactType()== "Designated Responsible Party") 
				cntDRP=true;
			if(applContacts[a].getCapContactModel().getContactType()== "Business") 
				cntBusiness=true;
			if(applContacts[a].getCapContactModel().getContactType()== "Agent for Service of Process") 
				cntASOP=true;	
		}
		
		if(cntDRP = false) {
			cancel=true;
			showMessage=true;
			comment("No required Designated Responsible Party contact has been entered on the application.  Please add before submitting the application");
		}
		if(cntBusiness = false) {
			cancel=true;
			showMessage=true;
			comment("There must be one and only one Business contact");
		}
		if(cntASOP = false) {
			cancel=true;
			showMessage=true;
			comment("There must be one and only one Agent for Service Process contact");
		}
		
	}
			
} catch(err){
	logDebug("An error has occurred in CTRCB;LICENSES!CULTIVATOR!~!APPLICATION.js: Check Number of contacts " + err.message);
	logDebug(err.stack);
}