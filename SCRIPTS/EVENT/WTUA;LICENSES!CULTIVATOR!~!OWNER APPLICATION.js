//lwacht: if the owner record is deficient, add a row to the parent deficiency table.   
try{
	if(matches(wfStatus, "Additional Information Needed", "Incomplete Response")){
		if(parentCapId){
			var tblRow = [];
			tblRow["Deficiency Type"] = "Owner - Deficiency on application";
			tblRow["Deficiency Details"] = capName;
			tblRow["Resolution"] = "";
			tblRow["Additional Notes"] = "";
			tblRow["Status"] = "Deficient";	
			addToASITable("DEFICIENCIES",tblRow,parentCapId);
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Owner Deficiency: " + err.message);
	logDebug(err.stack);
}

//lwacht: if the owner record is noncompliant for child support, add a condition.   
try{
	if(matches(wfStatus, "Non-compliant Child Support") && !appHasCondition("Owner History","Applied","Non-compliant Child Support",null)){
		addStdCondition("Owner History","Non-compliant Child Support");
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Owner Deficiency: " + err.message);
	logDebug(err.stack);
}