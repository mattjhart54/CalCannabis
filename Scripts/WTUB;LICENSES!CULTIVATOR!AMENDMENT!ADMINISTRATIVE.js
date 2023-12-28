try {
	var amendContactResult = aa.people.getCapContactByCapID(capId);
	if (amendContactResult.getSuccess()){
		var amendContacts = amendContactResult.getOutput();
		var cntBusiness = 0;
		var cntASOP = 0;
		var cntIndv = 0;
		for (a in amendContacts){
			if(amendContacts[a].getCapContactModel().getContactType()== "Business") 
				++cntBusiness;
			if(amendContacts[a].getCapContactModel().getContactType()== "Agent for Service of Process") 
				++cntASOP;	
			if(amendContacts[a].getCapContactModel().getContactType()== "Individual") 
				++cntIndv;	
		}
		if(cntBusiness != 1) {
			cancel=true;
			showMessage=true;
			comment("There must be one and only one Business contact");
		}
		if(cntASOP != 1) {
			cancel=true;
			showMessage=true;
			comment("There must be one and only one Agent for Service Process contact");
		}
		if(cntIndv > 0) {
			cancel=true;
			showMessage=true;
			comment("Individual is not a valid contact type for an Administrative Amenmdment record.  Please remove the contact or set the contact type to Business or Agent for Service of Process");
		}
	}
			
} catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/AMENDMENT/ADMINISTRTIVE: Check Number of contacts " + err.message);
	logDebug(err.stack);
}