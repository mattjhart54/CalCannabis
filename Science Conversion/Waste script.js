
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_WASTE Update
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
eval(getScriptText("WASTE SCRIPT DATA"));

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
var WASTE = WASTESCRIPTData();
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
	logDebug("ERROR: BATCH_WASTE Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{ 
	var recCnt = 0;
	var rejCnt = 0;
	for (i in WASTE) {
		if(!matches(WASTE[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(WASTE[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("WASTE row for " + WASTE[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(WASTE[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("WASTE row for " + WASTE[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		recCnt++;
	//	logDebug("processing record " + WASTE[i]["License_Number"]);
		if(WASTE[i]["Waste_Management_Method"] == "On-site Composting of Cannabis Waste")
			editAppSpecific("On-site Composting of Cannabis Waste","CHECKED");
		if(WASTE[i]["Waste_Management_Method"] == "Local Agency Franchised or Contracted/Permitted Waste Hauler")
			editAppSpecific("Local Agency Franchised or Contracted/Permitted Waste Hauler","CHECKED");
		if(WASTE[i]["Waste_Management_Method"] == "Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility")
			editAppSpecific("Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility","CHECKED");
		if(WASTE[i]["Waste_Management_Method"] == "Self-Haul to a Manned Fully Permitted Composting Facility/Operation")
			editAppSpecific("Self-Haul to a Manned Fully Permitted Composting Facility/Operation","CHECKED");
		if(WASTE[i]["Waste_Management_Method"] == "Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation")
			editAppSpecific("Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation","CHECKED");
		if(WASTE[i]["Waste_Management_Method"] == "Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation")
			editAppSpecific("Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation","CHECKED");
		if(WASTE[i]["Waste_Management_Method"] == "Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility")
			editAppSpecific("Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility","CHECKED");
		if(WASTE[i]["Waste_Management_Method"] == "Self-Haul to a Recycling Center That Meets Regulations Requirements")
			editAppSpecific("Self-Haul to a Recycling Center That Meets Regulations Requirements","CHECKED");
		if(WASTE[i]["Waste_Management_Method"] == "Reintroduction of cannabis waste back into Agricultural operations")
			editAppSpecific("Reintroduction of cannabis waste back into Agricultural operations","CHECKED");
	}
	logDebug("Total Records Processed : " + WASTE.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: Scienc Conversion Waste: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
