try {
	loadASITablesBefore();
	if(typeof(LICENSES) == "object") {
		for(i in LICENSES) {
			var licNum = LICENSES[i]["License Number"]
			var licId = aa.cap.getCapID(licNum);
			if (!licId.getSuccess()){
				showMessage = true;
				comment(licNum  + " is not a valid Record Number. Record cannot be submitted");
				cancel = true;
				continue;
			}else{
				licId =  licId.getOutput();
				var licCap = aa.cap.getCap(licId).getOutput();
				var licType = licCap.getCapType();
				var licTypeArray = licCap.getCapType().toString().split("/");
				if(licTypeArray[3]!="License"){
					showMessage = true;
					comment(licNum  + " is not a License record. Record cannot be submitted");
					cancel = true;
					continue;
				}
			}
		}
	
	}else {
		showMessage = true;
		comment("You cannot create a Batch Conversion record unless there is one valid License Number entered in the table.  Record cannot be submitted");
		cancel = true;
	}
}catch(err){
	logDebug("An error has occurred in ASB:LICENSES/CULTIVATOR/Batch/Conversion: " + err.message);
	logDebug(err.stack);
}
