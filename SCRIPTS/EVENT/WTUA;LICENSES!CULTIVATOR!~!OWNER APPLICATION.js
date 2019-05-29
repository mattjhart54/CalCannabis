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
try{
	if(parentCapId) {
		pCap = aa.cap.getCap(parentCapId).getOutput();
		pAppTypeResult = pCap.getCapType();
		pAppTypeString = pAppTypeResult.toString();
		pAppTypeArray = pAppTypeString.split("/");
		if(matches(wfStatus, "Review Completed","Withdrawn","Close","Recommended Denial","Non-compliant Child Support") && pAppTypeArray[2] == "Amendment"){
			var holdId = capId;
			capId = parentCapId;
			activateTask("Ownership Change Amendment Review")
			capId = holdId;
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Owner Amendment: " + err.message);
	logDebug(err.stack);
}