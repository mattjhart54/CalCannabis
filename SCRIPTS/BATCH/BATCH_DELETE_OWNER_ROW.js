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

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));

function getScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
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
		
		if (String(altID.substr(0,3)) == "LCR"){
			capId = getApplication(altID);
			var multTable = new Array(); 
			var lineFound = false;

			ownerInfo = loadASITable("OWNERS",capId);
			if (ownerInfo){
				for (var ii in ownerInfo) {
					if(String(ownerInfo[ii]["First Name"] + ownerInfo[ii]["Last Name"] + ownerInfo[ii]["Email Address"]) != firstName + lastName + ownerEmail) {
						row = new Array();
						row["First Name"] = ownerInfo[ii]["First Name"];
						row["Last Name"] = ownerInfo[ii]["Last Name"];
						row["Email Address"] = ownerInfo[ii]["Email Address"];
						row["Percent Ownership"] = ownerInfo[ii]["Percent Ownership"];
						multTable.push(row);
					}else{
						lineFound = true;
					}
				}				
			}
			if (lineFound){
				if (multTable.length > 0){
					removeASITable("OWNERS");
					addASITable("OWNERS", multTable,capId);
				}
			}else{
				logDebug("Defined Criteria not found in the indicated record");
			}
		}else{
			logDebug("Batch must be run against a License Conversion Record");
		}

	}catch (err){
		logDebug("ERROR: " + err.message + " In " + batchJobName);
		logDebug("Stack: " + err.stack);
	}

}
