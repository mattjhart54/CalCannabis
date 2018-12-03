/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_DECLAR_DRP_CONTACT.JS
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

try{
	var capId = cap.getCapID();
	var contactList = cap.getContactsGroup(); 
	if(contactList != null && contactList.size() > 0){ 
		var arrContacts = contactList.toArray(); 
		for(var i in arrContacts) { 
			var thisCont = arrContacts[i]; 
			var pChannel = thisCont.preferredChannel;
			if (matches(pChannel,null, "", "undefined",0)) { 
				cancel = true; 
				showMessage = true; 
				logMessage("You must select your Preferred Method of Contact before continuing.  Click 'Edit' to update."); 
			}
		}
	}
} catch (err) {
	logDebug("An error has occurred in ACA_BEFORE_DECLAR_DRP_CONTACT: Require Preferred Method of Contact  : " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_DECLAR_DRP_CONTACT: Require Preferred Method of Contact   " + startDate, "capId: " + capId + br + br + err.message + br + err.stack);
}

try {
	var resCurUser = aa.people.getPublicUserByUserName(publicUserID);
	if(resCurUser.getSuccess()){
		var contactFnd = false
		var drpFnd = false;
		var appFnd = false;
		var currUser = resCurUser.getOutput();
		var currEmail = currUser.email;
		var AInfo = [];
		loadAppSpecific4ACA(AInfo);
		var applicationId = AInfo["Application ID"];
		var appId = aa.cap.getCapID(applicationId);
		var contactList = cap.getContactsGroup(appId);
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				var contEmail = thisCont.email;
				var contType = thisCont.contactType;
				if(contType == "Designated Responsible Party") {
					if(contEmail.toUpperCase() != currEmail.toUpperCase()){
						cancel = true;
						showMessage = true;
						logMessage("  Error: Only the Designated Responsible party can update this application.");
					}	
				}
			}
		}else {
			logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
			aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the contacts: ACA_BEFORE_DECLARATION_DRP: Validate Contact: " + startDate, "appId: " + appId + br + resCurUser.getErrorMessage() + br + currEnv);
		}
	}else {
			logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
			aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the public user: ACA_BEFORE_DECLARATION_DRP: Validate Contact: " + startDate, "capId: " + capId + br + resCurUser.getErrorMessage() + br + currEnv);
	}
}
catch (err){
	logDebug("A JavaScript Error occurred:ACA_BEFORE_DECLARATION_DRP: Validate Contact: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_DECLARATION_DRP: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

try {
	//lwacht: 180306: story 5301: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
		//lwacht: 180306: story 5301: end
		//if(publicUserID == "PUBLICUSER130840" || publicUserID == "PUBLICUSER130303") {
			//showMessage=true;
			//logMessage("Start script");
			//cancel = true;
		var capId = cap.getCapID();
		var tblRow = [];
		var ownPctTbl = [];	
		var totOwn = 0;
		var pctOwn =0;
		var br = "<BR>";
		var msg = "The Ownership percentage must not be greater than 100%.  Please correct before continuing " + br;
		var parentId = getParent();
		if(parentId){
			children = getChildren("Licenses/Cultivator/Medical/Owner Application", parentId)
			var totOwn = 0
			for (c in children) {
				childId = children[c];
				var pctOwn = getAppSpecific("Percent Ownership", childId);
				contacts = getContactArray(childId);
				for (x in contacts) {
					//logMessage("Contact " + contacts[x]["contactType"] + "Owner: " + contacts[x]["firstName"] + " " + contacts[x]["lastName"] + " / Ownership " + pctOwn + " / Business Name: " + contacts[x]["middleName"]);
					msg = msg + "Owner: " + contacts[x]["firstName"] + " " + contacts[x]["lastName"] + " / Ownership " + pctOwn  + "%  / Business Name: " + contacts[x]["middleName"] + br;
					if(contacts[x]["contactType"] == "Owner" || contacts[x]["contactType"] == "Individual") {
						ownerFnd = false;
						for(o in ownPctTbl) {
							check = ownPctTbl[o];
							//logMessage("check owner - " + check["firstName"] + " " + check["lastName"] + " " + check["legalBusName"] + " " + check["pctOwn"])
							if(!matches(contacts[x]["middleName"],null,"",undefined) && contacts[x]["middleName"] == check["legalBusName"])
									ownerFnd = true;
						}

						if(ownerFnd == false) {
							//logMessage("Add Owner: " + contacts[x]["firstName"] + " " + contacts[x]["lastName"] + " / Ownership " + pctOwn + " / Business Name: " + contacts[x]["middleName"] );
							var tblRow = [];
							tblRow["firstName"] = contacts[x]["firstName"];
							tblRow["lastName"] = contacts[x]["lastName"];
							tblRow["legalBusName"] = contacts[x]["middleName"];
							tblRow["pctOwn"] = pctOwn; 
							totOwn += parseFloat(pctOwn,2);
							ownPctTbl.push(tblRow);
						}
					}
				}
			}
			
		}
		if(totOwn > 100) {
			showMessage = true;
			cancel = true;
			logMessage("Total Ownership entered on Owner Applications is " + totOwn +"%.  "+ msg);
		}
	//}	
	}
}catch (err) {
	showDebug = true;
    logDebug("A JavaScript Error occurred: ACA_BEFORE_DECLAR_DRP_CONTACT: Owner Percentage: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_BEFORE_DECLAR_DRP_CONTACT: Owner Percentage: "+ startDate, capId + "; " + err.message+ "; "+ err.stack+ br + currEnv);

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
				//lwacht: 180621: story 5572:  don't allow submission if any contacts are missing from owner as well
				var arrOwner =  getChildren("Licenses/Cultivator/*/Owner Application", parCapId);
				var incompleteOwnerRecord = false;
				var incompleteRecdId = "";
				var incompleteOwnerInfo = "";
				for(o in arrOwner){
					if(!getContactObj(arrOwner[o],"Owner")){
						missingContact = true;
					}
					//lwacht: 180810: 5687: verify owner record has been completed
					if(getCapIdStatusClass(arrOwner[o])!="INCOMPLETE EST"){
						incompleteOwnerRecord= true;
						incompleteRecdId = arrOwner[o].getCustomID();
						incompleteOwnerInfo = getShortNotes(arrOwner[o]);
					}
				}
				//lwacht: 180621: story 5572:  end
				if(missingContact){
					showMessage=true;
					cancel = true;
					comment("A system issue may have occurred. For assistance with your application, please contact CalCannabis Cultivation Licensing Customer Support at 1-833-CAL-GROW or 1-833-225-4769, press option 1, and then option 2.");
				}
				if(incompleteOwnerRecord){
					showMessage=true;
					cancel = true;
					comment("The following owner record must be completed before the Final Affidavit can be completed: " + incompleteRecdId + ": " + incompleteOwnerInfo);
				}
				//lwacht: 180621: story 5572: end
			}
		}
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_BEFORE_DECLAR_DRP_CONTACT: Missing contact check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_DECLAR_DRP_CONTACT: Missing contact check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
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



