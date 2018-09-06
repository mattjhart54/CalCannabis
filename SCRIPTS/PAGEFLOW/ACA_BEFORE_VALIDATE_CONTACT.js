/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_VALIDATE_CONTACT.JS
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
//var parentId = cap.getParentCapID();

// page flow custom code begin

try {
	//lwacht: 180306: story 5306: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180306: story 5306: end
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
						if(contEmail.toUpperCase() == currEmail.toUpperCase() && matches(contType, "Designated Responsible Party", "Business","DRP - Temporary License")){
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
			aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the current user: ACA_ONLOAD_OWNER_APP_UPDATE: " + startDate, "capId: " + capId + br + resCurUser.getErrorMessage() + br + currEnv);
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_VALIDATE_CONTACT: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_VALIDATE_CONTACT: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
try {
	//lwacht: 180306: story 5306: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180306: story 5306: end
		var contactList = cap.getContactsGroup();
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				var contFirst = thisCont.firstName;
				var contLast = thisCont.lastName;
				var contLBN = thisCont.middleName;
				var contType = thisCont.contactType;
				if(contType == "Agent for Service of Process") {
					if(matches(contFirst,null,"",undefined) && matches(contLast,null,"",undefined) && matches(contLBN,null,"",undefined) ||
						(matches(contFirst,null,"",undefined) && !matches(contLast,null,"",undefined)) ||
						(!matches(contFirst,null,"",undefined) && matches(contLast,null,"",undefined))){
							cancel = true;
							showMessage = true;
							logMessage("The Agent for Process of Service must have a First and Last Name or Legal Business Name.  Please edit the Agent for Service of Process contact.");	
					}
				}
				//mhart - added check to validate required fields completed as expressions not always firing
				if(contType == "Business") {
					if(matches(contFirst,null,"",undefined) || matches(contLast,null,"",undefined) || matches(contLBN,null,"",undefined)) {
							cancel = true;
							showMessage = true;
							logMessage("The Business must have a First and Last Name and Legal Business Name and the Individual/Organization field must be set to Individual.  Please edit the Business contact to add these fields.");	
					}
				}
				if(contType == "Designated Responsible Party" || contType == "DRP - Temporary License") {
					if(matches(contFirst,null,"",undefined) || matches(contLast,null,"",undefined)) {
							cancel = true;
							showMessage = true;
							logMessage("The Designated Responsible Party must have a First and Last Name and the Individual/Organization field must be set to Individual.  Please edit the DRP contact to add these fields.");	
					}
				}
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_VALIDATE_CONTACT: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_VALIDATE_CONTACT: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

try{
	//lwacht: ???? : 180904: make the owner table read-only if the application has gone past the review page
	var arrOwnRecds = getChildren("Licenses/Cultivator/*/Owner Application", capId);
	if(!matches(arrOwnRecds,null,"","undefined")){
		if(arrOwnRecds.length>0){
			//loadASITables();
			//removeASITable("OWNERS"); 
			var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos("OWNERS",capId,"ADMIN")
			if (!tssmResult.getSuccess()){
				logDebug("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()) ;
			}else{
				logDebug("Successfully removed all rows from ASI Table: ");
			}
			var tempArray = new Array(); 
			var tblOwner = [];
			for(own in OWNERS){
				var drpContact = []; 
				var fName = ""+OWNERS[own]["First Name"];
				var LName = ""+OWNERS[own]["Last Name"];
				var eMail = ""+OWNERS[own]["Email Address"];
				logDebug("fName: " + fName);
				logDebug("LName: " + LName);
				logDebug("eMail: " + eMail);
				drpContact["First Name"]=new asiTableValObj("First Name", "VOTE FOR PEDRO", "Y");
				drpContact["Last Name"]=new asiTableValObj("Last Name", LName, "Y");
				drpContact["Email Address"]=new asiTableValObj("Email Address", eMail, "Y");
				tblOwner.push(drpContact);
				var asit = cap.getAppSpecificTableGroupModel();
				addASITable4ACAPageFlow(asit, "OWNERS", tblOwner);
				addToASITable("OWNERS",tblOwner);
			}
			//asit = cap.getAppSpecificTableGroupModel();
			//addASITable4ACAPageFlow(asit, "OWNERS",tempArray);
			//addASITable("OWNERS",tempArray);
		}
	}
	//lwacht: ???? : 180904: end
}catch (err) {
    logDebug("A JavaScript Error occurred: ACA_BEFORE_VALIDATE_CONTACT: Lock Owner Table: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_BEFORE_VALIDATE_CONTACT: Lock Owner Table: "+ startDate, capId + "; " + err.message+ "; "+ err.stack + br + currEnv);
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




