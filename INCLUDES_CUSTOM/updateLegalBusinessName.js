function updateLegalBusinessName() {
	cList = getContactArray();
	for(c in cList) {
		if(cList[c]["contactType"] == "Business") {
			if(!matches(cList[c]["middleName"], null, "", undefined)) {
				updateWorkDesc(cList[c]["middleName"]);
			}
			else {
				updateWorkDesc("No legal business name provided");
			}
		}
	}
}