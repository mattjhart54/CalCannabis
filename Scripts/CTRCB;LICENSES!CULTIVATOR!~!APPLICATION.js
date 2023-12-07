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
