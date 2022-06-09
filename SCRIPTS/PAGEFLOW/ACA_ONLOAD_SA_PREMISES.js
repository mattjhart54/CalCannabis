/*
| Program : ACA_ONLOAD_SA_PREMISES.js
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
//	Only allow DRP to process an SA record
	
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
			logMessage("  Warning: Only the Designated Responsible party can submit a science amendment.");
		}else{
			cIds = getChildren("Licenses/Cultivator/Amendment/Science",parentCapId);
			var approvedStatus = true;
			var amendArray = new Array();
			var recCnt = 0;
			for(x in cIds) {
				var recId = "" + cIds[x];
				if(recId.substring(2,5) != "EST") {
					var recId = cIds[x];
					logDebug(recId.getCustomID());
					thisCap = aa.cap.getCap(recId).getOutput();		
					var thisCapStatus = thisCap.getCapStatus();
					if (!matches(thisCapStatus,"Transition Amendment Approved","Amendment Rejected","Amendment Approved")){
						approvedStatus = false;
						if (amendArray.indexOf(recId) < 0) {
							amendArray.push(recId);
						}
					}
				}
			}
			if(!approvedStatus){
				if(amendArray.length > 1){
					approvedStatusMessage= "The license for which you are trying to create a Science Amendment already has an active Science Amendment. Navigate back to your licenses page to upload new documents to one of the Science Amendments open for review associated to this license. If you have questions please email environmentalreview@cannabis.ca.gov or call 1-844-61-CA-DCC (1-844-612-2322)."
				}else{
					var str = String(recId.getCustomID());
					var summaryDeepLink1 = acaUrl + "/Cap/CapDetail.aspx?Module=Licenses&TabName=Licenses&capID1=";
					var summaryDeepLink2 = recId.getID1() + "&capID2=" + recId.getID2() + "&capID3=" + recId.getID3() + "&agencyCode=CALCANNABIS";
					var fullSummaryDeepLink = summaryDeepLink1 + summaryDeepLink2;
					var result = str.link(fullSummaryDeepLink);
					approvedStatusMessage="The license for which you are trying to create a Science Amendment already has an active Science Amendment. Navigate back to your licenses page to upload new documents to the Science Amendment open for review associated to this license." + result + " If you have questions please email environmentalreview@cannabis.ca.gov or call 1-844-61-CA-DCC (1-844-612-2322)."
				}
				cancel = true;
				showMessage = true;
				logMessage(approvedStatusMessage);
			}
		}				
	}else{
		logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
		aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the current user: ACA_ONLOAD_SA_PREMISE: " + startDate, "capId: " + capId + br + resCurUser.getErrorMessage() + br + currEnv);
	}
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_ONLOAD_SA_PREMISE: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_SA_PREMISE: Validate DRP " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
try{
	var capId = cap.getCapID();
	var AInfo = [];
	loadAppSpecific4ACA(AInfo);
	logDebug("APN " + AInfo["APN"]);
	if(matches(AInfo["APN"] ,null,"",undefined)) {
//		var licNbr = AInfo["License Number"];
//		licCapId = aa.cap.getCapID(licNbr).getOutput();
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
				editAppSpecific4ACA("DRP First Name",priContact.capContact.firstName);
				editAppSpecific4ACA("DRP Last Name",priContact.capContact.lastName);
				editAppSpecific4ACA("DRP Email Address",priContact.capContact.email);
				//Story 6577 SA - Resolve ACA Save and Resume Later contact issue - Adding DRP
				priContact.people.setContactSeqNumber(null); // reset in order to avoid capContactNotFoundException on submittal
				priContact.people.setContactType("Designated Responsible Party");	
				cap.setApplicantModel(priContact.capContact);
				aa.env.setValue("CapModel",cap);
			}
			b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
			if (b1ExpResult.getSuccess()) {
				this.b1Exp = b1ExpResult.getOutput();
				expDate = this.b1Exp.getExpDate();	
				if(expDate) {
					tmpExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
					editAppSpecific4ACA("License Expiration Date", tmpExpDate);
				}
			}
			editAppSpecific4ACA("License Issued Type", PInfo["License Issued Type"]);
			editAppSpecific4ACA("Premise Address", PInfo["Premise Address"]);
			editAppSpecific4ACA("Premise City",PInfo["Premise City"]);
			editAppSpecific4ACA("Premise State",PInfo["Premise State"]);
			editAppSpecific4ACA("Premise Zip",PInfo["Premise Zip"]);
			editAppSpecific4ACA("Premise County",PInfo["Premise County"]);
			editAppSpecific4ACA("APN",PInfo["APN"]);
			editAppSpecific4ACA("Tribal Land",PInfo["Tribal Land"]);
			editAppSpecific4ACA("Tribal Land Information",PInfo["Tribal Land Information"]);
			editAppSpecific4ACA("Grid",PInfo["Grid"]);
			editAppSpecific4ACA("Grid Update",PInfo["Grid"]);
			editAppSpecific4ACA("Solar",PInfo["Solar"]);
			editAppSpecific4ACA("Solar Update",PInfo["Solar"]);
			editAppSpecific4ACA("Generator",PInfo["Generator"]);
			editAppSpecific4ACA("Generator Update",PInfo["Generator"]);
			editAppSpecific4ACA("Generator Under 50 HP",PInfo["Generator Under 50 HP"]);
			editAppSpecific4ACA("G50 Update",PInfo["Generator Under 50 HP"]);
			editAppSpecific4ACA("Other",PInfo["Other"]);
			editAppSpecific4ACA("Other Update",PInfo["Other"]);
			editAppSpecific4ACA("Other Source Description",PInfo["Other Source Description"]);
			copyASITables4ACA(licCapId,capId,"DEFICIENCIES","DENIAL REASONS","OWNERS","CANNABIS FINANCIAL INTEREST");
		}
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_SA_PREMISES: Load Data: " + err.message + br + err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_SA_PREMISES: Load Date: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
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
