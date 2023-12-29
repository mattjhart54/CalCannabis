
// Update_WF_Task_Assignments_Applications.js

/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var disableTokens = false;
var showDebug = true; // Set to true to see debug messages in email confirmation
var maxSeconds = 4 * 60; // number of seconds allowed for batch processing, usually < 5*60
var autoInvoiceFees = "Y"; // whether or not to invoice the fees added
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = true; // Use Group name when populating Task Specific Info Values
var currentUserID = "ADMIN";
var publicUser = null;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var GLOBAL_VERSION = 2.0
var cancel = false;
var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var feeSeqList = new Array(); // invoicing fee list
var paymentPeriodList = new Array(); // invoicing pay periods
var bSetCreated = false; //Don't create a set until we find our first app
var setId = "";
var timeExpired = false;
var emailText = "";
var capId = null;
var cap = null;
var capIDString = "";
var appTypeResult = null;
var appTypeString = "";
var appTypeArray = new Array();
var capName = null;
var capStatus = null;
var fileDateObj = null;
var fileDate = null;
var fileDateYYYYMMDD = null;
var parcelArea = 0;
var estValue = 0;
var houseCount = 0;
var feesInvoicedTotal = 0;
var balanceDue = 0;
var houseCount = 0;
var feesInvoicedTotal = 0;
var capDetail = "";
var AInfo = new Array();
var partialCap = false;
var SCRIPT_VERSION = 2.0
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
	eval(getMasterScriptText(SAScript, SA));
} else {
	eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

function getMasterScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1)
		servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

function getScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1)
		servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//Needed HERE to log parameters below in eventLog
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//
// Your variables go here
/*
aa.env.setValue("Group", "Licenses");
aa.env.setValue("Type", "Cultivator");
aa.env.setValue("Subtype", "*");
aa.env.setValue("Category", "Application");
*/

var appGroup = getParam("Group");
var appType = getParam("Type");
var appSubtype = getParam("Subtype");
var appCategory = getParam("Category");
//
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|-----------------------------------------------------------------------------------------------------+/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
//
// Your script goes here
// Ex. var appGroup = getParam("Group");
//
logDebug("Start of Job");
var vCapList;
var vCap;
var capId;
var vCapStatus;
var cnt = 0;
var vCnt = 0;
var vCntA = 0;
var vCntU = 0;
var vCntS = 0;
var vCntR = 0;
var vCntP = 0;
var vCntN = 0;

try {
	var userMap = [
		{"EXISTING":"MATT HART","NEW":"Matt.Hart@cannabis.ca.gov"},
		{"EXISTING":"JAIME SHEAR","NEW":"JAIME.SHEAR@cannabis.ca.gov"},
		{"EXISTING":"MICHAEL REED","NEW":"Michael.Reed@cannabis.ca.gov"}	
		]
	var ignoreRecordStatuses = ['License Issued', 'Provisional License Issued', 'Pending Owner Application', 'Pending Final Affidavit',
		'Completed', 'Completed-Missing Information','Disqualified','Abandoned','Closed','Withdrawn',
		'Refer to Legal','LAU Executed - Revocation', 'Suspension Lifted','Appealed','Renewal Denial Executed','Settled','Surrender Executed','Resolved', 'Surrender Rejected','Surrender Escatated',
		'Not Converted','Scientific Review Complete',
		'Approved','Renewal Denied',
		'Amendment Approved','Amendment Rejected','Transition Amendment Approved'];
	
	var ignoreWFStatuses = ['Completed', 'Completed-Missing Information'];
	var i = 0;
	
// Get records	
	if(appSubtype == '*')
		appSubtype = null;
	if(appCategory == '*')
		appCategory = null;
	vCapList= aa.cap.getByAppType(appGroup, appType, appSubtype, appCategory).getOutput();
	i = 0;
	logDebug("Processing " + vCapList.length + " " + appGroup + "/" +appType + "/" + appSubtype + "/" + appCategory + " records");
	 
//loop through records 
	for (i in vCapList) {
		
//for testing purposes
//		if (i > 600) break;
		
		vCap = vCapList[i];
		capId = vCap.getCapID();
		capDetail = aa.cap.getCapDetail(capId).getOutput();	
// Ignore records
		var altId = capId.getCustomID();
		if(altId.substring(2,5) == 'TMP') { cnt = cnt + 1; continue};
		if(altId.substring(0,3) == 'TCA')  { cnt = cnt + 1; continue};
		if(altId.substring(0,3) == 'DUB')  { cnt = cnt + 1; continue};
		if(altId.substring(0,4) == 'LCA-')  { cnt = cnt + 1; continue};
		
//get record status and skip if in status list
		vCapStatus = getAppStatus(capId);
		if (exists(vCapStatus, ignoreRecordStatuses))  {	
			vCntR = vCntR + 1;
			continue;
		}

//		logDebug("Processing record " + capId.getCustomID() + 'cap status ' + vCapStatus);
		vCntP = vCntP + 1;
		var processName = "";
		var fmlNameStr = "";
		var workflowResult = aa.workflow.getTaskItems(capId, null, processName, null, null, null);
		if (workflowResult.getSuccess())
			wfObj = workflowResult.getOutput();
		else {
			logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		}
		
		//loop through wf tasks
		for (var i in wfObj) {
			fTask = wfObj[i];
			vActive = fTask.getActiveFlag();
//			logDebug("Active " + vActive);
			if(vActive == 'Y') {
				var taskUserObj = fTask.getTaskItem().getAssignedUser();
				if (taskUserObj.getDispFirstName() != null) {
					var vWfStatus = fTask.getDisposition();			
//check if wf status qualifies
					if (exists(vWfStatus, ignoreWFStatuses)) {
//						logDebug("**Workflow task " + fTask.getTaskDescription() + " is not in a qualifying status; Task not reassigned");
						vCntS = vCntS + 1;
						continue;
					}			
//get assigned FMLName
					fmlNameStr = taskUserObj.getDispFirstName() + " " + taskUserObj.getDispLastName();		
					vTaskReassigned = false;
					logDebug("Workflow Task " + fTask.getTaskDescription() + " is currently assigned to " + fmlNameStr);		
					for (e in userMap) {
						if (userMap[e].EXISTING.toUpperCase() == fmlNameStr.toUpperCase()) {
							if (userMap[e].NEW != "n/a") {
//update workflow task assignment to new user ID
								reAssignTask(fTask.getTaskDescription(), userMap[e].NEW.toUpperCase());
								vTaskReassigned = true;
								logDebug("For record " + capId.getCustomID() + " task " + fTask.getTaskDescription() + " was assigned to " + userMap[e].NEW.toUpperCase());
								vCnt = vCnt + 1;				 			
								break;
							}
						}
					}
					if (!vTaskReassigned) {
//						logDebug("**Workflow task was assigned to a user that did not exist in the User Map; Task not reassigned");
						vCntA = vCntA + 1;
					}
				} else {
//					logDebug("**Workflow task not currently assigned to a user; skipping");
					vCntU = vCntU + 1;
				}	
			} else { 
//				logDebug("**Workflow task not active; skipping");
				vCntN = vCntN + 1;
			}
		}
	}
	logDebug("Finished Processing " + vCapList.length  + " records.");
	logDebug(cnt + " records skipped");
	logDebug(vCntR + " records skipped as not in qualifying status.");
	logDebug(vCntP + " records selected to process");
	logDebug(vCnt + " task were reassigned.");
	logDebug(vCntA + " task were not reassigned as user did not exist in the User Map.");
	logDebug(vCntU + " task were not reassigned as task was unassigned.");
	logDebug(vCntN + " task were not reassigned as task was not Active.");
	logDebug(vCntS+ " task were not reassigned as record was not in qualifying status.");
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");		
	
} catch (e) {
	logDebug(e);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
} else {
	aa.env.setValue("ScriptReturnCode", "0");
	if (showMessage)
		aa.env.setValue("ScriptReturnMessage", message);
	if (showDebug)
		aa.env.setValue("ScriptReturnMessage", debug);
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function getAppStatus(itemcap) {
	var appStatus = null;
	var capResult = aa.cap.getCap(itemcap);
	if (capResult.getSuccess()) {
		var licenseCap = capResult.getOutput();
		if (licenseCap != null) {
			appStatus = "" + licenseCap.getCapStatus();
		}
	} else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;	
}

function getAssignedToStaff(itemcap) {
	var cdScriptObjResult = aa.cap.getCapDetail(itemcap);
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
		return false;
	}
	
	var cdScriptObj = cdScriptObjResult.getOutput();
	
	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return false;
	}
	
	cd = cdScriptObj.getCapDetailModel();
	
	var returnValue = cd.getAsgnStaff();
	//logDebug("Returning Assigned To Staff value: " + returnValue);
	
	return returnValue;
}
function assignRec(assignId) // option CapId
	{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	iNameResult  = aa.person.getUser(assignId);

	if (!iNameResult.getSuccess())
		{ logDebug("**ERROR retrieving  user model " + assignId + " : " + iNameResult.getErrorMessage()) ; return false ; }

	iName = iNameResult.getOutput();

	cd.setAsgnDept(iName.getDeptOfUser());
	cd.setAsgnStaff(assignId);

	cdWrite = aa.cap.editCapDetail(cd)

	if (!cdWrite.getSuccess())
//		{ logDebug("Assigned CAP to " + assignId) }
//	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	}
	
function updateTaskAsgnFromRecordAsgn(recAsgnStaff) {
	// user story 3402.  Assigned staff can result these tasks.
	if (recAsgnStaff != null) {
		wfTkArray = new Array();
		wfTkArray = loadTasks(capId);
		//added Review task to list - user story3465
		for (x in wfTkArray) {
			if (matches(x, 'Application Acceptance', 'Initial Review','Review')) {
				assignTask(x, recAsgnStaff);
			}
		}
	}
}
function reAssignTask(wfstr,username) // optional process name
	{
	// Assigns the task to a user.  No audit.
	//
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) 
		{
		processName = arguments[2]; // subprocess
		useProcess = true;
		}
		
	var taskUserResult = aa.person.getUser(username);
	if (taskUserResult.getSuccess())
		taskUserObj = taskUserResult.getOutput();  //  User Object
	else
		{ logMessage("**ERROR: Failed to get user object: " + taskUserResult.getErrorMessage()); return false; }
		
	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
   		var fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			fTask.setAssignedUser(taskUserObj);
			var taskItem = fTask.getTaskItem();
			var adjustResult = aa.workflow.assignTask(taskItem);
			
	//		logMessage("Assigned Workflow Task: " + wfstr + " to " + username);
	//		logDebug("Assigned Workflow Task: " + wfstr + " to " + username);
			}			
		}
	}
