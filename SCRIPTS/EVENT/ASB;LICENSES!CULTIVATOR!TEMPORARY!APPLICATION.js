try{
	cancel = true;
	showDebug =true;
	showMessage = true;
	var ApplicantContactAddressModelList = aa.env.getValue("ApplicantContactAddressModelList");
	var RefAddressType = aa.env.getValue("RefAddressType");
	logDebug("ApplicantContactAddressModelList:"+ ApplicantContactAddressModelList);
	logDebug("RefAddressType:"+ RefAddressType);
	for (x in ApplicantContactAddressModelList){
		var thisAddr = ApplicantContactAddressModelList[x];
		for(y in thisAddr){
			if(typeof(thisAddr[y])!="function"){
				logDebug(y+": " + thisAddr[y]);
			}
		}
	}
}catch (err){
	logDebug("An error has occurred in ASB:Licenses/Cultivation/Temporary/Application: Completed field check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/Temporary/Application: Completed field check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);

}