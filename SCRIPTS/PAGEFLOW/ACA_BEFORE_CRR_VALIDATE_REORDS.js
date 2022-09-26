/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_CRR_VALIDATE_REORDS.JS
| Event   : ACA Page Flow before load of page
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS","CALCANNABIS",true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", "CALCANNABIS",true));
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
var AInfo = new Array();						// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables4ACA();

// page flow custom code begin

try {
		//error messages
		var licTypeMessage = "Neither the DRP or Legal Business Name match the Primary record’s DRP or Legal Business Name. If a change has occurred, you must first submit a " + <a target="_blank" rel="Notification and Request Form (DCC-LIC-027)" href="https://cannabis.ca.gov/wp-content/uploads/sites/2/2021/12/DCC-LIC-027-Notifications-and-Requests-to-Modify-a-License.pdf">Link</a> + " to request a modification to the license record before you can proceed with a conversion request." + <br>;
		var lightTypeMessage = "The lighting type does not match the primary record lighting type of [insert value]. The lighting type refers to Indoor, Outdoor, Mixed-light Tier 1, or Mixed-light Tier 2." + <br>;
		errorMessage = "";
		
		//Primary License Data
		var icNum = gatAppSpecific("License Number");
		parentCapId = getApplication(icNum);
		var legalBusName = getAppSpecific("Legal Business Name", parentCapId);
		var lightType = getAppSpecific("License Type", parentCapId);
		var priContact = getContactObj(parentCapId,"Designated Responsible Party");
		if(priContact){
			var licFirstName = priContact.people.getFirstName();
			var licLastName = priContact.people.getLastName();
		}
		//Compare Data from Licenses to COnvert Table to Primary License Info
		if (typeof(LICENSERECORDSFORCONVERSION) == "object") {
			for (var x in LICENSERECORDSFORCONVERSION) {
				var theRow = LICENSERECORDSFORCONVERSION[x];
				var convFirstName = theRow["DRP First Name"].fieldValue;
				var convLastName = theRow["DRP Last Name"].fieldValue;
				var convLegalBusName = theRow["Legal Business Name"].fieldValue;
				var convLightType = theRow["Lighting Type"].fieldValue;
				var convLicRec = theRow["License Record ID"].fieldValue;
				convCapId = getApplication(convLicRec);
				var convCap = aa.cap.getCap(convCapId).getOutput();
				var convStatus = licCap.getCapStatus();
				if (matches(convStatus,"Active", "About to Expire", "Expired - Pending Renewal")){
					if ((convFirstName.toUpperCase() != licFirstName.toUpperCase()) || (convLastName.toUpperCase() != licLastName.toUpperCase()) || (convLegalBusName.toUpperCase() != legalBusName.toUpperCase())){	
						errorMessage += convLicRec ": " + licTypeMessage;
					}
				}
				if (lightType.toUpperCase() != convLightType.toUpperCase()){
					errorMessage += convLicRec ": " + lightTypeMessage;
				}
			}
		}
					
				
					
					
		if(errorMessage != ""){
			cancel = true;
			showMessage = true;
			logMessage(errorMessage);
		}
					
					
					
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_VALIDATE_CONTACT: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_VALIDATE_CONTACT: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
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
