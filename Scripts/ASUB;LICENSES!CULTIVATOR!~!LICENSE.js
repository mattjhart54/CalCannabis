try {
//MJH 190411 story 5977 - Only License Manager or Legal staff can revoke a license
	if(appStatus == "Revoked") { 
		if(!matches(currentUserGroup,"LicensesManager","LegalStaff")) {
			cancel = true;
			showMessage = true;
			comment("Only the License Manager or Legal staff can Revoke a license");
		}
	}
	//MJH 190411 story 5977 - end
}catch(err){
	logDebug("An error has occurred in ASUB:LICENSES/CULTIVATOR/*/APPLICATION: Revoke License Check: " + err.message);
	logDebug(err.stack);
}