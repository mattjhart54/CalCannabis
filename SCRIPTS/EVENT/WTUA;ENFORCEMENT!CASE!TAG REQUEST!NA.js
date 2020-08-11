try {
	if(wfStatus == "Approved") {
		if (typeof(TAQREQUEST) == "object") {
			for(r in TAQREQUEST) {
				licId = TAQREQUEST[r]["License Number"];
				if (matches(TAQREQUEST["Increase Type"],"Permitted")) {
					editAppSpecific(licId,"Current Plant Tags",TAQREQUEST[r]["New Plant Tags"]);
					editAppSpecific(licId,"Current Package Tags",TAQREQUEST[r]["New Package Tags"]);
				}
				if (matches(TAQREQUEST["Increase Type"],"One-Time")) {
					editAppSpecific(licId,"One-Time Increase Plant Tags",TAQREQUEST[r]["One-Time Plant Tags"]);
					editAppSpecific(licId,"One-Time Increase Package Tags",TAQREQUEST[r]["One-Time Package Tags"]);
					editAppSpecific(licId,"One-Time Increase Expiration Date",TAQREQUEST[r]["One-Time Expiration Date"]);
				}
				// link the tag request record as a child to the license record
			}	
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/TAG REQUEST/NA " + err.message);
	logDebug(err.stack);
}
