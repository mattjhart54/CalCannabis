/*
| Program : ACA_ONLOAD_CLC_PREMISES.js
| Event   : ACA Page Flow onload ASI Components
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/-----------------------------------------
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


// page flow custom code begin
try {
//	Only allow DRP to process an CLC record
	var expDateProcessed = getAppSpecific("Expiration Date Changed", parentCapId);
	var pAltId = parentCapId.getCustomID();
	var thisCap = aa.cap.getCap(parentCapId).getOutput();		
	var thisCapStatus = thisCap.getCapStatus();
	
	var resCurUser = aa.people.getPublicUserByUserName(publicUserID);
	if(resCurUser.getSuccess()){
		var contactFnd = false;
		var currUser = resCurUser.getOutput();
		var currEmail = currUser.email;
		var currUserID = currUser.fullName;
		var priContact = getContactObj(parentCapId,"Designated Responsible Party");
		if(priContact){
			var conEmail = priContact.capContact.email;
			if(!matches(conEmail,"",null,"undefined")){
				if(conEmail.toUpperCase() == currEmail.toUpperCase()){
					contactFnd = true;
				}
			}
		}
		if(!contactFnd){
			cancel = true;
			showMessage = true;
			logMessage("  Warning: Only the Designated Responsible Party will be allowed to complete a License Change request.");
		}else{
			if (expDateProcessed == "CHECKED"){
				cancel = true;
				showMessage = true;
				logMessage(" Your license status is not eligible for this request, please contact DCC Licensing at <a href='mailto:licensing@cannabis.ca.gov'>licensing@cannabis.ca.gov</a>");
			}else{
				if (!matches(thisCapStatus,"Active", "Inactive", "Suspended", "Limited Operations")){
					cancel = true;
					showMessage = true;
					logMessage(" Your license status is not eligible for this request, please contact DCC Licensing at <a href='mailto:licensing@cannabis.ca.gov'>licensing@cannabis.ca.gov</a>");
				}
			}
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
			if (renewalCapProject != null) {
				cancel = true;
				showMessage = true;
				logMessage(" Your license is not eligible for this license change request as you have a pending renewal in progress. At this time, you must request these changes via the renewal process. If you have questions, please contact DCC Licensing at <a href='mailto:licensing@cannabis.ca.gov'>licensing@cannabis.ca.gov</a>");
			}
			var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("License Number", pAltId);
			if (getCapResult.getSuccess()){
				var apsArray = getCapResult.getOutput();
			
				for (aps in apsArray){
					var thisCapId = apsArray[aps].getCapID();
				    var capBasicInfo = aa.cap.getCapBasicInfo(thisCapId).getOutput();
				    if (capBasicInfo) {
				    	var thisCapType = capBasicInfo.getCapType();
				    	if (String(thisCapType) == "Licenses/Cultivator/Conversion Request/NA"){
				      		var capStatus = capBasicInfo.getCapStatus();
					      	if (!matches(capStatus,"Abandoned", "License Issued")){
					      		cancel = true;
								showMessage = true;
								logMessage(" Your license is not eligible for this license change request as you have a conversion request in progress. If you have questions, please contact DCC Licensing at <a href='mailto:licensing@cannabis.ca.gov'>licensing@cannabis.ca.gov</a>");
							}
				      	}
					}	
				}
				
			}else{ 
				logDebug( "**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()) ;
			}
		}				
	}else{
		logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
		aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the current user: ACA_ONLOAD_CLC_PREMISES: " + startDate, "capId: " + capId + br + resCurUser.getErrorMessage() + br + currEnv);
	}
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_ONLOAD_CLC_PREMISES: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_CLC_PREMISES: Validate DRP " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
try{
	var capId = cap.getCapID();
	var AInfo = [];
	loadAppSpecific4ACA(AInfo);
	logDebug("APN " + AInfo["APN"]);
	if(matches(AInfo["APN"] ,null,"",undefined)) {
		licCapId = parentCapId;
		if(licCapId){
			var currCap = capId; 
			capId = licCapId;
			logDebug("licCapId: " + licCapId);
			PInfo = new Array;
			loadAppSpecific(PInfo);
			capId = currCap;
			editAppSpecific4ACA("License Number", parentCapId.getCustomID());
			var priContact = getContactObj(parentCapId,"Designated Responsible Party");
			if(priContact){
				//Story 6577 SA - Resolve ACA Save and Resume Later contact issue - Adding DRP
				priContact.people.setContactSeqNumber(null); // reset in order to avoid capContactNotFoundException on submittal
				priContact.people.setContactType("Designated Responsible Party");
				aa.env.setValue("CapModel",cap);
				cap.setApplicantModel(priContact.capContact);
			}
   
			b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
			if (b1ExpResult.getSuccess()) {
				this.b1Exp = b1ExpResult.getOutput();
				expDate = this.b1Exp.getExpDate();	
				if(expDate) {
					expDate = fixDate(expDate);
					tmpExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
					editAppSpecific4ACA("Expiration Date", tmpExpDate);
				}
			}
			editAppSpecific4ACA("License Issued Type", PInfo["License Issued Type"]);
			editAppSpecific4ACA("Premises Address", PInfo["Premise Address"]);
			editAppSpecific4ACA("Premises City",PInfo["Premise City"]);
			editAppSpecific4ACA("Premises State",PInfo["Premise State"]);
			editAppSpecific4ACA("Premises Zip",PInfo["Premise Zip"]);
			editAppSpecific4ACA("Premises County",PInfo["Premise County"]);
			editAppSpecific4ACA("APN",PInfo["APN"]);
			editAppSpecific4ACA("Cultivator Type", PInfo["Cultivator Type"]);
			editAppSpecific4ACA("Business Name", PInfo["Legal Business Name"]);
      		updateWorkDesc(PInfo["Business Name"]);
      		editAppSpecific4ACA("License Type", PInfo["License Type"]);
      		editAppSpecific4ACA("Original License Type", PInfo["Original License Type"]);
      		useAppSpecificGroupName = true; 
  			editAppSpecific4ACA("LICENSE INFORMATION.Limited Operations",PInfo["Limited Operations"]);
  			useAppSpecificGroupName = false;
		}
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_CLC_PREMISES: Load Data: " + err.message + br + err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_CLC_PREMISES: Load Date: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
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
