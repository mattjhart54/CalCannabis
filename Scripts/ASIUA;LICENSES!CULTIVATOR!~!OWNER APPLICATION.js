try {
	removeASITable("DEFICIENCIES"); 
	for(x in DEFICIENCIES) {
		if(matches(DEFICIENCIES[x]["Deficiency Details"], null, "", undefined)) {
			defDesc = lookup("LIC_CC_DEFICIENCY_TYPE_OWNER",DEFICIENCIES[x]["Deficiency Type"]);
			DEFICIENCIES[x]["Deficiency Details"] = defDesc;
		}
		//lwacht: 180215: story 4796: populated a UID so that rows can be matched to child records
		if(matches(DEFICIENCIES[x]["UID"],"",null,"undefined")){
			var thisDate = new Date();
			var thisTime = ""+thisDate.getTime();
			DEFICIENCIES[x]["UID"] = thisTime;
			var date = new Date();
			var curDate = null;
			do { curDate = new Date(); } 
				while(curDate-date < 10);
		}
		//lwacht: 180215: story 4796: end
	}
	addASITable("DEFICIENCIES", DEFICIENCIES)

}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Owner Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}