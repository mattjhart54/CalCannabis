//lwacht: 080816: prototype
try{
	var parCapId =AInfo["Parent ID"];
	logDebug("parCapId: " + parCapId);
	if (parCapId != null) {
		var newAltId = parCapId.getCustomID() + "-REN2018";
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
		if(AInfo["Changes"]=="Y") {
			var expDate = dateAddMonths(null,12);
			setLicExpirationDate(parCapId,null,expDate,"Active");
			emailRptContact("PRA", "LCA_APP_APPROVAL_PAID", "Official License Certificate", true, capStatus, capId, "Designated Responsible Party", "altId", parCapId.getCustomID());
			renewCapProj = getRenewalCapByParentCapIDForReview(parCapId);
			renewCapProj.setStatus("Complete");
			aa.cap.updateProject(renewCapProj);
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
//lwacht: 080816: prototype end