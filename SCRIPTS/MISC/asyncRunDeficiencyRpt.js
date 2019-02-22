try{
//	aa.env.setValue("altId", "LCA19-0000071");
//	aa.env.setValue("newAltId", "LCA19-0000071-DEF01T");
//	aa.env.setValue("currentUserID", "MHART");
//	aa.env.setValue("reportName", "Deficiency Report - Owner");
	var altId = "" + aa.env.getValue("altId");
	var newAltId = "" + aa.env.getValue("newAltId");
	var currentUserID = "" + aa.env.getValue("currentUserID");
	var reportName = "" + aa.env.getValue("reportName");
	var br = "<BR>";
	var eTxt = "";
	var sDate = new Date();
	var sTime = sDate.getTime();
	reportResult = aa.reportManager.getReportInfoModelByName(reportName);
	if (!reportResult.getSuccess()){
		aa.print("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
		eTxt+="**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage() +br; 
	}
	var report = reportResult.getOutput(); 
	var tmpID = aa.cap.getCapID(altId).getOutput(); 
	cap = aa.cap.getCap(tmpID).getOutput();
	appTypeResult = cap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
	report.setModule(appTypeArray[0]); 
	//report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3()); 
	report.setCapId(tmpID.getID1() + "-" + tmpID.getID2() + "-" + tmpID.getID3()); 
	report.getEDMSEntityIdModel().setAltId(altId);
	var parameters = aa.util.newHashMap();              
	parameters.put("p1value",altId);
	parameters.put("p2value",newAltId);
	report.setReportParameters(parameters);
	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) { 
		var reportResult = aa.reportManager.getReportResult(report); 
		aa.print("Report " + reportName + " has been run for " + altId);
		eTxt+=("Report Report " + reportName + " has been run for " + altId) +br;
	}else{
		aa.print("No permission to report: "+ reportName + " for user: " + currentUserID);
		eTxt+="No permission to report: "+ reportName + " for user: " + currentUserID;
	}
//----------------------- 
} catch(err){
	aa.print("An error has occurred in RunAsync: Deficiency Report: " + err.message);
	aa.print(err.stack);
	aa.sendMail("calcannabislicensing@cdfa.ca.gov", "mhart@trustvip.com", "", "AN ERROR HAS OCCURRED IN RunAsync: ", "Report " + reportName + " for record " + altId + br + eTxt);
}
