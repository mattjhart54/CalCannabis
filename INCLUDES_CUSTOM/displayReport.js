/*===========================================
Title: displayReport
Purpose: Display a report in a separate window 
	NOTE: This has to be run from the BEFORE event
		  and showDebug has to be turned off.
Author: Lynda Wacht		
Functional Area : Reports
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : 
Parameters:
	rptName: Text: Name of the report
	rptParams: Optional report parameter(s): "agencyid",servProvCode,"capid",myCapId
============================================== */
function displayReport(reportName) {
try{
	// create a hashmap for report parameters
	var parameters = aa.util.newHashMap();
	for (var i = 1; i < arguments.length; i = i + 2) {
		parameters.put(arguments[i], arguments[i + 1]);
	}
	//returns the report file which can be attached to an email.
	var report = aa.reportManager.getReportModelByName(reportName);
	report = report.getOutput();
	var permit = aa.reportManager.hasPermission(reportName, currentUserID);
	if (permit.getOutput().booleanValue()) {
		var reportResult = aa.reportManager.runReport(parameters, report);
		if (reportResult) {
			var reportOutput = reportResult.getOutput();
			showMessage = true;
			showDebug = false;
		  // message is a global Accela variable. Addding the URL to it
		  // pushes the request over to the web server. The regular
		  // way to do this is using the comment method, but that appends a 
		  // <br> tag, causing havoc on the server side.
		  message += reportOutput;
	  } else {
		  logDebug("System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
		  return false;
	  }
	} else {
	  logDebug("You have no permissions to view this report.");
	  return false;
	}
}catch(err){
	logDebug("An error occurred in displayReport: " + err.message);
	logDebug(err.stack);
}}