// lwacht
// set altId based on application parent
try{
	parentCapId = getParent();
	if(parentCapId){
		nbrToTry = 1;
		if(capId.getCustomID().substring(0,3)!="LCA"){
			logDebug("parentCapId.getCustomID(): " +parentCapId.getCustomID());
			var newAltId = parentCapId.getCustomID() + "-DEC";
			var updateResult = aa.cap.updateCapAltID(capId, newAltId);
			var newIdErrMsg = updateResult.getErrorMessage() +"; ";
			if (updateResult.getSuccess()) {
				logDebug("Updated Declaration record AltId to " + newAltId + ".");
			}else {
				logDebug("Error renaming declar record " + capId + ":  " + newIdErrMsg);
				//aa.sendMail(sysFromEmail, debugEmail, "", "Error renaming declar record : " + startDate, capId + ": "+ newIdErrMsg);
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/DECLARATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/DECLARATION: Required Documents: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}

//lwacht 180208: story 5200: updating file date 
try{
	editAppSpecific("Created Date", fileDate);
	updateFileDate(null);
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/DECLARATION: Force file date to be submission date: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/DECLARATION: Force file date to be submission date: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}
//lwacht 180208: story 5200: end