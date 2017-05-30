//lwacht
// if this is the last owner record to be submitted, create a temp affidavit record and email the DRP
try{
	logDebug("parentCapId: " + parentCapId);
	if(parentCapId){
		var allKidsComplete = true;
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application", parentCapId);
		if(!matches(arrChild, null, "", "undefined")&& arrChild.length>0){
			for(ch in arrChild){
				thisChild = arrChild[ch];
				capChild = aa.cap.getCap(capId).getOutput();
				logDebug("capChild.getCapStatus: " + capChild.getCapStatus());
				if(capChild.getCapStatus()!="Pending"){
					allKidsComplete=false;
				}
			}
		}
		if(allKidsComplete){
			ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
			ctm.setGroup("Licenses");
			ctm.setType("Cultivator");
			ctm.setSubType("Medical");
			ctm.setCategory("Declaration");
			var newCapID = aa.cap.createSimplePartialRecord(ctm,null, "INCOMPLETE CAP").getOutput();
			var result = aa.cap.createAppHierarchy(parentCapId, newCapID); 
			if (result.getSuccess()){
				logDebug("Child application successfully linked");
			}else{
				logDebug("Could not link application: " + result.getErrorMessage());
				aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "Could not link application: Licenses/Cultivation/*/Owner Application: " + startDate, "capId: " + capId + ": " + result.getErrorMessage());
			}
		}

	}
}catch (err){
	logDebug("A JavaScript Error occurred: Licenses/Cultivation/*/Owner Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "A JavaScript Error occurred: Licenses/Cultivation/*/Owner Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}
