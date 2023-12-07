/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_OWNER_APP_CONTACT.JS
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
var showMessage = false; // Set to true to see results in popup window
var showDebug = true; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var SCRIPT_VERSION = 3;
var useCustomScriptFile = true;
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, true));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS","CALCANNABIS",useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", "CALCANNABIS",true));
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

try{
	var userMatch = false;
	var currEmail = null
	var resCurUser = aa.people.getPublicUserByUserName(publicUserID);
	if(resCurUser.getSuccess()){
		var currUser = resCurUser.getOutput();
		var currEmail = currUser.email;
		currEmail = String(currEmail).toUpperCase();
	}
/*	var contactList = cap.getContactsGroup();
    if(contactList != null && contactList.size() > 0){
    	var arrContacts = contactList.toArray();
    	for(var i in arrContacts) {
    		var thisCont = arrContacts[i];
    		var contEmail = thisCont.email;
    		var contType = thisCont.contactType;
    		if(contType == "Owner") {
    			contEmail = String(contEmail).toUpperCase();
    		}
    	}
    }
    if(contEmail == currEmail){
    	userMatch = true;
    }
*/
	var AInfo = [];
	loadAppSpecific4ACA(AInfo);
	var varAppNbr = AInfo["Application ID"];
	var varOwnership = parseFloat(AInfo["Percent Ownership"]);
	var parentId = getApplication(varAppNbr);
//	comment("parent ID " + parentId + " app ID " + varAppNbr);
		loadASITables(parentId);
		if(OWNERS.length<1){
			cancel = true;
			showMessage = true;
			comment("Contacts needs to be added to the Owners table.");
		}
		var ownerFnd = false;
		var pctMatch = false;
		var ownerSubmitted = false;

		for(o in OWNERS) {
			var ownerEmail = OWNERS[o]["Email Address"];
			var ownerPct = parseFloat(OWNERS[o]["Percent Ownership"]);
			var ownerStatus = OWNERS[o]["Status"];
			ownEmail = String(ownerEmail).toUpperCase();
			if(ownEmail == currEmail) {
				ownerFnd = true;
				if(ownerStatus == "Submitted") {
					ownerSubmitted = true;
				}
				else {
					if(varOwnership == ownerPct) {
						pctMatch = true;
					}
				}
			}
		}
		if(ownerSubmitted) {
			showMessage = true;
			cancel = true;
			comment("Error:  An owner application for " + currEmail + " has already been submitted for application " + varAppNbr + ".");
		}else {
			if(!ownerFnd) {
				showMessage = true;
				cancel = true;
				comment("Error:  Your user email " + currEmail + " does not match an owner on the License Application " + varAppNbr  + ". Contact the Designated Responsible Party for this application");
			}else {
				if(!pctMatch) {
					showMessage = true;
					cancel = true;
					comment("The Ownership Percentage you entered does not match the Ownership Percentage entered on the annual application " + varAppNbr + ".  Please contact the Designated Responsible Party for this application and correct the discrepancy.");
				}
			}
		}
	
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_BEFORE_OWNER_APP_CONTACT: Correct contact : " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_OWNER_APP_CONTACT: Correct contact  " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
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



