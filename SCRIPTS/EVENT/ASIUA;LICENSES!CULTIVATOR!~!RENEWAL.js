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
		
			// Remove Late Fees
			if (AInfo['Waive Late Fee'] == "CHECKED"){
				var feeDesc = AInfo["License Type"] + " - Late Fee";
				var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
				if(thisFee){
					var hasFee = feeExists(thisFee.feeCode);
					if(hasFee) {
						voidRemoveFeesByDesc(feeDesc);
					}
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIUA:LICENSES/CULTIVATOR/*/RENEWAL: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUA:LICENSES/CULTIVATOR/*/RENEWAL: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}