// mhart 100918 Story 5738 and 5739 Changes to generate carrect approval letter based on CAP status
try{
	if(balanceDue<=0 && matches(capStatus, "License Issued", "Provisional License Issued")){
		if(capStatus == "License Issued")
			var licType = "annual";
		else 
			var licType = "provisional"; 
		var parCapId = getParent();
		if(parCapId){
			var appAltId = capId.getCustomID();
			var licAltId = parCapId.getCustomID();
			var scriptName = "asyncRunOfficialLicenseRpt";
			var envParameters = aa.util.newHashMap();
			envParameters.put("licType", licType);
			envParameters.put("appCap",appAltId);
			envParameters.put("licCap",licAltId); 
			envParameters.put("reportName","Official License Certificate"); 
			envParameters.put("currentUserID",currentUserID);
			envParameters.put("contType","Designated Responsible Party");
			envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
			aa.runAsyncScript(scriptName, envParameters);
		}	
		if(capStatus=="License Issued") 
			runReportAttach(capId,"Approval Letter", "p1value", capId.getCustomID());
		else
			runReportAttach(capId,"Approval Letter Provisional", "p1value", capId.getCustomID());
// mhart 100918 Story end
		
//mhart 180430 story 5392 Attach the Official License to the email sent
//   moved to the asyncRunOfficialLicenseReport
//		emailRptContact("PRA", "LCA_APP_APPROVAL_PAID", "Official License Certificate", true, capStatus, capId, "Designated Responsible Party", "altId", parCapId.getCustomID());
//mhart 180430 story 5392 end 

//lwacht: 180123: story 4679: add post contacts to a set; create set if it does not exist
		var priContact = getContactObj(capId,"Designated Responsible Party");
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					if(capStatus=="License Issued") 
						var sName = createSet("LICENSE_ISSUED","License Notifications", "New");
					else
						var sName = createSet("PROV_LICENSE_ISSUED","License Notifications", "New");
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
//mhart 181019 story 5756 Add record to set if preference is postal
			var priContact = getContactObj(capId,"Designated Responsible Party");
			if(priContact){
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						var sName = createSet("APPSUBMITTED","License Notifications", "New");
						if(sName){
							setAddResult=aa.set.add(sName,capId);
							if(setAddResult.getSuccess()){
								logDebug(capId.getCustomID() + " successfully added to set " +sName);
							}else{
								logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
							}
						}
					}else {
						emailRptContact("PRA", "LCA_APPLICATION _SUBMITTED", "", false, capStatus, capId, contType);
					}
				}	
			}
//mhart 181019 story 5756 end
		}
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/* /APPLICATION: Admin Fees Paid: " + err.message);
	logDebug(err.stack);
}
//mhart 180409 user story 5391 - end
//lwacht: 180419: story 5441: end