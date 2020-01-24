try{
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Notice Of Violation") {
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("License Hold","Applied","Notice of Violation",null)){
			addStdCondition("License Hold","Notice of Violation");
		}
		capId = holdId;
	}
	if (wfTask == "Licensing Case Assessment" && wfStatus == "Owner Conviction") {
		parentCapId = getParent();
		holdId = capId;
		capId = parentCapId;
		if(!appHasCondition("License Hold","Applied","Owner Subsequent Convictions",null)){
			addStdCondition("License Hold","Owner Subsequent Convictions");
		}
		capId = holdId;
	}
	if (wfTask == "LAU Assessment" && wfStatus == "Refer to Legal") {
		editAppSpecific("Case Renewal Type","Renewal Hold");
	}
	if (wfTask == "LAU Assessment" && wfStatus == "Resolved") {
		var parentCapId = getParent();
		var renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
		var licAltId = parentCapId.getCustomID();
		var altId = renewalCapProject.getCustomID();
		if (renewalCapProject != null && ) {
			var capDetailObjResult = aa.cap.getCapDetail(renewalCapProject);
			if (capDetailObjResult.getSuccess()){
				capDetail = capDetailObjResult.getOutput();
				var balanceDue = capDetail.getBalance();
			}
			if (balanceDue = 0){
				// Get current expiration date.
				vLicenseObj = new licenseObject(null, parentCapId);
				vExpDate = vLicenseObj.b1ExpDate;
				vExpDate = new Date(vExpDate);
				// Extend license expiration by 1 year
				vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
				// Update license expiration date
				logDebug("Updating Expiration Date to: " + vNewExpDate);
				vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
				// Set license record expiration and status to active
				vLicenseObj.setStatus("Active");
				updateAppStatus("Active","License Renewed",parentCapId);
				// Update the Cultivation Type on the license record
				if(AInfo["Designation Change"] == "Yes") {
					editAppSpecific("Cultivator Type",AInfo["Designation Type"],parentCapId);
					editAppName(AInfo["Designation Type"] + " - " + AInfo["License Type"],parentCapId);
				}
				//Set renewal to complete, used to prevent more than one renewal record for the same cycle
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);			
				//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
				if (AInfo["License Issued Type"] == "Provisional"){
					var approvalLetter = "Provisional Renewal Approval";
				}else{
					var approvalLetter = "Approval Letter Renewal";
					var scriptName = "asyncRunOfficialLicenseRpt";
					var envParameters = aa.util.newHashMap();
					envParameters.put("licType", "");
					envParameters.put("appCap",altId);
					envParameters.put("licCap",licAltId); 
					envParameters.put("reportName","Official License Certificate");
					envParameters.put("approvalLetter", approvalLetter);
					envParameters.put("emailTemplate", "LCA_RENEWAL_APPROVAL");
					envParameters.put("reason", "");
					envParameters.put("currentUserID",currentUserID);
					envParameters.put("contType","Designated Responsible Party");
					envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
					aa.runAsyncScript(scriptName, envParameters);
				}
				
				var priContact = getContactObj(capId,"Designated Responsible Party");
				// If DRP preference is Postal add license record to Annual/Provisional Renewal A set
				if(priContact){
					var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
					if(!matches(priChannel, "",null,"undefined", false)){
						if(priChannel.indexOf("Postal") > -1 ){
							
							if (AInfo['License Issued Type'] == "Provisional") {
								var sName = createSet("PROVISIONAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
							}
							if (AInfo['License Issued Type'] == "Annual"){
								var sName = createSet("ANNUAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
							}
							if(sName){
								setAddResult=aa.set.add(sName,parentCapId);
								if(setAddResult.getSuccess()){
									logDebug(capId.getCustomID() + " successfully added to set " +sName);
								}else{
									logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
								}
							}
						}
					}
					// Add record to the CAT set
					addToCat(vLicenseID);
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE CASE/NA: " + err.message);
	logDebug(err.stack);
}