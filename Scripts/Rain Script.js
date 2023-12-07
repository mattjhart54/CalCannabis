/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_RAIN_TABLE
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

var RAIN = [
   {
    "License_Number": "",
    "Application_Number": "LCA20-0000071",
	"Total Square footage of catchment footprint": "Yes",
    "Total storage capacity (Gallons)": "Yes",
    "Detailed description of the catchment surface": "Yes",
    "Photos of the rainwater catchment system infrastructure": "No",
    "Catchment_Lat": 40.23972,
    "Catchment_Lon": -123.83915,
    "Currently Used for Cannabis?": "Yes"
   },
  {
    "License_Number": "CCL18-0000303",
    "Application_Number": "LCA18-0000303",
    "Total Square footage of catchment footprint": "Yes",
    "Total storage capacity (Gallons)": "Yes",
    "Detailed description of the catchment surface": "Yes",
    "Photos of the rainwater catchment system infrastructure": "No",
    "Catchment_Lat": 40.23972,
    "Catchment_Lon": 123.83915,
    "Currently Used for Cannabis?": "Yes"
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
	for (i in RAIN) {
		if(!matches(RAIN[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(RAIN[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("RAIN Water row for " + RAIN[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
			recId = RAIN[i]["License_Number"]
		}
		else {
			capId =aa.cap.getCapID(RAIN[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("RAIN Water row for " + RAIN[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
			recId = RAIN[i]["Application_Number"]
		}
		recCnt++;
		if(i == 0) {
			var holdId = capId;
			var prevId = recId;
			var newRAIN = new Array;
		}
//		logDebug("processing record " + recId + " prev " + prevId);
		if(recId != prevId) {
			removeASITable("RAINWATER CATCHMENT",holdId);
			addASITable("RAINWATER CATCHMENT", newRAIN, holdId);
			prevId = recId;
			holdId = capId;
			var newRAIN = new Array;
		}
		var updt = new Array;
		updt["Total Square footage of catchment footprint"] = RAIN[i]["Total Square footage of catchment footprint"];		
		updt["Total storage capacity (Gallons)"] = RAIN[i]["Total storage capacity (Gallons)"];
		updt["Detailed description of the type, nature, and location of each catchment surface"]= RAIN[i]["Detailed description of the catchment surface"];
		updt["Name of Retail Water Supplier Provided?"]= RAIN[i]["Name of Retail Water Supplier Provided?"];
		updt["Photos of the rainwater catchment system infrastructure"]= RAIN[i]["Photos of the rainwater catchment system infrastructure"];
		updt["Catchment Latitude"]= RAIN[i]["Catchment_Lat"].toString();
		updt["Catchment Longitude"] = RAIN[i]["Catchment_Lon"].toString();
		updt["Currently Used for Cannabis?"] = RAIN[i]["Currently Used for Cannabis?"];	
		newRAIN.push(updt);
	}
	removeASITable("RAINWATER CATCHMENT",holdId);
	addASITable("RAINWATER CATCHMENT", newRAIN,holdId);
	logDebug("Total Records Processed : " + RAIN.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
	
}catch (err){
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
