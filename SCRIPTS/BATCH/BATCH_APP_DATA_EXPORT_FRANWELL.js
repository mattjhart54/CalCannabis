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

aa.env.setValue("lookAheadDays", "-10");
aa.env.setValue("daySpan", "10");
aa.env.setValue("emailAddress", "lwacht@trustvip.com");
aa.env.setValue("sendToEmail", "lwacht@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("reportName", "CDFA_Franwell_Export");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "*");
aa.env.setValue("recordCategory", "Application");
aa.env.setValue("activeTask", "Administrative Review");
aa.env.setValue("contactType", "Designated Responsible Party");
*/

var emailAddress = getJobParam("emailAddress");			// email to send report
var lookAheadDays = getJobParam("lookAheadDays");
var daySpan = getJobParam("daySpan");
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var rptName = getJobParam("reportName");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appSubtype = getJobParam("recordSubType");
var appCategory = getJobParam("recordCategory");
var task = getJobParam("activeTask");
var contactType = getJobParam("contactType");


if(appTypeType=="*") appTypeType="";
if(appSubtype=="*")  appSubtype="";
if(appCategory=="*") appCategory="";
var filepath = "c://test"; 


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
var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan));
fromJSDate = new Date(fromDate);
toJSDate = new Date(toDate);
var dFromDate = aa.date.parseDate(fromDate);
var dToDate = aa.date.parseDate(toDate);
logDebug("fromDate: " + fromDate + "  toDate: " + toDate);

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
	var recdsFound = false;
	var tmpRecd = 0;
	var noContactType = 0;
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
	var newRptName = "CDFA" + rptDateFormatted + ".CSV";
	logDebug("newRptName: " + newRptName);
	var rptToEmail = filepath + "/" + newRptName;
	var capFilterBalance = 0;
	var capFilterDateRange = 0;
	var capCount = 0;
	setCreated = false
	var taskItemScriptModel = aa.workflow.getTaskItemScriptModel().getOutput();
	//taskItemScriptModel.setActiveFlag("Y");
	//taskItemScriptModel.setCompleteFlag("N");
	taskItemScriptModel.setTaskDescription(task);
	 taskItemScriptModel.setDisposition("noStatus");
	// taskItemScriptModel.setDisposition("noStatus");
	 //Setup the cap type criteria
	 var capTypeScriptModel = aa.workflow.getCapTypeScriptModel().getOutput();
	 capTypeScriptModel.setGroup(appGroup);
	 capTypeScriptModel.setType(appTypeType);
	 capTypeScriptModel.setSubType(appSubtype);
	 capTypeScriptModel.setCategory(appCategory); 
	 //Set the date range for the task due date criteria
	 //var startDueDate = aa.date.parseDate(fromDate));
	 //var endDueDate = aa.date.getCurrentDate();
	 //for testing purposes only
	 //var startDueDate = aa.date.parseDate(fromDate);
	 //var endDueDate = aa.date.parseDate(toDate);
	 //var appStatusList = [];
	 //appStatusList = arrAppStatus;
	 //var capResult = aa.workflow.getCapIdsByCriteria(taskItemScriptModel, startDueDate, endDueDate, capTypeScriptModel, appStatusList);
	 var capResult = aa.workflow.getCapIdsByCriteria(taskItemScriptModel, dFromDate, dToDate, capTypeScriptModel, null);
	if (capResult.getSuccess()) {
		myCaps = capResult.getOutput();
		logDebug("Found " + myCaps.length + " records to process");
	}else { 
		logDebug("Error: Getting records, reason is: " + capResult.getErrorMessage()) ;
		return false;
	}
	for (myCapsXX in myCaps) {
    	capId = myCaps[myCapsXX].getCapID();
   		//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		altId = capId.getCustomID();
		logDebug("Processing altId: " + altId);
		cap = aa.cap.getCap(capId).getOutput();		
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		if(appTypeArray[2]=="Temporary"){
			logDebug("Skipping due to temp record");
			tmpRecd++;
			continue;
		}
		var rptLine = "";
		rptLine = altId+",";
		var thisContact = getContactByType(contactType,capId);
		if(thisContact){
			if(thisContact.firstName.length>100){
				rptLine+=thisContact.firstName.substring(0,100) +",";
			}else{
				rptLine+=thisContact.firstName +",";
			}
			rptLine+=",";
			if(thisContact.lastName.length>100){
				rptLine+=thisContact.lastName.substring(0,100) +",";
			}else{
				rptLine+=thisContact.lastName +",";
			}
			if(thisContact.email.length>255){
				rptLine+=thisContact.email.substring(0,255) +",";
			}else{
				rptLine+=thisContact.email +",";
			}
			rptLine+=thisContact.phone3 +",";
			if(thisContact.middleName.length>100){
				rptLine+=thisContact.middleName.substring(0,100) +",";
			}else{
				rptLine+=thisContact.middleName +",";
			}
			//Line return after each record has been written.
			rptLine += "\r\n";
			aa.util.writeToFile(rptLine,rptToEmail);
			recdsFound = true;
		}else{
			logDebug("Skipping due to no contact type: " + contactType);
			noContactType++;
		}
	}



	if(recdsFound){
		var rFiles = [];
		rFiles.push(rptToEmail);
		//sendNotification(sysFromEmail,sendToEmail,"","","", rFiles,null);
		var result = aa.sendEmail(sysFromEmail, sendToEmail, "", newRptName, ".", rFiles);
		if(result.getSuccess()){
			logDebug("Sent email successfully!");
		}else{
			logDebug("Failed to send mail. - " + result.getErrorType());
		}
	}
 	logDebug("Total CAPS qualified : " + myCaps.length);
 	logDebug("Ignored due to temp record: " + tmpRecd);
 	logDebug("Ignored due to no contact type: " + noContactType);
 	logDebug("Total CAPS processed: " + capCount);

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

function getJobParam(pParamName){ //gets parameter value and logs message showing param value
try{
	var ret;
	if (aa.env.getValue("paramStdChoice") != "") {
		var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"),pParamName);
		if (b.getSuccess()) {
			ret = b.getOutput().getDescription();
			}	

		ret = ret ? "" + ret : "";   // convert to String
		
		logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
		}
	else {
			ret = "" + aa.env.getValue(pParamName);
			logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
		}
	return ret;
}catch (err){
	logDebug("ERROR: getJobParam: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}
