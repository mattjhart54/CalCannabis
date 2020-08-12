try {
	if(wfStatus == "Approved") {
		if (typeof(TAQREQUEST) == "object") {
			for(r in TAQREQUEST) {
				licenseNumber = TAQREQUEST[r]["License Number"];
				licenseCapId = aa.cap.getCapID(licenseNumber).getOutput();
				if (matches(TAQREQUEST[r]["Increase Type"],"Permitted")) {
					editAppSpecific("Current Plant Tags",TAQREQUEST[r]["New Plant Tags"],licenseCapId);
					editAppSpecific("Current Package Tags",TAQREQUEST[r]["New Package Tags"],licenseCapId);
				}
				if (matches(TAQREQUEST[r]["Increase Type"],"One-Time")) {
					editAppSpecific("One-Time Increase Plant Tags",TAQREQUEST[r]["One-Time Plant Tags"],licenseCapId);
					editAppSpecific("One-Time Increase Package Tags",TAQREQUEST[r]["One-Time Package Tags"],licenseCapId);
					editAppSpecific("One-Time Increase Expiration Date",TAQREQUEST[r]["One-Time Expiration Date"],licenseCapId);
				}
				// link the tag request record as a child to the license record
			}	
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/TAG REQUEST/NA " + err.message);
	logDebug(err.stack);
}
