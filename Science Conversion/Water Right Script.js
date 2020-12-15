/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_WATER_RIGHT_TABLE
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

var WRIGHT = [
  {
    "License_Number": "",
    "Application_Number": "LCA19-0000088",
    "Water_Right_Number": "H032700",
    "Copy_of_Document(s)_Provided?": "Yes",
    "APN_Matches_Premises": "",
    "Diversion Type": "Stream Diversion",
    "Diversion_Lat": 40.246431,
    "Diversion_Lon": -124.049099,
    "Currently used for Cannabis?": ""
  },
  {
    "License_Number": "",
    "Application_Number": "LCA20-0000071",
    "Water_Right_Number": "B5-293",
    "Copy_of_Document(s)_Provided?": "N/A",
    "APN_Matches_Premises": "",
    "Diversion Type": "Stream Diversion",
    "Diversion_Lat": "",
    "Diversion_Lon": "",
    "Currently used for Cannabis?": "Yes"
  },
  {
    "License_Number": "CCL18-0000303",
    "Application_Number": "LCA18-0000303",
    "Water_Right_Number": "B5-293",
    "Copy_of_Document(s)_Provided?": "N/A",
    "APN_Matches_Premises": "",
    "Diversion Type": "Stream Diversion",
    "Diversion_Lat": "",
    "Diversion_Lon": "",
    "Currently used for Cannabis?": "Yes"
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
	for (i in WRIGHT) {
		if(!matches(WRIGHT[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(WRIGHT[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("WRIGHT Spatial row for " + WRIGHT[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
			recId = WRIGHT[i]["License_Number"]
		}
		else {
			capId =aa.cap.getCapID(WRIGHT[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("WRIGHT Spatial row for " + WRIGHT[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
			recId = WRIGHT[i]["Application_Number"]
		}
		recCnt++;
		if(i == 0) {
			holdId = capId;
			prevId = recId;
			var newWRIGHT = new Array;
		}
//		logDebug("processing record " + recId + " prev " + prevId);
		if(recId != prevId) {
			removeASITable("WATER RIGHTS",holdId);
			addASITable("WATER RIGHTS", newWRIGHT, holdId);
			prevId = recId;
			holdId = capId;
			var newWRIGHT = new Array;
		}
		var updt = new Array;
		updt["Water Right Number"] = WRIGHT[i]["Water_Right_Number"];
		updt["Copy of Document(s) Provided?"]= WRIGHT[i]["Copy_of_Document(s)_Provided?"];
		updt["APN Matches Premises"]= WRIGHT[i]["APN_Matches_Premises"];
		updt["Diversion Type"]= WRIGHT[i]["Diversion Type"];
		updt["Currently used for Cannabis?"]= WRIGHT[i]["Currently used for Cannabis?"];
		updt["Diversion Latitude"] = WRIGHT[i]["Diversion_Lat"].toString();
		updt["Diversion Longitude"] = WRIGHT[i]["Diversion_Lon"].toString();
		newWRIGHT.push(updt);
	}
	removeASITable("WATER RIGHTS",holdId);
	addASITable("WATER RIGHTS", newWRIGHT,holdId);
	logDebug("Total Records Processed : " + WRIGHT.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
	
}catch (err){
	logDebug("ERROR: Science Conversion Water Rights: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
