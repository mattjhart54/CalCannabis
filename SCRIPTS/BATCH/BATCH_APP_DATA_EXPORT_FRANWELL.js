/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_APP_DATA_EXPORT_FRANWELL
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to close workflow and update the application status after the appeal perios expires.
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 4.5 * 60;
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/* test parameters 

aa.env.setValue("lookAheadDays", "-4");
//aa.env.setValue("daySpan", "0");
aa.env.setValue("emailAddress", "lwacht@trustvip.com");
aa.env.setValue("sendToEmail", "lwacht@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("reportName", "CDFA_Franwell_Export");
 */

var emailAddress = getParam("emailAddress");			// email to send report
var lookAheadDays = getParam("lookAheadDays");
//var daySpan = getParam("daySpan");
var sysFromEmail = getParam("sysFromEmail");
var sendToEmail = getParam("sendToEmail");
var rptName = getParam("reportName");

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0,0,0,0);
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var fromDate = dateAdd(null,parseInt(lookAheadDays));
//var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan));
fromJSDate = new Date(fromDate);
//toJSDate = new Date(toDate);
var dFromDate = aa.date.parseDate(fromDate);
//var dToDate = aa.date.parseDate(toDate);
logDebug("fromDate: " + fromDate); // + "  toDate: " + toDate);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);

if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	var rptDate = new Date();
	var pYear = rptDate.getYear() + 1900;
	var pMonth = rptDate.getMonth();
	var pDay = rptDate.getDate();
	var pHour = rptDate.getHours();
	var pMinute = rptDate.getMinutes();
	if(pMonth<12){
		pMonth++;
	}else{
		pMonth=1;
	}
	if (pMonth > 9)
		var mth = pMonth.toString();
	else
		var mth = "0" + pMonth.toString();
	if (pDay > 9)
		var day = pDay.toString();
	else
		var day = "0" + pDay.toString();
	if (pHour > 9)
		var hour = pHour.toString();
	else
		var hour = "0" + pHour.toString();
	if (pMinute > 9)
		var minute = pMinute.toString();
	else
		var minute = "0" + pMinute.toString();
	
	var rptDateFormatted = "" + pYear.toString() + mth + day + hour + minute;
	var newRptName = "CDFA" + rptDateFormatted;
	logDebug("newRptName: " + newRptName);
	var rptFile = renameReport(rptName, newRptName, "p1value", fromDate);
	if (rptFile) {
		var rFiles = new Array();
		rFiles.push(rptFile);
		//sendNotification(sysFromEmail,sendToEmail,"","","", rFiles,null);
		var result = aa.sendEmail(sysFromEmail, sendToEmail, "", newRptName, ".", rFiles);
		if(result.getSuccess()){
			logDebug("Sent email successfully!");
		}else{
			logDebug("Failed to send mail. - " + result.getErrorType());
		}

	}
}catch (err){
	logDebug("An error occurred in BATCH_APP_DATA_EXPORT_FRANWELL: " + err.message);
	logDebug(err.stack);
}}
	
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function getCapIdByIDs(s_id1, s_id2, s_id3)  {
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
    if(s_capResult.getSuccess())
		return s_capResult.getOutput();
    else
       return null;
}

function renameReport(rptName, newRptName){
try{
	// Get the report Object
	if(newRptName!=null){
		var thisRptName = newRptName;
	}else{
		var thisRptName = rptName +".PDF";
	}
	var rptResult = aa.reportManager.getReportInfoModelByName(rptName);
	if (!rptResult.getSuccess()) {
		logDebug("**WARNING** couldn't load report " + rptName + " " + rptResult.getErrorMessage());
		return false;
	}
	var report = rptResult.getOutput();
	// set the report module
	//var itemCap = aa.cap.getCap(capId).getOutput();
	//appTypeResult = itemCap.getCapType();
	//appTypeString = appTypeResult.toString();
	//appTypeArray = appTypeString.split("/");
	report.setModule("Licenses");
	//report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
	//report.getEDMSEntityIdModel().setAltId(capId.getCustomID());
	logDebug("Report ID: " + report.getReportId());	// create a hashmap for report parameters
	var parameters = aa.util.newHashMap();
	for (var i = 2; i < arguments.length; i = i + 2) {
		parameters.put(arguments[i], arguments[i + 1]);
		logDebug("Report parameter: " + arguments[i] + " = " + arguments[i + 1]);
	}

	report.setReportParameters(parameters);
	logDebug("Running Report as User: " + currentUserID);
	// check if the current user has permission to run the report
	var checkPermission = aa.reportManager.hasPermission(rptName,currentUserID); 
	if(checkPermission.getOutput().booleanValue()){ 
		// execute the report using Report Manager
		var rptResult = aa.reportManager.getReportResult(report); 
		if(rptResult.getSuccess()) {
			rptResult = rptResult.getOutput(); 
			if (rptResult != null){
				// save the report to a file
				var reportFile = aa.reportManager.storeReportToDisk(rptResult); 
				reportFile = reportFile.getOutput();
				//logDebug("reportFile created " + reportFile);
				// use Java.IO to save the file to a specific folder
				var file = new java.io.File(reportFile); 
				logDebug("file.parentFile: " + file.parentFile);
				var newFilePath = file.parentFile+ "\\" + thisRptName +".csv";
				var renmSuccess = file.renameTo(new java.io.File(newFilePath));
				if(renmSuccess){
					logDebug("File has been successfully renamed to " + newFilePath);
					return newFilePath;
				}else{
					logDebug("Error renaming file to Report Manager file name " + thisRptName);
				}
			}else{
				logDebug("Report result was null");
			}
		}else{
			logDebug("ERROR Executing Report: " + rptResult.getErrorMessage());
		}
	}else{
		logDebug("No permission to report: "+ rptName + " for " + systemUserObj);
	}
}catch(err){
	logDebug("An error occurred in renameReport: " + err.message);
	logDebug(err.stack);
}}