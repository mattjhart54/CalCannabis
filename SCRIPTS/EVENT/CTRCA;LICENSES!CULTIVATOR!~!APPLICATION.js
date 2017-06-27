//lwacht
//remove conditions after documents are uploaded
try{
	var capCondResult = aa.capCondition.getCapConditions(capId,"License Required Documents");
	if (!capCondResult.getSuccess()){
		logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()) ; 
	}else{
		var ccs = capCondResult.getOutput();
		for (pc1 in ccs){
			var rmCapCondResult = aa.capCondition.deleteCapCondition(capId,ccs[pc1].getConditionNumber()); 
			if (rmCapCondResult.getSuccess())
				logDebug("Successfully removed condition to CAP : " + capId + "  (" + cType + ") " + cDesc);
			else
				logDebug( "**ERROR: removing condition to Parcel " + parcelNum + "  (" + cType + "): " + addParcelCondResult.getErrorMessage());
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Remove Conditions: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Remove Conditions: "+ startDate, capId + br + err.message+ br+ err.stack);
}
