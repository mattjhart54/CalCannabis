/* lwacht: 180809: this may need to be added back in, so commenting out for now
//lwacht
//create official license record
try{
	if(balanceDue<=0 && capStatus == "License Issued"){
		var parCapId = getParent();
		if(parCapId){
			runReportAttach(parCapId,"Official License Certificate", "altId", parCapId.getCustomID());
		}
		runReportAttach(capId,"Approval Letter", "p1value", capId.getCustomID());
//mhart 180430 story 5392 Attach the Official License to the email sent
		emailRptContact("PRA", "LCA_APP_APPROVAL_PAID", "Official License Certificate", true, capStatus, capId, "Designated Responsible Party", "altId", parCapId.getCustomID());
//mhart 180430 story 5392 end 
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
	logDebug("An error has occurred in PPA:LICENSES/CULTIVATOR/* /APPLICATION: License Fee Paid: " + err.message);
	logDebug(err.stack);
}
lwacht: 1800809: end */ 


//lwacht: 1800809: 5442: this logic needs to run in the payment processing portlet as well
//activate admin  review task when app fees are paid
try{
	if(balanceDue<=0 && !isTaskComplete("Administrative Review")){
		activateTask("Administrative Review")
		activateTask("Owner Application Reviews")
		updateAppStatus("Submitted", "Updated via PPA:LICENSES/CULTIVATOR/*/APPLICATION.");
	}
}catch(err){
	logDebug("An error has occurred in PPA:LICENSES/CULTIVATOR/*/APPLICATION: Admin Fees Paid: " + err.message);
	logDebug(err.stack);
}
//lwacht: 1800809: 5442: end

/* lwacht: 180809: this may need to be added back in, so commenting out for now
//lwacht: 180419: story 5441: report only populates correctly in async mode
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
				//runReportAttach(capId,"Submitted Annual Application", "Record ID", capId.getCustomID(), "Contact Type", contType, "Address Type", addrType, "servProvCode", "CALCANNABIS");
				var scriptName = "asyncRunSubmittedApplicRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("sendCap",capIDString); 
				envParameters.put("reportName","Submitted Annual Application"); 
				envParameters.put("contType",contType); 
				envParameters.put("addrType",addrType); 
				envParameters.put("currentUserID",currentUserID);
				aa.runAsyncScript(scriptName, envParameters);
			}else{
				//runReportAttach(capId,"Submitted Annual App No LiveScan", "altId", capIDString, "Contact Type", contType, "Address Type", addrType);
				var scriptName = "asyncRunSubmittedApplicRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("sendCap",capIDString); 
				envParameters.put("reportName","Submitted Annual App No LiveScan"); 
				envParameters.put("contType",contType); 
				envParameters.put("addrType",addrType); 
				envParameters.put("currentUserID",currentUserID);
				aa.runAsyncScript(scriptName, envParameters);
			}	
			emailRptContact("ASIUA", "LCA_APPLICATION _SUBMITTED", "", false, capStatus, capId, contType);	
		}
	}
}catch(err){
	logDebug("An error has occurred in PPA:LICENSES/CULTIVATOR/* /APPLICATION: Admin Fees Paid: " + err.message);
	logDebug(err.stack);
}
//mhart 180409 user story 5391 - end
//lwacht: 180419: story 5441: end
lwacht: 1800809: end */ 

