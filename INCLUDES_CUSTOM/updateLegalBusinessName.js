function updateLegalBusinessName() {
	cList = getContactArray();
	for(c in cList) {
		if(cList[c]["contactType"] == "Applicant") {
			if(!matches(cList[c]["businessName"], null, "", undefined)) {
				updateWorkDesc(cList[c]["businessName"]);
			}
			else {
				if(!matches(cList[c]["middleName"], null, "", undefined)) {
					updateWorkDesc(cList[c]["middleName"]);
				}
				else {
					updateWorkDesc("No legal business name provided");
				}
			}
		}
	}
}