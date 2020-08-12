try {
	if(wfStatus == "Approved") {
		var tagRequest = loadASITable("TAQ REQUEST",capId); 
		if (typeof(tagRequest) == "object") {
			for(r in tagRequest) {
				licenseNumber = tagRequest[r]["License Number"];
				licenseCapId = aa.cap.getCapID(licenseNumber);
				if (matches(tagRequest[r]["Increase Type"],"Permitted")) {
					editAppSpecific("Current Plant Tags",tagRequest[r]["New Plant Tags"],licenseCapId);
					editAppSpecific("Current Package Tags",tagRequest[r]["New Package Tags"],licenseCapId);
				}
				if (matches(tagRequest[r]["Increase Type"],"One-Time")) {
					editAppSpecific("One-Time Increase Plant Tags",tagRequest[r]["One-Time Plant Tags"],licenseCapId);
					editAppSpecific("One-Time Increase Package Tags",tagRequest[r]["One-Time Package Tags"],licenseCapId);
					editAppSpecific("One-Time Increase Expiration Date",tagRequest[r]["One-Time Expiration Date"],licenseCapId);
				}
				// link the tag request record as a child to the license record
			}	
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/TAG REQUEST/NA " + err.message);
	logDebug(err.stack);
}
