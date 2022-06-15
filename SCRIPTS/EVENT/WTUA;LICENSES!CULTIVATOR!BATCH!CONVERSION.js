try {
	if(wfStatus == "Processed"){
		if(AInfo["Pause Renewal"] == "Check to stop renewal notices") 
			fieldUpdate = "CHECKED"
		else
			fieldUpdate = "UNCHECKED";
		for(i in LICENSES) {
			licRec = LICENSES[i]["License Number"];
			licRecId = aa.cap.getCapID(licRec).getOutput();
			editAppSpecific("Pause Renewal Notice",fieldUpdate,licRecId)
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/Batch/Conversion: " + err.message);
	logDebug(err.stack);
}
