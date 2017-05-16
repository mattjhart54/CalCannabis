try {
	if(AInfo["Producing Dispensary"] == "CHECKED") {
		fnd = "N";
		loadASITables();
		if(typeof(CANNABISFINACIALINTEREST) == "object") {
			for(x in CANNABISFINACIALINTEREST) {
				if(CANNABISFINACIALINTEREST[x]["Type of License"] == "Producing Dispensary") 
					fnd ="Y";
			}
		}
		if (fnd == "N") {
			showMessage = true;
			cancel = true;
			comment("When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
		}
	}
}
catch (err) {
    logDebug("A JavaScript Error occurred: Licenses/Cultivation/*/*/: " + err.message);
}
		