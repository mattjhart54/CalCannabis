/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CONV_ABANDONED
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to send abandoned notification on conversion resords not paid within 30 days
| Batch job name: LCA_Conv_Abandoned_Notif
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
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "Conversion Request");
aa.env.setValue("recordCategory", "NA");
aa.env.setValue("appStatus", "License Fee Due");
aa.env.setValue("asiField", "License Fee Due");
aa.env.setValue("asiGroup", "License Type");
aa.env.setValue("newAppStatus", "Abandoned");
aa.env.setValue("emailTemplate","LIC_CC_CCR_ABANDONED");
aa.env.setValue("sysFromEmail", "noreply@cannabis.ca.gov");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
*/
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var appGroup = getParam("recordGroup");
var appTypeType = getParam("recordType");
var appSubtype = getParam("recordSubType");
var appCategory = getParam("recordCategory");
var appStatus = getParam("appStatus");
var asiField = getParam("asiField");
var asiGroup = getParam("asiGroup");
var newAppStatus = getParam("newAppStatus");
var emailTemplate = getParam("emailTemplate");
var sysFromEmail = getParam("sysFromEmail");
var emailAddress = getParam("emailAddress");			// email to send report

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
	var capFilterStatus = 0;
	var capCount = 0;
	var rptParam = "";
	setCreated = false

 	var capResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(asiGroup, asiField, dFromDate, dToDate);
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
		if (!capId) {
			logDebug("Could not get record capId: " + altId);
			continue;
		}
		cap = aa.cap.getCap(capId).getOutput();	
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		AInfo = new Array();
		loadAppSpecific(AInfo);
		var capDetailObjResult = aa.cap.getCapDetail(capId);		
		if (!capDetailObjResult.getSuccess()){
			logDebug("Could not get record detail: " + altId);
			continue;
		}else{
			capDetail = capDetailObjResult.getOutput();
			var balanceDue = capDetail.getBalance();
			if(balanceDue<=0){
				logDebug("Skipping record " + altId + " due to balance due: " + balanceDue);
				capFilterBalance++;
				continue;
			}
			//filter by status Status
			logDebug("capStatus " + capStatus + " appStatus " + appStatus)
			if (capStatus != appStatus){
				logDebug("Skipping record " + altId + " due to record status ");
				capFilterStatus++;
				continue;
			}
			capCount++;
			logDebug("----Processing record " + altId);
			updateAppStatus(newAppStatus,"Abandoned - No payment within 30 days");
			if(!appHasCondition("Application Condition","Applied","Application Hold",null)){
				addStdCondition("Application Condition","Application Hold");
			}
			var priContact = getContactObj(capId,"Designated Responsible Party");
			if(priContact){
				rFiles = [];
				priEmail = priContact.capContact.email;
				var eParams = aa.util.newHashtable(); 
				var acaSite = getACABaseUrl();   
				addParameter(eParams, "$$acaURL$$", acaSite);
				
				addParameter(eParams, "$$altID$$", capId.getCustomID());
				addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
				addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
				addParameter(eParams, "$$apprDate$$", AInfo["License Fee Due"]);
				sendApprovalNotification(sysFromEmail,priEmail,"",emailTemplate,eParams,rFiles,capId);
			}else{
				logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
			}
		}
	}

 	logDebug("Total CAPS Abandoned : " + myCaps.length);
 	logDebug("Ignored due to balance due: " + capFilterBalance);
 	logDebug("Ignored due to record status: " + capFilterStatus);
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

function sendApprovalNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile) {
	itemCap = arguments[6]; 
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}
