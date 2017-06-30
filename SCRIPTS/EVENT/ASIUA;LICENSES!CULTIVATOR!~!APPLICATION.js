try {
	removeASITable("DEFICIENCIES"); 
	for(x in DEFICIENCIES) {
		if(matches(DEFICIENCIES[x]["Deficiency Details"], null, "", undefined)) {
			DEFICIENCIES[x]["Deficiency Details"] == lookup("LIC_CC_DEFICIENCY_TYPE",DEFICIENCIES[x]["Deficiency Type"]);
			addASITable("DEFICIENCIES", DEFICIENCIES)
		}
	}

}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}