// lwacht
// if not ACA, set the altId based on application parent
try{
	if(!publicUser){
		if(parentCapId){
			updateAppStatus("Application Fee Due", "Updated via ASA:LICENSES/CULTIVATOR/* /DECLARATION",parentCapId);
			logDebug("parentCapId.getCustomID(): " +parentCapId.getCustomID());
			var newAltId = parentCapId.getCustomID() + "-DEC";
			var updateResult = aa.cap.updateCapAltID(capId, newAltId);
			if (updateResult.getSuccess()) {
				logDebug("Updated Declaration record AltId to " + newAltId + ".");
			}else {
				logDebug("Error renaming declar record " + capId);
				aa.sendMail(sysFromEmail, debugEmail, "", "Error renaming declar record : " + startDate, capId);
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/DECLARATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/*/DECLARATION: Set AltID: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
