
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_PEST Update
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

var PEST = [
  {
    "License_Number": "CCL20-0000003",
    "Application_Number": "LCA20-0000003",
    "PEST_Review_Status": "Complete",
    "PEST_Status": "Annual",
    "PEST_Document_Provided": "Local Approval Document (Non-PEST)",
    "APN_Matches_Premises": "",
    "CDFA_PEST_Action": "",
    "Notes": "No PEST document"
  },
  {
    "License_Number": "CCL19-0000088",
    "Application_Number": "LCA19-0000088",
    "PEST_Review_Status": "Complete",
    "PEST_Status": "Provisional",
    "PEST_Document_Provided": "",
    "APN_Matches_Premises": "",
    "CDFA_PEST_Action": "",
    "Notes": ""
  },
  {
    "License_Number": "CCL18-0000007",
    "Application_Number": "LCA18-0000007",
    "PEST_Review_Status": "Complete",
    "PEST_Status": "Annual",
    "PEST_Document_Provided": "Exemption determination but NOE not filed with SCH",
    "APN_Matches_Premises": "Yes",
    "CDFA_PEST_Action": "Exempt Checklist",
    "Notes": ""
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
	logDebug("ERROR: BATCH_PEST Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{ 
	var recCnt = 0;
	var rejCnt = 0;
	for (i in PEST) {
		if(!matches(PEST[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(PEST[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("PEST row for " + PEST[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(PEST[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("PEST row for " + PEST[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		recCnt++;
		editAppSpecific("Pesticide(s) product name(s)",PEST[i]["Pesticide(s) product name(s)?"]);
		editAppSpecific("Pesticide(s) active ingredient",PEST[i]["Pesticide(s) active ingredient?"]);
		editAppSpecific("Biological controls",PEST[i]["Biological controls?"]);
		editAppSpecific("Cultural controls",PEST[i]["Cultural controls?"]);
		editAppSpecific("Chemical controls",PEST[i]["Chemical controls?"]);
		editAppSpecific("Pest Management Review Status",PEST[i]["Pest_Review_Status"]);

	}
	logDebug("Total Records Processed : " + PEST.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: BATCH_Pest: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
