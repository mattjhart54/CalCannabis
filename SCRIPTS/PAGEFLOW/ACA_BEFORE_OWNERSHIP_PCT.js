/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_OWNERSHIP_PCT.js
| Event   : ACA Page Flow attachments before event
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
var useCustomScriptFile = true;  			// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, true));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null,true));
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

// page flow custom code begin

//doStandardChoiceActions(controlString, true, 0);

try {
	if(publicUserID == "PUBLICUSER130840" || publicUserID == "PUBLICUSER130303") {
		showMessage=true;
		logMessage("Start script");
		cancel = true;
	var capId = cap.getCapID();
	var tblRow = [];
	var ownPctTbl = [];	
	var totOwn = 0;
	var pctOwn =0;
	var br = "<BR>";
	var msg = "The Ownership Pct must not be > 100%.  You will need to correct before continueing " + br;
	var parentId = getParent();
	logMessage("parentId " + parentId);
	children = getChildren("Licenses/Cultivator/Medical/Owner Application", parentId)
	var totOwn = 0
	for (c in children) {
		childId = children[c];
		var pctOwn = getAppSpecific("Percent Ownership", childId);
		contacts = getContactArray(childId);
		for (x in contacts) {
		logDMessage("Contact " + contacts[x]["contactType"] );
			if(contacts[x]["contactType"] == "Owner") {
				var tblRow = [];
				tblRow["firstName"] = contacts[x]["firstName"];
				tblRow["lastName"] = contacts[x]["lastName"];
				tblRow["legalBusName"] = contacts[x]["middleName"];
				tblRow["pctOwn"] = pctOwn; 
				ownPctTbl.push(tblRow);
			}
		}
	}
	for(p in ownPctTbl) {
		owner = ownPctTbl[p]
		logMessage("owner - " + owner["firstName"] + " " + owner["lastName"] + " " + owner["legalBusName"] + " " + owner["pctOwn"])
		ownerFnd = false;
		for(o in ownPctTbl) {
			check = ownPctTbl[0];
			logMessage("check - " + check["firstName"] + " " + check["lastName"] + " " + check["legalBusName"] + " " + check["pctOwn"])
			if(ownerFnd == true) 
				continue;
			if(matches(owner["legalBusName"],null,"",undefined)) {
				ownerFnd = true;
				totOwn += parseFloat(owner["pctOwn"],2);
					msg = msg + "Owner: " + owner["firstName"] + " " + owner["lastName"] + "  Business Name: " + owner["legalBusName"] + "  Ownership " + owner["pctOwn"] +"%" + br;
			}
			else {
				if(owner["legalBusName"] == check["legalBusName"]) {
					ownerFnd = true;
					totOwn += parseFloat(owner["pctOwn"],2);
					msg = msg + "Owner: " + owner["firstName"] + " " + owner["lastName"] + "Business: " + owner["legalBusName"] + "Ownership " + owner["pctOwn"] +"%" + br;
				}
			}
		}
	}
	}
//if(totOwn > 100) 
	logMessage("total Ownership " + totOwn + msg);
}catch (err) {
    logDebug("A JavaScript Error occurred: ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: Main Loop: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
	aa.env.setValue("ErrorCode", "-2");
	if (showMessage) aa.env.setValue("ErrorMessage", message);
	if (showDebug) aa.env.setValue("ErrorMessage", debug);
}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
