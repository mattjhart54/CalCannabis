/*------------------------------------------------------------------------------------------------------/
| Program: PERMIT_ONEYEAR_INSPECTION.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 03/05/2013 - Jaime Shear
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_BATCH"));


function getScriptText(vScriptName) {
vScriptName = vScriptName.toUpperCase();
var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
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

var altID = getParam("recordNumber");							
var firstName = getParam("ownerFirstName");
var lastName = getParam("ownerLastName");
var ownerEmail = getParam("ownerEmail");
var emailAddress = getParam("emailAddress");


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;


var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING","RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));

var systemUserObj = aa.person.getUser("ADMIN").getOutput();


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


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() {
	
	try{
		var numRows = 0;	

		capId = getApplication(altID);
		var tblOwner = loadASITable("OWNERS",capId);

		for (row in tblOwner){
			if(tblODefic[row]["First Name"]==firstName && tblODefic[row]["Last Name"]==lastName && tblODefic[row]["Email Address"]==ownerEmail){
				var capIDModel = aa.cap.getCapIDModel(capId.getID1(), capId.getID2(), capId.getID3()).getOutput();
				deletedAppSpecificTableInfors("OWNERS", capIDModel, row);
				numRows++
				logDebug("Deleted " + firstName + " " + lastName + " from the Owners Table of Record " + altID + " ROW: " + numRows);
			}
		}
		if (numRows = 0){
			logDebug("Could not find a table value that fits the provided criteria");
		}
	}catch (err){
		logDebug("ERROR: " + err.message + " In " + batchJobName);
		logDebug("Stack: " + err.stack);
	}

}