/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_APPLICANT_OWNER_TABLE.js
| Event   : ACA Page Flow attachments before event
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :  Checks the values of first/last name against reference contacts with corresponding email
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
try{
	//lwacht: 180305: story 5298: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180305: story 5298: end
		var contactList = cap.getContactsGroup();
		if(contactList != null && contactList.size() > 0){
			var arrContacts = contactList.toArray();
			for(var i in arrContacts) {
				var thisCont = arrContacts[i];
				var emailText = "";
				//for(x in thisCont){
				//	if(typeof(thisCont[x])!="function"){
				//		logDebug(x+ ": " + thisCont[x]);
				//		emailText +=(x+ ": " + thisCont[x]) + br;
				//	}
				//}
				var contType = thisCont.contactType;
				showMessage=true;
				if(contType =="Designated Responsible Party") {
					//var refContNrb = thisCont.refContactNumber;
					var drpContact = [];
					var drpFName = ""+thisCont.firstName;
					var drpLName = ""+thisCont.lastName;
					var drpEmail = ""+thisCont.email.toLowerCase();
				}
			}
		}
		loadASITables4ACA_corrected();
		var tblOwner = [];
		var tblCorrection = false;
		if(OWNERS.length<1){
			cancel = true;
			showMessage = true;
			comment("The Designated Responsible Party (" + drpFName + " " + drpLName + ") contact needs to be added to the Owners table.");
		}else{
			var drpInTable = false;
			var totPct = 0;
			for(row in OWNERS){
				//get contact by email
				var correctLastName = false;
				var capitalLastName = false;
				var matchLastName = "";
				var correctFirstName = false;
				tblOwner.push(OWNERS[row]);
				var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
				var ownerEmail = ""+OWNERS[row]["Email Address"];
				ownEmail = ownerEmail.toLowerCase();
				qryPeople.setEmail(ownEmail);
				var ownFName = ""+OWNERS[row]["First Name"];
				var ownLName = ""+OWNERS[row]["Last Name"];
				if(ownEmail==drpEmail && ownLName==drpLName){
					drpInTable = true;
				}
				var ownPct = parseFloat(OWNERS[row]["Percent Ownership"]);
				totPct = totPct + ownPct 
			//get reference contact(s)
				var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
				if (!qryResult.getSuccess()){ 
					logDebug("WARNING: error searching for people : " + qryResult.getErrorMessage());
				}else{
					var peopResult = qryResult.getOutput();
					if (peopResult.length > 0){
						for(p in peopResult){
							var thisPerson = peopResult[p];
							var pplRes = aa.people.getPeople(thisPerson.getContactSeqNumber());
							if(pplRes.getSuccess()){
								var thisPpl = pplRes.getOutput();
								logDebug("first name: " + thisPpl.getResFirstName());
								var thisFName = ""+thisPpl.getResFirstName();
								var thisLName = ""+thisPpl.getResLastName();
								//logDebug("Owner table: " + ownFName + " " + ownLName );
								//logDebug("People table: " + thisFName + " " + thisLName );
								if(ownLName==thisLName){
									correctLastName = true;
									capitalLastName = true;
								}else{
									if(ownLName.toUpperCase()==thisLName.toUpperCase()){
										capitalLastName = true;
									}else{
										matchLastName = thisLName;
									}
								}
								if(ownFName==thisFName){
									correctFirstName = true;
								}
							}else{
								logDebug("WARNING: error retrieving reference contact : " + pplRes.getErrorMessage());
							}
						}
					}else{
						//email doesn't exist, continue without error
						correctLastName = true;
						correctFirstName = true;
						capitalLastName = true;
					}
					//if the capitalization is incorrect, have the user correct
					//if the last name is wrong, don't allow applicant to progress
					if(!correctLastName){
						cancel = true;
						showMessage = true;
						comment("The name '" + ownFName + " " + ownLName + "' does not match the name on file for the email address '" + ownEmail + "'.  Please correct before continuing.");
					}else{
						//if last name is correct, check for capitalization
						if(!capitalLastName){
							cancel = true;
							showMessage = true;
							comment("The capitalization of the last name '" + ownLName + "' does not match the name on file  '" + matchLastName + "'.  Please correct before continuing.");
						}
						//if last name is correct but first name is wrong, just correct the first name and go on.
						if(!correctFirstName){
							tblOwner[row]["First Name"]=thisFName;
							tblCorrection = true;
						}
					}
				}
			}
			if(!drpInTable){
				cancel = true;
				showMessage = true;
				//comment("The Designated Responsible Party (" + drpFName + " " + drpLName + ") contact needs to be added to the Owners table.");
				//lwacht 171105: required text per defect 4615
				comment("Must have at least one owner in the owner table below. At least one owner must be the DRP.");
			}
			if (totPct > 100 || totPct < 0) {
				cancel = true;
				showMessage = true;
				comment("The total Percent Ownership must be greater than 0 and less than 100.")
			}
//MJH 190412 story 5979 - validate that each email address in owner table is unique 
			var tblOwnerEmails = [];
			var emailDuplicate = false;
			for(row in OWNERS){
				tblOwnerEmails.push(OWNERS[row]);
			}
			for(x in tblOwnerEmails) {
				var tblEmail = ""+ tblOwnerEmails[x]["Email Address"];
				tblEmail = tblEmail.toUpperCase();
				for(o in OWNERS) {
					if( x == o) 
						continue;
					var ownEmail = ""+ OWNERS[o]["Email Address"];
					ownEmail = ownEmail.toUpperCase();
					if (tblEmail == ownEmail) {
						emailDuplicate = true;
					}
				}
				if(emailDuplicate) {
					cancel = true;
					showMessage = true;
					comment("Each Owner in the table must have a unique email address.");
					break;
				}
			}
//MJH 190412 story 5979 - end
		}
	}
}catch (err) {
    logDebug("A JavaScript Error occurred: ACA_BEFORE_APPLICANT_OWNER_TABLE: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_BEFORE_APPLICANT_OWNER_TABLE: Main Loop: "+ startDate, publicUserID + br + capId + br + err.message+ br + err.stack);
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