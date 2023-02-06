/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_APP_CONTACT.JS
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null,true));
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
	//lwacht: 180306: story 5312: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180306: story 5312: end
		var appName = cap.getSpecialText();
		if(!matches(appName,null,"","undefined")){
			if(appName.indexOf("(")>1){
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
					if(!matches(ownerEmail,"",null,"undefined")){
						if(ownerEmail.toUpperCase() != currEmail.toUpperCase()){
							//lwacht 171121: hiding the page if it's not the right person
							//lwacht 171122: that didn't work out so great. 
							showMessage = true;
							logMessage("Warning: Only " + ownerName + " can edit and submit this application.");
							//aa.acaPageFlow.hideCapPage4ACA(capId, 1, 1);
							//aa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
							//aa.acaPageFlow.hideCapPage4ACA(capId, 1, 2);
							//aa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
							//aa.acaPageFlow.hideCapPage4ACA(capId, 2, 1);
							//aa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
							//aa.acaPageFlow.hideCapPage4ACA(capId, 3, 1);
							//aa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
							//lwacht 171121: end
							//lwacht 171122: end
						}
					}
				}else{
					logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
					aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the current user: ACA_ONLOAD_OWNER_APP_CONTACT: " + startDate, "capId: " + capId + br + resCurUser.getErrorMessage());
				}
			}else{
				logDebug("Error on app name: "+ appName);
			}
		}else{
			logDebug("No application name for this record: " + capId);
		}
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_APP_CONTACT: Correct Contact: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_OWNER_APP_CONTACT: Correct Contact: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack);
}


try{
	//lwacht: 180306: story 5312: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180306: story 5312: end
		var emailText = "";
		var contactList = cap.getContactsGroup();
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				var contType = thisCont.contactType;
	/*			showMessage=true;
				if(contType =="Owner") {
					var pplRes = aa.people.getPeople(thisCont.refContactNumber);
					if(pplRes.getSuccess()){
						var thisPpl = pplRes.getOutput();
						var ssn = thisPpl.MaskedSsn;
						if (matches(ssn,null, "", "undefined")) {
							showMessage = true;
							logMessage("'Social Security Number' needs to be populated on the contact form before continuing.  Click 'Edit' to update.");
						}
						var bDate = thisPpl.birthDate;
						if (matches(bDate,null, "", "undefined")) {
							showMessage = true;
							logMessage("'Birth Date' needs to be populated on the contact form before continuing.  Click 'Edit' to update.");
						}
					}
				}
	*/
			}
		}
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_APP_CONTACT: Complete Contact: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_OWNER_APP_CONTACT: Complete Contact" + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack);
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



