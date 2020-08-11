try {
	if(wfStatus == "Approved") {
		if (typeof(TAQ_REQUEST) == "object") {
			for(r in TAQ_REQUEST) {
				licId = TAQ_REQUEST[r]["License Number"];
				if matches(TAQ_REQUEST["Increase Type"],"Permitted") {
					editAppSpecific(licId,"Current Plant Tags",TAQ_REQUEST[r]["New Plant Tags"]);
					editAppSpecific(licId,"Current Package Tags",TAQ_REQUEST[r]["New Package Tags"]);
				}
				if matches(TAQ_REQUEST["Increase Type"],"One-Time") {
					editAppSpecific(licId,"One-Time Increase Plant Tags",TAQ_REQUEST[r]["One-Time Plant Tags"]);
					editAppSpecific(licId,"One-Time Increase Package Tags",TAQ_REQUEST[r]["One-Time Package Tags"]);
					editAppSpecific(licId,"One-Time Increase Expiration Date",TAQ_REQUEST[r]["One-Time Expiration Date"]);
				}
				// link the tag request record as a child to the license record
			}	
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/TAG REQUEST/NA: Request Approved/Rejected " + err.message);
	logDebug(err.stack);
}