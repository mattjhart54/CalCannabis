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

	if(matches(AInfo["Local Authority Response"],"In Compliance","Pending","No Response") && (matches(capStatus,"Pending Local Authorization 10","Pending Local Authorization 60") || (capStatus == "Submitted" && isTaskStatus("Local Verification Review", "Under Review")))){
		//lwacht: 180426: story 5436: reset the assigned task
		var asgnDateAR = getAssignedDate("Administrative Review");
		var asgnDateOR = getAssignedDate("Owner Application Reviews");
		activateTask("Administrative Review");
		activateTask("Owner Application Reviews");
		updateTask("Administrative Review","Under Review",AInfo["Local Authority Response"] + " notification received from Local Authority","");
		closeTask("Local Verification Review","Local Verification Complete","","");
		updateAppStatus("Under Administrative Review", AInfo["Local Authority Response"]+ " notification received from Local Authority");
		if(asgnDateAR){
			updateTaskAssignedDate("Administrative Review", asgnDateAR);
		}else{
			logDebug("No assigned date found for Administrative Review");
		}
		if(asgnDateOR){
			updateTaskAssignedDate("Owner Application Reviews", asgnDateOR);
		}else{
			logDebug("No assigned date found for Owner Application Reviews");
		}
		//lwacht: 180426: story 5436: end
		//lwacht 171218: two reports now: temp and annual
		//mhart 180409: user story 5391 comment out code to send submitted letter and email for annual application.  this now runs when application fee is paid.
		if(appTypeArray[2] == "Temporary") {
			runReportAttach(capId,"Submitted Application", "Record ID", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
			emailRptContact("ASIUA", "LCA_APPLICATION _SUBMITTED", "", false, capStatus, capId, contType);
		}
	/*	else{
			var liveScanNotActive = lookup("LIVESCAN_NOT_AVAILABLE","LIVESCAN_NOT_AVAILABLE");
			//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: getReqdDocs: " + startDate, "capId: " + capId + ": " + br + liveScanNotActive);
			if(!matches(liveScanNotActive,true, "true")){
				runReportAttach(capId,"Submitted Annual Application", "Record ID", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
			}else{
				runReportAttach(capId,"Submitted Annual App No LiveScan", "altId", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
			}
			emailRptContact("ASIUA", "LCA_APPLICATION _SUBMITTED", "", false, capStatus, capId, contType);
		}
		//lwacht 171218 end
	*/ //mhart 180409: user story 5391 end
	}
//mhart 190410 story 5900 - Add Pending status to Local Authority Response drop down list
	if(AInfo["Local Authority Response"] == "Pending"  && matches(capStatus,"Pending Local Authorization 10","Pending Local Authorization 60"))  {
		activateTask("Administrative Review");
		activateTask("Owner Application Reviews");
		updateAppStatus("Under Administrative Review","Updated by script");
	}
	if(AInfo["Local Authority Response"] == "Non Compliance"  && matches(capStatus,"Pending Local Authorization 10","Pending Local Authorization 60"))  {
		//lwacht: 180426: story 5436: reset the assigned task
		var asgnDateAR = getAssignedDate("Administrative Review");
		closeTask("Administrative Review","Incomplete Response","Non-Compliance notification recieved from Local Authority","");
		if(asgnDateAR){
			updateTaskAssignedDate("Administrative Review", asgnDateAR);
		}else{
			logDebug("No assigned date found for Administrative Review");
		}
		//lwacht: 180426: story 5436: end
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
	else {
		if(AInfo["Local Authority Response"] == "Non Compliance"  && !matches(capStatus,"Denied", "Disqualified", "Provisional License Issued", "License Issued")){
			activateTask("Administrative Manager Review");
			updateTask("Administrative Manager Review","Locally Non-Compliant","Updated by script");
			updateAppStatus("Ready for Review","Updated by script");
			if(!appHasCondition("Application Condition",null,"Locally Non-Compliant",null))
				addStdCondition("Application Condition","Locally Non-Compliant");
		}
	}
//mhart 190410 story 5900 - end
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: Send Local Auth: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASIUA:Licenses/Cultivation/*/Application: Send Local Auth: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
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
