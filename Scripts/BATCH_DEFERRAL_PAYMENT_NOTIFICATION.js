/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_DEFERRAL_UNPAID
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to close workflow and update the application status after the deferral period expires.
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var errLog = "";
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
aa.env.setValue("lookAheadDays", "0");
aa.env.setValue("daySpan", "10");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("asiField", "Deferral Expiration Date");
aa.env.setValue("asiGroup", "RENEWAL INFORMATION");
aa.env.setValue("appStatus", "Deferral Approved");
aa.env.setValue("sendEmailNotifications", "Y");
aa.env.setValue("sysFromEmail", "noreply_accela@cdfa.ca.gov");
aa.env.setValue("sendEmailToContactTypes", "Business");
aa.env.setValue("emailTemplate", "LCA_RENEWAL_DEFERRAL_PAYMENT_NOTICE");
*/
var emailAddress = getParam("emailAddress");			// email to send report
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var appStatus = getParam("appStatus");
var asiField = getParam("asiField");
var asiGroup = getParam("asiGroup");
var sendEmailNotifications = getParam("sendEmailNotifications");
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");
var emailTemplate = getParam("emailTemplate");
var sysFromEmail = getParam("sysFromEmail");
var fromDate = dateAdd(null,parseInt(lookAheadDays));
var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan));
var dFromDate = aa.date.parseDate(fromDate);
var dToDate = aa.date.parseDate(toDate);

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
logDebug("fromDate: " + fromDate + "  toDate: " + toDate);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

if (!fromDate.length) { // no "from" date, assume today + number of days to look ahead
	fromDate = dateAdd(null, parseInt(lookAheadDays))
	var dFromDate = aa.date.parseDate(fromDate);
}
if (!toDate.length) { // no "to" date, assume today + number of look ahead days + span
	toDate = dateAdd(null, parseInt(lookAheadDays) + parseInt(daySpan))
	var dToDate = aa.date.parseDate(toDate);
}

logDebug("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate)


try {
	mainProcess();
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
	if (emailAddress.length) {
		aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);
		if(errLog != "") {
			aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Errors", errLog);
		}
	}
} catch (err) {
	logDebug("ERROR: BATCH_DEFERRAL_UNPAID: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}


//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	var capFilterType = 0;
	var capFilterStatus = 0;
	var capFilterReliefType = 0;
	var capCount = 0;
	var busName = "";
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
		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
			logDebug("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
		}
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
		if (!matches(appStatus,null,undefined,"")){
			if (appStatus != capStatus) {
				logDebug("----Ignoring Record Due to Status " + altId + br);
				capFilterStatus++
				continue;
			}
		}
		// Check to see if Relief Type equals Equity Relief
		var reliefType = getAppSpecific("Relief Type", capId);
		if (reliefType != "Equity Relief"){
			logDebug("----Ignoring Record Due to Relief Type, " + reliefType + ", " + altId + br);
			capFilterReliefType++
			continue;
		}
			
		
		capCount++;
		logDebug("----Processing record " + altId + br);
		
		if (sendEmailNotifications == "Y" && sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
			var conTypeArray = sendEmailToContactTypes.split(",");
			var	conArray = getContactArray(capId);
			var contactFound = false;
			for (thisCon in conArray) {
				var conEmail = false;
				thisContact = conArray[thisCon];
				if (exists(thisContact["contactType"],conTypeArray)){
					contactFound = true;
					pContact = getContactObj(capId,thisContact["contactType"]);
					conEmail = thisContact["email"];
					if (conEmail) {						
						eParams = aa.util.newHashtable();
						if(appTypeArray[3] == "Renewal") {
							altId = getAppSpecific("License Number")
							busName = thisContact["middleName"];
						}else{
							busName = getAppSpecific("Legal Business Name");
						}
						addParameter(eParams,"$$altID$$",altId);
						addParameter(eParams,"$$firstName$$",thisContact["firstName"]);
						addParameter(eParams,"$$lastName$$",thisContact["lastName"]);
						addParameter(eParams,"$$businessName$$",busName);
						addParameter(eParams,"$$expDays$$",String(lookAheadDays));
						addParameter(eParams,"$$defExpDate$$",getAppSpecific(asiField, capId));
						addParameter(eParams,"$$licType$$",getAppSpecific("License Type", capId));
						var rFiles = [];
						sendNotification(sysFromEmail,conEmail,"",emailTemplate,eParams, rFiles,capId);
						logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact["contactType"] + " : " + conEmail);						
					}
				}
			}
			if(!contactFound){
				logDebug("No contact found for notification: " + altId);
			}
		}
	}
 	logDebug("Total CAPS qualified : " + myCaps.length);
 	logDebug("Ignored due to CAP Status: " + capFilterStatus);
	logDebug("Ignored due to Relief Type: " + capFilterReliefType);
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
