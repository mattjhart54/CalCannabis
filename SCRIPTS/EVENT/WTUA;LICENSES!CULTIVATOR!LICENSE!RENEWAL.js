try {
	if (matches(wfTask,"Renewal Review","Annual Renewal Review","Provisional Renewal Review") && wfStatus == "Approved") {
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
			
	//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
			
									
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
			
			var eParams = aa.util.newHashtable(); 
			
			addParameter(eParams, "$$altId$$", newAltId);
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$parentId$$", parentAltId);
			
			var rFiles = [];
			var priEmail = ""+priContact.priContact.getEmail();
				
			if (matches(wfTask,"Provisional Renewal Review") && wfStatus == "Approved") {
				
					sendNotification(sysFromEmail,priEmail,"","LCA_PROVISIONAL_RENEWAL_APPROVAL",envParams, rFiles,capId);
			
			}if (matches(wfTask,"Annual Renewal Review") && wfStatus == "Approved"){
					
					sendNotification(sysFromEmail,priEmail,"","LCA_RENEWAL_APPROVAL",envParams, rFiles,capId);	
				}
			
	// If DRP preference is Postal add license record to Annual/Provisional Renewal A set
			if(priContact){
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						
						if (matches(wfTask,"Provisional Renewal Review") && wfStatus == "Approved") {
						var sName = createSet("PROVISIONAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
						
						}if (matches(wfTask,"Annual Renewal Review") && wfStatus == "Approved"){
							var sName = createSet("ANNUAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
							}
							
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
	//	6316: If Parent record of Provisional license does not have science Amendment with Status of "Approved for Provisional Renewl" within last year
		if (AInfo['License Issued Type'] == "Provisional"){
			var scienceArr = getChildren("Licenses/Cultivator/Amendment/Science",vLicenseID);
			var issueDate = getAppSpecific("Valid From Date",vLicenseID);
			var approvedRen = false;
			for (x in scienceArr){
				var scienceCap = scienceArr[x];
				var workflowResult = aa.workflow.getTasks(scienceCap);
				if (workflowResult.getSuccess()){
					wfObj = workflowResult.getOutput();
				}else {
					logDebug("**ERROR: Failed to get workflow object: "+wfObj );
				}
				
				for (i in wfObj) {
					fTask = wfObj[i];
					var status = fTask.getDisposition();
					var taskDesc = fTask.getTaskDescription();
					if(status != null && taskDesc != null && status.equals("Approved for Provisional Renewal")){
						if((getDateDiff(issueDate) > 0) && (getDateDiff(issueDate) <= 365)){
							approvedRen = true;
							
						}
					}	
				}
			}
			if (!approvedRen){
				addStdCondition("Application Conditions", "Provisional Renewal Missing Science Amendment");
			}
		}
	// Add record to the CAT set
			addToCat(vLicenseID);
		}
	}
	//Removing as per 6355, 6313, 6314, 6315
	/*if (matches(wfTask,"Annual Renewal Review","Provisional Renewal Review") && wfStatus == "Recommended for Denial") {
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
	}*/
	if (wfTask == "License Manager" && wfStatus == "Revisions Required") {
		reactivateActiveTasksWithStatus("Recommended for Denial");
		deactivateTask("License Manager");
	}			
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: " + err.message);
	logDebug(err.stack);
}