/*------------------------------------------------------------------------------------------------------/
| Program : ACA_APPLICATION_DOC_BEFORE.js
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

	if(publicUserID == "PUBLICUSER130840" || publicUserID == "PUBLICUSER130303") {
		showmessage = true
		logMessage("Start Script");
	if(AInfo["Producing Dispensary"] == "CHECKED") {
		logMessage("PD checked");
		var fnd = false;
		cfi =loadASITable("CANNABIS FINANCIAL INTEREST")
		for(x in cfi) {
//			logDebug("Type of License : " + cfi[x]["Type of License"]);
			if(cfi[x]["Type of License"] == "Producing Dispensary") {
				fnd = true;
			}
		}
		if (!fnd) {
			showMessage = true;
			cancel = true;
//			comment(" COMMENT When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
			logDebug("When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
		}
	}
	}

// Check for total acreage from all applicant rec ords.  Total must be less than 4 acres 
// Check no more than one Medium license allowed unless Producing Disensary is checked.
/*	if(publicUserID == "PUBLICUSER130840" || publicUserID == "PUBLICUSER130303") {
		aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY:   ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: Main Loop: "+ startDate, capId + "; " );
		cancel = true;
		var totAcre = 0;
		var mediumLic = "N";
		var c = new Array();
		//c = aa.people.getCapContactByCapID(capId).getOutput();
		if(contactList != null && contactList.size() > 0){
		//var contactList = capModel.getContactsGroup();
		var contactList = cap.getContactsGroup();
			for(var i=contactList.size(); i > 0; i--){
				var contactModel = contactList.get(i-1);
				var contType = contactModel.getCapContactModel().getContactType();
				showMessage=true;
				logDebug("AContacts " + contType);
				if(contType =="Applicant") {
					var crn = contactModel.getCapContactModel().getRefContactNumber();
					logDebug("ref nbr " + crn);
					if (crn != null && crn != "") {
						var p = contactModel.getPeople();
						var psm = aa.people.createPeopleModel().getOutput();
						psm.setContactSeqNumber(crn);
						psm.setServiceProviderCode(contactModel.getServiceProviderCode());
						var fn=contactModel.getFirstName();
						if(fn !=null && fn !="") {
							var cfn = contactModel.getCapContactModel().getFirstName();
							var cln = contactModel.getCapContactModel().getLastName();
							psm.setFullName(cfn + " " + cln);
						}
						else {
							var cbn = contactModel.getCapContactModel().getBusinessName()
							psm.setBusinessName (cbn);
						}
						var cResult = aa.people.getCapIDsByRefContact(psm);  // needs 7.1
						if (cResult.getSuccess()) {
							logDebug("got recs by contact");
							var cList = cResult.getOutput();
							for (var j in cList) {
								var thisCapId = cList[j];
								var thatCapId = thisCapId.getCapID();
								logDebug("capId " + thatCapId);
								var cs = getAppSpecific("Canopy Size",thatCapId);
								logDebug("cs " + cs);
								if(cs != "" && cs != null && cs != undefined) {
									totAcre = totAcre + parseFloat(cs,2);
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
			showMessage=true;
			logDebug("Acres " + totAcre + "Medium " + mediumLic);
			logDebug("lictype " + AInfo["License Type"]);
			logDebug("prodDisp" + AInfo["Producing Dispensary"]);
			if(totAcre > 174240) {
				cancel=true;
				showMessage=true;
				logDebug("You cannot apply for anymore cultivator licenses as you will or have exceeded the 4 acre canopy size limit");
			}
			if((AInfo["License Type"] == "Medium Outdoor" || AInfo["License Type"] == "Medium Indoor" || AInfo["License Type"] == "Medium Mixed-Light") && AInfo["Producing Dispensary"] != "CHECKED" && mediumLic == "Y") {
				cancel=true;
				showMessage=true;
				logDebug("You cannot apply for a Medium type license as you already have a Medium type license and you do not have a Producing Dispensary License");
			}
		  //  aa.sendMail(sysFromEmail, "mhart@trustvip.com", "", "Info: ACA_Applicant: " + "contacts: " + c + " " + "Type: " + ct);
		}
	}*/
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





