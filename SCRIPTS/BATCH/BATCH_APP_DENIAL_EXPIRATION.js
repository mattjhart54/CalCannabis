/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_APP_DENIAL
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

aa.env.setValue("lookAheadDays", "-1");
aa.env.setValue("daySpan", "0");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("asiField", "Appeal Expiry Date");
aa.env.setValue("asiGroup", "INTERNAL");
aa.env.setValue("appStatus", "Denied - Pending Appeal");
aa.env.setValue("newAppStatus", "Denied");
aa.env.setValue("sysFromEmail", "noreply_accela@cdfa.ca.gov");
aa.env.setValue("setNonEmailPrefix", "Denials");
*/
var emailAddress = getParam("emailAddress");			// email to send report
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var appStatus = getParam("appStatus");
var newAppStatus = getParam("newAppStatus");
var asiField = getParam("asiField");
var asiGroup = getParam("asiGroup");
//lwacht: 171122: duplicate
//var emailAddress = getParam("mhart@trustvip.com");
//lwacht: 171122: end
var setNonEmailPrefix = getParam("setNonEmailPrefix");
var sysFromEmail = getParam("sysFromEmail");

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
	var capFilterType = 0;
	var capFilterStatus = 0;
	var capCount = 0;
 	var capResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(asiGroup, asiField, dFromDate, dToDate);
	if (capResult.getSuccess()) {
		myCaps = capResult.getOutput();
	}else { 
		logDebug("Error: Getting records, reason is: " + capResult.getErrorMessage()) ;
		return false;
	}
	logDebug("Found " + myCaps.length + " records to process");
	    //Create a set of records where an email was not sent

	for (myCapsXX in myCaps) {		
// MJH Story 5843 - Remove timeout logic
/*		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
			logDebug("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
		}
*/		
    	capId = myCaps[myCapsXX].getCapID();
   		//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		altId = capId.getCustomID();
		if (!capId) {
			logDebug("Could not get Cap ID");
			continue;
		}
		cap = aa.cap.getCap(capId).getOutput();		
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		logDebug("app " + appStatus + " cap " + capStatus);
		if (appStatus != capStatus) {
			continue;
		}
		capCount++;
		logDebug("----Processing record " + altId + br);
		
		if (newAppStatus && newAppStatus != ""){
			updateAppStatus(newAppStatus, "set by " + batchJobName +  " batch");
		} 
		
		closeTask("Application Disposition", "Denied - No Appeal");

	}
 	logDebug("Total CAPS qualified : " + myCaps.length);
 	logDebug("Ignored due to application type: " + capFilterType);
 	logDebug("Ignored due to CAP Status: " + capFilterStatus);
 	logDebug("Total CAPS processed: " + capCount);

}catch (err){
	logDebug("ERROR: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
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