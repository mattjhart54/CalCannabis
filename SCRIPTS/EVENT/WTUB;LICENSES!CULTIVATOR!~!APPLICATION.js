//lwacht: when the status is "Additional Information Needed" and the preferred channel is *not* email,
//display the deficiency report for printing. Note: only use the primary contact's preferred channel
try{ 
	if("Administrative Manager Review".equals(wfTask) && "Deficiency Letter Sent".equals(wfStatus)){
		var showReport = false;
		//lwacht : 170823 : removing primary contact
		//var priContact = getContactObj(capId,"Primary Contact");
		//if(priContact){
		//	var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		//	if(priChannel.indexOf("Postal") > -1){
		//		showReport = true;
		//	}
		//}
		//lwacht: 170815: uncommenting in preparation for Primary Contact going away
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(!matches(priChannel,"",null,"undefined")){
				if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
					showReport = true;
				}
			}
		}
		if(showReport){
			showDebug=false;
			//lwacht: 170815: updated report name
			displayReport("Deficiency Report", "Record ID", capIDString);
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	aa.print(err.stack);
}

//lwacht: when the status is set to a status that requires notification and the preferred channel is *not* email,
//display the appropriate report for printing
try{
	if(matches(wfStatus, "Deficiency Letter Sent", "Science Manager Review Completed")){
		showDebug=false;
		//lwacht : 170823 : removing primary contact
		//var priContact = getContactObj(capId,"Primary Contact");
		//var showReport = false;
		//if(priContact){
		//	var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		//	if(priChannel.indexOf("Postal") >-1){
		//		showReport = true;
		//	}
		//}
		//lwacht: 170815: uncommenting in preparation for Primary Contact going away
		var drpContact = getContactObj(capId,"Designated Responsible Party");
		if(drpContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ drpContact.capContact.getPreferredChannel());
			if(!matches(priChannel,"",null,"undefined")){
				if(priChannel.indexOf("Email") < 0 && priChannel.indexOf("E-mail") < 0){
					showReport = true;
				}
			}
		}
		if(showReport){
			var rptName = "";
			switch(""+wfStatus){
				case "Science Manager Review Completed": rptName = "Approval Letter and Invoice"; break;
				default: rptName = "Deficiency Report";
			}
			displayReport(rptName, "Record Id", capIDString);
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Deficiency Notice: " + err.message);
	aa.print(err.stack);
}

//lwacht: all owner records need to be updated before this task can be updated
try{
	if("Owner Application Reviews".equals(wfTask) && "Owner Application Reviews Completed".equals(wfStatus)){
		var ownerUpdated=true;
		var notUpdated = "Yes";
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application");
		if(arrChild){
			for(ch in arrChild){
				var currCap = capId;
				capId = arrChild[ch];
				if(isTaskActive("Owner Application Review")){
					ownerUpdated=false;
					if(notUpdated=="Yes"){
						notUpdated= arrChild[ch].getCustomID();
					}else {
						notUpdated += "; " + arrChild[ch].getCustomID();
					}
				}
			}
			capId = currCap;
			if(!ownerUpdated){
				cancel=true;
				showMessage=true;
				comment("The following owner record(s) need to be updated before continuing: " + notUpdated);
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Check owner update: " + err.message);
	aa.print(err.stack);
}


//lwacht: license can only be issued from PRA
try{
	if("Application Disposition".equals(wfTask) && "License Issued".equals(wfStatus)){
		cancel=true;
		showMessage=true;
		comment("The license can only be issued upon payment of fees.");
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Stop license issuance: " + err.message);
	aa.print(err.stack);
}
//lwacht
//add fees
//lwacht: don't run for temporary app 
try{
	if(appTypeArray[2]!="Temporary" && wfStatus=="Science Manager Review Completed"){
		var feeDesc = AInfo["License Type"] + " - License Fee";
		var thisFee = getFeeDefByDesc("LIC_CC_CULTIVATOR", feeDesc);
		if(thisFee){
			updateFee_Rev(thisFee.feeCode,"LIC_CC_CULTIVATOR", "FINAL", 1, "Y", "N");
		}else{
			aa.print("An error occurred retrieving fee item: " + feeDesc);
			aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: WTUB:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Application Submitted: Add Fees: " + err.message);
	aa.print(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: WTUB:Licenses/Cultivation/*/Application: Add Fees: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht: if cash has been selected as a payment type, the letter must be sent before anything else can be done on the record
try{
	var priContact = getContactObj(capId,"Designated Responsible Party");
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(priChannel.indexOf("Postal") > -1){
				if("Application Fee Due".equals(capStatus) && wfStatus!="Cash Payment Due Letter Sent"){
					cancel=true;
					showMessage=true;
					comment("The 'Cash Payment Due Letter' must be sent before this record can be processed.");
				}
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Cash Payment Required: " + err.message);
	aa.print(err.stack);
}
//mhart - check for local auth email
try {
	if(matches(wfStatus,"Local Auth Sent - 10","Local Auth Sent - 60") && AInfo["Manually Send Local Authority Notification"] != "CHECKED"){
		if(AInfo["Local Authority Type"] == "County")
			var locAuth = AInfo["Local Authority County"];
		if(AInfo["Local Authority Type"] == "City")
			var locAuth = AInfo["Local Authority City"];
		if(AInfo["Local Authority Type"] == "City and County")
			var locAuth = AInfo["Local Authority City"] + "-" + AInfo["Local Authority County"];
		var locEmail = lookup("LIC_CC_LOCAL_AUTH_CONTACTS", locAuth);
		if(matches(locEmail, null, "", undefined)) {
			showMessage = true;		
			cancel = true;
			comment("Local Authority Notification not sent.  No email address found for the local authority " + locAuth)
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Local Auth Notice: " + err.message);
	aa.print(err.stack);
}