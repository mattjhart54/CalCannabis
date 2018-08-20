//lwacht: 080816: prototype
try{
	var parCapArr =AInfo["Parent ID"].split("-");
	var parCapId = aa.cap.getCapID(parCapArr[0],parCapArr[1],parCapArr[2]).getOutput();
	if (parCapId != null) {
		var newAltId = parCapId.getCustomID() + "-REN2018";
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
		if(AInfo["Changes"]=="No") {
			var expDate = dateAddMonths(null,12);
			var validFromDate = dateAddMonths(null,0);
			setLicExpirationDate(parCapId,null,expDate,"Active");
			updateAppStatus("Active", "Updated via CTRCA:LICENSES/CULTIVATOR/*/RENEWAL");
			emailRptContact("PRA", "LCA_APP_APPROVAL_PAID", "Official License Certificate", true, capStatus, capId, "Designated Responsible Party", "altId", parCapId.getCustomID());
			result = aa.cap.getProjectByMasterID(parCapId, "Renewal", "Incomplete");
			if (result.getSuccess()) {
				var renewCapProjArr=result.getOutput();
				var renewCapProj = renewCapProjArr[0];
				renewCapProj.setStatus("Complete");
				var updRes = aa.cap.updateProject(renewCapProj);
				editAppSpecific("Valid From Date", validFromDate);
			}
		}
	}
	//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY CTRCA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + message + br + currEnv);
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}

//lwacht: 080816: prototype end