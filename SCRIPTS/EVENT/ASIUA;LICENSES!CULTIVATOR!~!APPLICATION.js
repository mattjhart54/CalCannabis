try {
	if (typeof(DEFICIENCIES) == "object") {
		for(x in DEFICIENCIES) {
			if(matches(DEFICIENCIES[x]["Deficiency Details"], null, "", undefined)) {
				defDesc = lookup("LIC_CC_DEFICIENCY_TYPE",DEFICIENCIES[x]["Deficiency Type"]);
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
		removeASITable("DEFICIENCIES"); 
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
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA: Licenses/Cultivation/*/Application: Send Local Auth: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: Update deficiency table: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}

try{
	editAppName(AInfo["License Type"]);
	updateShortNotes(AInfo["Premise County"]);
	if(appTypeArray[2] == "Temporary") {
		contType = "DRP - Temporary License";
		addrType = "Mailing";
	}
	else {
		//lwacht 171218 address type now Mailing
		contType = "Designated Responsible Party";
		addrType = "Mailing";
		//lwacht 171218 end
	}

	if(matches(AInfo["Local Authority Response"],"In Compliance","No Response") && matches(capStatus,"Pending Local Authorization 10","Pending Local Authorization 60")) {
		activateTask("Administrative Review");
		activateTask("Owner Application Reviews");
		updateTask("Administrative Review","Under Review","In Compliance notification received from Local Authority","");
		updateAppStatus("Under Administrative Review", "In Compliance notification received from Local Authority");
		//lwacht 171218: two reports now: temp and annual
		if(appTypeArray[2] == "Temporary") {
			runReportAttach(capId,"Submitted Application", "Record ID", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
		}else{
			var liveScanNotActive = lookup("LIVESCAN_NOT_AVAILABLE","LIVESCAN_NOT_AVAILABLE");
			//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: getReqdDocs: " + startDate, "capId: " + capId + ": " + br + liveScanNotActive);
			if(!matches(liveScanNotActive,true, "true")){
				runReportAttach(capId,"Submitted Annual Application", "Record ID", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
			}else{
				runReportAttach(capId,"Submitted Annual App No LiveScan", "altId", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
			}
		}
		//lwacht 171218 end
		emailRptContact("ASIUA", "LCA_APPLICATION _SUBMITTED", "", false, capStatus, capId, contType);
	}
	if(AInfo["Local Authority Response"] == "Non Compliance"  && matches(capStatus,"Pending Local Authorization 10","Pending Local Authorization 60"))  {
		closeTask("Administrative Review","Incomplete Response","Non-Compliance notification recieved from Local Authority","");
		activateTask("Administrative Manager Review");
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
	logDebug("A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: Send Local Auth: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: Send Local Auth: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}