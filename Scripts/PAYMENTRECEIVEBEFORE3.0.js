/*------------------------------------------------------------------------------------------------------/
| Program : PaymentReceiveBefore3.0.js
| Event   : PaymentReceiveBefore
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
var controlString = "PaymentReceiveBefore"; // Standard choice for control
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

var FeeSeqList = aa.env.getValue("FeeItemsList");			logDebug("FeeSeqList = " + FeeSeqList);
var FeeItemsOffsetList = aa.env.getValue("FeeItemsOffsetList");		logDebug("FeeItemsOffsetList = " + FeeItemsOffsetList);
var FeeItemsPaidList = aa.env.getValue("FeeItemsPaidList");		logDebug("FeeItemsPaidList = " + FeeItemsPaidList);
var FeePeriod = aa.env.getValue("FeePeriod");				logDebug("FeePeriod = " + FeePeriod);
var NumberOfFeeItems = aa.env.getValue("NumberOfFeeItems");		logDebug("NumberOfFeeItems = " + NumberOfFeeItems);
var PaymentCashierId = aa.env.getValue("PaymentCashierId");		logDebug("PaymentCashierId = " + PaymentCashierId);
var PaymentComment = aa.env.getValue("PaymentComment");			logDebug("PaymentComment = " + PaymentComment);
var PaymentDate = aa.env.getValue("PaymentDate");			logDebug("PaymentDate = " + PaymentDate);
var PaymentMethod = aa.env.getValue("PaymentMethod");			logDebug("PaymentMethod = " + PaymentMethod);
var PaymentRegisterId = aa.env.getValue("PaymentRegisterId");		logDebug("PaymentRegisterId = " + PaymentRegisterId);
var PaymentTotalAvailableAmount = aa.env.getValue("PaymentTotalAvailableAmount");	logDebug("PaymentTotalAvailableAmount = " + PaymentTotalAvailableAmount);
var PaymentTotalPaidAmount  = aa.env.getValue("PaymentTotalPaidAmount");	logDebug("PaymentTotalPaidAmount  = " + PaymentTotalPaidAmount );

var checkNumber = aa.env.getValue("PaymentCheckNumber");
var checkType = aa.env.getValue("PaymentCheckType");
var cHolderName = aa.env.getValue("PaymentCheckHolderName");
var cHolderEmail = aa.env.getValue("PaymentCheckHolderEmail");
var phoneCountryCode = aa.env.getValue("PaymentPayeePhoneCountryCode");
var phoneNumber = aa.env.getValue("PaymentPhoneNumber");
var bankName = aa.env.getValue("PaymentBankName");
var country = aa.env.getValue("PaymentCountry");
var state = aa.env.getValue("PaymentState");
var city = aa.env.getValue("PaymentCity");
var postalCode = aa.env.getValue("PaymentPostalCode");
var driverLicenseNumber = aa.env.getValue("PaymentDriverLicenseNumber");
var street = aa.env.getValue("PaymentStreet");

logDebug("checkNumber = " + checkNumber);
logDebug("checkType = " + checkType);
logDebug("cHolderName = " + cHolderName);
logDebug("cHolderEmail = " + cHolderEmail);
logDebug("country = " + country);
logDebug("state = " + state);
logDebug("city = " + city);
logDebug("street = " + street);
logDebug("street = " + phoneCountryCode);
logDebug("phoneNumber = " + phoneNumber);
logDebug("postalCode = " + postalCode);
logDebug("bankName = " + bankName);
logDebug("driverLicenseNumber = " + driverLicenseNumber);
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