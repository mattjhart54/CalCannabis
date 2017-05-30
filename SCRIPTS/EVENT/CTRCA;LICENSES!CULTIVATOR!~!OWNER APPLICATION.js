// lwacht
// set altId based on application parent
try{
	if(parentCapId){
		nbrToTry = y+1;
		//because owners can be added and deleted, need a way to number the records
		//but only if they haven't been numbered before
		if(capId.getCustomID().substring(0,3)!="LCA"){
			var ownerGotNewAltId = false;
			var newIdErrMsg = "";
			for (i = 0; i <= 100; i++) {
				if(nbrToTry<10){
					var nbrOwner = "00" + nbrToTry;
				}else{
					if(nbrToTry<100){
						var nbrOwner = "0" + nbrToTry
					}
					var nbrOwner = ""+ nbrToTry;
				}
				var newAltId = parentCapId.getCustomID() + "-" + nbrOwner + "O";
				var updateResult = aa.cap.updateCapAltID(capId, newAltId);
				if (updateResult.getSuccess()) {
					logDebug("Updated owner record AltId to " + newAltId + ".");
					ownerGotNewAltId = true;
					break;
				}else {
					newIdErrMsg += updateResult.getErrorMessage() +"; ";
					nbrToTry++;
				}
			}
			if(!ownerGotNewAltId){
				logDebug("Error renaming owner record " + capId + ":  " + newIdErrMsg);
				aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "Error renaming owner record " + capId + ": " + startDate, newIdErrMsg);
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail("CALTREES-noreply@resources.ca.gov", debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Required Documents: "+ startDate,capId + "; " + err.message+ "; "+ err.stack);
}
