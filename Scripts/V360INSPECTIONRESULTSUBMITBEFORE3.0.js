/*------------------------------------------------------------------------------------------------------/
| Program : V360InspectionResultSubmitBeforeV3.0.js
| Event   : V360InspectionResultSubmitBefore
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var controlString = "InspectionResultSubmitBefore"; // Standard choice for control
var preExecute = "PreExecuteForAfterEvents" // Standard choice to execute first (for globals, etc)
	var documentOnly = false; // Document Only -- displays hierarchy of std choice steps

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0;

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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
}

eval(getScriptText("INCLUDES_CUSTOM"));

if (documentOnly) {
	doStandardChoiceActions(controlString, false, 0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName);

var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = true; // compatibility default
var doScripts = false;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) {
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE");
	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT");
	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
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
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
//
// load up an array of result objects
//

resultObjArray = new Array();

var s_id1 = aa.env.getValue("PermitId1Array");
var s_id2 = aa.env.getValue("PermitId2Array");
var s_id3 = aa.env.getValue("PermitId3Array");
var inspTypeArr = aa.env.getValue("InspectionTypeArray");
var inspResultArr = aa.env.getValue("InspectionResultArray");
var inspIdArr = aa.env.getValue("InspectionIdArray");
var inspResultCommentArr = aa.env.getValue("InspectionResultCommentArray");
var resultCapIdStringSave = null;

for (thisElement in s_id1) {
	var r = new resultObj();
	var s_capResult = aa.cap.getCapID(s_id1[thisElement], s_id2[thisElement], s_id3[thisElement]);
	if (s_capResult.getSuccess())
		r.capId = s_capResult.getOutput();
	else
		logDebug("**ERROR: Failed to get capId: " + s_capResult.getErrorMessage());
	r.capIdString = r.capId.getCustomID();
	r.inspType = inspTypeArr[thisElement];
	r.inspResult = inspResultArr[thisElement];
	r.inspId = inspIdArr[thisElement];
	r.resultComment = inspResultCommentArr[thisElement];
	resultObjArray.push(r);
}

resultObjArray.sort(compareResultObj);

for (thisResult in resultObjArray) {
	curResult = resultObjArray[thisResult];
	if (!curResult.capIdString.equals(resultCapIdStringSave)) {
		var capId = curResult.capId

			aa.env.setValue("PermitId1", capId.getID1());
		aa.env.setValue("PermitId2", capId.getID2());
		aa.env.setValue("PermitId3", capId.getID3());

		if (SA) {
			eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA));
		} else {
			eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
		}

		resultCapIdStringSave = capIDString;

		logGlobals(AInfo);

	}

	/*------------------------------------------------------------------------------------------------------/
	| END Event Specific Variables
	/------------------------------------------------------------------------------------------------------*/

	if (preExecute.length)
		doStandardChoiceActions(preExecute, true, 0); // run Pre-execution code

	logGlobals(AInfo);

	/*------------------------------------------------------------------------------------------------------/
	| <===========Main=Loop================>
	|
	/-----------------------------------------------------------------------------------------------------*/
	//
	//  Get the Standard choices entry we'll use for this App type
	//  Then, get the action/criteria pairs for this app
	//
	inspId = curResult.inspId;
	inspResult = curResult.inspResult;
	inspType = curResult.inspType;
	inspObj = aa.inspection.getInspection(capId, inspId).getOutput(); // current inspection object
	inspComment = curResult.resultComment;
	inspGroup = inspObj.getInspection().getInspectionGroup();
	inspSchedDate = inspObj.getScheduledDate().getMonth() + "/" + inspObj.getScheduledDate().getDayOfMonth() + "/" + inspObj.getScheduledDate().getYear();
	inspResultDate = inspObj.getInspectionStatusDate().getMonth() + "/" + inspObj.getInspectionStatusDate().getDayOfMonth() + "/" + inspObj.getInspectionStatusDate().getYear();
	inspTotalTime = inspObj.getTimeTotal();
	logDebug("Inspection #" + thisResult);
	logDebug("inspId " + inspId);
	logDebug("inspResult = " + inspResult);
	logDebug("inspComment = " + inspComment);
	logDebug("inspResultDate = " + inspResultDate);
	logDebug("inspGroup = " + inspGroup);
	logDebug("inspType = " + inspType);
	logDebug("inspSchedDate = " + inspSchedDate);
	logDebug("inspTotalTime = " + inspTotalTime);

	if (doStdChoices)
		doStandardChoiceActions(controlString, true, 0);
	//  Next, execute and scripts that are associated to the record type
	if (doScripts)
		doScriptActions();

	//
	// Check for invoicing of fees
	//
	if (feeSeqList.length) {
		invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
		if (invoiceResult.getSuccess())
			logMessage("Invoicing assessed fee items is successful.");
		else
			logMessage("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
	}

}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ScriptReturnCode", "1");
		if (showMessage)
			aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br>" + message);
		if (showDebug)
			aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br>" + debug);
	} else {
		aa.env.setValue("ScriptReturnCode", "0");
		if (showMessage)
			aa.env.setValue("ScriptReturnMessage", message);
		if (showDebug)
			aa.env.setValue("ScriptReturnMessage", debug);
	}
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function resultObj() {
	this.capId = null;
	this.capIdString = null;
	this.inspType = null;
	this.inspResult = null;
	this.inspId = null;
	this.resultComment = null;
}

function compareResultObj(a, b) {
	return (a.capIdString < b.capIdString);
}
