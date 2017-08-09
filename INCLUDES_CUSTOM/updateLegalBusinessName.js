function updateLegalBusinessName() {
	cList = getContactArray();
	for(c in cList) {
		if(cList[c]["contactType"] == "Applicant") {
			if(!matches*(cList[c]["businessName"], null, "", undefined)) {
				updateWorkDescT(cList[c]["businessName"]);
			}
			else {
				if(!matches*(cList[c]["middleName"], null, "", undefined)) {
					updateWorkDescT(cList[c]["middleName"]);
				}
				else {
					updateWorkDescT("No legal business name provided");
				}
			}
		}
	}
}