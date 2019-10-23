try {
	if (wfTask == "Renewal Review" && wfStatus == "Approved") {
		var vLicenseID;
		var vIDArray;
		var renewalCapProject;
		var vExpDate;
		var vNewExpDate;
		var vLicenseObj;
	// Get the parent license
		vLicenseID = getParentLicenseCapID(capId);
		vIDArray = String(vLicenseID).split("-");
		vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
		licAltId = vLicenseID.getCustomID();
		altId = capId.getCustomID();
		if (vLicenseID != null) {
	// Get current expiration date.
			vLicenseObj = new licenseObject(null, vLicenseID);
			vExpDate = vLicenseObj.b1ExpDate;
			vExpDate = new Date(vExpDate);
	// Extend license expiration by 1 year
			vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
	// Update license expiration date
			logDebug("Updating Expiration Date to: " + vNewExpDate);
			vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
	// Set license record expiration and status to active
			vLicenseObj.setStatus("Active");
			updateAppStatus("Active","License Renewed",vLicenseID);
	// Update the Cultivation Type on the license record
			if(AInfo["Designation Change"] == "Yes") {
				editAppSpecific("Cultivator Type",AInfo["Designation Type"],vLicenseID);
				editAppName(AInfo["Designation Type"] + " - " + AInfo["License Type"],vLicenseID);
			}
	//Set renewal to complete, used to prevent more than one renewal record for the same cycle
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
			if (renewalCapProject != null) {
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);
			}
	//Run Official License Certificate and Renewal Approval Letter and email the DRP	
			var scriptName = "asyncRunOfficialLicenseRpt";
			var envParameters = aa.util.newHashMap();
			envParameters.put("licType", "Renewal");
			envParameters.put("appCap",altId);
			envParameters.put("licCap",licAltId); 
			envParameters.put("reportName","Official License Certificate"); 
			envParameters.put("currentUserID",currentUserID);
			envParameters.put("contType","Designated Responsible Party");
			envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
			aa.runAsyncScript(scriptName, envParameters);
			var priContact = getContactObj(capId,"Designated Responsible Party");
	// If DRP preference is Postal ad license record to Renewal Issued set
			if(priContact){
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						var sName = createSet("LICENSE_RENEWAL_ISSUED","License Notifications", "New");
						if(sName){
							setAddResult=aa.set.add(sName,vLicenseID);
							if(setAddResult.getSuccess()){
								logDebug(capId.getCustomID() + " successfully added to set " +sName);
							}else{
								logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
							}
						}
					}
				}
			}
	// Add record to the CAT set
			addToCat(vLicenseID);
		}
	}
	if (wfTask == "Renewal Review" && wfStatus == "Denied") {
		var vLicenseID;
		var vIDArray;
		var renewalCapProject;
		var vExpDate;
		var vNewExpDate;
		var vLicenseObj;
	// Get the parent license
		vLicenseID = getParentLicenseCapID(capId);
		vIDArray = String(vLicenseID).split("-");
		vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
		licAltId = vLicenseID.getCustomID();
		if (vLicenseID != null) {
	// Set license record expiration and status to inactive
			vLicenseObj = new licenseObject(null, vLicenseID);
			vLicenseObj.setStatus("Inactive");
	//		updateAppStatus("Inactive","License Renewed",vLicenseID);
	//Set renewal to complete, used to prevent more than one renewal record for the same cycle
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
			if (renewalCapProject != null) {
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);
			}
	// Add record to the CAT set
			addToCat(vLicenseID);
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: " + err.message);
	logDebug(err.stack);
}