//lwacht: 180613: story 5499: update app name with case type
try {
	if (typeof(CASETYPE) == "object") {
		toDay = jsDateToMMDDYYYY(new Date());
		for(x in CASETYPE) {
			var caseDate = jsDateToMMDDYYYY(new Date((CASETYPE[x]["Date"])));
			if(caseDate==toDay) {
				editAppName(CASETYPE[x]["Case Type"]);
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA:Enforcement/Legal/Case/NA: Update case type (app name): " + err.message);
	logDebug(err.stack);
}
//lwacht: 180613: story 5499: end