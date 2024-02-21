/*------------------------------------------------------------------------------------------------------/
| Program : ACA_Before_Sample_V1.6.js
| Event   : ACA_Before
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var SCRIPT_VERSION = 3;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, true));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null,true));
}

eval(getScriptText("INCLUDES_CUSTOM", null,true));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

var cap = aa.env.getValue("CapModel");

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

try {

	cancel = false;
	showMessage = false;
	showList = true;
	addConditions = true;
	r = getNonTableRequiredDocs4ACA();

	if (r.length > 0 && showList) {
		cancel = true;
		showMessage = true;
		message = "<div class='docList'><span class='fontbold font14px ACA_Title_Color'>The following documents are required based on the information you have provided:</span><ol>";
	}

	if (r.length > 0) {
		for (x in r) {
			if(appMatch("Licenses/Cultivator/Amendment/License Change")) conditionType = "License Required Documents";

			
			dr = r[x];
			// passed from script, contains name of requirement which will match condition;
			if (dr) {
				ccr = aa.capCondition.getStandardConditions(conditionType,dr).getOutput();
			}

			if (dr && ccr.length > 0 && showList) {
					message += "<li><span>" + dr + "</span>: " + ccr[0].getPublicDisplayMessage() + "</li>";
			}

			if (dr && ccr.length > 0 && addConditions && !appHasCondition(conditionType,null,dr,null)) {
				addStdCondition(conditionType,dr);
			}
		}
	}

	if (r.length > 0) {
		message += "</ol></div>";
	}



		
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_FOR_REN_DOC_REQS: Load Docs: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_FOR_REN_DOC_REQS: Load Docs: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
	}
else
	{
	if (cancel)
		{
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage) aa.env.setValue("ErrorMessage", message);
		if (showDebug) 	aa.env.setValue("ErrorMessage", debug);
		}
	else
		{
		aa.env.setValue("ErrorCode", "0");
		if (showMessage) aa.env.setValue("ErrorMessage", message);
		if (showDebug) 	aa.env.setValue("ErrorMessage", debug);
		}
	}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
