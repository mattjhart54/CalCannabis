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
var useCustomScriptFile = true;  			// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
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
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
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
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false ;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();					// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();				// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");				// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	// Calculated valuation
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
	}

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail
if (capDetailObjResult.getSuccess())
	{
	capDetail = capDetailObjResult.getOutput();
	var houseCount = capDetail.getHouseCount();
	var feesInvoicedTotal = capDetail.getTotalFee();
	var balanceDue = capDetail.getBalance();
	}

var AInfo = new Array();						// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
//loadASITables();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);


// page flow custom code begin

//doStandardChoiceActions(controlString, true, 0);

try {

	showMessage = true;
	logMessage("Start Script" + publicUser);
	if(AInfo["Producing Dispensary"] == "CHECKED") {
		logMessage("PD Checked");
		var fnd = false;
		logMessage("found " + fnd);
		cfi =loadASITable("CANNABIS FINANCIAL INTEREST")
		logMessage("tables loaded");
		for(x in cfi) {
			logMessage("Type of License : " + cfi[x]["Type of License"]);
			if(cfi[x]["Type of License"] == "Producing Dispensary") {
				fnd = true;
			}
		}
		logMessage("found after " + fnd);
		if (!fnd) {
			showMessage = true;
			cancel = true;
//			comment(" COMMENT When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
			logMessage("When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
		}
	}

// Check for total acreage from all applicant records.  Total must be less than 4 acres 
// Check no more than one Medium license allowed unless Producing Disensary is checked.
	
	var totAcre = 0;
	var mediumLic = "N";

	var c = new Array();

    c = aa.people.getCapContactByCapID(capId).getOutput();
	showMessage=true;
	logMessage("AContacts " + c.length);
		for (var i in c){
			var con = c[i];
			var ct = con.getCapContactModel().getContactType();
			showMessage=true;
			logMessage("AContacts " + ct);
			if(ct =="Applicant") {
			var crn = con.getCapContactModel().getRefContactNumber();
			logMessage("ref nbr " + crn);
				if (crn != null && crn != "") {
					var p = con.getPeople();
					var psm = aa.people.createPeopleModel().getOutput();
					psm.setContactSeqNumber(crn);
					psm.setServiceProviderCode(con.getServiceProviderCode());
					var fn=con.getFirstName();
					if(fn !=null && fn !="") {
						var cfn = con.getCapContactModel().getFirstName();
						var cln = con.getCapContactModel().getLastName();
						psm.setFullName(cfn + " " + cln);
					}
					else {
						var cbn = con.getCapContactModel().getBusinessName()
						psm.setBusinessName (cbn);
					}

					var cResult = aa.people.getCapIDsByRefContact(psm);  // needs 7.1
					if (cResult.getSuccess()) {
						logMessage("got recs by contact");
						var cList = cResult.getOutput();
						for (var j in cList) {
							var thisCapId = cList[j];
							var thatCapId = thisCapId.getCapID();
							logMessage("capId " + thatCapId);
							var cs = getAppSpecific("Canopy Size",thatCapId);
							if(cs != "" && cs != null && cs != undefined) {
								totAcre = totAcre + parseFloat(cs,2);
							}

							capLicType = getAppSpecific("License Type",thatCapId);
							if (matches(capLicType, "Medium Outdoor", "Medium Indoor", "Medium Mixed Light")) {
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
//	showMessage=true;
	logMessage("Acres " + totAcre + "Medium " + mediumLic);
	licType = getAppSpecific("License Type");
	prodDisp = getAppSpecific("Producing Dispensary");
	if(totAcre > 174240) {
		cancel=true;
		showMessage=true;
		logMessage("You cannot apply for anymore cultivator licenses as you will or have exceeded the 4 acre canopy size limit");
	}
	if((licType == "Medium Outdoor" || licType == "Medium Indoor" || licType == "Medium Mixed-Light") && prodDisp != "CHECKED" && mediumLic == "Y") {
		cancel=true;
		showMessage=true;
		logMessage("You cannot apply for a Medium type license as you already have a Medium type license and you do not have a Producing Dispensary License");
	}
  //  aa.sendMail(sysFromEmail, "mhart@trustvip.com", "", "Info: ACA_Applicant: " + "contacts: " + c + " " + "Type: " + ct);

}
catch (err) {
    logDebug("A JavaScript Error occurred: Licenses/Cultivation/*/Application/: " + err.message);
	logDebug(err.stack);
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





