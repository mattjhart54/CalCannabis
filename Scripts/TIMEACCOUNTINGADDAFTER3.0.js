/*------------------------------------------------------------------------------------------------------/
| Program : TimeAccountingAddAfter3.0.js
| Event   : TimeAccountingAddAfter
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
var controlString = "TimeAccountingAddAfter"; // Standard choice for control
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

var timeLogList = aa.env.getValue("TimeLogModelList");

if (timeLogList) {
	var it = timeLogList.iterator();
	while (it.hasNext()) {
		var timeLog = it.next();
		var capId = null;
		var timeLogSeq = timeLog.getTimeLogSeq();
		var timeGroupSeq = timeLog.getTimeGroupSeq();
		var timeTypeSeq = timeLog.getTimeTypeSeq();
		var reference = "" + timeLog.getReference();
		if (reference.substr("-")) {
			var sca = String(reference).split("-");
			var capId = aa.cap.getCapID(sca[0], sca[1], sca[2]).getOutput();
		}
		var dateLogged = timeLog.getDateLogged();
		var startTime = timeLog.getStartTime();
		var endTime = timeLog.getEndTime();
		var timeElapsedHours = timeLog.getTimeElapsed().getHours();
		var timeElapsedMin = timeLog.getTimeElapsed().getMinutes();
		var totalMinutes = timeLog.getTotalMinutes();
		var billable = timeLog.getBillable();
		var materials = timeLog.getMaterials();
		var materialsCost = timeLog.getMaterialsCost();
		var mileageStart = timeLog.getMileageStart();
		var mileageEnd = timeLog.getMileageEnd();
		var milageTotal = timeLog.getMilageTotal();
		var vehicleId = timeLog.getVehicleId();
		var entryRate = timeLog.getEntryRate();
		var entryPct = timeLog.getEntryPct();
		var entryCost = timeLog.getEntryCost();
		var createdDate = timeLog.getCreatedDate();
		var createdBy = timeLog.getCreatedBy();
		var notation = timeLog.getNotation();
		var lastChangeDate = timeLog.getLastChangeDate();
		var lastChangeUser = timeLog.getLastChangeUser();
		var timeTypeModel = timeLog.getTimeTypeModel();

		logDebug("<B>EMSE Script Results for Time Log</B>");
		logDebug("capId = " + capId);
		logDebug("timeLog= " + timeLog.getClass());
		logDebug("timeLogSeq = " + timeLogSeq);
		logDebug("timeGroupSeq = " + timeGroupSeq);
		logDebug("timeTypeSeq = " + timeTypeSeq);
		logDebug("reference = " + reference);
		logDebug("dateLogged = " + dateLogged);
		logDebug("startTime = " + startTime);
		logDebug("endTime = " + endTime);
		logDebug("timeElapsedHours = " + timeElapsedHours);
		logDebug("timeElapsedMin = " + timeElapsedMin);
		logDebug("totalMinutes = " + totalMinutes);
		logDebug("billable = " + billable);
		logDebug("materials = " + materials);
		logDebug("materialsCost = " + materialsCost);
		logDebug("mileageStart = " + mileageStart);
		logDebug("mileageEnd = " + mileageEnd);
		logDebug("milageTotal = " + milageTotal);
		logDebug("vehicleId = " + vehicleId);
		logDebug("entryRate = " + entryRate);
		logDebug("entryPct = " + entryPct);
		logDebug("entryCost = " + entryCost);
		logDebug("createdDate = " + createdDate);
		logDebug("createdBy = " + createdBy);
		logDebug("notation = " + notation);
		logDebug("lastChangeDate = " + lastChangeDate);
		logDebug("lastChangeUser = " + lastChangeUser);
		logDebug("timeTypeModel = " + timeTypeModel);

		var servProvCode = timeLog.getServProvCode();

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
				logMessage("Invoicing assessed fee items is successful.");
			else
				logMessage("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
		}

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