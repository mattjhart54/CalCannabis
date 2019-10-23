/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LICENSE_EXPIRATION
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to send notice of license expiring or to expire the license
| Batch job name: LCA_LICENSE_ABOUT_TO_EXPIRE, LCA_LICENSE_DELINQUENT, LCA_LICENSE_EXPIRED 
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var errLog = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 7 * 60;
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
/* test parameters  
aa.env.setValue("lookAheadDays", "-30");
aa.env.setValue("daySpan", "0");
aa.env.setValue("gracePeriodDays", "0");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "License");
aa.env.setValue("recordCategory", "License");
aa.env.setValue("expirationStatus", "About to Expire,Inactive");
aa.env.setValue("newExpirationStatus", "Expired");
aa.env.setValue("newApplicationStatus", "Expired");
aa.env.setValue("workflowTask", "Renewal Review");
aa.env.setValue("newWorkflowStatus", "Closed");
aa.env.setValue("createNotifySets", "Y");
aa.env.setValue("setNonEmailPrefix", "LICENSE_ABOUT_TO_EXPIRE");
aa.env.setValue("skipAppStatusArray", "Active,Cancelled,Expired,Inactive,Retired,Revoked,Surrendered,Suspended");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sendEmailToContactTypes", "Desiganted Responsible Party");
aa.env.setValue("emailTemplate","LCA_ABOUT_TO_EXPIRE_NOTIFICATION");
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("sendEmailNotifications","N");
aa.env.setValue("reportName", "");
*/

var paramStdChoice = getJobParam("paramStdChoice")  // use this standard choice for parameters instead of batch jobs
var fromDate = getJobParam("fromDate"); // Hardcoded dates.   Use for testing only
var toDate = getJobParam("toDate"); // ""
var lookAheadDays = getJobParam("lookAheadDays");
var daySpan = getJobParam("daySpan");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appSubtype = getJobParam("recordSubType");
var appCategory = getJobParam("recordCategory");
var expStatus = getJobParam("expirationStatus"); //   test for this expiration status
var newExpStatus = getJobParam("newExpirationStatus"); //   update to this expiration status
var newAppStatus = getJobParam("newApplicationStatus"); //   update the CAP to this status
var updWfTask = getJobParam("workflowTask"); //   update this workflow task
var newWfStatus = getJobParam("newWorkflowStatus"); //   update the workflow task to this status
var setPrefix = getJobParam("setNonEmailPrefix");
var gracePeriodDays = getJobParam("gracePeriodDays"); //	bump up expiration date by this many days
var skipAppStatusArray = getJobParam("skipAppStatus").split(","); //   Skip records with one of these application statuses
var emailAddress = getJobParam("emailAddress"); // email to send report
var sendEmailToContactTypes = getJobParam("sendEmailToContactTypes"); // ALL,PRIMARY, or comma separated values
var emailTemplate = getJobParam("emailTemplate"); // email Template
var createNotifySets = getJobParam("createNotifySets").substring(0, 1).toUpperCase().equals("Y") ; // different sets based on notification preferences
var sendEmailNotifications = getJobParam("sendEmailNotifications");
var sysFromEmail = getJobParam("sysFromEmail");
var rptName = getJobParam("reportName");

if(appTypeType=="*") appTypeType="";
if(appSubtype=="*")  appSubtype="";
if(appCategory=="*") appCategory="";
var sArray = getJobParam("expirationStatus").split(",");
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();

if (!fromDate.length) { // no "from" date, assume today + number of days to look ahead
	fromDate = dateAdd(null, parseInt(lookAheadDays))
}
if (!toDate.length) { // no "to" date, assume today + number of look ahead days + span
	toDate = dateAdd(null, parseInt(lookAheadDays) + parseInt(daySpan))
}
var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING", "RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

logDebug("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate)

var startTime = startDate.getTime(); // Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

appGroup = appGroup == "" ? "*" : appGroup;
appTypeType = appTypeType == "" ? "*" : appTypeType;
appSubtype = appSubtype == "" ? "*" : appSubtype;
appCategory = appCategory == "" ? "*" : appCategory;
var appType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;



/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

try {
	mainProcess();
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
	if (emailAddress.length) {
		aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);
		if(errLog != "") {
			aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Errors", errLog);
		}
	}
} catch (err) {
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	var myExp = new Array();
	var capPermApp = 0;
	var capFilterType = 0;
	var capFilterInactive = 0;
	var capFilterError = 0;
	var capFilterStatus = 0;
	var capDeactivated = 0;
	var capCount = 0;
	var setName;
	var setDescription;
	var setCreated = false;
	var yy = startDate.getFullYear().toString().substr(2, 2);
	var mm = (startDate.getMonth() + 1).toString();
	if (mm.length < 2)
		mm = "0" + mm;
	var dd = startDate.getDate().toString();
	if (dd.length < 2)
		dd = "0" + dd;
	var hh = startDate.getHours().toString();
	if (hh.length < 2)
		hh = "0" + hh;
	var mi = startDate.getMinutes().toString();
	if (mi.length < 2)
		mi = "0" + mi;
	setPrefix+= ":" + yy + mm + dd + hh + mi;
	
	for (i in sArray) {
		var expResult = aa.expiration.getLicensesByDate(sArray[i], fromDate, toDate);
		if (expResult.getSuccess()) {
			tempcapList = expResult.getOutput();
			logDebug("Type count: " + tempcapList.length);
			if (tempcapList.length > 0) {
				myExp = myExp.concat(tempcapList);
			}
		}else{
			logDebug("Error retrieving records: " + expResult.getErrorMessage());
		}
	}
	if (myExp.length > 0) {
		logDebug("Found " + myExp.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
		
	for (thisExp in myExp) // for each b1expiration (effectively, each license app)	
	{
		b1Exp = myExp[thisExp];
		var expDate = b1Exp.getExpDate();
		if (expDate) {
			var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
		}
		var b1Status = b1Exp.getExpStatus();
		var renewalCapId = null;
		capId = aa.cap.getCapID(b1Exp.getCapID().getID1(), b1Exp.getCapID().getID2(), b1Exp.getCapID().getID3()).getOutput();
		if (!capId) {
			logDebug("Could not get a Cap ID for " + b1Exp.getCapID().getID1() + "-" + b1Exp.getCapID().getID2() + "-" + b1Exp.getCapID().getID3());
			continue;
		}
		altId = capId.getCustomID();
		logDebug("==========: " + altId + " :==========");
		logDebug("     " +"Renewal Status : " + b1Status + ", Expires on " + b1ExpDate);
		var capResult = aa.cap.getCap(capId);
		if (!capResult.getSuccess()) {
			logDebug("     " +"skipping, Record is deactivated");
			capDeactivated++;
			continue;
		} else {
			var cap = capResult.getOutput();
		}
		 fileDateObj = cap.getFileDate();
		 fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		 fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		var capStatus = cap.getCapStatus();
		appTypeResult = cap.getCapType(); //create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		// Filter by CAP Type
		if (appType.length && !appMatch(appType)) {
			capFilterType++;
			logDebug("     " +"skipping, Application Type does not match")
			continue;
		}
		// Filter by CAP Status
		if (exists(capStatus, skipAppStatusArray)) {
			capFilterStatus++;
			logDebug("     " +"skipping, due to application status of " + capStatus)
			continue;
		}
		// done filtering, so increase the record count to include this record.
		capCount++;
	// Actions start here:
	// update expiration status
		if (newExpStatus.length > 0) {
			b1Exp.setExpStatus(newExpStatus);
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
			logDebug("Update expiration status: " + newExpStatus);
		}
		if(newExpStatus == "Expired") {
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(capId);
			if (renewalCapProject != null) {
				renewalCapProject.setStatus("Complete");
				renewalCapProject.setRelationShip("R");  // move to related records
				aa.cap.updateProject(renewalCapProject);
			}
		}
	// update CAP status
		if (newAppStatus.length > 0) {
            updateAppStatus(newAppStatus, "");
		}
		if(matches(newAppStatus, "Revoked", "Suspended", "Inactive","Expired","Surrendered","Cancelled")){
			addToCat(capId);
			logDebug("Record added to CAT set");
		}
	// workflow task status
		if (newWfStatus.length > 0 && updWfTask.length > 0) {		
			cIds = getChildren("Licenses/Cultivator/License/Renewal",capId);
			if(cIds.length > 0) {
				rId = cIds.length-1;
				holdId = capId;
				capId = cIds[rId];
				closeTask(updWfTask,newWfStatus,"Closed by License Expiration Batch Process", "");
				updateAppStatus(newAppStatus, "");
				capId = holdId;
			}
		}	
	// Send Notification
		if (sendEmailNotifications == "Y" && sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
			var conTypeArray = sendEmailToContactTypes.split(",");
			var	conArray = getContactArray(capId);
			var contactFound = false;
			for (thisCon in conArray) {
				var conEmail = false;
				thisContact = conArray[thisCon];
				if (exists(thisContact["contactType"],conTypeArray)){
					contactFound = true;
					pContact = getContactObj(capId,thisContact["contactType"]);
					var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ pContact.capContact.getPreferredChannel());
					if((matches(priChannel,null,"",undefined) || priChannel.indexOf("Postal") >-1) && setNonEmailPrefix != ""){
						if(setCreated == false) {
						   //Create NonEmail Set
							var vNonEmailSet =  createExpirationSet(setNonEmailPrefix);
							if(vNonEmailSet){
								var sNonEmailSet = vNonEmailSet.toUpperCase();
								var setHeaderSetType = aa.set.getSetByPK(sNonEmailSet).getOutput();
								setHeaderSetType.setRecordSetType("License Notifications");
								setHeaderSetType.setSetStatus("New");
								updResult = aa.set.updateSetHeader(setHeaderSetType);          
								setCreated = true;
							}else{
								logDebug("Could not create set.  Stopping processing.");
								break;
							}
						}
						setAddResult=aa.set.add(sNonEmailSet,capId);
					}
					conEmail = thisContact["email"];
					if (conEmail) {
						runReportAttach(capId,rptName, "altId", capId.getCustomID(), "contactType", thisContact["contactType"], "addressType", addrType); 
						emailRptContact("BATCH", emailTemplate, "", false, "Deficiency Letter Sent", capId, thisContact["contactType"]);
						logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact["contactType"] + " : " + conEmail);
					}
				}
			}
			if(!contactFound){
				logDebug("No contact found for notification: " + altId);
			}
		}

	}
	logDebug("========================================");
	logDebug("Total CAPS qualified date range: " + myExp.length);
	logDebug("Ignored due to application type: " + capFilterType);
	logDebug("Ignored due to CAP Status: " + capFilterStatus);
	logDebug("Ignored due to Deactivated CAP: " + capDeactivated);
	logDebug("Total CAPS processed: " + capCount);
}catch (err){
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}


function getJobParam(pParamName){ //gets parameter value and logs message showing param value
try{
	var ret;
	if (aa.env.getValue("paramStdChoice") != "") {
		var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"),pParamName);
		if (b.getSuccess()) {
			ret = b.getOutput().getDescription();
			}	

		ret = ret ? "" + ret : "";   // convert to String
		
		logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
		}
	else {
			ret = "" + aa.env.getValue(pParamName);
			logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
		}
	return ret;
}catch (err){
	logDebug("ERROR: getJobParam: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}

function createExpirationSet( prefix ){
// Create Set
try{
	if (prefix != ""){
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
			//var s = new capSet(setName,prefix,"License Notifications", "Notification records processed by Batch Job " + batchJobName + " Job ID " + batchJobID);
			var setCreateResult= aa.set.createSet(setName,prefix,"License Notifications","Created via batch script " + batchJobName);
			if( setCreateResult.getSuccess() ){
				logDebug("New Set ID "+setName+" created for CAPs processed by this batch job.<br>");
				return setName;
			}else{
				logDebug("ERROR: Unable to create new Set ID "+setName+" for CAPs processed by this batch job.");
				return false;
			}
		}else{
			logDebug("Set " + setName + " already exists and will be used for this batch run<br>");
			return setName;
		}
	}
}catch (err){
	logDebug("ERROR: createExpirationSet: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}