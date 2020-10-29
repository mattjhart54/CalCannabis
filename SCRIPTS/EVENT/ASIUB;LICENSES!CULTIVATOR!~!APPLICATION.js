// MHART 121118 user Story 5831 - Owner Table Percentage Check
try{
	if(!publicUser) {
		var totPct = 0;
		if (typeof(OWNERS) == "object") {
			for(x in OWNERS) {
				var ownPct = parseFloat(OWNERS[x]["Percent Ownership"]);
				totPct = totPct + ownPct 
			}
		}
		if (totPct > 100 || totPct < 0) {
			cancel = true;
			showMessage = true;
			comment("The total Percent Ownership must be greater than 0 and less than 100.")
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Percent Ownership: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
try{
	if(matches(AInfo["LSA Review Status"],"Annual", "Provisional")) {
		var cmplt = true;
		if(!matches(AInfo["APN Matches Premises"],"Yes","N/A","No")) {
			cmplt = false;
		}
		if(!matches(AInfo["APN Matches Adjacent Parcel"],"Yes","N/A","No")) {
			cmplt = false;
		}
		for(r in LAKEANDSTREAMBEDALTERATION) {
			if(matches(LAKEANDSTREAMBEDALTERATION[r]["LSA ID Number"], null,"",undefined)) {
				cmplt = false;
			}
			if(matches(LAKEANDSTREAMBEDALTERATION[r]["Document Type"], null,"",undefined)) {
			 	cmplt = false;
			}
		}
		
		if(!cmplt) {
			cancel = true;
			showMessage = true;
			comment("The LSA Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	if(AInfo["Water Rights Review Status"] == "Complete") {
		wsRows = 0;
		wrRows = 0;
		for(r in SOURCEOFWATERSUPPLY) {
			if(SOURCEOFWATERSUPPLY[r]["Type of Water Supply"] == "Diversion from Waterbody") {
				wsRows = wsRows + 1;
			}
		}
			for(r in WATERRIGHTS) {
			if(WATERRIGHTS[r]["Currently used for Cannabis?"] != "No") {
				wrRows = wrRows + 1;
			}
		}
		logDebug("wsRows " + wsRows + " wrRows " + wrRows);
		if(wsRows != wrRows) {
			cancel = true;
			showmessage = true;
			comment("The number of water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.")
		}
	}
}catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Water Source Reviews: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Water Source Reviews: "+ startDate, capId + br+ err.message+ br+ err.stack);
}
