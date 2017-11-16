// lwacht
// set altId based on application parent
try{
	parentCapId = getParent();
	aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY CTRCA:LICENSES/CULTIVATOR/*/DECLARATION : " + startDate, capId + ": "+ newIdErrMsg);
	if(parentCapId){
		nbrToTry = 1;
		//because owners can be added and deleted, need a way to number the records
		//but only if they haven't been numbered before
		if(capId.getCustomID().substring(0,3)!="LCA"){
			logDebug("parentCapId.getCustomID(): " +parentCapId.getCustomID());
			var newAltId = parentCapId.getCustomID() + "-DEC";
			var updateResult = aa.cap.updateCapAltID(capId, newAltId);
			if (updateResult.getSuccess()) {
				logDebug("Updated Declaration record AltId to " + newAltId + ".");
			}else {
				logDebug("Error renaming declar record " + capId + ":  " + newIdErrMsg);
				aa.sendMail(sysFromEmail, debugEmail, "", "Error renaming declar record : " + startDate, capId + ": "+ newIdErrMsg);
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/DECLARATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/DECLARATION: Required Documents: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
