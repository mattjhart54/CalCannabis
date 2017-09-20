try {
	if (typeof(DEFICIENCIES) == "object") {
		removeASITable("DEFICIENCIES"); 
		for(x in DEFICIENCIES) {
			if(matches(DEFICIENCIES[x]["Deficiency Details"], null, "", undefined)) {
				defDesc = lookup("LIC_CC_DEFICIENCY_TYPE",DEFICIENCIES[x]["Deficiency Type"]);
				DEFICIENCIES[x]["Deficiency Details"] = defDesc;
			}
		}
		addASITable("DEFICIENCIES", DEFICIENCIES)
	}
	if (typeof(DENIALREASONS) == "object") {
		removeASITable("DENIAL REASONS"); 
		for(x in DENIALREASONS) {
			if(matches(DENIALREASONS[x]["Denial Reason"], null, "", undefined)) {
				denialDesc = lookup("LIC_CC_DENIAL_REASONS",DENIALREASONS[x]["Denial Type"]);
				DENIALREASONS[x]["Denial Reason"] = denialDesc;
			}
		}
		addASITable("DENIAL REASONS", DENIALREASONS)
	}

	editAppName(AInfo["License Type"]);
	updateShortNotes(AInfo["Premise County"]);

	if(matches(AInfo["Local Authority Response"],"In Compliance","No Response") && capStatus == "Pending - Local Authorization") {
		activateTask("Administrative Review");
		activateTask("Owner Application Reviews");
		updateAppStatus("Ready for Review", "In Compliance notification recieved from Local Authority");
	}
	if(AInfo["Local Authority Response"] == "Non Compliance"  && capStatus == "Pending - Local Authorization") {
		activateTask("Administrative Review");
		updateAppStatus("Ready for Review", "Non Compliance notification recieved from Local Authority");
		childRecs = getChildren("Licenses/Cultivator/Medical/*");
		var holdId = capId;
		if(childRecs) {
			for(c in childRecs) {
				capId = childRecs[c];
					updateAppStatus("Closed", "Non Compliance notification recieved from Local Authority");
					deactivateTask("Owner Application Review");
			}
		}
		capId = holdId;
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}