//lwacht: if the owner record is deficient, add a row to the parent deficiency table.   
try{
	if(matches(wfStatus, "Additional Information Needed", "Incomplete Response")){
		if(parentCapId){
			var tblRow = [];
			tblRow["Deficiency Type"] = "Owner - Deficiency on application";
			tblRow["Deficiency Details"] = capName;
			tblRow["Resolution"] = "";
			tblRow["Additional Notes"] = "";
			tblRow["Status"] = "Deficienct";	
			addToASITable("Deficiencies",tblRow,parentCapId);
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Owner Deficiency: " + err.message);
	logDebug(err.stack);
}



