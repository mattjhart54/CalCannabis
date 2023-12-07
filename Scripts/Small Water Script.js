/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_SMALL_TABLE
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

var SMALL = [
  {
    "License_Number": "",
    "Application_Number": "LCA19-0000088",
    "Verified Small Retail Water Supplier": "",
    "Water Bill Address Matches Premises": "",
    "Is the water source a diversion?": "N/A",
    "Name of Retail Water Supplier Provided?": "Yes",
    "Water source for diversion": "N/A",
    "Coordinates of any POD?": "N/A",
    "Authorized place of use": "N/A",
    "Maximum Amount of Water delivered to Applicant?": "N/A",
    "Copy of most recent water service bill?": "N/A",
    "Or is the water source a well?": "N/A",
    "Name of retail supplier under the contract provided?": "N/A",
    "Coordinates of well provided?": "N/A",
    "Maximum amount of water delivered": "N/A",
    "Copy of well completion report": "N/A",
    "Copy of the most recent water service bill?": "N/A",
    "Currently Used for Cannabis": "",
    "Small Retail Water Suppliers": ""
  },
  {
    "License_Number": "",
    "Application_Number": "LCA20-0000071",
    "Verified Small Retail Water Supplier": "",
    "Water Bill Address Matches Premises": "",
    "Is the water source a diversion?": "Yes",
    "Name of Retail Water Supplier Provided?": "Yes",
    "Water source for diversion": "Yes",
    "Coordinates of any POD?": "Yes",
    "Authorized place of use": "Yes",
    "Maximum Amount of Water delivered to Applicant?": "Yes",
    "Copy of most recent water service bill?": "Yes",
    "Or is the water source a well?": "",
    "Name of retail supplier under the contract provided?": "Yes",
    "Coordinates of well provided?": "Yes",
    "Maximum amount of water delivered": "Yes",
    "Copy of well completion report": "Yes",
    "Copy of the most recent water service bill?": "Yes",
    "Currently Used for Cannabis": "",
    "Small Retail Water Suppliers": "Potter Valley Irrigation District"
  },
  {
    "License_Number": "CCL18-0000303",
    "Application_Number": "LCA18-0000303",
     "Verified Small Retail Water Supplier": "",
    "Water Bill Address Matches Premises": "",
    "Is the water source a diversion?": "Yes",
    "Name of Retail Water Supplier Provided?": "Yes",
    "Water source for diversion": "Yes",
    "Coordinates of any POD?": "Yes",
    "Authorized place of use": "Yes",
    "Maximum Amount of Water delivered to Applicant?": "Yes",
    "Copy of most recent water service bill?": "Yes",
    "Or is the water source a well?": "",
    "Name of retail supplier under the contract provided?": "Yes",
    "Coordinates of well provided?": "Yes",
    "Maximum amount of water delivered": "Yes",
    "Copy of well completion report": "Yes",
    "Copy of the most recent water service bill?": "Yes",
    "Currently Used for Cannabis": "",
    "Small Retail Water Suppliers": "Potter Valley Irrigation District"
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
	for (i in SMALL) {
		if(!matches(SMALL[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(SMALL[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("SMALL Retail row for " + SMALL[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
			recId = SMALL[i]["License_Number"]
		}
		else {
			capId =aa.cap.getCapID(SMALL[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("SMALL Retail row for " + SMALL[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
			recId = SMALL[i]["Application_Number"]
		}
		recCnt++;
		if(i == 0) {
			var holdId = capId;
			var prevId = recId;
			var newSMALL = new Array;
		}
//		logDebug("processing record " + recId + " prev " + prevId);
		if(recId != prevId) {
			removeASITable("SMALL RETAIL WATER SUPPLIERS",holdId);
			addASITable("SMALL RETAIL WATER SUPPLIERS", newSMALL, holdId);
			prevId = recId;
			holdId = capId;
			var newSMALL = new Array;
		}
		var updt = new Array;
		updt["Verified Small Retail Water Supplier"] = SMALL[i]["Verified Small Retail Water Supplier"];		
		updt["Water Bill Address Matches Premises"] = SMALL[i]["Water Bill Address Matches Premises"];
		updt["Is the water source a diversion?"]= SMALL[i]["Is the water source a diversion?"];
		updt["Name of Retail Water Supplier Provided?"]= SMALL[i]["Name of Retail Water Supplier Provided?"];
		updt["Water source for diversion"]= SMALL[i]["Water source for diversion"];
		updt["Coordinates of any POD?"]= SMALL[i]["Coordinates of any POD?"];
		updt["Authorized place of use"] = SMALL[i]["Authorized place of use"];
		updt["Maximum Amount of Water delivered to Applicant?"] = SMALL[i]["Maximum Amount of Water delivered to Applicant?"];
 		updt["Copy of most recent water service bill?"] = SMALL[i]["Copy of most recent water service bill?"];
		updt["Is the water source a well?"]= SMALL[i]["Or is the water source a well?"];
		updt["Name of retail supplier under the contract provided?"]= SMALL[i]["Name of retail supplier under the contract provided?"];
		updt["Coordinates of well provided?"]= SMALL[i]["Coordinates of well provided?"];
		updt["Maximum amount of water delivered"]= SMALL[i]["Maximum amount of water delivered"];
		updt["Copy of well completion report"] = SMALL[i]["Copy of well completion report"];
		updt["Copy of the most recent water service bill?"] = SMALL[i]["Copy of the most recent water service bill?"];
		updt["Currently Used for Cannabis"] = SMALL[i]["Currently Used for Cannabis"];	
		updt["Name of Supplier"] = SMALL[i]["Small Retail Water Suppliers"];		

		newSMALL.push(updt);
	}
	removeASITable("SMALL RETAIL WATER SUPPLIERS",holdId);
	addASITable("SMALL RETAIL WATER SUPPLIERS", newSMALL,holdId);
	logDebug("Total Records Processed : " + SMALL.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
	
}catch (err){
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
