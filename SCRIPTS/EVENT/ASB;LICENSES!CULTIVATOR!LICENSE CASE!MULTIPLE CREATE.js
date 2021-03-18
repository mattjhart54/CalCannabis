try {
	loadASITablesBefore();
	for(i in LICENSENUMBERS) {
	
		var licNum = LICENSENUMBERS[i]["License Number"]
		var licId = aa.cap.getCapID(licNum);
		if (!licId.getSuccess()){
			showMessage = true;
			comment(licNum  + " is not a valid License Number. Record cannot be submitted");
			cancel = true;
			continue;
		}else{
			licId =  licId.getOutput();
			var licCap = aa.cap.getCap(licId).getOutput();
			var licType = licCap.getCapType();
			var licTypeArray = licCap.getCapType().toString().split("/");
			if((licTypeArray[3]!="License" && licTypeArray[3]!="Provisional") || licTypeArray[2]=="Temporary"){
				showMessage = true;
				comment(licNum  + " is not an Annual or Provisional License record. Record cannot be submitted");
				cancel = true;
				continue;
			}else{
				licStatus = licCap.getCapStatus();
				if(!matches(licStatus, "Active", "About to Expire", "Expired - Pending Renewal", "Suspended", "Expired", "Inactive")) {
					showMessage = true;
					comment(licNum  + " staus is " + licStatus + ". You cannot create a Licensing Case for a license record with this status.  Record cannot be submitted");
					cancel = true;
					continue;
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in ASB:LICENSES/CULTIVATOR/License Case/Multiple Cases: " + err.message);
	logDebug(err.stack);
}
