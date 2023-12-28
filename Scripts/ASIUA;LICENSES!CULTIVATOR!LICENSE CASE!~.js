try {
	
	editAppName(AInfo["Case Renewal Type"]);
	
	if (AInfo['Case Renewal Type'] =="Renewal Hold"){
		var licNum = getApplication(AInfo["License Number"]);
		var renewalCapProject = getRenewalCapByParentCapIDForIncomplete(licNum);
		if (renewalCapProject != null) {
			var renCapId = renewalCapProject.getCapID();
			if (renCapId.toString().contains("EST")){
				var renewalCap = aa.cap.getCap(renCapId).getOutput();
				var renewalCapId = renewalCap.getCapID();
				var altId = renewalCapId.getCustomID();
				var removeFeesResult = voidRemoveAllFees(renewalCapId);
				if (removeFeesResult){
					logDebug("Removed fees from Record, " + altId);
				}
			}
		}
	}
	
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/License Case/*: " + err.message);
	logDebug(err.stack);
}