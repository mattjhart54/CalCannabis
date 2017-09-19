/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_APP_PEND_PMT_NOTICE
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to send thirty day notification on applications requiring more information
| Batch job name: LCA_App_Disqual_Notif
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
/* test parameters
aa.env.setValue("lookAheadDays", "-3");
aa.env.setValue("daySpan", "5");
aa.env.setValue("", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "*");
aa.env.setValue("recordCategory", "Application");
aa.env.setValue("AppStatusArray", "Pending Payment");
aa.env.setValue("sendEmailNotifications","Y");
aa.env.setValue("emailTemplate","LCA_GENERAL_NOTIFICATION");
aa.env.setValue("sendEmailToContactTypes", "Designated Responsible Party");
aa.env.setValue("sysFromEmail", "noreply_accela@cdfa.ca.gov");
aa.env.setValue("emailAddress", "lwacht@trustvip.com");
aa.env.setValue("reportName", "60 Day Payment Notification Letter");
 */
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var appGroup = getParam("recordGroup");
var appTypeType = getParam("recordType");
var appSubtype = getParam("recordSubType");
var appCategory = getParam("recordCategory");
var arrAppStatus = getParam("AppStatusArray").split(",");
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");
var emailTemplate = getParam("emailTemplate");
var sendEmailNotifications = getParam("sendEmailNotifications");
var sysFromEmail = getParam("sysFromEmail");
var emailAddress = getParam("emailAddress");			// email to send report
var rptName = getParam("reportName");

if(appTypeType=="*") appTypeType="";
if(appSubtype=="*")  appSubtype="";
if(appCategory=="*") appCategory="";

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
	var capFilterBalance = 0;
	var capFilterDateRange = 0;
	var capCount = 0;
	setCreated = false
	var taskItemScriptModel = aa.workflow.getTaskItemScriptModel().getOutput();
	// taskItemScriptModel.setActiveFlag("N");
	// taskItemScriptModel.setCompleteFlag("N");
	taskItemScriptModel.setTaskDescription("Appeal");
	// taskItemScriptModel.setDisposition("noStatus");
	// taskItemScriptModel.setDisposition("noStatus");
	 //Setup the cap type criteria
	 var capTypeScriptModel = aa.workflow.getCapTypeScriptModel().getOutput();
	 capTypeScriptModel.setGroup(appGroup);
	 capTypeScriptModel.setType(appTypeType);
	 capTypeScriptModel.setSubType(appSubtype);
	 capTypeScriptModel.setCategory(appCategory); 
	 //Set the date range for the task due date criteria
	 //var startDueDate = aa.date.parseDate(dateAdd(null,-2));
	 //var endDueDate = aa.date.getCurrentDate();
	 //for testing purposes only
	 //var startDueDate = aa.date.parseDate(fromDate);
	 //var endDueDate = aa.date.parseDate(toDate);
	 var appStatusList = [];
	 appStatusList = arrAppStatus;
	 //var capResult = aa.workflow.getCapIdsByCriteria(taskItemScriptModel, startDueDate, endDueDate, capTypeScriptModel, appStatusList);
	 var capResult = aa.workflow.getCapIdsByCriteria(taskItemScriptModel, null, null, capTypeScriptModel, appStatusList);
	if (capResult.getSuccess()) {
		myCaps = capResult.getOutput();
	}else { 
		logDebug("Error: Getting records, reason is: " + capResult.getErrorMessage()) ;
		return false;
	}
	logDebug("Found " + myCaps.length + " records to process");
	for (myCapsXX in myCaps) {
    	capId = myCaps[myCapsXX].getCapID();
   		//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		altId = capId.getCustomID();
		logDebug("altId: " + altId);
	}
		
	for (myCapsXX in myCaps) {
		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
			logDebug("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
		}
    	capId = myCaps[myCapsXX].getCapID();
   		//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		altId = capId.getCustomID();
		if (!capId) {
			logDebug("Could not get record capId: " + altId);
			continue;
		}
		cap = aa.cap.getCap(capId).getOutput();		
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		var capDetailObjResult = aa.cap.getCapDetail(capId);		
		if (!capDetailObjResult.getSuccess()){
			logDebug("Could not get record balance: " + altId);
			continue;
		}else{
			capDetail = capDetailObjResult.getOutput();
			var houseCount = capDetail.getHouseCount();
			var feesInvoicedTotal = capDetail.getTotalFee();
			var balanceDue = capDetail.getBalance();
			if(balanceDue<=0){
				logDebug("Skipping record " + altId + " due to balance due: " + balanceDue);
				capFilterBalance++;
				continue;
			}
			//filter by status date
			statusResult = aa.cap.getStatusHistoryByCap(capId, "APPLICATION", null);
			if (statusResult.getSuccess()) {
				statusArr = statusResult.getOutput();
				if (statusArr && statusArr.length > 0) {
					statusArr.sort(compareStatusDate);
					for (xx in statusArr) {
						var thisStatus = statusArr[xx];
						var thisStatusStatus = "" + thisStatus.getStatus();
						if (thisStatusStatus == arrAppStatus){
							statusDate = thisStatus.getStatusDate();
							var cStatusDate = convertDate(statusDate);
							if(cStatusDate.getTime()<fromJSDate.getTime() || cStatusDate.getTime()>toJSDate.getTime()){
								logDebug("Skipping record " + altId + " due to date range: " + cStatusDate);
								capFilterDateRange++;
								continue;
							}
						}
					}
				}
			}
			else {
				logDebug("Error getting application status history " + statusResult.getErrorMessage());
			}
			capCount++;
			logDebug("----Processing record " + altId + br);
			if (sendEmailNotifications == "Y" && sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
				var conTypeArray = sendEmailToContactTypes.split(",");
				var	conArray = getContactArray(capId);
				for (thisCon in conArray) {
					var conEmail = false;
					thisContact = conArray[thisCon];
					if (exists(thisContact["contactType"],conTypeArray)){
						pContact = getContactObj(capId,thisContact["contactType"]);
						var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ pContact.capContact.getPreferredChannel());
						if(!matches(priChannel,null,"",undefined) && priChannel.indexOf("Postal") >-1 && setNonEmailPrefix != ""){
							if(setCreated == false) {
							   //Create NonEmail Set
								var vNonEmailSet =  createExpirationSet(setNonEmailPrefix);
								var sNonEmailSet = vNonEmailSet.toUpperCase();
								setCreated = true;
							}
							setAddResult=aa.set.add(sNonEmailSet,capId);
						}else{
							conEmail = thisContact["email"];
							if (conEmail) {
								//emailParameters = aa.util.newHashtable();
								//addParameter(emailParameters,"$$recordId$$",altId);
								//addParameter(emailParameters,"$$recordAlias$$",cap.getCapType().getAlias());
								//var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());
								//var fileNames = [];
								//aa.document.sendEmailAndSaveAsDocument(sysFromEmail,conEmail,"" , emailTemplate, emailParameters, capId4Email, fileNames);
								runReportAttach(capId,rptName, "p1value", capId.getCustomID()); 
								emailRptContact("BATCH", emailTemplate, rptName, false, "Deficiency Letter Sent", capId, thisContact["contactType"]);
								logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact["contactType"] + " : " + conEmail);
							}
						}
					}
				}
			}
		}
	}
	if(setCreated){
		aa.sendMail(sysFromEmail, emailAddress, "", sNonEmailSet + " Set Created ", "Records in this set will need to be sent the '" + rptName + "'.");
	}
 	logDebug("Total CAPS qualified : " + myCaps.length);
 	logDebug("Ignored due to balance due: " + capFilterBalance);
 	logDebug("Ignored due to date range: " + capFilterDateRange);
 	logDebug("Total CAPS processed: " + capCount);

}catch (err){
	logDebug("ERROR: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}
	
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

function compareStatusDate(a,b) {
	return (a.getStatusDate().getEpochMilliseconds() > b.getStatusDate().getEpochMilliseconds()); 
}
