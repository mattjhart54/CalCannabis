	/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_APP_PREMISES.JS
| Event   : ACA Page Flow onload attachments component
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

//var parentId = cap.getParentCapID();

// page flow custom code begin

try {
	//lwacht: 180305: story 5296: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180305: story 5296: end
		var AInfo = [];
		loadAppSpecific4ACA(AInfo);
		var resCurUser = aa.people.getPublicUserByUserName(publicUserID);

		if(resCurUser.getSuccess()){
			var contactFnd = false
			var drpFnd = false;
			var prepFnd = false;
			var appFnd = false;
			var currUser = resCurUser.getOutput();
			var currEmail = currUser.email;
			//lwacht: 170810: need person logged in to be able to access the application in the future
			if(matches(AInfo["publicUserEmail"],"",null)){
				editAppSpecific4ACA("publicUserEmail",currEmail);
				prepFnd = true;
			}else{
				if(AInfo["publicUserEmail"]==currEmail){
					prepFnd = true;
				}
			}
			var contactList = cap.getContactsGroup();
			if(contactList != null && contactList.size() > 0){
				var arrContacts = contactList.toArray();
				for(var i in arrContacts) {
					var thisCont = arrContacts[i];
					var contEmail = thisCont.email;
					var contType = thisCont.contactType;
					if(contType == "Designated Responsible Party")
						drpFnd = true;
					if(contType == "Business")
						appFnd = true;
					if(!matches(contEmail,"",null,"undefined")){
						if(contEmail.toUpperCase() == currEmail.toUpperCase() && matches(contType, "Designated Responsible Party", "Business")){
							contactFnd = true;
						}
					}
				}
			}
			//lwacht: changed logic to check for DRP *or* Business
			if(!prepFnd){
				if(contactFnd == false && (drpFnd == true || appFnd == true)) {
					cancel = true;
					showMessage = true;
					logMessage("  Warning: Only the Business or the Designated Responsible party can update this application.");
				}	
			}
		}
		else{
			logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
			aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the current user: ACA_BEFORE_APP_PREMISES: " + startDate, "capId: " + capId + br + resCurUser.getErrorMessage() + br + currEnv);
		}
//		showDebug=3;
		loadASITables4ACA_corrected();
		var monHrs = false;
		var tueHrs = false;
		var wedHrs = false;
		var thuHrs = false;
		var friHrs = false;
		if(HOURSOFOPERATION.length<1){
			cancel = true;
			showMessage = true;
			comment("You must enter at least one row in the Hours of Operations table");
		} 
		else {
			for(row in HOURSOFOPERATION){
				if(matches(HOURSOFOPERATION[row]["Day"],"Monday","Tuesday","Wednesday","Thursday","Friday")) {
					var sTime = "" + HOURSOFOPERATION[row]["Start"];
					var sHH = sTime.substring(0,2)
					if(sHH < "08" || sHH > "15") {
						continue;
					}
					sHH = sHH * 60;
					var sMM = sTime.substring(3,5);
					sTime = parseInt(sHH) + parseInt(sMM);
					var eTime = "" + HOURSOFOPERATION[row]["End"];
					var eHH = eTime.substring(0,2) * 60;
					var eMM = eTime.substring(3,5);
					eTime = parseInt(eHH) + parseInt(eMM);
					var tDiff = eTime - sTime;
					logDebug("Time Difference " + tDiff);
					if(tDiff >= 120) {
						if(HOURSOFOPERATION[row]["Day"] == "Monday"){
							monHrs = true;
						}
						if(HOURSOFOPERATION[row]["Day"] == "Tuesday"){
							tueHrs = true;
						}
						if(HOURSOFOPERATION[row]["Day"] == "Wednesday"){
							wedHrs = true;
						}
						if(HOURSOFOPERATION[row]["Day"] == "Thursday"){
							thuHrs = true;
						}
						if(HOURSOFOPERATION[row]["Day"] == "Friday"){
							friHrs = true;
						}
					}
				}
			}
			logDebug("mon " + monHrs + " tue " + tueHrs + " wed " + wedHrs + " thu " + thuHrs + " fri " + friHrs);
			if(!monHrs || !tueHrs || !wedHrs || !thuHrs || !friHrs) {
				cancel = true;
				showMessage = true;
				comment("There must be two contiguous hours of operation between 8AM and 5PM on each work week day (Monday thru Friday)");
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_APP_PREMISES: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_APP_PREMISES: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
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