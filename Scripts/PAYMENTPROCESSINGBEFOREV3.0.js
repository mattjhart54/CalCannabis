/*------------------------------------------------------------------------------------------------------/
| Program : PaymentProcessingBeforev3.0.js
| Event   : PaymentProcessingBefore
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
var controlString = "PaymentProcessingBefore"; // Standard choice for control
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
var cashierTransModel = aa.env.getValue("CashierTransModel");
var paymentModels = aa.env.getValue("PaymentModelArray");
var feeItemInvoiceModels = aa.env.getValue("FeeItemInvoiceModelArray");

logDebug("cashierTransModel = " + cashierTransModel);
logDebug("paymentModels = " + paymentModels);
logDebug("feeItemInvoiceModels = " + feeItemInvoiceModels);

if (cashierTransModel != null && cashierTransModel != "") {
	var ppCashierID = cashierTransModel.getCashierID();
	var ppPaymentDate = cashierTransModel.getPaymentDate();
	var ppChangeDue = cashierTransModel.getChangeDue();
	var ppPaymentAmount = cashierTransModel.getPaymentAmount();
	var ppUnappliedAmount = cashierTransModel.getUnapplied();
	var ppTransType = cashierTransModel.getTransType();
	var ppSessionNbr = cashierTransModel.getSessionNbr();
	logDebug("*(string)ppCashierID:" + ppCashierID);
	logDebug("*(date)ppPaymentDate:" + ppPaymentDate);
	logDebug("*(double)ppChangeDue:" + ppChangeDue);
	logDebug("*(double)ppPaymentAmount:" + ppPaymentAmount);
	logDebug("*(double)ppUnappliedAmount:" + ppUnappliedAmount);
	logDebug("*(string)ppTransType:" + ppTransType);
	logDebug("*(long)ppSessionNbr:" + ppSessionNbr);
}

var ppPaymentMethods = new Array();

if (paymentModels != null && paymentModels != "") {
	for (var i = 0; i < paymentModels.length; i++) {
		ppPaymentMethods[i] = new Array();
		var paymentModel = paymentModels[i];
		var paymentMethod = paymentModel.getPaymentMethod();
		if (paymentMethod == 'Trust Account') {
			ppPaymentMethods[i].trustAccount = paymentModel.getAcctID();
			logDebug("**(String)ppPaymentMethods[" + i + "].trustAccount:" + ppPaymentMethods[i].trustAccount);
		}
		ppPaymentMethods[i].paymentMethod = paymentMethod;
		ppPaymentMethods[i].paymentRefNbr = paymentModel.getPaymentRefNbr();
		ppPaymentMethods[i].payee = paymentModel.getPayee();
		ppPaymentMethods[i].paymentComment = paymentModel.getPaymentComment();
		ppPaymentMethods[i].receivedType = paymentModel.getReceivedType();
		ppPaymentMethods[i].paymentAmount = paymentModel.getPaymentAmount();
		ppPaymentMethods[i].cardHolderName = paymentModel.getCardHolderName();
		ppPaymentMethods[i].ccAuthCode = paymentModel.getCCAuthCode();
		ppPaymentMethods[i].module = paymentModel.getModule();

		logDebug("**(string)ppPaymentMethods[" + i + "].paymentMethod:" + ppPaymentMethods[i].paymentMethod);
		logDebug("**(string)ppPaymentMethods[" + i + "].paymentRefNbr:" + ppPaymentMethods[i].paymentRefNbr);
		logDebug("**(string)ppPaymentMethods[" + i + "].payee:" + ppPaymentMethods[i].payee);
		logDebug("**(string)ppPaymentMethods[" + i + "].paymentComment:" + paymentModel.getPaymentComment());
		logDebug("**(string)ppPaymentMethods[" + i + "].receivedType:" + ppPaymentMethods[i].receivedType);
		logDebug("**(double)ppPaymentMethods[" + i + "].paymentAmount:" + ppPaymentMethods[i].paymentAmount);
		logDebug("**(string)ppPaymentMethods[" + i + "].cardHolderName:" + ppPaymentMethods[i].cardHolderName);
		logDebug("**(string)ppPaymentMethods[" + i + "].ccAuthCode:" + ppPaymentMethods[i].ccAuthCode);
		logDebug("**(string)ppPaymentMethods[" + i + "].module:" + ppPaymentMethods[i].module);
	}
}

var processArr = new Array();
if (feeItemInvoiceModels != null && feeItemInvoiceModels != "") {
	feeItemInvoiceModels.sort(function (a, b) {
		a.getCapID().toString() - b.getCapID().toString();
	});
	for (var i = 0; i < feeItemInvoiceModels.length; i++) {
		var feeItemInvoiceModel = feeItemInvoiceModels[i];
		var tCapId = feeItemInvoiceModel.getCapID().toString()
			if (processArr[tCapId] == null) {
				processArr[tCapId] = new Array();
			}
			processArr[tCapId][processArr.length] = feeItemInvoiceModel;
	}
}

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
//
//  Get the Standard choices entry we'll use for this App type
//  Then, get the action/criteria pairs for this app
//

for (recId in processArr) {

	var capId = processArr[recId][0].getCapID(); // Get the CapID

	aa.env.setValue("PermitId1", capId.getID1());
	aa.env.setValue("PermitId2", capId.getID2());
	aa.env.setValue("PermitId3", capId.getID3());

	if (SA) {
		eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA));
	} else {
		eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
	}

	logGlobals(AInfo);

	//
	// Event Specific Details
	//
	var ppFeesArray = processArr[recId];
	logDebug("***(array)ppFeesArray:" + ppFeesArray);

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