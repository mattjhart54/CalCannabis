//mhart 181128 story 5784 - update script to remove code for processing cash payments and creating associated records
//lwacht
//remove conditions after documents are uploaded
try{
	var cType = "License Required Documents";
	var capCondResult = aa.capCondition.getCapConditions(capId,cType);
	if (!capCondResult.getSuccess()){
		logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()) ; 
	}else{
		var ccs = capCondResult.getOutput();
		for (pc1 in ccs){
			var rmCapCondResult = aa.capCondition.deleteCapCondition(capId,ccs[pc1].getConditionNumber()); 
			if (rmCapCondResult.getSuccess())
				logDebug("Successfully removed condition to CAP : " + capId + "  (" + cType + ") ");
			else
				logDebug( "**ERROR: removing condition  (" + cType + "): " + rmCapCondResult.getErrorMessage());
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Remove Conditions: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Remove Conditions: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
//mhart
//send local auth notification and update work description with Legal Business Name
//lwacht: don't run for temporary app 
try {
	if(appTypeArray[2]!="Temporary"){
		updateLegalBusinessName();
		editAppName(AInfo["License Type"]);
		updateShortNotes(AInfo["Premise County"]);
		
// mhart 181128 story 5784 & 5793 - deactive workflow task and set record status
		updateAppStatus("Pending Owner Applications", "Updated via CTRCA:LICENSES/CULTIVATOR/* /APPLICATION.");
		deactivateTask("Owner Application Reviews");
		deactivateTask("Administrative Review");
// mhart 181128 story 5784 & 5793 - end		
	}
}catch (err){
	logDebug("A JavaScript Error occurred: CTRCA: Licenses/Cultivation/*/Application: Local Auth: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/*/Application: Local Auth: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht 180208: story 5200: updating file date
try{
	editAppSpecific("Created Date", fileDate);
	updateFileDate(null);
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Force file date to be submission date: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Force file date to be submission date: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//lwacht 180208: story 5200: end

//mhart 180321: story 5376: add live scan required condition
try{
	if(appTypeArray[2]!="Temporary"){
		lScan = lookup("LIVESCAN_NOT_AVAILABLE","LIVESCAN_NOT_AVAILABLE");
		if (lScan == true) {
			addStdCondition("Application Condition","LiveScan Required");
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Add livescan required condition: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Add livescan required condition: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart 180321: story 5376: end

//lwacht: 180216: story 5177: adding this back in
// mhart: Comment out report to test payment processor time out issue
//lwacht: create submission report

try{
	//lwacht: 180108: defect 5120: don't run for temporary
	if(appTypeArray[2]!="Temporary"){
		//lwacht: 180220: story 5177: completed app report needs to run in a (un)specified amount of time
		var eTxt = "";
		var sDate = new Date();
		var sTime = sDate.getTime();
		var scriptName = "asyncRunComplApplicRpt";
		var envParameters = aa.util.newHashMap();
		envParameters.put("sendCap",capIDString); 
		envParameters.put("currentUserID",currentUserID);
		aa.runAsyncScript(scriptName, envParameters);
		var thisDate = new Date();
		var thisTime = thisDate.getTime();
		var eTime = (thisTime - sTime) / 1000;
		logDebug("elapsed time: " + eTime + " seconds.");
		//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: "+ startDate, capId + br +"elapsed time: " + eTime + " seconds. " + br + "capIDString: " + capIDString + br + currEnv);
	}
	//lwacht: 180108: defect 5120: end
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//lwacht: 180216: story 5177: end

try{
//mhart 181129 story 5784: send email notification to owners to create account and apply for owner application.
	if(appTypeArray[2]!="Temporary"){
		var tblOwners = loadASITable("OWNERS");
		for(o in tblOwners){
			var nFirst = tblOwners[o]["First Name"];
			var nLast = tblOwners[o]["Last Name"];
			var nEmail = tblOwners[o]["Email Address"];
			emailParameters = aa.util.newHashtable();
			var sysDate = aa.date.getCurrentDate();
			var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
			addParameter(emailParameters, "$$AltID$$", capId.getCustomID());
			addParameter(emailParameters, "$$ParentAltID$$", capId.getCustomID());
			addParameter(emailParameters, "$$fName$$",""+nFirst);
			addParameter(emailParameters, "$$lName$$",""+nLast);
			addParameter(emailParameters, "$$mmddyy$$", sysDateMMDDYYYY);
			sendNotification(sysEmail,nEmail,"","LCA_OWNER_APP_NOTIF",emailParameters,null,capId);
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Submission Report: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart 181129 story 5784: end
