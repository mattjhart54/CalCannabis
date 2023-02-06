try {
	//7332 - Update appName with License Type Change
	var appName = cap.getSpecialText();
	var newAppName = AInfo['License Issued Type'] + " " + AInfo['Cultivator Type'] + " - " + AInfo['License Type'];
	if (String(appName) != newAppName){
		editAppName(newAppName);
		addToCat(capId);
	}

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
	logDebug("A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: Update LSA table: " + err.message);
	logDebug(err.stack);
}
