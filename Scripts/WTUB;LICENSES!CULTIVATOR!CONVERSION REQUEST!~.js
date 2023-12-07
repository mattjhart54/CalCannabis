try {
	var licType = AInfo["Proposed License Type"];		
	if(licType.substring(0,5) == "Large") {
		if(matches(AInfo["Canopy SF-NEW"],null,"",undefined) && matches(AInfo["Canopy SF"],null,"",undefined)) {
			showMessage = true;
			cancel = true;
			comment("There must be a value entered in the Canopy Square Footage field to process this conversion request")
		}
	}
	
	if(wfTask == 'Science Manager Review' && wfStatus == 'Conversion Approved') {
		if(typeof(LICENSERECORDSFORCONVERSION) == "object"){
			if(LICENSERECORDSFORCONVERSION.length > 0){
				var addedRow = true;
			}
		}
			
		if(!addedRow){
			cancel=true; 
			showMessage=true; 
			comment("Conversion record can not be submitted without a secondary license record");
		} 
	}
}catch (err){
	logDebug("A JavaScript Error occurred: WTUB:Licenses/Cultivation/Conversion Request/*: process conversion request: " + err.message);
	logDebug(err.stack);
}
