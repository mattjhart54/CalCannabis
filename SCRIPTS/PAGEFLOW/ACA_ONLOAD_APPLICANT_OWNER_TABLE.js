/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_APPLICANT_OWNER_TABLE.js
| Event   : ACA Page Flow attachments before event
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :  Checks the values of first/last name against reference contacts with corresponding email
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
try{
	//lwacht: 180306: story 5308: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180306: story 5308: end
		loadASITables4ACA_corrected();
		var tblOwner = [];
		var tblCorrection = false;
		var correctLastName = false;
		var correctFirstName = false;
		if(OWNERS.length<1){
			var contactList = cap.getContactsGroup();
			if(contactList != null && contactList.size() > 0){
				var arrContacts = contactList.toArray();
				for(var i in arrContacts) {
					var thisCont = arrContacts[i];
					var emailText = "";
					//for(x in thisCont){
					//	if(typeof(thisCont[x])!="function"){
					//		logDebug(x+ ": " + thisCont[x]);
					//		emailText +=(x+ ": " + thisCont[x]) + br;
					//	}
					//}
					var contType = thisCont.contactType;
					showMessage=true;
					if(contType =="Designated Responsible Party") {
						//var refContNrb = thisCont.refContactNumber;
						var drpContact = [];
						var drpFName = thisCont.firstName;
						var drpLName = thisCont.lastName;
						var drpEmail = thisCont.email;
						drpContact["First Name"]=drpFName;
						drpContact["Last Name"]=drpLName;
						drpContact["Email Address"]=drpEmail;
						tblOwner.push(drpContact);
						var asit = cap.getAppSpecificTableGroupModel();
						addASITable4ACAPageFlow(asit, "OWNERS", tblOwner)
						addToASITable("OWNERS",tblOwner);
					}
				}
			}
		}
	}
}catch (err) {
    logDebug("A JavaScript Error occurred: ACA_ONLOAD_APPLICANT_OWNER_TABLE: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_ONLOAD_APPLICANT_OWNER_TABLE: Main Loop: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
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


