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
	var capId = cap.getCapID();
	var AInfo = [];
	loadAppSpecific4ACA(AInfo);
	if(AInfo["Producing Dispensary"] == "CHECKED") {
		var fnd = false;
		loadASITables4ACA_corrected();
		var tblCanFinInt = CANNABISFINANCIALINTEREST;
		for(x in tblCanFinInt) {
	//		logDebug("Type of License : " + tblCanFinInt[x]["Type of License"]);
			if(tblCanFinInt[x]["Type of License"] == "Producing Dispensary") {
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

	var aa = expression.getScriptRoot();
	eval(getScriptText("INCLUDES_EXPRESSION"));
	//eval(getScriptText("INCLUDES_CUSTOM"));

	function getScriptText(vScriptName){
		vScriptName = vScriptName.toUpperCase();
		var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
		var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
		return emseScript.getScriptText() + "";	
	}

	servProvCode = expression.getValue("$$servProvCode$$").value;
	var canopy=expression.getValue("ASI::LICENSE TYPE::Canopy Size");
	var licType=expression.getValue("ASI::LICENSE TYPE::License Type");

	var perID1 = expression.getValue("$$capID1$$");
	var perID2 = expression.getValue("$$capID2$$");
	var perID3 = expression.getValue("$$capID3$$");
	capId = aa.cap.getCapID(perID1.value, perID2.value, perID3.value).getOutput();
	var totAcre = 0;
	var mediumLic = "N";
	var maxAcres = 0;
	var licLookup = lookup("LIC_CC_LICENSE_TYPE", licType );
	if(!matches(licLookup, "", null, undefined)) {
		var licTbl = licLookup.split(";");
		maxAcres = licTbl[0];
		totAcre += parseInt(maxAcres);
	}
	var c = aa.people.getCapContactByCapID(capId).getOutput();

		for (var i in c){
			var con = c[i];

			var ct = con.getCapContactModel().getContactType();
			if(ct =="Business") {
				var crn = con.getCapContactModel().getRefContactNumber();
				if (crn != null && crn != "") {
					var p = con.getPeople();
					var psm = aa.people.createPeopleModel().getOutput();
					psm.setContactSeqNumber(con.getCapContactModel().getRefContactNumber());
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
						var cList = cResult.getOutput();
						for (var j in cList) {
							var thisCapId = cList[j];
							var thatCapId = thisCapId.getCapID();
							thatCap = aa.cap.getCap(thatCapId ).getOutput();
							thatAppTypeResult = thatCap .getCapType();
							thatAppTypeString = thatAppTypeResult.toString();
							thatAppTypeArray = thatAppTypeString.split("/");
							if(thatAppTypeArray[2] != "Temporary" && thatAppTypeArray[3] == "Application") {
								var cs = getAppSpecific("Canopy Size",thatCapId);
								var capLicType = getAppSpecific("License Type",thatCapId);
								var licLookup = lookup("LIC_CC_LICENSE_TYPE", capLicType );
								if(!matches(licLookup, "", null, undefined)) {
									var licTbl = licLookup.split(";");
									maxAcres = licTbl[0];
									totAcre += parseInt(maxAcres);
		canopy.message = "Acres " + maxAcres + " Medium " + mediumLic + "appType " + thatAppTypeArray[2] + " " + thatAppTypeArray[3]
		expression.setReturn(canopy);
								}
								if (matches(capLicType, "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light Tier 1", "Medium Mixed-Light Tier 2")) {
									mediumLic = true;
								} 
							}
						}
					}
					else{
						logDebug("error finding cap ids: " + cResult.getErrorMessage());
					}
				}
			}
		}

	//canopy.message = "Acres " + totAcre + "Medium " + mediumLic;
//		expression.setReturn(canopy);

	if((totAcre) > 43560) {
		licType.message="You cannot apply for anymore cultivator licenses as you will or have exceeded the 1 acre size limit";
		expression.setReturn(licType);
	}
	if(matches(licType, "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light Tier 1", "Medium Mixed-Light Tier 2") && mediumLic == true) {
		licType.message="You cannot apply for a medium license as you already have a medium licens";
		expression.setReturn(licType);
	}

	function matches(eVal, argList) {
	    for (var i = 1; i < arguments.length; i++) {
	        if (arguments[i] == eVal) {
	            return true;
	        }
	    }
	    return false;
	}

	var useAppSpecificGroupName = false; 	
	function getAppSpecific(itemName) { // optional: itemCap
	    var updated = false;
	    var i = 0;
	    var itemCap = capId;
	    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	    if (useAppSpecificGroupName) {
	        if (itemName.indexOf(".") < 0)
	        { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false }

	        var itemGroup = itemName.substr(0, itemName.indexOf("."));
	        var itemName = itemName.substr(itemName.indexOf(".") + 1);
	    }

	    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	    if (appSpecInfoResult.getSuccess()) {
	        var appspecObj = appSpecInfoResult.getOutput();

	        if (itemName != "") {
	            for (i in appspecObj)
	                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup)) {
	                return appspecObj[i].getChecklistComment();
	                break;
	            }
	        } // item name blank
	    }
	    else
	    { logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
	}

	function loadAppSpecific(thisArr) {
		// 
		// Returns an associative array of App Specific Info
		// Optional second parameter, cap ID to load from
		//
		
		var itemCap = capId;
		if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	    	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
		if (appSpecInfoResult.getSuccess())
		 	{
			var fAppSpecInfoObj = appSpecInfoResult.getOutput();

			for (loopk in fAppSpecInfoObj)
				{
				if (useAppSpecificGroupName)
					thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
				else
					thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
				}
			}
		}

	function lookup(stdChoice,stdValue) {
		var strControl = "";
		var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
		
	   	if (bizDomScriptResult.getSuccess())
	   		{
			var bizDomScriptObj = bizDomScriptResult.getOutput();
			strControl = "" + bizDomScriptObj.getDescription();
	 		}
		return strControl;
	}
	_________________________________________________________
	// Check for total acreage from all applicant rec ords.  Total must be less than 4 acres 
	// Check no more than one Medium license allowed unless Producing Disensary is checked.
		if(publicUserID == "PUBLICUSER130840" || publicUserID == "PUBLICUSER130303") {
			showMessage=true;
			logMessage("Start script");
			cancel = true;
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
					var contType = thisCont.contactType;
					if(contType =="Business") {
						//check for legal business name if not a Sole Proprietor
						if(AInfo["Business Entity Structure"] != "Sole Proprietorship" && matches(thisCont.middleName,"",null,undefined)) {
							showMessage = true;
							cancel = true;
							logMessage("Warning: Legal Business Name must be entered if the Business Entity Structure is not Sole Proprietor.  Click the edit button to enter your Legal Business Name");
						}
						var refContNrb = thisCont.refContactNumber;
					//	showMessage = true;
					//	logMessage("contact nbr " + refContNrb + " Name " + thisCont.fullName + " Business " + thisCont.businessName);
						if (!matches(refContNrb,null, "", "undefined")) {
							var pplMdl = aa.people.createPeopleModel().getOutput();
							pplMdl.setContactSeqNumber(refContNrb);
							pplMdl.setServiceProviderCode("CALCANNABIS");
							if(!matches(thisCont.fullName,null, "", "undefined")) {
								pplMdl.setFullName(thisCont.fullName);
							}else {
								pplMdl.setBusinessName (thisCont.businessName);
							}
							var capResult = aa.people.getCapIDsByRefContact(pplMdl);  // needs 7.1
							if (capResult.getSuccess()) {
								logDebug("got recs by contact");
								var capList = capResult.getOutput();
								for (var j in capList) {
									var thisCapId = capList[j];
									var thatCapId = thisCapId.getCapID();
									logDebug("capId " + thatCapId);
									var capLicType = getAppSpecific("License Type",thatCapId);
									var licLookup = lookup("LIC_CC_MAX_ACRES", capLicType);
									if(!matches(licLookup, "", null, undefined)) {
										licTbl = licLookup.split("|");
										maxAcres = licTbl[0];
										totAcres += parseInt(maxAcres);
									}
									if (matches(capLicType.substring(0,6), "Medium")) {
										mediumLic = true;
									}
		/*							
									var canopySize = getAppSpecific("Canopy Size",thatCapId);								
									var nbrPlants = getAppSpecific("Number of Plants",thatCapId);
									if(!matches(canopySize, "", null, undefined)) {
										totAcre += parseFloat(canopySize,2);
									}
									if(!matches(nbrPlants, "", null, undefined)) {
										totPlants += parseInt(nbrPlants);
									}								
									capLicType = getAppSpecific("License Type",thatCapId);
									if (matches(capLicType, "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light")) {
										mediumLic = true;
									}
		*/
								}
							}else{
								logDebug("error finding cap ids: " + capResult.getErrorMessage());
							}
						}
					}
				}
				logMessage("Acres " + totAcre );
				logMessage("Medium " + mediumLic);
				logMessage("Number of Plants " + totPlants);			
				logMessage("lictype " + AInfo["License Type"]);
//				logMessage("prodDisp " + AInfo["Producing Dispensary"]);
				if(totAcre > 43560) {
					cancel=true;
					showMessage=true;
					logMessage("You cannot apply for anymore cultivator licenses as you will or have exceeded the 4 acre canopy size limit");
				}
				if(matches(AInfo["License Type"], "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light Tier 1", "Medium Mixed-Light Tier 2") && mediumLic ) {
					cancel=true;
					showMessage=true;
					logMessage("You cannot apply for a Medium type license as you already have a Medium type");
				}
//				if(totPlants > 25000) {
//					cancel=true;
//					showMessage=true;
//					logMessage("You cannot apply for anymore cultivator licenses as you will or have exceeded the 25000 number of mature plants limit");
//				}
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





