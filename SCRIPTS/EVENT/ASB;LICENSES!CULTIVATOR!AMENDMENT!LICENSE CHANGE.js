//7708: Verify Record is eligible for submission
try{
	var parentCapId = getApplication(AInfo['License Number']);
	var expDateProcessed = getAppSpecific("Expiration Date Changed", parentCapId);
	var pAltId = parentCapId.getCustomID();
	var thisCap = aa.cap.getCap(parentCapId).getOutput();		
	var thisCapStatus = thisCap.getCapStatus();
	

	if (expDateProcessed == "CHECKED"){
		cancel = true;
		showMessage = true;
		logMessage(" Your license status is not eligible for this request, please contact DCC Licensing at <a href='mailto:licensing@cannabis.ca.gov'>licensing@cannabis.ca.gov</a>");
	}
 	if (!matches(thisCapStatus,"Active", "Inactive", "Suspended", "Limited Operations")){
		cancel = true;
		showMessage = true;
		logMessage(" Your license status is not eligible for this request, please contact DCC Licensing at<a href='mailto:licensing@cannabis.ca.gov'>licensing@cannabis.ca.gov</a>");
	}
	renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
	if (renewalCapProject != null) {
		cancel = true;
		showMessage = true;
		logMessage(" Your license is not eligible for this license change request as you have a pending renewal in progress. At this time, you must request these changes via the renewal process. If you have questions, please contact DCC Licensing at <a href='mailto:licensing@cannabis.ca.gov'>licensing@cannabis.ca.gov</a>");
	}
	var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("License Number", pAltId);
	if (getCapResult.getSuccess()){
		var apsArray = getCapResult.getOutput();
	
		for (aps in apsArray){
			var thisCapId = apsArray[aps].getCapID();
		    var capBasicInfo = aa.cap.getCapBasicInfo(thisCapId).getOutput();
		    if (capBasicInfo) {
		    	var thisCapType = capBasicInfo.getCapType();
		    	if (String(thisCapType) == "Licenses/Cultivator/Conversion Request/NA"){
		      		var capStatus = capBasicInfo.getCapStatus();
			      	if (!matches(capStatus,"Abandoned", "License Issued")){
			      		cancel = true;
						showMessage = true;
						logMessage(" Your license is not eligible for this license change request as you have a conversion request in progress. If you have questions, please contact DCC Licensing at <a href='mailto:licensing@cannabis.ca.gov'>licensing@cannabis.ca.gov</a>");
					}
		      	}
			}	
		}
		
	}else{ 
		logDebug( "**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()) ;
	}			

		
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivator/Amendment/License Change: Eligibility check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivator/Amendment/License Change: Eligibility check:  " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}
