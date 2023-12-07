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

var groundWaterArray = [
  
  
  
          {
            "License_Number": "CCL20-0000003",
            "Application_Number": "LCA20-0002099",
            "Water_Source_Review": "Complete",
            "Copy of Well completion report from DWR": "Yes",
            "Or DWR Letter": "N/A",
            "APN_Address_Matches_Premises": "Yes",
            "Well_Lat": "40.2669",
            "Well_Lon": "-124.0438001",
            "Currently Used for Cannabis": "Yes"
        },
        {
            "License_Number": "CCL19-0000164",
            "Application_Number": "LCA20-0002159",
            "Water_Source_Review": "Complete",
            "Copy of Well completion report from DWR": "No",
            "Or DWR Letter": "yes",
            "Well_Lat": "39.413611",
            "Well_Lon": "-123.318056",
            "Currently Used for Cannabis": "Yes"
        },
        {
            "Application_Number": "CCL19-0000164",
            "Water_Source_Review": "Complete",
            "Copy of Well completion report from DWR": "Yes",
            "Or DWR Letter": "N/A",
            "APN_Address_Matches_Premises": "Yes",
            "Well_Lat": "39.30615",
            "Well_Lon": "-123.09466",
            "Currently Used for Cannabis": "Yes"
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
	for (i in groundWaterArray) {
		if(!matches(groundWaterArray[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(groundWaterArray[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("groundWaterArray Spatial row for " + groundWaterArray[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(groundWaterArray[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("groundWaterArray Spatial row for " + groundWaterArray[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		var updt = new Array;
		var newAPN = new Array;
		updt["Copy of Well completion report from DWR"] = groundWaterArray[i]["Copy of Well completion report from DWR"];
		updt["Well Latitude"]= groundWaterArray[i]["Well_Lat"].toString();
		updt["Well Longitude"] = groundWaterArray[i]["Well_Lon"].toString();
		updt["DWR Letter"] = groundWaterArray[i]["Or DWR Letter"].toString();
		updt["DWR Letter"] = groundWaterArray[i]["Or DWR Letter"].toString();
		updt["Currently Used for Cannabis"] = groundWaterArray[i]["Currently Used for Cannabis"].toString();
		newAPN.push(updt);
		editAppSpecific("Groundwater Well Review Status",groundWaterArray[i]["Water_Source_Review"].toString(),capId);
		addASITable("GROUNDWATER WELL", newAPN, capId);
		recCnt++;
	}

	logDebug("Total Records Processed : " + groundWaterArray.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
	
}catch (err){
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
