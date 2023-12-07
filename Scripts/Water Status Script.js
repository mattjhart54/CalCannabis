
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_WATER_STATUS Update
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
|  
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
var maxSeconds = 7 * 60;
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

var emailAddress = "mhart@trustvip.com";
var sysFromEmail = "calcannabislicensing@cdfa.ca.gov";
var useAppSpecificGroupName = false;
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var WSTATUS = [
  {
    "License_Number": "CCL20-0000003",
    "Application_Number": "LCA20-0000003",
    "Water_Source_Review": "Incomplete",
    "Groundwater_Well_Review": "N/A",
    "Rainwater_Review": "Incomplete",
    "Retail_Water_Review": "N/A",
    "Small_Retail_Water_Review": "N/A",
    "Water_Right_Review": "N/A"
  },
  {
    "License_Number": "CCL19-0000088",
    "Application_Number": "LCA19-0000088",
    "Water_Source_Review": "Complete",
    "Groundwater_Well_Review": "Complete",
    "Rainwater_Review": "N/A",
    "Retail_Water_Review": "N/A",
    "Small_Retail_Water_Review": "N/A",
    "Water_Right_Review": "N/A"
  },
  {
    "License_Number": "CCL18-0000007",
    "Application_Number": "LCA18-0000007",
    "Water_Source_Review": "Complete",
    "Groundwater_Well_Review": "N/A",
    "Rainwater_Review": "N/A",
    "Retail_Water_Review": "Complete",
    "Small_Retail_Water_Review": "Complete",
    "Water_Right_Review": "N/A"
  }
]
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

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
	logDebug("ERROR: BATCH_WSTATUS Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{ 
	var recCnt = 0;
	var rejCnt = 0;
	for (i in WSTATUS) {
		if(!matches(WSTATUS[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(WSTATUS[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("WSTATUS row for " + WSTATUS[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(WSTATUS[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("WSTATUS row for " + WSTATUS[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		recCnt++;
	//	logDebug("processing record " + WSTATUS[i]["License_Number"]);
		editAppSpecific("Water Source Review Status",WSTATUS[i]["Water_Source_Review"]);
		editAppSpecific("Groundwater Well Review Status",WSTATUS[i]["Groundwater_Well_Review"]);
		editAppSpecific("Rainwater Catchment Review Status",WSTATUS[i]["Rainwater_Review"]);
		editAppSpecific("Retail Water Supplier Review Status",WSTATUS[i]["Retail_Water_Review"]);
		editAppSpecific("Small Retail Water Supplier Review Status",WSTATUS[i]["Small_Retail_Water_Review"]);
		editAppSpecific("Water Rights Review Status",WSTATUS[i]["Water_Right_Review"]);
	}
	logDebug("Total Records Processed : " + WSTATUS.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: Science Conversion Water Status: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
