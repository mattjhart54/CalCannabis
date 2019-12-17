try{
// Make the renewal record accessible in ACA	
	aa.cap.updateAccessByACA(capId,"Y");
// Update alt id on renewal record
	vLicenseID = getParentLicenseCapID(capId);
	vIDArray = String(vLicenseID).split("-");
	vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
	if (vLicenseID != null) {
		vLicenseAltId = vLicenseID.getCustomID();
		cIds = getChildren("Licenses/Cultivator/License/Renewal",vLicenseID);
		if(matches(cIds, null, "", undefined)) 
			renewNbr = renewNbr = "0" + 1;
		else {
			cIdLen = cIds.length 
			if(cIds.length <= 9) {
				renewNbr = cIdLen + 1;
				renewNbr = "0" +  renewNbr;
			}else {
				renewNbr = cIdLen + 1;
			}
		}
		newAltId = vLicenseAltId + "-R" + renewNbr;
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
	}
// Copy business contact from license
	copyContactsByType(vLicenseID,capId,"Designated Responsible Party");
	copyContactsByType(vLicenseID,capId,"Business");
// Add condition effective in thirty days if Late Fee not paid	
	var feeDesc = AInfo["License Type"] + " - Late Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
	if(thisFee){
		var hasFee = feeExists(thisFee.feeCode,"NEW");
		if(hasFee) {
			effDate = dateAdd(AInfo["Expiration Date"],30);
			addStdConditionEffDate("Application Condition", "Application Hold",effDate);
		}
	}else{
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/License/Renewal: Get Fee: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		logDebug("An error occurred retrieving fee item: " + feeDesc);
	}
// Set status and deactivate workflow if fees are due
	
	if (AInfo["License Issued Type"] == "Provisional") {
		updateTask("Provisional Renewal Review","In Progress","","");
		deactivateTask("Annual Renewal Review");
	}else{
		updateTask("Annual Renewal Review","In Progress","","");
		deactivateTask("Provisional Renewal Review");
	}
	if(balanceDue > 0) {
		updateAppStatus("Renewal Fee Due","Licensee chose Cash Option at checkout");
		deactivateActiveTasks();
	}
// Invoice all fees if cash payment selected at submission in ACA
	var feeDesc = AInfo["License Type"] + " - Renewal Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
	if(thisFee){
		var hasFee = feeExists(thisFee.feeCode,"NEW");
		if(hasFee) {
			var invNbr = invoiceAllFees();
			if (AInfo["License Issued Type"] == "Provisional") {
				updateTask("Provisional Renewal Review","In Progress","","");
			}else{
				updateTask("Annual Renewal Review","In Progress","","");
			}
			updateAppStatus("Renewal Fee Due","Licensee chose Cash Option at checkout");
			deactivateTask("Annual Renewal Review");
			deactivateTask("Provisional Renewal Review");
		}
	}else{
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/License/Renewal: Get Fee: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		logDebug("An error occurred retrieving fee item: " + feeDesc);
	}
	
//  Send email notification to DRP
	var priContact = getContactObj(capId,"Designated Responsible Party");
	if(priContact){
		var eParams = aa.util.newHashtable(); 
		addParameter(eParams, "$$altId$$", newAltId);
		addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
		addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
		addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
		addParameter(eParams, "$$parentId$$", vLicenseAltId);
		var rFiles = [];
		var priEmail = ""+priContact.capContact.getEmail();
		
		sendNotification(sysFromEmail,priEmail,"","LCA_RENEWAL_SUBMISSION",eParams, rFiles,capId)

		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(priChannel.indexOf("Postal") > -1 ){
				var sName = createSet("Renewal Submission","Renewal Notifications", "New");
				if(sName){
					setAddResult=aa.set.add(sName,capId);
					if(setAddResult.getSuccess()){
						logDebug(capId.getCustomID() + " successfully added to set " +sName);
					}else{
						logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
					}
				}
			}
		}
	}

} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
