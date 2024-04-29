try {
	if (matches(wfTask,"Renewal Review","Annual Renewal Review","Provisional Renewal Review") && wfStatus == "Approved") {
		var event = "WTUA";
		rAltId = capId.getCustomID();
		hasFee = false;
		fastTrack = renewalProcess(rAltId, event, hasFee);
		if(balanceDue>0){
			// Remove Late Fees
			if (AInfo['Waive Late Fee'] == "CHECKED"){
				var feeDesc = AInfo["License Type"] + " - Late Fee";
				var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
				if(thisFee){
					var hasFee = feeExists(thisFee.feeCode);
					if(hasFee) {
						voidRemoveFeesByDesc(feeDesc);
						var scriptName = "asyncRunBalanceDueRpt";
						var envParameters = aa.util.newHashMap();
						envParameters.put("altId",capId.getCustomID()); 
						envParameters.put("reportName","Balance Due Report"); 
						envParameters.put("contType","Designated Responsible Party"); 
						envParameters.put("currentUserID",currentUserID);
						envParameters.put("fromEmail",sysFromEmail);
						aa.runAsyncScript(scriptName, envParameters, 5000);
					}
				}
			}
			updateAppStatus("Deferral Approved", "Updated via WTUA:LICENSES/CULTIVATOR/*/Renewal.");
		}
	}
	if (wfTask == "License Manager" && wfStatus == "Revisions Required") {
		reactivateActiveTasksWithStatus("Recommended for Denial");
		deactivateTask("License Manager");
	}			
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: " + err.message);
	logDebug(err.stack);
}
