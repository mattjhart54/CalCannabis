
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CEQA Update
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

var CEQA = [
  {
    "License_Number": "CCL20-0000003",
    "Application_Number": "LCA20-0000003",
    "CEQA_Review_Status": "Complete",
    "CEQA_Status": "Annual",
    "CEQA_Document_Provided": "Local Approval Document (Non-CEQA)",
    "APN_Matches_Premises": "",
    "CDFA_CEQA_Action": "",
    "Notes": "No CEQA document"
  },
  {
    "License_Number": "CCL19-0000088",
    "Application_Number": "LCA19-0000088",
    "CEQA_Review_Status": "Complete",
    "CEQA_Status": "Provisional",
    "CEQA_Document_Provided": "",
    "APN_Matches_Premises": "",
    "CDFA_CEQA_Action": "",
    "Notes": ""
  },
  {
    "License_Number": "CCL18-0000007",
    "Application_Number": "LCA18-0000007",
    "CEQA_Review_Status": "Complete",
    "CEQA_Status": "Annual",
    "CEQA_Document_Provided": "Exemption determination but NOE not filed with SCH",
    "APN_Matches_Premises": "Yes",
    "CDFA_CEQA_Action": "Exempt Checklist",
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
	for (i in CEQA) {
		if(!matches(CEQA[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(CEQA[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("CEQA row for " + CEQA[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(CEQA[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("CEQA row for " + CEQA[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		recCnt++;
	//	logDebug("processing record " + CEQA[i]["License_Number"]);
		editAppSpecific("CEQA Review Status",CEQA[i]["CEQA_Review_Status"]);
		editAppSpecific("CEQA Status",CEQA[i]["CEQA_Status"]);
		editAppSpecific("CEQA Document Provided",CEQA[i]["CEQA_Document_Provided"]);
		editAppSpecific("APN Matches Premises-CEQA",CEQA[i]["APN_Matches_Premises"]);
		editAppSpecific("CDFA CEQA Action",CEQA[i]["CDFA_CEQA_Action"]);
		editAppSpecific("CEQA Notes",CEQA[i]["Notes"]);
	}
	logDebug("Total Records Processed : " + CEQA.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
