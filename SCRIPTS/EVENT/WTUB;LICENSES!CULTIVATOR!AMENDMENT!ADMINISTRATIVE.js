try {
	var amendContactResult = aa.people.getCapContactByCapID(capId);
	if (amendContactResult.getSuccess()){
		var amendContacts = amendContactResult.getOutput();
		var cntBusiness = 0;
		var cntASOP = 0;
		for (a in amendContacts){
			if(amendContacts[a].getCapContactModel().getContactType()== "Business") 
				++cntBusiness;
			if(amendContacts[a].getCapContactModel().getContactType()== "Agent for Service of Process") 
				++cntASOP;	
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
	}
			
} catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/AMENDMENT/ADMINISTRTIVE: Check Number of contacts " + err.message);
	logDebug(err.stack);
}