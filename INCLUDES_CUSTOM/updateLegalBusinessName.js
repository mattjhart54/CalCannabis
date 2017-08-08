function updateLegalBusinessName() {
	if(!matches(AInfo["Legal Business Name"], null, "", undefined)) {
		updateWorkDesc(AInfo["Legal Business Name"]);
	}
	else {
		updateWorkDesc("No legal business name provided");
	}
}