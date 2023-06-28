/*------------------------------------------------------------------------------------------------------/
| Program: ONE_TIME_LC_CLOSE
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| One Time Batch Script to CLose Licensing Cases that have a OpenedBy of Sciece - Annual and a
| Case Description of Annual Renewal Missing Science Amendment
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var sysFromEmail = "noreply@cannabis.ca.gov";
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

showDebug = "Y";

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;


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

aa.env.setValue("emailAddress", "jshear@trustvip.com");
*/
var emailAddress = getParam("emailAddress");			// email to send report


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var startDate = new Date();
var timeExpired = false;
var startTime = startDate.getTime(); // Start timer

var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING","RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
useAppSpecificGroupName = false;

var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var AInfo = new Array();

//logDebug("Historical Date Check: " + dateCheck);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
logDebug("********************************");

if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);

function mainProcess(){
	
	var capModel = aa.cap.getCapModel().getOutput();
	
	//Get the Permits from the system 
	var emptyGISArray=new Array();
	capTypeModel = capModel.getCapType();
	capTypeModel.setGroup("Licenses");
	capTypeModel.setType("Cultivator");
	capTypeModel.setSubType("License Case");
	capTypeModel.setCategory("NA");
	capModel.setCapType(capTypeModel);
	
	var typeResult = aa.cap.getCapIDListByCapModel(capModel);
	if (typeResult.getSuccess())
	{
		vCapList = typeResult.getOutput();
	}
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + typeResult.getErrorType() + ":" + typeResult.getErrorMessage());
	}

	var recCnt = 0;

	for (x in vCapList) {
		capId = aa.cap.getCapID(vCapList[x].getCapID().getID1(),vCapList[x].getCapID().getID2(),vCapList[x].getCapID().getID3()).getOutput();
		var altId = capId.getCustomID();
		
		var capResult = aa.cap.getCap(capId);

		if (!capResult.getSuccess()) {
			logDebug(altId + ": Record is deactivated, skipping");
			continue;
		} else {
			var cap = capResult.getOutput();
		}
		var capStatus = cap.getCapStatus();
		appTypeResult = cap.getCapType(); //create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		
		var appStatus = aa.cap.getCap(capId).getOutput().getCapStatus();
		var openedBy = getAppSpecific("Case Opened By",capId);
		var caseDesc = getAppSpecific("Case Description",capId);
		if (openedBy == "Science - Annual" && caseDesc == "Annual Renewal Missing Science Amendment"){
			if (appStatus != "Closed"){
				recCnt= recCnt + 1;
				var updateStatusResult = aa.cap.updateAppStatus(capId, "APPLICATION", "Closed", sysDate, "Close by One-TIme Batch Job", systemUserObj);
				if (updateStatusResult.getSuccess())
					logDebug("Updated application " + altId + " status to Closed successfully.");
				else
				logDebug("**ERROR: application " + altId + " status update to Closed was unsuccessful.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
			}
		}
	}
	logDebug("Number of Records Updated: " + recCnt);
}
	
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
