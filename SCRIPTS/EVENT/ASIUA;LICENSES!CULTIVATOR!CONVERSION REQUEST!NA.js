try {
	pId = AInfo["License Number"]; 
	plId = aa.cap.getCapID(pId).getOutput(); 
	cIds = getChildren("Licenses/Cultivator/License/License");
	if(cIds.length > 0) {
		for( c in cIds) {
			found = false;
			child = cIds[c];
			logDebug("plid " + plId.getCustomID() + " child " + child.getCustomID());
			if(plId.getCustomID() == child.getCustomID()) {
				found = true;
			}
			logDebug("found " + found + " plid " + plId + " child " + child);
			if(LICENSERECORDSFORCONVERSION.length > 0) {
				for (x in LICENSERECORDSFORCONVERSION){
					licId = getApplication(LICENSERECORDSFORCONVERSION[x]["License Record ID"]);
					logDebug("licid " + plId + " chi;d " +child);
					if(licId == child)
						found = true;
				}
				if(found == false) {
					aa.cap.removeProjectChild(capId, child)
					logDebug("removed child " + child);
				}
			}else {
				if(found == false) {
					aa.cap.removeProjectChild(capId, child)
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
				for(c in cIds) {
					if(licId == cIds[c])
						found = true;
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
