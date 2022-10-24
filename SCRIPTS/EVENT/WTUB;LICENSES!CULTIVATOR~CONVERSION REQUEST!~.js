try {
	var licType = AInfo["Proposed License Type"];		
	if(licType.substring(0,5) == "Large") {
		if(matches(AInfo["Canopy SF-NEW"],null,"",undefined) && matches(AInfo["Canopy SF],null,"",undefined)) {
			showMessage = true;
			cancel = true;
			comment("There must be a value entered in the Canopy Square Footage field to process this conversion request")
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUB:Licenses/Cultivation/Conversion Request/*: Update conversion license table: " + err.message);
	logDebug(err.stack);
}
