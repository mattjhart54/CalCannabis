/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_LIC_VALIDATE_PREMISES_ADDRESSES.js
| Event   : ACA Page Flow attachments before event
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :  Compare Premises Address Table values with Custom Field Values
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
var useCustomScriptFile = true;  	// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM

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
var AInfo = new Array();						// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
loadASITables4ACA_corrected();

// page flow custom code begin


//jshear: 200123: story 6306: Check for Smart Chars
try {
	var smartCharMessage = "An illegal character has been found.  These characters are sometimes invisible and can come from copying and pasting the script from a word processing program.  Please remove the invalid character from ";
	var invalidChar = false;
	var myObj = new Object();
	myObj['Premise Address'] = AInfo["Premise Address"];
	myObj['Premise City'] = AInfo["Premise City"];
	myObj['Premise County'] = "" + AInfo["Premise County"];
	myObj['Premise State'] = "" + AInfo["Premise State"];
	myObj['Premise Zip'] = "" + AInfo["Premise Zip"];
	myObj['APN'] = "" + AInfo["APN"];
	for (x in myObj){
		if (myObj.hasOwnProperty(x)){			
			var smartChar = isUnicode(String(myObj[x]));
			if (smartChar){
				invalidChar = true;
				smartCharMessage += ", " + x;
			}
		}
	}

	if (invalidChar){
		cancel = true;
		showMessage = true;
		logMessage(smartCharMessage);
	}
	//jshear: 200123: story 6306: Check for Smart Chars end
	
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_VALIDATE_CONTACT: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_VALIDATE_CONTACT: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

try {
		
		//Primary License Data
		var capId = cap.getCapID();
		var premCity = AInfo['Premise City'];
		var premCounty = AInfo['Premise County'];
		
		//error messages
		var premCountyMessage = "";
		var premCityMessage = "";

		
		//Compare Data from Table to Custom Field Values
		if (typeof(PREMISESADDRESSES) == "object") {
			if(PREMISESADDRESSES.length > 0){
				for (var x in PREMISESADDRESSES) {
					var theRow = PREMISESADDRESSES[x];
					var premCityTable = theRow["Premises City"];
					var premCountyTable = theRow["Premises County"];
					
					if (String(premCity).toLowerCase() != String(premCityTable).toLowerCase()) {
						premCityMessage = "Premises City must match the Premises City entered in the Premises Information" + br;
					}
					if (String(premCounty).toLowerCase() != String(premCountyTable).toLowerCase()) {
						premCountyMessage = "Premises County must match the Premises County entered in the Premises Information" + br;
					}
				}
			}				
		}
		
		if (premCountyMessage != "" || premCityMessage != ""){
				cancel = true;
				showMessage = true;
				logMessage(premCityMessage + premCountyMessage);
		}		
					
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_LIC_VALIDATE_PREMISES_ADDRESSES: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_LIC_VALIDATE_PREMISES_ADDRESSES: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
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
