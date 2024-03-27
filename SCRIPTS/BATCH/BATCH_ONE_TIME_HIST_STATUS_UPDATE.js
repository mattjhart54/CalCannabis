/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_ONE_TIME_HIST_STATUS_UPDATE
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

var emailAddress = "jshear@trustvip.com";
var sysFromEmail = "calcannabislicensing@cdfa.ca.gov";
var useAppSpecificGroupName = false;
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

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
	
	var capCount  =0;
	var assignRec = 0;
	var recArray = new Array();


	
	
	var appGroup = "Licenses";
	var appTypeType = "Cultivator";
	var appSubtype = "License";
	var appCategory = "License";
	var appType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;


	var getCapResult = aa.cap.getByAppType(appGroup,appTypeType);
		
	if (getCapResult.getSuccess()){
		var apsArray = getCapResult.getOutput();
		for (aps in apsArray){
			capId = apsArray[aps].getCapID();
			var myCap = aa.cap.getCap(capId).getOutput();
			var altId = capId.getCustomID();	
		
				if (String(altId.substr(0,3)) == "CCL"){
					if (altId.indexOf("-HIST") > 0){
						appTypeResult = myCap.getCapType();   
						appTypeString = appTypeResult.toString();
						appTypeArray = appTypeString.split("/");
						if (appTypeArray[3] != "License") {
							continue;
						}else{	
							capCount++;
							updateAppStatus("Historical","");
							aa.cap.updateAccessByACA(capId, "N");
							recArray.push(altId);
						}
					}
				}
			}
		}
				
			

	logDebug("Total Records : " + capCount);
	logDebug("Record Return: " + recArray);
	
}catch (err){
	logDebug("ERROR: Historical Records Batch Update: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}