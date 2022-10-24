try {
	pId = AInfo["License Number"]; 
	plId = aa.cap.getCapID(pId).getOutput();
	pAltId = plId.getCustomID();
	cIds = getChildren("Licenses/Cultivator/License/License");
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
				for(c in cIds) {
					if(licId.getCustomID() == cIds[c].getCustomID())
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
try {
	if(LAKEANDSTREAMBEDALTERATION.length>0) {
		var tblLSA = loadASITable("LAKE AND STREAMBED ALTERATION");
		var addRow = false;
		for(r in LAKEANDSTREAMBEDALTERATION) {
			if(LAKEANDSTREAMBEDALTERATION[r]["New Row"] == "CHECKED") {
				addRow = true;
				tblLSA[r]["New Row"] = "UNCHECKED";
				thisLSA = LAKEANDSTREAMBEDALTERATION[r];
				thisLSA["New Row"] = "UNCHECKED";
				thisLSA["Covered Activity"] = "";
				thisLSA["LSA Detail Latitude"] = "";
				thisLSA["LSA Detail Longitude"] = "";
				thisLSA["Covered Activity"] = "";
				thisLSA["APN"] = "";
				thisLSA["APN Latitude"] = "";
				thisLSA["APN Longitude"] = "";
				thisLSA["Adjacent APN"] = "";	
				tblLSA.push(thisLSA);
			}
		}
		if(addRow) {
			removeASITable("LAKE AND STREAMBED ALTERATION");
			addASITable("LAKE AND STREAMBED ALTERATION",tblLSA);
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA:Licenses/Cultivation/Conversion Request: Update LSA table: " + err.message);
	logDebug(err.stack);
}
