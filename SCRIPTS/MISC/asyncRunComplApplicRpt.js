//lwacht: 180220: story 5177: completed application not populated when run in sync.
try{
	//aa.env.setValue("sendCap", "LCA18-0000116");
	//aa.env.setValue("currentUserID", "LWACHT");
	var sendCap = "" + aa.env.getValue("sendCap");
	var currentUserID = "" + aa.env.getValue("currentUserID");
	var br = "<BR>";
	var eTxt = "";
	var sDate = new Date();
	var sTime = sDate.getTime();
//-----------------------
	var reportName = "Completed Application";
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
	var parameters = aa.util.newHashMap();              
	parameters.put("altId",sendCap);
	report.setReportParameters(parameters);
	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) { 
		var reportResult = aa.reportManager.getReportResult(report); 
		aa.print("Report 'Completed Application' has been run for " + sendCap);
		eTxt+=("Report 'Completed Application' has been run for " + sendCap) +br;
	}else{
		aa.print("No permission to report: "+ reportName + " for user: " + currentUserID);
		eTxt+="No permission to report: "+ reportName + " for user: " + currentUserID;
	}
//----------------------- 
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	var eTime = (thisTime - sTime) / 1000
	//aa.sendMail("calcannabislicensing@cdfa.ca.gov", "lwacht@trustvip.com", "", "INFO ONLY RunAsync: ",  tmpID + br +"elapsed time: " + eTime + " seconds. " + br + "altId: " + sendCap + br + "avpre6" + br + eTxt);
	//lwacht: 180108: defect 5120: end
} catch(err){
	aa.print("An error has occurred in RunAsync: Submission Report: " + err.message);
	aa.print(err.stack);
	aa.sendMail("calcannabislicensing@cdfa.ca.gov", "lwacht@trustvip.com", "", "AN ERROR HAS OCCURRED IN RunAsync: ",  tmpID + br +"elapsed time: " + eTime + " seconds. " + br + "altId: " + sendCap + br + "avpre6" + br + eTxt);
}
//lwacht: 180220: story 5177:end