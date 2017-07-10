try {
	removeASITable("DEFICIENCIES"); 
	for(x in DEFICIENCIES) {
		if(matches(DEFICIENCIES[x]["Deficiency Details"], null, "", undefined)) {
			defDesc = lookup("LIC_CC_DEFICIENCY_TYPE",DEFICIENCIES[x]["Deficiency Type"]);
			DEFICIENCIES[x]["Deficiency Details"] = defDesc;
		}
	}
	addASITable("DEFICIENCIES", DEFICIENCIES)
	editAppName(AInfo["License Type"]);
	if(!matches(AInfo["Denial Letter Receipt Date",null,""])) {
		editAppSpecific("Appeal Expiry Date",dateAdd("Denail Letter Receipt Date",30))
	}

}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}