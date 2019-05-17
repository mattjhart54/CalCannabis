try {
	if (typeof(DEFICIENCIES) == "object") {
		for(x in DEFICIENCIES) {
			if(matches(DEFICIENCIES[x]["Deficiency Details"], null, "", undefined)) {
				defDesc = lookup("LIC_CC_DEFICIENCY_TYPE",DEFICIENCIES[x]["Deficiency Type"]);
				DEFICIENCIES[x]["Deficiency Details"] = defDesc;
			}
		}
		removeASITable("DEFICIENCIES"); 
		addASITable("DEFICIENCIES", DEFICIENCIES);
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA: Licenses/Cultivation/Amendment/*: Update deficiency table: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASIUA:Licenses/Cultivation/Amendment/*: Update deficiency table: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}