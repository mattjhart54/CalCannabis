/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_RETAIL_TABLE
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

var RETAIL = [
  {
    "License_Number": "",
    "Application_Number": "LCA20-0000071",
     "Name of Retail Water Supplier": "Yes",
    "A copy of the most recent water service bill": "No",
    "Water Bill Address Matches Premises": "Yes",
    "Currently Used for Cannabis": "Yes",
    "Retail Water Supplier": "Desert Water Agency"
  },
  {
    "License_Number": "",
    "Application_Number": "LCA19-0000088",
    "Name of Retail Water Supplier": "Yes",
    "A copy of the most recent water service bill": "No",
    "Water Bill Address Matches Premises": "",
    "Currently Used for Cannabis": "",
    "Retail Water Supplier": "City of California City"
  },
  {
    "License_Number": "CCL18-0000303",
    "Application_Number": "LCA18-0000303",
    "Name of Retail Water Supplier": "Yes",
    "A copy of the most recent water service bill": "No",
    "Water Bill Address Matches Premises": "",
    "Currently Used for Cannabis": "",
    "Retail Water Supplier": "City of California City"
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
	for (i in RETAIL) {
		if(!matches(RETAIL[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(RETAIL[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("RETAIL Water row for " + RETAIL[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
			recId = RETAIL[i]["License_Number"]
		}
		else {
			capId =aa.cap.getCapID(RETAIL[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("RETAIL Water row for " + RETAIL[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
			recId = RETAIL[i]["Application_Number"]
		}
		recCnt++;
		if(i == 0) {
			holdId = capId;
			prevId = recId;
			var newRETAIL = new Array;
		}
//		logDebug("processing record " + recId + " prev " + prevId);
		if(recId != prevId) {
			removeASITable("RETAIL WATER SUPPLIER",holdId);
			addASITable("RETAIL WATER SUPPLIER", newRETAIL, holdId);
			prevId = recId;
			holdId = capId;
			var newRETAIL = new Array;
		}
		var updt = new Array;
		updt["Name of Retail Water Supplier"]= RETAIL[i]["Name of Retail Water Supplier"];
		updt["A copy of the most recent water service bill"]= RETAIL[i]["A copy of the most recent water service bill"];
		updt["Water Bill Address Matches Premises"]= RETAIL[i]["Water Bill Address Matches Premises"];
		updt["Currently Used for Cannabis"]= RETAIL[i]["Currently Used for Cannabis"];
		updt["Retail Water Supplier"] = RETAIL[i]["Retail Water Supplier"];
		newRETAIL.push(updt);
	}
	removeASITable("RETAIL WATER SUPPLIER",holdId);
	addASITable("RETAIL WATER SUPPLIER", newRETAIL,holdId);
	logDebug("Total Records Processed : " + RETAIL.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
	
}catch (err){
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
