try {

//Update Primary record, generate License Certificate and email with Approval Letter
	if(balanceDue <= 0) {
		var pId = AInfo["License Number"];
		var licType = AInfo["Proposed License Type"];
		plId = aa.cap.getCapID(pId).getOutput();
		updateConvRecs(plId);
		var result = aa.cap.createAppHierarchy(plId, capId);
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");		
//run the License Report and send approval email
		var appAltId = capId.getCustomID();
		var licAltId = plId.getCustomID();
		var scriptName = "asyncRunOfficialLicenseRpt";
		var envParameters = aa.util.newHashMap();
		envParameters.put("licType", licType);
		envParameters.put("appCap",appAltId);
		envParameters.put("licCap",licAltId); 
		envParameters.put("reportName","Official License Certificate"); 
		//envParameters.put("approvalLetter", "");
		if(AInfo["No Transition"] == "CHECKED") {
			var templateName = "LIC_CC_CCR_APPR_PROV_LIC_ISSUED";
			envParameter.put("reason", AInfo["Reason for Provisional Renewal"]);
		}else {
			envParameters.put("reason", "");
			var templateName = "LIC_CC_CCR_APPR_LIC_ISSUED";
		}
		envParameters.put("emailTemplate", templateName);
		envParameters.put("currentUserID",currentUserID);
		envParameters.put("contType","Designated Responsible Party");
		envParameters.put("fromEmail",sysFromEmail);
		aa.runAsyncScript(scriptName, envParameters);
	}	
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/CONVERSION REQUEST/*: " + err.message);
	logDebug(err.stack);
}
