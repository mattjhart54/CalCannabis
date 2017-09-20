//lwacht: 170817: moved record creation to before script
//lwacht
//send the application fee notification letter
//lwacht 170920: paid application fee notice is not going to be sent per CDFA decision
try{
	if(balanceDue<=0 && isTaskActive("Administrative Review")){
		//runReportAttach(capId,"Paid Application Fee", "p1value", capId.getCustomID()); 
		//emailDrpPriContacts("PRA", "LCA_GENERAL_NOTIFICATION", "", false, "Application Fee Paid", capId, "RECORD_ID", capId.getCustomID());
		//emailRptContact("PRA", "LCA_GENERAL_NOTIFICATION", "", false, capStatus, capId, "Designated Responsible Party", "RECORD_ID", capId.getCustomID());
		//emailRptContact("PRA", "LCA_GENERAL_NOTIFICATION", "", false, capStatus, capId, "Primary Contact", "RECORD_ID", capId.getCustomID());
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/APPLICATION: App Fee Paid: " + err.message);
	logDebug(err.stack);
}

//lwacht
//create official license record
try{
	if(balanceDue<=0 && capStatus == "License Issued"){
		var parCapId = getParent();
		if(parCapId){
			runReportAttach(parCapId,"Official License Certificate", "altId", parCapId.getCustomID());
		}
		runReportAttach(capId,"Approval Letter", "p1value", capId.getCustomID());
		emailRptContact("PRA", "LCA_APP_APPROVAL_PAID", "", false, capStatus, capId, "Designated Responsible Party", "RECORD_ID", capId.getCustomID());
		//emailRptContact("PRA", "LCA_APP_APPROVAL_PAID", "", false, capStatus, capId, "Primary Contact", "RECORD_ID", capId.getCustomID());
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/APPLICATION: License Fee Paid: " + err.message);
	logDebug(err.stack);
}

