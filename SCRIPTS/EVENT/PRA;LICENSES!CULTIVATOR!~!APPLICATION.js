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
		//lwacht: 180123: story 4679: add post contacts to a set; create set if it does not exist
		var priContact = getContactObj(capId,"Designated Responsible Party");
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("LICENSE_ISSUED","License Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,parCapId);
						if(setAddResult.getSuccess()){
							logDebug(capId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
		//lwacht: 180123: story 4679: end
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/APPLICATION: License Fee Paid: " + err.message);
	logDebug(err.stack);
}

//lwacht
//activate admin  review task when app fees are paid
try{
	if(balanceDue<=0 && !isTaskComplete("Administrative Review")){
		activateTask("Administrative Review")
		activateTask("Owner Application Reviews")
		updateAppStatus("Submitted", "Updated via PRA:LICENSES/CULTIVATOR/*/APPLICATION.");
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/APPLICATION: Admin Fees Paid: " + err.message);
	logDebug(err.stack);
}
//mhart 180409 user story 5391 - Send submitted application notice when the application fee is paid in full
try {
	if(balanceDue<=0){
		feeFound = false
		feeTbl = loadFees(capId);
			for(x in feeTbl) {
				feeItem = feeTbl[x];
				if(feeItem.code.indexOf("LI",6) > 0  || feeItem.code == "LIC_NSF") {
					feeFound = true;
				}
			}
		if(!feeFound) {
			contType = "Designated Responsible Party";
			addrType = "Mailing";
			var liveScanNotActive = lookup("LIVESCAN_NOT_AVAILABLE","LIVESCAN_NOT_AVAILABLE");
			if(!matches(liveScanNotActive,true, "true")){
				runReportAttach(capId,"Submitted Annual Application", "Record ID", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
			}else{
				runReportAttach(capId,"Submitted Annual App No LiveScan", "altId", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
			}	
			emailRptContact("ASIUA", "LCA_APPLICATION _SUBMITTED", "", false, capStatus, capId, contType);	
		}
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/APPLICATION: Admin Fees Paid: " + err.message);
	logDebug(err.stack);
}
//mhart 180409 user story 5391 - end