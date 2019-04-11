try {
//MJH 190411 story 5977 - Only License Manager or Legal staff can revoke a license
	logDebug("Status " + capStatus + " Group " + currentUserGroup)
	if(capStatus == "Revoked") { 
		if(!matches(currentUserGroup,"License Manager","Legal Staff")) {
			showMessage = true
			cancel = true;
			comment("Only the License Manager or Legal staff can Revoke a license");
			logDebug("got Here")
		}
	}
	//MJH 190411 story 5977 - end
}}catch(err){
	logDebug("An error has occurred in ASUB:LICENSES/CULTIVATOR/*/APPLICATION: Revoke License Check: " + err.message);
	logDebug(err.stack);
}