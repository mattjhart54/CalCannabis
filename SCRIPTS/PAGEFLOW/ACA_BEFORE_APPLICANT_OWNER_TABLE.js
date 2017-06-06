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
var showDebug = true; // Set to true to see debug messages in popup window
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
	loadASITables4ACA_corrected();
	var tblOwner = [];
	var tblCorrection = false;
	var correctLastName = false;
	var correctFirstName = false;
	for(row in OWNERS){
		//get contact by email
		tblOwner.push(OWNERS[row]);
		var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
		var ownEmail = OWNERS[row]["Email Address"];
		qryPeople.setEmail(ownEmail);
		var ownFName = ""+OWNERS[row]["First Name"];
		var ownLName = ""+OWNERS[row]["Last Name"];
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
						logDebug("Owner table: " + ownFName + " " + ownLName );
						logDebug("People table: " + thisFName + " " + thisLName );
						if(ownLName==thisLName){
							correctLastName = true;
						}
						if(ownFName==thisFName){
							correctFirstName = true;
						}
					}else{
						logDebug("WARNING: error retrieving reference contact : " + pplRes.getErrorMessage());
					}
				}
			}
			//if the last name is wrong, don't allow applicant to progress
			if(!correctLastName){
				cancel = true;
				showMessage = true;
				comment("The name '" + ownFName + " " + ownLName + "' does not match the name on file for the email address '" + ownEmail + "'.  Please correct before continuing.");
			}else{
				//if last name is correct but first name is wrong, just correct the first name and go on.
				if(!correctFirstName){
					tblOwner[row]["First Name"]=thisFName;
					tblCorrection = true;
				}
			}
		}
	}
	//table isn't getting removed, so working around for now by putting code to get the first name in the 
	//script that adds the owner records.
	/*
	if(tblCorrection){
		for(x in tblOwner){
			logDebug(x + ": " + tblOwner[x]);
		}
		removeASITable("OWNERS");
		var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos("OWNERS",capId,"ADMIN");
		if(!tssmResult.getSuccess()){
			aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_BEFORE_APPLICANT_OWNER_TABLE: RemoveASIT: "+ startDate, capId + "; " + tssmResult.getErrorMessage() + "; ");
		}
		asit = cap.getAppSpecificTableGroupModel();
		addASITable4ACAPageFlow(asit, "OWNERS", tblOwner);
	}
	*/
}catch (err) {
    logDebug("A JavaScript Error occurred: ACA_BEFORE_APPLICANT_OWNER_TABLE: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in  ACA_BEFORE_APPLICANT_OWNER_TABLE: Main Loop: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
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


function loadASITables4ACA_corrected() {

 	//
 	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	//
	// Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
	//

	var itemCap = capId;
	if (arguments.length == 1)
		{
		itemCap = arguments[0]; // use cap ID specified in args
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
		}
	else
		{
		var gm = cap.getAppSpecificTableGroupModel()
		}

	var ta = gm.getTablesMap();


	var tai = ta.values().iterator();

	while (tai.hasNext())
	  {
	  var tsm = tai.next();

	  if (tsm.rowIndex.isEmpty()) continue;  // empty table

	  var tempObject = new Array();
	  var tempArray = new Array();
	  var tn = tsm.getTableName();

	  tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');

	  if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
	  var numrows = 1;

	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{

			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		//var tval = tsmfldi.next().getInputValue();
		var tval = tsmfldi.next();
		tempObject[tcol.getColumnName()] = tval;
		}
	  tempArray.push(tempObject);  // end of record
	  var copyStr = "" + tn + " = tempArray";
	  logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	  eval(copyStr);  // move to table name
	  }

	}



