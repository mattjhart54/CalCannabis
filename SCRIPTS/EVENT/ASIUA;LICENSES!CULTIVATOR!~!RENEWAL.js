// JSHEAR 05082020 user Story 6519 - Covid Payment Deferral
try{
	vLicenseID = getParentLicenseCapID(capId);
    result = aa.cap.getProjectByMasterID(vLicenseID, "Renewal", "Incomplete");
    if (result.getSuccess()) {
		var appStatus = getAppStatus();
		if(balanceDue>0 && AInfo['Deferral Approved'] == "CHECKED" && appStatus == "Renewal Fee Due"){
			if(!isTaskComplete("Annual Renewal Review") && !isTaskComplete("Provisional Renewal Review")){
				if (AInfo["License Issued Type"] == "Provisional") {
					activateTask("Provisional Renewal Review");
					updateTask("Provisional Renewal Review","In Progress","","");
					deactivateTask("Annual Renewal Review");
				}else{
					activateTask("Annual Renewal Review");
					updateTask("Annual Renewal Review","In Progress","","");
					deactivateTask("Provisional Renewal Review");
				}
			}
			updateAppStatus("Submitted", "Updated via ASIUA:LICENSES/CULTIVATOR/*/Renewal.");
		}
	}
    if(AInfo["Deferral Approved"] == "CHECKED") {
    	var pType = "Application Condition";
    	var pDesc = "Application Hold";
    	var pStatus = "Applied";
    	var pEffDate = dateAdd(AInfo["Expiration Date"],61);
    	if(appHasCondition(pType,null,pDesc,null)) {
    		editCapConditionEffDate(pType,pDesc,pStatus,pEffDate); 
    	}
    	else{
    		addStdConditionEffDate(pType,pDesc,pEffDate);
    	}
    }
	if (AInfo['Waive Late Fee'] == "CHECKED"){
		var feeDesc = AInfo["License Type"] + " - Late Fee";
		var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
		if(thisFee){
			var hasFee = feeExists(thisFee.feeCode,"INVOICED");
			if(hasFee) {
				voidRemoveFeesByDesc(feeDesc);
				var rFiles = [];
				var rptParams = aa.util.newHashMap();
				rptParams.put("altId", capId.getCustomID());
				rFile = generateReport(capId,"Balance Due Report","Licenses",rptParams);
				if (rFile) {
					rFiles.push(rFile);
				}
				var priContact = getContactObj(capId,"Designated Responsible Party");
				if(priContact){
					var eParams = aa.util.newHashtable(); 
					addParameter(eParams, "$$altId$$", capId.getCustomID());
					addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
					addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
					var priEmail = ""+priContact.capContact.getEmail();
					sendNotification(sysFromEmail,priEmail,"","LCA_BALANCE_DUE",eParams,rFiles,capId);
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIUA:LICENSES/CULTIVATOR/*/RENEWAL: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUA:LICENSES/CULTIVATOR/*/RENEWAL: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}