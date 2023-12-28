/*------------------------------------------------------------------------------------------------------/
| Program : ContactAddBefore3.0.js
| Event   : ContactAddBefore
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
var controlString = "ContactAddBefore"; // Standard choice for control
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


var ContactObj = aa.env.getValue("Contact");
		//logDebug("ContactObj = " + ContactObj.getClass());
var ContactAttrObj = aa.env.getValue("ContactAttribute");
		//logDebug("ContactAttrObj = " + ContactAttrObj.getClass());
var contactType = ContactObj.getPeople().getContactType();
		logDebug("contactType : " + contactType);
var contactRelation = ContactObj.getPeople().getRelation();
		logDebug("contactRelation : " + contactRelation);
var contactName = ContactObj.getPeople().getFullName() ;
		logDebug("contactName : " + contactName);
var contactBusiness = ContactObj.getPeople().getBusinessName();
		logDebug("contactBusiness : " + contactBusiness);
var contactAddr1 = ContactObj.getPeople().getCompactAddress().getAddressLine1();
		logDebug("contactAddr1 : "+contactAddr1);
var contactAddr2 = ContactObj.getPeople().getCompactAddress().getAddressLine2();
		logDebug("contactAddr2 : "+contactAddr2);
var contactAddr3 = ContactObj.getPeople().getCompactAddress().getAddressLine3();
		logDebug("contactAddr3 : "+contactAddr3);
var contactCity = ContactObj.getPeople().getCompactAddress().getCity();
		logDebug("contactCity : "+contactCity);
var contactState = ContactObj.getPeople().getCompactAddress().getState();
		logDebug("contactState : "+contactState);
var contactZip = ContactObj.getPeople().getCompactAddress().getZip();
		logDebug("contactZip : "+contactZip);
var contactEmail = ContactObj.getPeople().getEmail();
		logDebug("contactEmail : " + contactEmail);
var contactPhone1 = ContactObj.getPeople().getPhone1();
		logDebug("contactPhone1 : " + contactPhone1);
//var contactPriFlag = ContactObj.getPeople().getFlag();	logDebug("contactPriFlag : " + contactPriFlag);

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