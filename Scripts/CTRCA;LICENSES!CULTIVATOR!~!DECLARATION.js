// mhart 113018 story: 5785 - Access fee on annual application and send notice to drp.
try{
//	updateAppStatus("Submitted","Updated via CTRCA:Licenses/Cultivator//Owner Application");
	editAppSpecific("Created Date", fileDate);
	updateFileDate(null);
	appId = AInfo["Application ID"];
	addParent(appId);
	parentId = getApplication(appId);
	var holdId = capId;
	capId = parentId;
	PInfo = [];
	loadAppSpecific(PInfo);
	voidRemoveAllFees();
	var feeDesc = PInfo["License Type"] + " - Application Fee";
	var thisFee = getFeeDefByDesc("LIC_CC_CULTIVATOR", feeDesc);
	if(thisFee){
		newSeq = updateFee(thisFee.feeCode,"LIC_CC_CULTIVATOR", "FINAL", 1, "Y", "N");
		var invoiceResult = aa.finance.getFeeItemInvoiceByFeeNbr(capId, newSeq, null);
		if (invoiceResult.getSuccess()) {
			var invoiceItem = invoiceResult.getOutput();
			invNbr = invoiceItem[0].getInvoiceNbr();
		}
	}else{
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/*/Declaration: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		logDebug("An error occurred retrieving fee item: " + feeDesc);
	}
	
	var scriptName = "asyncRunInvoiceParamsRpt";
	var envParameters = aa.util.newHashMap();
	envParameters.put("licCap",capId.getCustomID()); 
	envParameters.put("licType",""); 
	envParameters.put("invNbr", invNbr);
	envParameters.put("feeAmount",0);
	envParameters.put("currentUserID",currentUserID);
	envParameters.put("templateName","LCA_GENERAL_NOTIFICATION");
	aa.runAsyncScript(scriptName, envParameters);

	
	updateAppStatus("Application Fee Due", "Updated via ASA:LICENSES/CULTIVATOR/* /APPLICATION");
	updateFileDate(null);
//	runReportAttach(capId,"CDFA_Invoice_Params", "capID", capId, "invoiceNbr", ""+invNbr, "agencyid","CALCANNABIS");
	runReportAttach(capId,"Application Payment Due", "capId", capId.getCustomID(), "invoicenbr", invNbr);
//	emailRptContact("CTRCA", "LCA_GENERAL_NOTIFICATION", "CDFA_Invoice_Params", true, capStatus, capId, "Designated Responsible Party", "capID", capId.getCustomID(), "invoiceNbr", ""+invNbr, "agencyid","CALCANNABIS");
	
	var priContact = getContactObj(capId,"Designated Responsible Party");
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(priChannel.indexOf("Postal") > -1 ){
				var sName = createSet("APPLICATION_FEE_DUE","License Notifications", "New");
				if(sName){
					setAddResult=aa.set.add(sName,capId);
					if(setAddResult.getSuccess()){
						logDebug(capId.getCustomID() + " successfully added to set " +sName);
					}else{
						logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
					}
				}
			}
		}
	}
	
	var children = getChildren("Licenses/Cultivator/*/Owner Application",parentId)
	for(c in children) {
		capId = children[c];
		updateFileDate(null);
	}
	capId = holdId;
	
// set altId based on application parent	
	if(parentId){
		if(capId.getCustomID().substring(0,3)!="LCA"){
			logDebug("parentId.getCustomID(): " +parentId.getCustomID());
			var newAltId = parentId.getCustomID() + "-DEC";
			var updateResult = aa.cap.updateCapAltID(capId, newAltId);
			var newIdErrMsg = updateResult.getErrorMessage() +"; ";
			if (updateResult.getSuccess()) {
				logDebug("Updated Declaration record AltId to " + newAltId + ".");
			}else {
				logDebug("Error renaming declar record " + capId + ":  " + newIdErrMsg);
			}
		}
	}
		
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/DECLARATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/DECLARATION: Required Documents: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
