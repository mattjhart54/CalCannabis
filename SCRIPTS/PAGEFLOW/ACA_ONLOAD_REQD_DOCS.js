


/*------------------------
	THIS PAGE FLOW IS NOT BEING USED AND SHOULD BE REMOVED
------------------------*/











/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_REQD_DOCS.js
| Event   : ACA Page Flow On-Load
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : CalCannabis Licensing
| Action# : N/A
|
| Notes   :  This script populates the custom list "tblAttach" with the required tblAttach
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
var useCustomScriptFile = true;  			// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var currentUserID = aa.env.getValue("CurrentUserID");

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
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));


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

try {
    var capModel = aa.env.getValue("CapModel");     
    capId = capModel.getCapID();
	reqDocs = getReqdDocs("Application");
	var tblRow = [];
	var tblNewAttach = [];
	if(reqDocs.length>0){
		for (x in reqDocs){
			var docName = reqDocs[x];
			var tblRow = [];
			tblRow["Document Type"] = new asiTableValObj("Document Type",""+docName, "Y"); 
			tblRow["Document Description"]= new asiTableValObj("Document Description",""+lookup("LIC_CC_ATTACHMENTS", docName), "Y"); 
			tblRow["Uploaded"] = new asiTableValObj("Uploaded","UNCHECKED", "Y"); 
			tblRow["Status"] = new asiTableValObj("Status","Not Submitted", "Y"); ; 
			tblNewAttach.push(tblRow);
		}
		removeASITable("ATTACHMENTS"); 
		asit = cap.getAppSpecificTableGroupModel();
		addASITable4ACAPageFlow(asit,"ATTACHMENTS",tblNewAttach);
	}
} catch (err) {
	logDebug("An error has occurred in ACA_ONLOAD_REQD_DOCS: Main function: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_REQD_DOCS: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
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
