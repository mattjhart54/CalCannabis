/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LOCAL_AUTH_EXPIRE
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to activate workflow and update the application status after the local authority expires and no response received.
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 4.5 * 60;
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
// test parameters
/* 
aa.env.setValue( "lookAheadDays" , "0");
aa.env.setValue( "daySpan" , "0");
aa.env.setValue( "emailAddress" , "lwacht@trustvip.com");
aa.env.setValue( "asiField" , "Local Authority Notification Expires");
aa.env.setValue( "asiGroup" , "INTERNAL");
aa.env.setValue( "newAppStatus" , "Under Administrative Review");
aa.env.setValue( "sysFromEmail" , "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue( "setNonEmailPrefix" , "AppSubmitted");
aa.env.setValue( "emailTemplate" , "LCA_APPLICATION_SUBMITTED");
aa.env.setValue( "sendEmailNotifications" , "Y");
aa.env.setValue("sendEmailToContactTypes" , "Designated Responsible Party");
*/
var emailAddress = getParam("emailAddress");			// email to send report
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var newAppStatus = getParam("newAppStatus");
var asiField = getParam("asiField");
var asiGroup = getParam("asiGroup");
var emailTemplate = getParam("emailTemplate");
var sendEmailNotifications = getParam("sendEmailNotifications");
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");
var addrType = getParam("sendEmailAddressType");
var emailAddress = getParam("emailAddress");
var setNonEmailPrefix = getParam("setNonEmailPrefix");
var sysFromEmail = getParam("sysFromEmail");

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0,0,0,0);
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var fromDate = dateAdd(null,parseInt(lookAheadDays));
var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan));
fromJSDate = new Date(fromDate);
toJSDate = new Date(toDate);
var dFromDate = aa.date.parseDate(fromDate);
var dToDate = aa.date.parseDate(toDate);
logDebug("fromDate: " + fromDate + "  toDate: " + toDate);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);

if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	var capFilterType = 0;
	var capFilterStatus = 0;
	var capCount = 0;
	var setCreated = false;
 	var capResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(asiGroup, asiField, dFromDate, dToDate);
	if (capResult.getSuccess()) {
		myCaps = capResult.getOutput();
	}else { 
		logDebug("Error: Getting records, reason is: " + capResult.getErrorMessage()) ;
		return false;
	}
	logDebug("Found " + myCaps.length + " records to process");
	    //Create a set of records where an email was not sent

	for (myCapsXX in myCaps) {
// MJH Story 5843 - Remove timeout logic
/*		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
			logDebug("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
		}
*/		
    	capId = myCaps[myCapsXX].getCapID();
   		//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		altId = capId.getCustomID();
		if (!capId) {
			logDebug("Could not get Cap ID");
			continue;
		}
		cap = aa.cap.getCap(capId).getOutput();	
		AInfo = new Array();
		loadAppSpecific(AInfo);	
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		logDebug(" cap " + capStatus);
		if (!matches(capStatus, "Pending Local Authorization 10","Pending Local Authorization 60")) {
			capFilterStatus++;
			continue;
		}
		capCount++;
		logDebug("----Processing record " + altId + br);
		
		//lwacht: 180426: story 5436: reset the assigned task
		var asgnDateAR = getAssignedDate("Administrative Review");
		var asgnDateOR = getAssignedDate("Owner Application Reviews");
		deactivateTask("Local Verification Review");
		activateTask("Administrative Review");
		activateTask("Owner Application Reviews");
		editAppSpecific("Local Authority Response", "No Response");
		updateTask("Administrative Review","Under Review","No notification recieved from Local Authority","");
		updateAppStatus("Under Administrative Review", "No notification recieved from Local Authority");
		if(asgnDateAR){
			updateTaskAssignedDate("Administrative Review", asgnDateAR);
		}else{
			logDebug("No assigned date found for Administrative Review");
		}
		if(asgnDateOR){
			updateTaskAssignedDate("Owner Application Reviews", asgnDateOR);
		}else{
			logDebug("No assigned date found for Owner Application Reviews");
		}
		//lwacht: 180426: story 5436: end
//mhart 181019 story 5756 Removed code to generate submitted report for an annual application and to add postal preference records to set.	
		if(appTypeArray[2] == "Temporary") {
			if (sendEmailNotifications == "Y" && sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
				var conTypeArray = sendEmailToContactTypes.split(",");
				var	conArray = getContactArray(capId);
				for (thisCon in conArray) {
					var conEmail = false;
					thisContact = conArray[thisCon];
					if (exists(thisContact["contactType"],conTypeArray)) {
						// Run report letter and attach to record for each contact type
						runReportAttach(capId,"Submitted Application", "Record ID", capId.getCustomID(), "Contact Type", thisContact["contactType"], "Address Type", addrType, "servProvCode", "CALCANNABIS");
						conEmail = thisContact["email"];
						if (conEmail) {
							eParams = aa.util.newHashtable();
							addParameter(eParams,"$$AltID$$",altId);
							addParameter(eParams,"$$ContactFirstName$$",thisContact["firstName"]);
							addParameter(eParams,"$$ContactLastName$$",thisContact["lastName"]);
							var rFiles = [];
							sendNotification(sysFromEmail,conEmail,"",emailTemplate,eParams, rFiles,capId);
							logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact["contactType"] + " : " + conEmail);
						}
					}
				}
			}
		}
//mhart 181019 story 5756 end
	}
 	logDebug("Total CAPS qualified : " + myCaps.length);
 	logDebug("Ignored due to application type: " + capFilterType);
 	logDebug("Ignored due to CAP Status: " + capFilterStatus);
 	logDebug("Total CAPS processed: " + capCount);

}catch (err){
	logDebug("ERROR: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}
}
	
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function getCapIdByIDs(s_id1, s_id2, s_id3)  {
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
    if(s_capResult.getSuccess())
		return s_capResult.getOutput();
    else
       return null;
}
function createExpirationSet( prefix ) {
	// Create Set
	if (prefix != "") {
		var yy = startDate.getFullYear().toString().substr(2,2);
		var mm = (startDate.getMonth() +1 ).toString(); //getMonth() returns (0 - 11)
		if (mm.length<2)
			mm = "0"+mm;
		var dd = startDate.getDate().toString();
		if (dd.length<2)
			dd = "0"+dd;
		var hh = startDate.getHours().toString();
		if (hh.length<2)
			hh = "0"+hh;
		var mi = startDate.getMinutes().toString();
		if (mi.length<2)
			mi = "0"+mi;
	//var setName = prefix.substr(0,5) + yy + mm + dd;
		var setName = prefix + "_" + yy + mm + dd;
		setDescription = prefix + " : " + mm + dd + yy;
		setResult = aa.set.getSetByPK(setName);
		setExist = false;
		setExist = setResult.getSuccess();
		if (!setExist) {
			//var setCreateResult= aa.set.createSet(setName,setDescription);
			//lwacht: 170925: need the set to have a type for the reports
			var setCreateResult= aa.set.createSet(setName,prefix,"License Notifications","Created via batch script " + batchJobName);
			if( setCreateResult.getSuccess()) {
				logDebug("New Set ID "+setName+" created for CAPs processed by this batch job.<br>");
				return setName;
			}
			else
				logDebug("ERROR: Unable to create new Set ID "+setName+" for CAPs processed by this batch job.");
		}
		else {
			logDebug("Set " + setName + " already exists and will be used for this batch run<br>");
			return setName;
		}
	}
}