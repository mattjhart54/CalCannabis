try{
	//aa.env.setValue("sendCap", "LCA18-0000664");
	//aa.env.setValue("currentUserID", "MHART");
	//aa.env.setValue("reportName", "Official License Certificate");
	//aa.env.setValue("contType", "Designated Responsible Party");
	//aa.env.setValue("addressType", "Mailing");
	var reportName = "" + aa.env.getValue("reportName");
	var sendCap = "" + aa.env.getValue("sendCap");
	var contType = "" + aa.env.getValue("contType");
	var addrType = "" + aa.env.getValue("addrType");
	var currentUserID = "" + aa.env.getValue("currentUserID");
	var br = "<BR>";
	var eTxt = "";
	var sDate = new Date();
	var sTime = sDate.getTime();
//-----------------------
	reportResult = aa.reportManager.getReportInfoModelByName(reportName);
	if (!reportResult.getSuccess()){
		aa.print("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
		eTxt+="**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage() +br; 
	}
	var report = reportResult.getOutput(); 
	var tmpID = aa.cap.getCapID(sendCap).getOutput(); 
	cap = aa.cap.getCap(tmpID).getOutput();
	appTypeResult = cap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
	report.setModule(appTypeArray[0]); 
	//report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3()); 
	report.setCapId(tmpID.getID1() + "-" + tmpID.getID2() + "-" + tmpID.getID3()); 
	report.getEDMSEntityIdModel().setAltId(sendCap);
	eTxt+="reportName: " + reportName + br;
	eTxt+="reportName: " + typeof(reportName) + br;
	var parameters = aa.util.newHashMap(); 
	if(reportName=="Submitted Annual App No LiveScan"){
		parameters.put("altId",sendCap);
		eTxt+="param altId: " + sendCap + br;
	}else{
		parameters.put("Record ID",sendCap);
	}
	parameters.put("Contact Type",contType);
	eTxt+="Contact Type: " + contType + br;
	parameters.put("Address Type",addrType);
	eTxt+="Address Type: " + addrType + br;
	report.setReportParameters(parameters);
	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) { 
		var reportResult = aa.reportManager.getReportResult(report); 
		aa.print("Report '" + reportName + "' has been run for " + sendCap);
		eTxt+=("Report '" + reportName + "' has been run for " + sendCap) +br;
	}else{
		aa.print("No permission to report: "+ reportName + " for user: " + currentUserID);
		eTxt+="No permission to report: "+ reportName + " for user: " + currentUserID;
	}
//----------------------- 
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	var eTime = (thisTime - sTime) / 1000
	//aa.sendMail("calcannabislicensing@cdfa.ca.gov", "mhart@trustvip.com", "", "INFO ONLY RunAsync: ",  tmpID + br +"elapsed time: " + eTime + " seconds. " + br + "altId: " + sendCap + br + "avpre6" + br + eTxt);
} catch(err){
	aa.print("An error has occurred in asyncRunSubmittedApplicRpt: " + err.message);
	aa.print(err.stack);
	aa.sendMail("calcannabislicensing@cdfa.ca.gov", "mhart@trustvip.com", "", "AN ERROR HAS OCCURRED IN asyncRunSubmittedApplicRpt: ",  tmpID + br +"elapsed time: " + eTime + " seconds. " + br + "altId: " + sendCap + br + "avpre6" + br + eTxt);
}
