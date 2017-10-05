/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_APPLICANT_WATER_SUPPLY_TABLE.js
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
	var noRows = false;
	var row = new Array();
	var tblWater = new Array();
	row["Authorized Place of Use"] = new asiTableValObj("Authorized Place of Use", "" + "", "Y");
	row["Description"] = new asiTableValObj("Description", "" + "", "Y");
	row["Diversion Number"] = new asiTableValObj("Diversion Number", "" , "Y");
	row["Geographical Location Coordinates"] = new asiTableValObj("Geographical Location Coordinates", "", "Y");
	row["Maximum Amount of Water Delivered"] = new asiTableValObj("Maximum Amount of Water Delivered", "", "Y");
	row["Name of Supplier"] = new asiTableValObj("Name of Supplier", "", "Y");
	row["Total Square Footage"] = new asiTableValObj("Total Square Footage", "", "Y");
	row["Total Storage Capacity"] = new asiTableValObj("Total Storage Capacity", "", "Y");
	row["Type of Water Supply"] = new asiTableValObj("Type of Water Supply", "", "Y");
	tblWater.push(row);
	asit = cap.getAppSpecificTableGroupModel();
	new_asit = addASITable4ACAPageFlow(asit,"SOURCE OF WATER SUPPLY", tblWater);
	a.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_VALIDATE_CONTACT: " + startDate, "capId: " + capId + br + "new_asit: " + new_asit);

	loadASITables4ACA_corrected();
//	showMessage=true
//	comment("table Legnth " + SOURCEOFWATERSUPPLY.length + "table data " + SOURCEOFWATERSUPPLY[0]["Type of Water Supply"])
	if(SOURCEOFWATERSUPPLY.length<1){
		noRows = true;
	}
	else {
		var rowFound = false;
		for(x in SOURCEOFWATERSUPPLY){
			rowFound = true;
			if(matches(SOURCEOFWATERSUPPLY[0]["Type of Water Supply"], null, "", undefined)) {
				noRows = true;
			}
		}
	}
	if(noRows) {
		cancel = true;
		showMessage = true;
		comment("The SOURCE OF WATER SUPPLY table requires at least one row.");
	}
	if(!rowFound) {
		cancel = true;
		showMessage = true;
		comment("The SOURCE OF WATER SUPPLY table requires at least one row.");
	}
}catch (err) {
    logDebug("A JavaScript Error occurred: ACA_BEFORE_APPLICANT_WATER_SUPPLY_TABLE: Validate table: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_BEFORE_APPLICANT_WATER_SUPPLY_TABLE: Validate table: "+ startDate, publicUserID + br + capId + br + err.message+ br + err.stack);
}
//validate contacts
try {
	var resCurUser = aa.people.getPublicUserByUserName(publicUserID);

	if(resCurUser.getSuccess()){
		var contactFnd = false
		var drpFnd = false;
		var prepFnd = false;
		var appFnd = false;
		var currUser = resCurUser.getOutput();
		var currEmail = currUser.email;
		//lwacht: 170810: need person logged in to be able to access the application in the future
		if(matches(AInfo["publicUserEmail"],"",null)){
			editAppSpecific4ACA("publicUserEmail",currEmail);
			prepFnd = true;
		}else{
			if(AInfo["publicUserEmail"]==currEmail){
				prepFnd = true;
			}
		}
		var contactList = cap.getContactsGroup();
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				var contEmail = thisCont.email;
				var contType = thisCont.contactType;
				if(contType == "Designated Responsible Party")
					drpFnd = true;
				if(contType == "Business")
					appFnd = true;
				if(!matches(contEmail,"",null,"undefined")){
					if(contEmail.toUpperCase() == currEmail.toUpperCase() && matches(contType, "Designated Responsible Party", "Business")){
						contactFnd = true;
					}
				}
			}
		}
		//lwacht: changed logic to check for DRP *or* Business
		if(!prepFnd){
			if(contactFnd == false && (drpFnd == true || appFnd == true)) {
				cancel = true;
				showMessage = true;
				logMessage("  Error: Only the Business and the Designated Responsible party can update this application.");
			}	
		}
	}
	else{
		logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
		aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the current user: ACA_ONLOAD_OWNER_APP_UPDATE: Validate Contact: " + startDate, "capId: " + capId + br + resCurUser.getErrorMessage() + br + currEnv);
	}
}
catch (err){
	logDebug("A JavaScript Error occurred:ACA_ONLOAD_OWNER_APP_UPDATE: Validate Contact: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_VALIDATE_CONTACT: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
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


