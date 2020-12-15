/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_APN_TABLE
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

var APN = [
  {
    "License_Number": "",
    "Application_Number": "LCA20-0000071",
    "APN": "665-110-006",
    "Latitude": 33.92847,
    "Longitude": -116.524908
  },
  {
    "License_Number": "",
    "Application_Number": "LCA20-0000071",
    "APN": "211-401-007-000",
    "Latitude": 40.241364,
    "Longitude": -123.838991
  },
  {
    "License_Number": "CCL18-0000303",
    "Application_Number": "LCA18-0000303",
    "APN": "013-750-03-00",
    "Latitude": 39.736756,
    "Longitude": -123.483448
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
	logDebug("ERROR: BATCH_CEQA Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	var recCnt = 0;
	var rejCnt = 0;
	for (i in APN) {
		if(!matches(APN[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(APN[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("APN Spatial row for " + APN[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
			recId = APN[i]["License_Number"]
		}
		else {
			capId =aa.cap.getCapID(APN[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("APN Spatial row for " + APN[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
			recId = APN[i]["Application_Number"]
		}
		recCnt++;
		if(i == 0) {
			holdId = capId;
			prevId = recId;
			var newAPN = new Array;
		}
//		logDebug("processing record " + recId + " prev " + prevId);
		if(recId != prevId) {
			removeASITable("APN SPATIAL INFORMATION",holdId);
			addASITable("APN SPATIAL INFORMATION", newAPN, holdId);
			prevId = recId;
			holdId = capId;
			var newAPN = new Array;
		}
		var updt = new Array;
		updt["Validated APN"] = APN[i]["APN"];
		updt["Latitude"]= APN[i]["Latitude"].toString();
		updt["Longitude"] = APN[i]["Longitude"].toString();
		newAPN.push(updt);
	}
	removeASITable("APN SPATIAL INFORMATION");
	addASITable("APN SPATIAL INFORMATION", newAPN);
	logDebug("Total Records Processed : " + APN.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
	
}catch (err){
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
