
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_PREM Update
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

var PREM = [
  {
    "License_Number": "CCL20-0000003",
    "Application_Number": "LCA20-0000003",
    "PREM_Review_Status": "Complete",
    "PREM_Status": "Annual",
    "PREM_Document_Provided": "Local Approval Document (Non-PREM)",
    "APN_Matches_Premises": "",
    "CDFA_PREM_Action": "",
    "Notes": "No PREM document"
  },
  {
    "License_Number": "CCL19-0000088",
    "Application_Number": "LCA19-0000088",
    "PREM_Review_Status": "Complete",
    "PREM_Status": "Provisional",
    "PREM_Document_Provided": "",
    "APN_Matches_Premises": "",
    "CDFA_PREM_Action": "",
    "Notes": ""
  },
  {
    "License_Number": "CCL18-0000007",
    "Application_Number": "LCA18-0000007",
    "PREM_Review_Status": "Complete",
    "PREM_Status": "Annual",
    "PREM_Document_Provided": "Exemption determination but NOE not filed with SCH",
    "APN_Matches_Premises": "Yes",
    "CDFA_PREM_Action": "Exempt Checklist",
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
	logDebug("ERROR: BATCH_PREM Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{ 
	var recCnt = 0;
	var rejCnt = 0;
	for (i in PREM) {
		if(!matches(PREM[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(PREM[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("PREM row for " + PREM[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(PREM[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("PREM row for " + PREM[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		recCnt++;
		editAppSpecific("Premises Diagram Review Status",PREM[i]["Premises Review Status"]);
		editAppSpecific("Canopy area included",PREM[i]["Canopy area included?"]);
		editAppSpecific("Aggregate square footage of noncontiguous canopy",PREM[i]["Aggregate square footage of noncontiguous canopy?"]);
		editAppSpecific("Does the square footage match dimensions",PREM[i]["Does the square footage match dimensions?"]);
		editAppSpecific("Does the square footage match the license type selected",PREM[i]["Does the square footage match the license type selected?"]);
		editAppSpecific("Immature plant area(s) (if applicable)",PREM[i]["Immature plant area(s)(if applicable)?"]);
		editAppSpecific("Pesticide and agricultural chemical storage area",PREM[i]["Pesticide and agricultural chemical stoarage area?"]);
		editAppSpecific("Processing area",PREM[i]["Processing area (if applicable)?"]);
		editAppSpecific("Packaging area",PREM[i]["Packaging area (if applicable)?"]);
		editAppSpecific("Composting area",PREM[i]["Composting area (if applicable)?"]);
		editAppSpecific("Cannabis Waste Area",PREM[i]["Cannabis Wase Area (if different than composting)?"]);
		editAppSpecific("Harvest storage area",PREM[i]["Harvest storage area?"]);
		editAppSpecific("Administrative hold area",PREM[i]["Administrative hold area?"]);
		editAppSpecific("Designated shared area(s)",PREM[i]["Designated shared area(s)"]);
		editAppSpecific("Common Use Area(s)",PREM[i]["Common Use Area(s)"]);
		editAppSpecific("Canopy SF",PREM[i]["Canopy_SF"]);
		editAppSpecific("Canopy Plant Count",PREM[i]["Canopy_Plants"]);
		editAppSpecific("Canopy SF Limit",PREM[i]["Canopy SF Limit"]);
		editAppSpecific("Immature Plant Area SF",PREM[i]["Immature Plant Area square footage"]);
	}
	logDebug("Total Records Processed : " + PREM.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: BATCH_Prem: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
