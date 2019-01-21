// lwacht
// if not ACA, set the altId based on application parent
try{
	if(!publicUser){
		if(!parentCapId){
			appId = AInfo["Application ID"];
			addParent(appId);
			parentCapId = getApplication(appId);
		} 
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
		var priContact = getContactObj(parentCapId,"Designated Responsible Party");
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("APPLICATION_FEE_DUE","License Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,parentCapId);
						if(setAddResult.getSuccess()){
							logDebug(parentCapId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/DECLARATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/*/DECLARATION: Set AltID: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
