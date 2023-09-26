try{
	if(balanceDue<=0){
		if (!matches(getAppStatus(),"Deferral Approved","Deferral Unpaid")){
			if(!isTaskComplete("Annual Renewal Review") && !isTaskComplete("Provisional Renewal Review")){
				if (AInfo["License Issued Type"] == "Provisional") {
					activateTask("Provisional Renewal Review");
					updateTask("Provisional Renewal Review","In Progress","","");
					deactivateTask("Annual Renewal Review");
				}else{
					activateTask("Annual Renewal Review");
					updateTask("Annual Renewal Review","In Progress","","");
					deactivateTask("Provisional Renewal Review");
				}
			}
			if(getAppStatus() == "Renewal Fee Due") {
				rAltId = capId.getCustomID();
				var event = "PRA";
				var fastTrack = "No";
				hasFee = false;
				fastTrack = renewalProcess(rAltId, event, hasFee); 
			}
			if (fastTrack == "No" && getAppStatus != 'Submitted'){
				updateAppStatus("Submitted", "Updated via PRA:LICENSES/CULTIVATOR/*/Renewal.");
			}
		}else{
				updateAppStatus("Deferral Paid", "Updated via PRA:LICENSES/CULTIVATOR/*/Renewal.");
			}		
	}
//Send email Notification for NSF Payments
	var dishonoredPayment = verifyFeePayment("LIC_NSF", PaymentDate);
	if (dishonoredPayment){
		email("Payments@cannabis.ca.gov", "noreply@cannabis.ca.gov", "Dishonored Payment Fee paid on " + capId.getCustomID(), "This serves as notice that a payment has been made on record " + capId.getCustomID() + " that includes a dishonored payment fee.") 
	}
}catch(err){
	logDebug("An error has occurred in PRA:LICENSES/CULTIVATOR/*/Renewal: Renewal Fees Paid: " + err.message);
	logDebug(err.stack);
}
