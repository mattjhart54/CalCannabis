try {
	//7332 - Update appName with License Type Change
	var appName = cap.getSpecialText();
	var issuedType = AInfo['License Issued Type'];
	var cultType = AInfo['Cultivator Type'];
	var licType =  AInfo['License Type'];
	var removeText = issuedType + " " + cultType;
	var curLicType = String(appName).replace(removeText,"");
	if (curLicType != licType){
		editAppName(issuedType + " " + cultType + " - " + licType);
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
