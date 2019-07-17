try {
	if(appTypeArray[2] != AInfo["Cultivator Type"]) {
		if(AInfo["Cultivator Type"] == "Medicinal") {
			typeUpdated= editAppTypeAlias("Medicinal Cannabis Cultivator License");
			if(typeUpdated)
				logDebug("App Type Alias Succesfully Changed");
			else
				logDebug("App Type Alias Update Failed");
		}
		else {
			typeUpdated= editAppTypeAlias("Adult-Use Cannabis Cultivator License");
			if(typeUpdated)
				logDebug("App Type Alias Succesfully Changed");
			else
				logDebug("App Type Alias Update Failed");
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIU:LICENSES/CULTIVATOR/*/LICENSE: Update App Type " + err.message);
	logDebug(err.stack);
}