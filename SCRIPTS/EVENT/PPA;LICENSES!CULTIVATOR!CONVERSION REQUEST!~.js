try {

//Update Primary record, generate License Certificate and email with Approval Letter
	if(balanceDue <= 0) {
		var pId = AInfo["License Number"];
		var licType = AInfo["Proposed License Type"];
		plId = aa.cap.getCapID(pId).getOutput();
		updateConvRecs(plId);
		var result1 = aa.cap.removeProjectChild(capId, plId);
		if (result1.getSuccess())
			logDebug("Child Primary License successfully removed");
		else
			logDebug("Could not remove child Primary License");
			
		var result = aa.cap.createAppHierarchy(plId, capId);
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");

// Run the Scientific Checklist Reort		
		var appAltId = capId.getCustomID();
		var licAltId = plId.getCustomID();
//		runReportAttach(capId,"Scientific Review Checklist","altId",licAltId);
		var scriptName = "asyncRunScientificChecklist";
		var envParameters = aa.util.newHashMap();
		envParameters.put("saCap",licAltId);
		envParameters.put("licCap",licAltId); 
		envParameters.put("reportName","Scientific Review Checklist"); 
		envParameters.put("currentUserID",currentUserID);
		aa.runAsyncScript(scriptName, envParameters, 5000);		
		
//run the License Report and send approval email
		var scriptName = "asyncRunOfficialLicenseRpt";
		var envParameters = aa.util.newHashMap();
		envParameters.put("licType", licType);
		envParameters.put("appCap",appAltId);
		envParameters.put("licCap",licAltId); 
		envParameters.put("reportName","Official License Certificate"); 
		//envParameters.put("approvalLetter", "");
		if(AInfo["No Transition"] == "CHECKED") {
			var templateName = "LIC_CC_CCR_APPR_PROV_LIC_ISSUED";
			envParameters.put("reason", AInfo["Reason for Provisional Conversion"]);
		}else {
			envParameters.put("reason", "");
			var templateName = "LIC_CC_CCR_APPR_LIC_ISSUED";
		}
		envParameters.put("emailTemplate", templateName);
		envParameters.put("currentUserID",currentUserID);
		envParameters.put("contType","Designated Responsible Party");
		envParameters.put("fromEmail",sysFromEmail);
		aa.runAsyncScript(scriptName, envParameters, 5000);

//notify processor that converion request has been paid and new license issued		
		wf = aa.workflow.getTaskItemByCapID(capId,null).getOutput();
		for(x in wf) {
			fTask = wf[x]; 
			taskName=fTask.getTaskDescription();
			if (taskName == "Conversion Review"){
				var caseMgr = wf[x].getAssignedStaff().getFirstName()+ " " +wf[x].getAssignedStaff().getLastName();
				var assignedUserID = aa.person.getUser(wf[x].getAssignedStaff().getFirstName(),wf[x].getAssignedStaff().getMiddleName(),wf[x].getAssignedStaff().getLastName()).getOutput();
				if(assignedUserID!=null){
					var staffEmail = assignedUserID.getEmail();
					if(staffEmail){
						email(staffEmail, sysFromEmail, "CLS - Converted License has been issued", "Conversion Request Record " + appAltId + " has been approved and payment is complete. The converted license has been issued for License Record " + licAltId + ".");
					}
				}
			}
		}
	}
//Send Notification for NSF Payment
	var dishonoredPayment = verifyFeePayment("LIC_NSF", PaymentDate);
	if (dishonoredPayment){
		email(paymentEmail, sysFromEmail , "Dishonored Payment Fee paid on " + capId.getCustomID(), "This serves as notice that a payment has been made on record " + capId.getCustomID() + " that includes a dishonored payment fee.") 
	}
}catch(err){
	logDebug("An error has occurred in PPA:LICENSES/CULTIVATOR/CONVERSION REQUEST/*: " + err.message);
	logDebug(err.stack);
}
