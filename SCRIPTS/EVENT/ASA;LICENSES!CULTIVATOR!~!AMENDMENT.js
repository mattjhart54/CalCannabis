//lwacht
//update AltId
try{
	if(parentCapId){
		var childAmend = getChildren("Licenses/Cultivator/Medical/Amendment",parentCapId);
		var cntChild = childAmend.length;
		//cntChild ++;
		//logDebug("cntChild: " + cntChild);
		if(cntChild<10){
			cntChild = "0" +cntChild;
		}
		var newAltId = capIDString +"-DEF"+ cntChild;
		//logDebug("newAltId: " + newAltId);
		var updAltId = aa.cap.updateCapAltID(capId,newAltId);
		if(!updAltId.getSuccess()){
			logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
		}else{
			logDebug("Deficiency record ID updated to : " + newAltId);
		}
	}else{
		logDebug("No parent record found.  AltId not updated.");
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/AMENDMENT: Notify Processor: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/*/AMENDMENT: Notify Processor: "+ startDate, capId + br + err.message+ br+ err.stack);
}
