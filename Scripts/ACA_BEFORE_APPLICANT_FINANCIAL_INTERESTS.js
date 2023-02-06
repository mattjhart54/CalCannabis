/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_APPLICANT_FINANCIAL_INTERESTS.js
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

//doStandardChoiceActions(controlString, true, 0);

try {
	//lwacht: 180305: story 5297: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180305: story 5297: end
		var capId = cap.getCapID();
		var AInfo = [];
		loadAppSpecific4ACA(AInfo);
		if(AInfo["Producing Dispensary"] == "CHECKED") {
			var fnd = false;
			loadASITables4ACA_corrected();
			var tblCanFinInt = CANNABISFINANCIALINTEREST;
			for(x in tblCanFinInt) {
				//logDebug("Type of License : " + tblCanFinInt[x]["Type of License"]);
				if(tblCanFinInt[x]["Type of License"] == "Producing Dispensary") {
					fnd = true;
				}
			}
			if (!fnd) {
				showMessage = true;
				cancel = true;
				//comment(" COMMENT When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
				logMessage("When Producing Dispensary is checked then you must list your Producing Dispensary License Number in the Cannabis Financial Interest table.");
			}
		}
		// Check for total acreage from all applicant rec ords.  Total must be less than 4 acres 
		// Check no more than one Medium license allowed unless Producing Disensary is checked.
		//if(publicUserID == "PUBLICUSER130840" || publicUserID == "PUBLICUSER130303") {
			//showMessage=true;
			//logMessage("Start script");
			//cancel = true;
		var totAcre = 0
		var totPlants = 0
		var maxAcres = 0;
		var mediumLic = false;

		var contactList = cap.getContactsGroup();
		logDebug("got contactlist " + contactList.size());
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				//MJH added code to check for Last, First and Business names.  Removed sole proprietorship check
				var contType = thisCont.contactType;
				var contFirst = thisCont.firstName;
				var contLast = thisCont.lastName;
				var contLBN = thisCont.middleName;
				if(contType =="Business") {
					if(matches(contFirst,null,"",undefined) || matches(contLast,null,"",undefined) || matches(contLBN,null,"",undefined)) {
						cancel = true;
						showMessage = true;
						logMessage("The Business must have a First and Last Name and Legal Business Name and the Individual/Organization field must be set to Individual.  Please edit the Business contact to add these fields.");	
					}
					var refContNrb = thisCont.refContactNumber;
					//showMessage = true;
					//logMessage("contact nbr " + refContNrb + " Name " + thisCont.fullName + " Business " + thisCont.middleName);
					var pplMdl = aa.people.createPeopleModel().getOutput();
					pplMdl.setServiceProviderCode("CALCANNABIS");
					//var emMesg = "";
					//emMesg += "refContNrb: " + refContNrb + br;
					var fndContact = false;
					if (!matches(refContNrb,null, "", "undefined")) {
						pplMdl.setContactSeqNumber(refContNrb);
						pplMdl.setAuditStatus("A");
						pplMdl.setEmail(thisCont.email);
						//pplMdl.setFullName(thisCont.fullName);
						fndContact = true;
						//emMesg += "thisCont.fullName: " + thisCont.fullName + br;
					}else{
						var correctLastName = false;
						var correctFirstName = false;
						var capitalLastName = false;
						var qryPeople = pplMdl.getPeopleModel();
						qryPeople.setEmail(thisCont.email);
						pplMdl.setAuditStatus("A");
						var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
						if (qryResult.getSuccess()){ 
							var peopResult = qryResult.getOutput();
							//aa.sendMail(sysFromEmail, debugEmail, "", "INFO INFO:  ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: Main Loop: "+ refContNrb, capId + br + thisCont.email);
							if (peopResult.length > 0){
								for(p in peopResult){
									var thisPerson = peopResult[p];
									var pplRes = aa.people.getPeople(thisPerson.getContactSeqNumber());
									if(pplRes.getSuccess()){
										var thisPpl = pplRes.getOutput();
										//pplMdl.setFullName(thisCont.fullName)
										pplMdl.setContactSeqNumber(thisPerson.getContactSeqNumber());
										pplMdl.setAuditStatus("A")
										fndContact = true;
										var thisFName = ""+thisPpl.getResFirstName();
										var thisLName = ""+thisPpl.getResLastName();
										var bsnsFName = thisCont.firstName;
										var bsnsLName = thisCont.lastName;
										//logDebug("Owner table: " + bsnsFName + " " + bsnsLName );
										//logDebug("People table: " + thisFName + " " + thisLName );
										if(bsnsLName==thisLName){
											correctLastName = true;
											capitalLastName = true;
										}else{
											if(bsnsLName.toUpperCase()==thisLName.toUpperCase()){
												capitalLastName = true;
											}else{
												matchLastName = thisLName;
											}
										}
										if(bsnsFName==thisFName){
											correctFirstName = true;
										}else{
											var matchFirstName = thisFName;
										}
									}
								}
								//if the capitalization is incorrect, have the user correct
								//if the last name is wrong, don't allow applicant to progress
								if(!correctLastName){
									cancel = true;
									showMessage = true;
									comment("The name '" + bsnsFName + " " + bsnsLName + "' does not match the name on file for the email address '" + thisCont.email + "'.  Please correct before continuing.");
								}else{
									//if last name is correct, check for capitalization
									if(!capitalLastName){
										cancel = true;
										showMessage = true;
										comment("The capitalization of the last name '" + bsnsLName + "' does not match the name on file  '" + matchLastName + "'.  Please correct before continuing.");
									}
									//if last name is correct but first name is wrong, cancel and have applicant correct.
									if(!correctFirstName){
										cancel = true;
										showMessage = true;
										comment("The first name '" + bsnsFName + "' does not match the name on file  '" + matchFirstName + "'.  Please correct before continuing.");
									}
								}
							}
						}
					}
					//if(!matches(thisCont.fullName,null, "", "undefined")) {
					//	pplMdl.setFullName(thisCont.fullName);
					//}else {
						//lwacht: 181002: changing to business name
						//pplMdl.setMiddleName (thisCont.middleName);
						//pplMdl.setBusinessName (thisCont.middleName);
					//}
					var capResult = aa.people.getCapIDsByRefContact(pplMdl);  // needs 7.1
					//aa.sendMail(sysFromEmail, debugEmail, "", "INFO INFO:  ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: Main Loop: "+ fndContact, capId + br + capResult.getErrorMessage());
					if (capResult.getSuccess()) {
						var capList = capResult.getOutput();
						for (var j in capList) {
							var thisCapId = capList[j];
							var thatCapId = thisCapId.getCapID();
							var altId =thatCapId.getCustomID();
							thatCap = aa.cap.getCap(thatCapId).getOutput();
							if(!matches(thatCap, null, "undefined", "")){
								thatAppTypeResult = thatCap.getCapType();
								thatAppTypeString = thatAppTypeResult.toString();
								thatAppTypeArray = thatAppTypeString.split("/");
								var capStatus = thatCap.getCapStatus();
								//logMessage("Cap" + thatAppTypeArray[3]);
								if(thatAppTypeArray[2] != "Temporary" && thatAppTypeArray[3] == "Application" && !matches(capStatus,"Withdrawn", "Disqualified")) {
									var capLicType = getAppSpecific("License Type",thatCapId);
									var licLookup = lookup("LIC_CC_LICENSE_TYPE", capLicType);
									if(!matches(licLookup, "", null, undefined)) {
										licTbl = licLookup.split(";");
										//logMessage("Cap" + thatCapId + "Type " + capLicType + " SQ FT " + licTbl[0]);
										maxAcres = licTbl[0];
										totAcre += parseInt(maxAcres);
									}
									//emMesg += "capId: " + thatCapId + "; capId: " + thatCapId.getCustomID() + "; licType: " + capLicType + br;
									if (matches(capLicType, "Medium Outdoor")) {
										mediumLic = true;
									}
								}
							}
						}
						//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: Main Loop: "+ startDate + ": " + currEnv, capId + br + emMesg + 'medium? ' + mediumLic);
					}else{
						logMessage("error finding cap ids: " + capResult.getErrorMessage());
					}
				}
			}
			//logMessage("Acres " + totAcre );
			//logMessage("Medium " + mediumLic);
			//lwacht 171111: removed acreage logic
			//if(totAcre > 43560) {
			//	cancel=true;
			//	showMessage=true;
			//	logMessage("You cannot apply for anymore cultivator licenses as you will or have exceeded the 1 acre size limit.");
			//}
			//lwacht 171112: removed medium logic
			//if(matches(AInfo["License Type"], "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light Tier 1", "Medium Mixed-Light Tier 2") && mediumLic ) {
			//	cancel=true;
			//	showMessage=true;
			//	logMessage("You cannot apply for a Medium type license as you already have a Medium type.");
			//}
		}
	}
}catch (err) {
    logDebug("A JavaScript Error occurred: ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_BEFORE_APPLICANT_FINANCIAL_INTEREST: Main Loop: "+ startDate, capId + br + err.message+ br + err.stack + br + currEnv);
}
//mhart 20180220 user story 4689 validate Date Interest Obtained
try {
	//lwacht: 180305: story 5297: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180305: story 5297: end
		var badDate = false;
		var capId = cap.getCapID();
		var AInfo = [];
		loadAppSpecific4ACA(AInfo);
		loadASITables4ACA_corrected();
		for(x in CANNABISFINANCIALINTEREST){
			nbrDays = getDateDiff(CANNABISFINANCIALINTEREST[x]["Date Interest Obtained"]);
			if(nbrDays < 0) {
				badDate = true;
			}
		}
		if (badDate) {
			cancel = true;
			showMessage = true;
			logMessage("Date Interest Obtained cannot be in the future");
		}
	}
}
catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_APPLICANT_FINANCIAL_INTERESTS: Date Interest Obtained Validation: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_APPLICANT_FINANCIAL_INTERESTS: Date Interest Obtained Validation: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
//mhart 20180220 user story 4689 

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





