/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_COND_DOCS.JS
| Event   : ACA Page Flow onload attachments component
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
var showMessage = true; // Set to true to see results in popup window
var showDebug = true; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = true;
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS","CALTREES",true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", "CALTREES",true));
}

eval(getScriptText("INCLUDES_CUSTOM"));

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
//var parentId = cap.getParentCapID();

// page flow custom code begin

try{
	var appName = cap.getSpecialText();
	var resCurUser = aa.person.getUser(publicUserID);
	aa.sendMail("noreply_accela@cdfa.ca.gov", "lwacht@trustvip.com", "", "Info: LACA_ONLOAD_OWNER_APP_CONTACT: " + startDate, "currUserName: " + resCurUser.getSuccess() + "; " + ("appName: " + appName));
	if(resCurUser.getSuccess()){
		var currUser = resCurUser.getOutput();
		var currUserName = currUser.firstName + " " + currUser.lastName;
		logDebug("currUserName: " + currUserName);
		logDebug("appName: " + appName);
		if(appName != currUserName){
			comment("Warning: Only the owner (" + appName + ") can submit this application.");
		}
	}else{
		logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
		aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "An error occurred retrieving the current user: LACA_ONLOAD_OWNER_APP_CONTACT: " + startDate, resCurUser.getErrorMessage());
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_COND_DOCS: Main function: " + err.message);
	logDebug(err.stack);
	aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "A JavaScript Error occurred: LACA_ONLOAD_OWNER_APP_CONTACT: " + startDate, err);
}
// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}



