/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_DECLAR_DRP_CONTACT.JS
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS","CALTREES",true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", "CALTREES",true));
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

try{
	//lwacht: 180306: story 5311: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180306: story 5311: end
		var appName = cap.getSpecialText();
		if(!matches(appName,null,"","undefined")){
			var parenLoc = appName.indexOf("(");
			var ownerName = appName.substring(0,parseInt(parenLoc));
			var appNameLen = 0
			appNameLen = appName.length();
			var ownerEmail = appName.substring(parseInt(parenLoc)+1, appNameLen-1);
			//var resCurUser = aa.person.getUser(publicUserID);
			var resCurUser = aa.people.getPublicUserByUserName(publicUserID);
			if(resCurUser.getSuccess()){
				var currUser = resCurUser.getOutput();
				var currEmail = currUser.email;
				if(ownerEmail.toUpperCase() != currEmail.toUpperCase()){
					showMessage = true;
					logMessage("Warning: Only " + ownerName + " can submit this application.");
				}
			}else{
				logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
				aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the current user: ACA_ONLOAD_DECLAR_DRP_CONTACT: " + startDate, resCurUser.getErrorMessage());
			}
		}else{
			logDebug("No application name for this record: " + capId);
		}
	}
} catch (err) {
	logDebug("An error has occurred in ACA_ONLOAD_DECLAR_DRP_CONTACT: Correct Contact: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_DECLAR_DRP_CONTACT: Correct Contact: " + startDate, "capId: " + capId + ": " + err);
}


try{
	//lwacht: 180306: story 5311: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180306: story 5311: end
		var emailText = "";
		var contactList = cap.getContactsGroup();
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				//for(x in thisCont){
				//	if(typeof(thisCont[x])!="function"){
				//		emailText+= (x+ ": " + thisCont[x] +br);
				//		logMessage(x+ ": " + thisCont[x]);
				//	}
				//}
				var contType = thisCont.contactType;
				showMessage=true;
				if(contType =="Designated Responsible Party") {
					var county = ""+thisCont.addressLine3;
					if (matches(county,null, "", "undefined")) {
						showMessage = true;
						logMessage("Contact and BOE Seller Permit Number need to be populated on the contact form before continuing.  Click 'Edit' to update.");
					}
				}
			}
		}
	}
} catch (err) {
	logDebug("An error has occurred in ACA_ONLOAD_DECLAR_DRP_CONTACT: Complete Contact: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_DECLAR_DRP_CONTACT: Complete Contact" + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}

//lwacht: 180529: story 5511:  don't allow submission if any contacts are missing
try{
	if(publicUser){
		if(appTypeArray[2]!="Temporary"){
			var parCapId = getParent();
			if(parCapId){
				var missingContact = false;
				if(!getContactObj(parCapId,"Business")){
					missingContact=true;
				}
				if(!getContactObj(parCapId,"Agent for Service of Process")){
					missingContact=true;
				}
				if(!getContactObj(parCapId,"Designated Responsible Party")){
					missingContact=true;
				}
				if(missingContact){
					comment("A system issue may have occurred. For assistance with your application, please contact CalCannabis Cultivation Licensing Customer Support at 1-833-CAL-GROW or 1-833-225-4769, press option 1, and then option 2.");
				}
			}
		}
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_DECLAR_DRP_CONTACT: Missing contact check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_DECLAR_DRP_CONTACT: Missing contact check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}
//lwacht: 180529: story 5511:   end

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



