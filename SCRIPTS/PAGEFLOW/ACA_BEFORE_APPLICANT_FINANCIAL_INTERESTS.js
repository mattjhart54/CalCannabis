/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST.js
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

// page flow custom code begin

//doStandardChoiceActions(controlString, true, 0);

try {
	var capId = cap.getCapID();
	var AInfo = [];
	loadAppSpecific4ACA(AInfo);
	if(AInfo["Producing Dispensary"] == "CHECKED") {
		var fnd = false;
		cfi =loadASITable("CANNABIS FINANCIAL INTEREST");
		for(x in cfi) {
	//		logMessage("Type of License : " + cfi[x]["Type of License"]);
			if(cfi[x]["Type of License"] == "Producing Dispensary") {
				fnd = true;
			}
		}
		if (!fnd) {
			showMessage = true;
			cancel = true;
//			comment(" COMMENT When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
			logMessage("When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
		}
	}

// Check for total acreage from all applicant rec ords.  Total must be less than 4 acres 
// Check no more than one Medium license allowed unless Producing Disensary is checked.
	if(publicUserID == "PUBLICUSER130840") {
		showMessage=true;
		logMessage("Start script");
		cancel = true;
		var totAcre = 0;
		var mediumLic = "N";
		var c = new Array();
		//c = aa.people.getCapContactByCapID(capId).getOutput();
//		
		//var contactList = capModel.getContactsGroup();
		var contactList = cap.getContactsGroup();
		logMessage("got contactlist " + contactList.size());
		aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY:   ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: Contact List: "+ startDate, capId + "; " + contactList==null);
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				//for(x in thisCont){
				//	if(typeof(thisCont[x])!="function"){
				//		logMessage(x+ ": " + thisCont[x]);
				//	}
				//}
				var contType = thisCont.contactType;
				showMessage=true;
				logMessage("AContacts " + contType);
				if(contType =="Applicant") {
					var refContNrb = thisCont.refContactNumber;
					logMessage("ref nbr " + refContNrb);
					if (!matches(refContNrb,null, "", "undefined")) {
						var p = contactModel.getPeople();
						var pplMdl = aa.people.createPeopleModel().getOutput();
						pplMdl.setContactSeqNumber(crn);
						pplMdl.setServiceProviderCode(contactModel.getServiceProviderCode());
						if(!matches(thisCont.fullName,null, "", "undefined")) {
							pplMdl.setFullName(thisCont.fullName);
						}else {
							pplMdl.setBusinessName (thisCont.businessName);
						}
						var capResult = aa.people.getCapIDsByRefContact(pplMdl);  // needs 7.1
						if (capResult.getSuccess()) {
							var totAcre=0;
							Message("got recs by contact");
							var capList = capResult.getOutput();
							for (var j in capList) {
								var thisCapId = capList[j];
								var thatCapId = thisCapId.getCapID();
								logDebug("capId " + thatCapId);
								var canopySize = getAppSpecific("Canopy Size",thatCapId);
								logMessage("canopySize " + canopySize);
								if(!matches(canopySize, "", null, undefined)) {
									totAcre += parseFloat(canopySize,2);
								}
								capLicType = getAppSpecific("License Type",thatCapId);
								if (matches(AInfo["License Type"], "Medium Outdoor", "Medium Indoor", "Medium Mixed Light")) {
									mediumLic = "Y";
								}
							}
						}
						else{
							logDebug("error finding cap ids: " + cResult.getErrorMessage());
						}
					}
				}
			}
			logMessage("Acres " + totAcre + "Medium " + mediumLic);
			logMessage("lictype " + AInfo["License Type"]);
			logMessage("prodDisp" + AInfo["Producing Dispensary"]);
			if(totAcre > 174240) {
				cancel=true;
				showMessage=true;
				logMessage("You cannot apply for anymore cultivator licenses as you will or have exceeded the 4 acre canopy size limit");
			}
			if(matches(AInfo["License Type"], "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light") && AInfo["Producing Dispensary"] != "CHECKED" && mediumLic == "Y") {
				cancel=true;
				showMessage=true;
				logDMessage("You cannot apply for a Medium type license as you already have a Medium type license and you do not have a Producing Dispensary License");
			}
		}
	}
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





