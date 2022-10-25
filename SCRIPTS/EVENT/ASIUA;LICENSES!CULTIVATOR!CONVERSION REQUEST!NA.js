try {
	pId = AInfo["License Number"]; 
	plId = aa.cap.getCapID(pId).getOutput();
	pAltId = plId.getCustomID();
	cIds = getChildren("Licenses/Cultivator/License/License");
	if(!matches(cIds, null,"",undefined)) {
		if(cIds.length > 0) {
			for( c in cIds) {
				found = false;
				child = cIds[c].getCustomID();
				logDebug("plid " + pAltId + " child " + child);
				if(pAltId == child) {
					continue;
				}
				if(LICENSERECORDSFORCONVERSION.length > 0) {
					for (x in LICENSERECORDSFORCONVERSION){
						licId = getApplication(LICENSERECORDSFORCONVERSION[x]["License Record ID"]);
						licAltId = licId.getCustomID();
						logDebug("licid " + licAltId + " chi;d " + child);
						if(licAltId == child)
							found = true;
					}	
				}
				logDebug("found " + found);
				if(found == false) {
					aa.cap.removeProjectChild(capId, cIds[c])
					logDebug("removed child " + child);
				}
			}
		}
	}		
	if(LICENSERECORDSFORCONVERSION.length > 0){
		if (typeof(LICENSERECORDSFORCONVERSION) == "object") {
			for (x in LICENSERECORDSFORCONVERSION){
				licId = getApplication(LICENSERECORDSFORCONVERSION[x]["License Record ID"]);
				found = false;
				if(!matches(cIds, null,"",undefined)) {
					for(c in cIds) {
						if(licId.getCustomID() == cIds[c].getCustomID())
							found = true;
					}
				}
				if(!found) {
				aa.cap.createAppHierarchy(capId,licId);
				logDebug("added child " + LICENSERECORDSFORCONVERSION[x]["License Record ID"]);	
				}
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA:Licenses/Cultivation/Conversion Request/*: Update conversion license table: " + err.message);
	logDebug(err.stack);
}
