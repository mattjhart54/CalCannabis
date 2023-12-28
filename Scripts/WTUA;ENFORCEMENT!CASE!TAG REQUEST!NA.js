try {
	if(wfStatus == "Approved") {
		if (typeof(TAGREQUEST) == "object") {
			for(r in TAGREQUEST) {
				licenseNumber = TAGREQUEST[r]["License Number"];
				licenseCapId = aa.cap.getCapID(licenseNumber).getOutput();
				if (matches(TAGREQUEST[r]["Increase Type"],"Permitted")) {
					editAppSpecific("Current Plant Tags",TAGREQUEST[r]["New Plant Tags"],licenseCapId);
					editAppSpecific("Current Package Tags",TAGREQUEST[r]["New Package Tags"],licenseCapId);
				}
				if (matches(TAGREQUEST[r]["Increase Type"],"One-Time")) {
					editAppSpecific("One-Time Increase Plant Tags",TAGREQUEST[r]["One-Time Plant Tags"],licenseCapId);
					editAppSpecific("One-Time Increase Package Tags",TAGREQUEST[r]["One-Time Package Tags"],licenseCapId);
					editAppSpecific("One-Time Increase Expiration Date",TAGREQUEST[r]["One-Time Expiration Date"],licenseCapId);
				}
				aa.cap.createAppHierarchy(licenseCapId,capId);
			}	
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/TAG REQUEST/NA " + err.message);
	logDebug(err.stack);
}
