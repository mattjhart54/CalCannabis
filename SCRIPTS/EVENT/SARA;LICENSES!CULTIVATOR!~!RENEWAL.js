//SaveAndResumeAfter4ACA for LICENSES!CULTIVATOR!~!RENEWAL

try{
	var expDateJS = new Date(AInfo["Expiration Date"]);
	var effectiveDate = lookup("EFFECTIVE_DATE_RENEWALS", "effectiveDate");
	var effectiveDateJS = new Date(effectiveDate);
	
	logDebug("expDateJS: " +  expDateJS);
	logDebug("effectiveDateJS: " + effectiveDateJS);
	
	if (expDateJS > effectiveDateJS) {
		//check ASI values for new ASI fields
		var licExpDateChange = AInfo["License Expiration Date Change"];
		var licChange = AInfo["License Change"];
		var limitedOperation = AInfo["Limited Operation"];
		
		//if any of them are missing, force the user to start at the beginning when they resume the renewal
		if (!licExpDateChange || !licChange || !limitedOperation) {
			//wipe out the save and resume values from PERMIT_TEMPORARY_DATA 
			aa.sendMail("noreply@cannabis.ca.gov", "evontrapp@etechconsultingllc.com", "", "Event Output 1", debug);
		}
	}
	aa.sendMail("noreply@cannabis.ca.gov", "evontrapp@etechconsultingllc.com", "", "Event Output 2", debug);
} catch(err) {
    logDebug("An error has occurred in SARA:LICENSES/CULTIVATOR/* /RENEWAL: Update AltId: " + err.message);
    logDebug(err.stack);
    aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}