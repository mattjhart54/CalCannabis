
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
eval(getScriptText("PREMNURS DATA"));

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

var AInfo = new Array();
var PREM = PREMNURSData();

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
		editAppSpecific("Premises Diagram Review Status",PREM[i]["Premises Review Status"]);;
		editAppSpecific("Designated shared area(s)",PREM[i]["Designated shared area(s)"]);
		editAppSpecific("Common Use Area(s)",PREM[i]["Common Use Area(s)"]);
		editAppSpecific("Immature canopy square footage-N",PREM[i]["Immature Plant Area square footage"]);
		editAppSpecific("Immature Plant Area-N",PREM[i]["Immature_Plant_Area"]);
		editAppSpecific("Seed Production Area-N",PREM[i]["Seed_Production_Area"]);
		editAppSpecific("Research and Development Area-N",PREM[i]["Research_And_Developement_Area"]);
		editAppSpecific("Pesticide and Agricultural Chemical Storage Area-N",PREM[i]["Pesticide_Storage_Area"]);
		editAppSpecific("Composting Area-N ",PREM[i]["Composting_Area"]);
		editAppSpecific("Cannabis Waste Area-N",PREM[i]["Cannabis_waste_Area"]);
		editAppSpecific("Immature canopy square footage-N",PREM[i]["Immature canopy square footage"]);
;

	}
	logDebug("Total Records Processed : " + PREM.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: BATCH_PremNurs: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
