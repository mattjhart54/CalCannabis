/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_UDATE_LICENSE_FEE_DUE
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| One time script to to update License Fee Due to task status date + 90 days for any record with record 
| status of Pending Payment and the License Fee Due is blank.

| Batch job name: LCA_UDATE_LICENSE_FEE_DUE
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
var maxSeconds = 10 * 60;
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
// test parameters

aa.env.setValue("appStatus", "Pending Payment");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
//
var emailAddress = getParam("emailAddress");
var appStatus = getParam("appStatus");
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
	projectbiz = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.ProjectBusiness").getOutput();
	acaDocBiz = aa.proxyInvoker.newInstance("com.accela.aa.ads.ads.EDMS4ACABusiness").getOutput();
	
	var capFilterDate = 0;
	var capFilterTaskDate = 0
	var capFilterOverride = 0
	var capCount = 0;
	var setCreated = false;
	var currDate = new Date();
	var capList = new Array();
	capTypeModel = aa.cap.getCapTypeModel().getOutput();
	capModel = aa.cap.getCapModel().getOutput();
	capModel.setCapType(capTypeModel);
	capModel.setCapStatus(appStatus);

// query a list of records based on the above criteria
	capListResult = aa.cap.getCapIDListByCapModel(capModel);
	if (capListResult.getSuccess()) {
		capList = capListResult.getOutput();
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
// MJH Story 5843 - Remove timeout logic
		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
			logDebug("WARNING: A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
		}

		capId = aa.cap.getCapID(capList[myCapsXX].ID1, capList[myCapsXX].ID2, capList[myCapsXX].ID3).getOutput();
		if (!capId) {
			logDebug("Could not get Cap ID");
			continue;
		}
		altId = capId.getCustomID();
		
//		if(altId != "LCA18-0000100") continue;
	
		cap = aa.cap.getCap(capId).getOutput();	
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		if(appTypeArray[3] == "Owner Application" ) {
				capFilterAppType++;
				continue;
		}
		AInfo = [];
		loadAppSpecific(AInfo);
		if(matches(AInfo["License Fee Due"],null,"",undefined)) {
			statusDate = taskStatusDate("Final Review");
			if(!matches(statusDate,null,"",undefined)) {
				logDebug("----Processing record " + altId + br);
				capCount++;
				editAppSpecific("License Fee Due",nextWorkDay(dateAdd(statusDate,89)));
				logDebug("Status Date " + statusDate + " License Due Date " + nextWorkDay(dateAdd(statusDate,89)));
			}
			else {
				capFilterTaskDate++;
				continue;
		 }
		}
		else {
			capFilterDate++;
			continue;
		 }
	}
	logDebug("Total CAPS qualified : " + capList.length);
	logDebug("Ignored due to License Due Date: " + capFilterDate);
	logDebug("Ignored due to Task Status Date: " + capFilterTaskDate);
	logDebug("Total CAPS processed: " + capCount);

}catch (err){
	logDebug("ERROR: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}
}

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