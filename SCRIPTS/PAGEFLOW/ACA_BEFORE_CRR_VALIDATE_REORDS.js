/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_APPLICANT_OWNER_TABLE.js
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
var showMessage = true; // Set to true to see results in popup window
var showDebug = true; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = true;
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

try {
		//error messages
		var licTypeMessage = "Neither the DRP or Legal Business Name match the Primary record’s DRP or Legal Business Name. If a change has occurred, you must first submit a " + br;
		var lightTypeMessage = "The lighting type does not match the primary record lighting type of [insert value]. The lighting type refers to Indoor, Outdoor, Mixed-light Tier 1, or Mixed-light Tier 2." + br;
		errorMessage = "";
		
		//Primary License Data
		var capId = cap.getCapID();
		var licNum = AInfo['License Number'];
		parentCapId = getApplication(licNum);
		logDebug("licNum: " + licNum + " parentCapId: " + parentCapId);
		var currCap = capId; 
		capId = parentCapId;
		PInfo = new Array;
		loadAppSpecific(PInfo);
		capId = currCap;
		
		var legalBusName = PInfo['Legal Business Name'];
		var lightType = PInfo['License Type'];
		logDebug("legalBusName: " + legalBusName + " lightType: " + lightType);
		var c = aa.people.getCapContactByCapID(parentCapId).getOutput();
		for(i in c) {
			var con = c[i];
			var conType = con.getCapContactModel().getContactType();
			if(conType == "Designated Responsible Party") {
				var licFirstName = con.getCapContactModel().getFirstName();
				var licLastName  = con.getCapContactModel().getLastName();
				logDebug("licFirstName: " + licFirstName + " licLastName: " +licLastName);
			}
		}
		//Compare Data from Licenses to COnvert Table to Primary License Info
		if (typeof(LICENSERECORDSFORCONVERSION) == "object") {
			for (var x in LICENSERECORDSFORCONVERSION) {
				var theRow = LICENSERECORDSFORCONVERSION[x];
				var convFirstName = theRow["DRP First Name"].fieldValue;
				logDebug("convFirstName: " + convFirstName);
				var convLastName = theRow["DRP Last Name"].fieldValue;
				var convLegalBusName = theRow["Legal Business Name"].fieldValue;
				var convLightType = theRow["Lighting Type"].fieldValue;
				var convLicRec = theRow["License Record ID"].fieldValue;
				convCapId = getApplication(convLicRec);
				var convCap = aa.cap.getCap(convCapId).getOutput();
				var convStatus = licCap.getCapStatus();
				if (matches(convStatus,"Active", "About to Expire", "Expired - Pending Renewal")){
					if ((convFirstName.toUpperCase() != licFirstName.toUpperCase()) || (convLastName.toUpperCase() != licLastName.toUpperCase()) || (convLegalBusName.toUpperCase() != legalBusName.toUpperCase())){	
						errorMessage += convLicRec + ": " + licTypeMessage;
					}
				}
				if (lightType.toUpperCase() != convLightType.toUpperCase()){
					errorMessage += convLicRec + ": " + lightTypeMessage;
				}
			}
		}
		logDebug("errorMessage: " + errorMessage);			
				
					
					
		if(errorMessage != ""){
			cancel = true;
			showMessage = true;
			logMessage(errorMessage);
		}
					
					
					
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_CRR_VALIDATE_REORDS: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_CRR_VALIDATE_REORDS: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

// page flow custom code end
function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
}

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