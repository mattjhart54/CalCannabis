/*------------------------------------------------------------------------------------------------------/
| Program : InspectionMultipleScheduleAfter3.0.js
| Event   : InspectionMultipleScheduleAfter
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
var controlString = "InspectionScheduleAfter"; // Standard choice for control
var preExecute = "PreExecuteForAfterEvents"; // Standard choice to execute first (for globals, etc)
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
	if (arguments.length > 1) {
		servProvCode = arguments[1]; // use different serv prov code
	}
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

schedObjArray = new Array();

var s_id1 = aa.env.getValue("PermitID1Array");
var s_id2 = aa.env.getValue("PermitID2Array");
var s_id3 = aa.env.getValue("PermitID3Array");
var inspIdArr = aa.env.getValue("InspectionIDArray");
var inspInspArr = aa.env.getValue("InspectionInspectorArray");

var resultCapIdStringSave = null;

for (thisElement in s_id1) {
	var r = new schedObj();
	var s_capResult = aa.cap.getCapID(s_id1[thisElement], s_id2[thisElement], s_id3[thisElement]);
	if (s_capResult.getSuccess())
		r.capId = s_capResult.getOutput();
	else
		logDebug("**ERROR: Failed to get capId: " + s_capResult.getErrorMessage());
	r.capIdString = r.capId.getCustomID();
	r.inspId = inspIdArr[thisElement];
	r.inspector = inspInspArr[thisElement];

	schedObjArray.push(r);
}

schedObjArray.sort(compareSchedObj);

for (thisResult in schedObjArray) {
	curResult = schedObjArray[thisResult];
	if (!curResult.capIdString.equals(resultCapIdStringSave)) {
		var capId = curResult.capId
		
		aa.env.setValue("PermitId1",capId.getID1());
    	aa.env.setValue("PermitId2",capId.getID2());
    	aa.env.setValue("PermitId3",capId.getID3());
    
		if (SA) {
			eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA));
		} else {
			eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
		}

		resultCapIdStringSave = capIDString;

		logGlobals(AInfo);

	}
	//
	// Event Specific Details
	//

	inspId = curResult.inspId;
	inspInspector = curResult.inspector;
	var inspInspectorObj = aa.person.getUser(inspInspector).getOutput();
	if (inspInspectorObj) {

		var InspectorFirstName = inspInspectorObj.getFirstName();
		var InspectorLastName = inspInspectorObj.getLastName();
		var InspectorMiddleName = inspInspectorObj.getMiddleName();
	} else {
		var InspectorFirstName = null;
		var InspectorLastName = null;
		var InspectorMiddleName = null;
	}

	inspObj = aa.inspection.getInspection(capId, inspId).getOutput(); // current inspection object
	inspGroup = inspObj.getInspection().getInspectionGroup();

	if (inspObj.getScheduledDate())
		inspSchedDate = inspObj.getScheduledDate().getMonth() + "/" + inspObj.getScheduledDate().getDayOfMonth() + "/" + inspObj.getScheduledDate().getYear();
	else
		inspSchedDate = null;

	inspType = inspObj.getInspectionType();
	logDebug("Inspection #" + thisResult);
	logDebug("inspId " + inspId);
	logDebug("inspInspector = " + inspInspector);
	logDebug("InspectorFirstName = " + InspectorFirstName);
	logDebug("InspectorMiddleName = " + InspectorMiddleName);
	logDebug("InspectorLastName = " + InspectorLastName);
	logDebug("inspGroup = " + inspGroup);
	logDebug("inspType = " + inspType);
	logDebug("inspSchedDate = " + inspSchedDate);

	var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName);
	
	if (preExecute.length)
		doStandardChoiceActions(preExecute, true, 0); // run Pre-execution code

	if (doStdChoices)
		doStandardChoiceActions(controlString, true, 0);

	if (doScripts)
		doScriptActions();

	//
	// Check for invoicing of fees
	//
	if (feeSeqList.length) {
		invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
		if (invoiceResult.getSuccess())
			logDebug("Invoicing assessed fee items is successful.");
		else
			logDebug("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
	}

}

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

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

function schedObj() {
	this.capId = null;
	this.capIdString = null;
	this.inspector = null;
	this.inspId = null;
}

function compareSchedObj(a, b) {
	return (a.capIdString < b.capIdString);
}