/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CONVERSION_CCT_EXTRACT
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to create file of new and old license number for CCT.
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
 
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sendToEmail", "mhart@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubtype", "License");
aa.env.setValue("recordCategory", "License");

*/
 
var emailAddress = getJobParam("emailAddress");			// email to send report
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appSubtype = getJobParam("recordSubtype");
var appCategory = getJobParam("recordCategory");

;

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
	var capCount = 0;
	var rptDate = new Date();
	var pYear = rptDate.getYear() + 1899;
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
	var newRptName = "LicenseNbrs" + rptDateFormatted + ".txt";
	logDebug("newRptName: " + newRptName);
	var rptToEmail = filepath + "/" + newRptName;
	var capFilterBalance = 0;
	var capFilterDateRange = 0;
	var capCount = 0;

	capListResult = aa.cap.getByAppType(appGroup,appTypeType,appSubtype,appCategory);
	if (capListResult.getSuccess()) {
		capList = capListResult.getOutput();
		logDebug("Category count: " + capList.length);			
	}else{
		logDebug("Error retrieving records: " + capListResult.getErrorMessage());
	}
	if (capList.length > 0) {
		logDebug("Found " + capList.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
	for (myCapsXX in capList) {
    	capId = capList[myCapsXX].getCapID();
		altId =	 capId.getCustomID();
		altSuffix = altId.substring(3)
		cap = aa.cap.getCap(capId).getOutput();	
		capStatus = cap.getCapStatus();
		var capModel = aa.cap.getCap(capId).getOutput().getCapModel();
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var AInfo = [];
		loadAppSpecific(AInfo);
		var licId = "";
	//logDebug("Processing altId: " + altId+ " " + altSuffix);
		var rptLine = "";
		if(AInfo["License Issued Type"] == "Provisional" && AInfo["Cultivator Type"] == "Medicinal")
			licId = "PML" + altSuffix;
		if(AInfo["License Issued Type"] == "Provisional" && AInfo["Cultivator Type"] == "Adult-Use")
			licId = "PAL" + altSuffix;
		if(AInfo["License Issued Type"] == "Annual" && AInfo["Cultivator Type"] == "Medicinal")
			licId = "CML" + altSuffix;
		if(AInfo["License Issued Type"] == "Annual" && AInfo["Cultivator Type"] == "Adult-Use")
			licId = "CAL" + altSuffix;			
		rptLine += ""+ licId;
				rptLine += ","+ altId;
	//logDebug("rptLine: " + rptLine);
	//Line return after each record has been written.
		rptLine += "\r\n";
		aa.util.writeToFile(rptLine,rptToEmail);
		recdsFound = true;
		capCount ++;
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
 	logDebug("Total CAPS qualified : " + capList.length);
 	logDebug("Total CAPS processed: " + capCount);

}catch (err){
	logDebug("An error occurred in BATCH_LICENSE_CONVERSION_EXTRACT: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, emailAddress, "", "An error has occurred in " + batchJobName, err.message + br + err.stack + br + "env: av6(prod)");
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
	}
}