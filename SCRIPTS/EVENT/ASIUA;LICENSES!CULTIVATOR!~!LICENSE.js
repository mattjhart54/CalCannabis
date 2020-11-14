try {
	if(appTypeArray[2] != AInfo["Cultivator Type"]) {
		if(AInfo["Cultivator Type"] == "Medical") {
			typeUpdated= editAppTypeAlias("Medicinal Cannabis Cultivator License","Medical");
			if(typeUpdated)
				logDebug("App Type Alias Succesfully Changed");
			else
				logDebug("App Type Alias Update Failed");
		}
		else {
			typeUpdated= editAppTypeAlias("Adult-Use Cannabis Cultivator License","Adult Use");
			if(typeUpdated)
				logDebug("App Type Alias Succesfully Changed");
			else
				logDebug("App Type Alias Update Failed");
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIU:LICENSES/CULTIVATOR/*/LICENSE: Update App Type " + err.message);
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
	logDebug("A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: Update LSA table: " + err.message);
	logDebug(err.stack);
}
