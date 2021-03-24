/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_WATER_RIGHT_TABLE
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
	var qualRec = 0;
	var errrorCount = 0;
	var recArray = new Array();
	
	
	var capModel = aa.cap.getCapModel().getOutput();
	//Get the Permits from the system 
	var emptyGISArray=new Array();
	capTypeModel = capModel.getCapType();
	capTypeModel.setGroup("Licenses");
	capTypeModel.setType("Cultivator");
	capTypeModel.setSubType("License Case");
	capTypeModel.setCategory("NA");
	capModel.setCapType(capTypeModel);
	
	var typeResult = aa.cap.getCapIDListByCapModel(capModel);
	if (typeResult.getSuccess())
	{
		vCapList = typeResult.getOutput();
	}
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + typeResult.getErrorType() + ":" + typeResult.getErrorMessage());
	}


	for (x in vCapList) {
		capCount++;
		capId = aa.cap.getCapID(vCapList[x].getCapID().getID1(),vCapList[x].getCapID().getID2(),vCapList[x].getCapID().getID3()).getOutput();
		var capValue = aa.cap.getCap(capId).getOutput();	
		var capStatus = capValue.getCapStatus();
		if (capStatus == "In Progress"){
			if(getAppSpecific("Case Opened By",capId) == "Science - Provisional") {
				qualRec++;
				logDebug("Logging: " + capId.getCustomID());
				var workflowResult = aa.workflow.getTasks(capId);
				if (workflowResult.getSuccess()){
					wfObj = workflowResult.getOutput();
					for (var i in wfObj) {
						fTask = wfObj[i];
						if (String(fTask.getActiveFlag()) == 'Y'){
								logDebug("Current Task: " + fTask.getTaskDescription() + " Current Status: " + fTask.getDisposition());
								var actionByUser=fTask.getTaskItem().getSysUser(); // Get action by user, this is a SysUserModel
								var wfTask = String(fTask.getTaskDescription());
								var wfStatus = String(fTask.getDisposition());
								var actionByObj = aa.person.getUser(actionByUser.getFirstName(), actionByUser.getMiddleName(), actionByUser.getLastName()).getOutput();
								if (actionByObj){
									var userID = actionByObj.getUserID();
								}else{
									var userID = "";
								}
						}
					}
				}
				if (!matches(userID,null,undefined,"")){
					assignTask("Licensing Case Assessment",userID);
				}
				var wfDeleteAndAssign = aa.workflow.deleteAndAssignWorkflow(capId,"LIC_CC_LC", false);
				
				if(wfDeleteAndAssign.getSuccess()){
					logDebug("Succesfully Deleted and Assigned workflow");
					assignRec++;
					recArray.push(capId.getCustomID());
				}else{
					logDebug("Too bad");
					errrorCount++;
				}
				
				if (wfTask == "LAU Assessment"){
					deactivateTask("Licensing Case Assessment");
					activateTask("LAU Assessment");
				}
				if (!matches(undefined,null,"","NA")){
					updateTask(wfTask,wfStatus,"","");
				}
			}
		}
	}
				
					
			

	logDebug("Total License Case Records : " + capCount);
	logDebug("Qualified Records: " + qualRec);
	logDebug("Records with reassigned WF: " + assignRec);
	logDebug("Records not reassigned due to error: " + errrorCount);
	logDebug("Records adjusted: " + recArray);
	
}catch (err){
	logDebug("ERROR: Science Conversion Water Rights: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
