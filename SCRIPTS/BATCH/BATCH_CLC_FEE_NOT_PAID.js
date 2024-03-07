/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CLC_FEE_NOT_PAID
| Client:  CLS_CalCannabis
|
| Version 1.0 - Base Version. 
|
|
| The sample email will be used when a CLC request is closed, and fee is not paid within 30 calendar days from date of submittal. 
| It will function similar to the current/existing CLC closed notification, in that once the record is closed notification will be sent to the DRP, 
| a copy of the notification will be saved in the Documents tab and the Communications tab of the CLC Record.
| The current/existing CLC closed notification will continue to be used for all other CLC records closed 30 calendar days from date of submittal 
|
|
| Batch job name: BATCH_CLC_FEE_NOT_PAID
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
var maxSeconds = 10 * 60;
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
if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
} else
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
// test parameters
/* 
//aa.env.setValue("recordGroup", "Licenses");
//aa.env.setValue("recordType", "Cultivator");
//aa.env.setValue("recordSubType", "Amendment");
//aa.env.setValue("recordCategory", "License Change");

aa.env.setValue("lookAheadDays", "0");
aa.env.setValue("daySpan", "0");
aa.env.setValue("appStatus", "License Change Fee Due");
aa.env.setValue("asiField", "Payment Due Date");
aa.env.setValue("asiGroup", "FEES");
aa.env.setValue("emailTemplate","LCA_CLC_FEE_NOT_PAID");
aa.env.setValue("sendEmailNotifications","Y");
aa.env.setValue("sysFromEmail", "noreply@cannabis.ca.gov");
aa.env.setValue("emailAddress", "sumpatel@trustvip.com");
*/

//var appGroup = getParam("recordGroup");
//var appTypeType = getParam("recordType");
//var appSubtype = getParam("recordSubType");
//var appCategory = getParam("recordCategory");

var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var appStatus = getParam("appStatus");
var asiField = getParam("asiField");
var asiGroup = getParam("asiGroup");
var emailTemplate = getParam("emailTemplate");
var sendEmailNotifications = getParam("sendEmailNotifications");
var sysFromEmail = getParam("sysFromEmail");
var emailAddress = getParam("emailAddress");			// email to send report

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
try {	
    var capFilterBalance = 0;
    var capFilterStatus = 0;
    var capCount = 0;
    var capResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(asiGroup, asiField, dFromDate, dToDate);
    if (capResult.getSuccess()) {
        myCaps = capResult.getOutput();
    } else { 
        logDebug("Error: Getting records, reason is: " + capResult.getErrorMessage()) ;
        return false;
    }
    logDebug("Found " + myCaps.length + " records to process");
    
    for (myCapsXX in myCaps) {
        if (elapsed() > maxSeconds) { // only continue if time hasn't expired
            logDebug("WARNING: A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
            timeExpired = true ;
            break; 
        }

        capId = myCaps[myCapsXX].getCapID();
        altId = capId.getCustomID();
        if (!capId) {
            logDebug("Could not get record capId: " + altId);
            continue;
        }
    
        cap = aa.cap.getCap(capId).getOutput();	
        fileDateObj = cap.getFileDate();
        fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
        fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"MM/DD/YYYY");
        appTypeResult = cap.getCapType();	
        appTypeString = appTypeResult.toString();	
        appTypeArray = appTypeString.split("/");
        var capStatus = cap.getCapStatus();
        var capDetailObjResult = aa.cap.getCapDetail(capId);	
        AInfo = [];
        loadAppSpecific(AInfo);	
        var paymentDueDate = AInfo["Payment Due Date"];
        if(appTypeArray[3] == "License Change"  && !matches(paymentDueDate,null,"",undefined)) {
            if (!capDetailObjResult.getSuccess()) {
                logDebug("Could not get record balance: " + altId);
                continue;
            } else {
                //filter by balance due
                capDetail = capDetailObjResult.getOutput();
                var balanceDue = capDetail.getBalance();
                if(balanceDue <= 0) {
                    logDebug("Skipping record " + altId + " balance due is not positive : " + balanceDue);
                    capFilterBalance++;
                    continue;
                }

                //filter by status Status
                logDebug("capStatus " + capStatus + " appStatus " + appStatus)
                if (capStatus != appStatus) {
                    logDebug("Skipping record " + altId + " due to application status mismatch");
                    capFilterStatus++;
                    continue;
                }

                capCount++;
                logDebug("----Processing record " + altId + br);
                updateAppStatus("Not Approved - Fee Not Paid","Updated via BATCH_CLC_FEE_NOT_PAID");
                addStdCondition("License Notice","Not Approved - Fee Not Paid",capId);
                
                var priContact = getContactObj(capId,"Designated Responsible Party");
                if(priContact) {
                    var eParams = aa.util.newHashtable(); 
                    addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
                    addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
                    addParameter(eParams, "$$fileDate$$", fileDateYYYYMMDD);
                    addParameter(eParams, "$$altId$$", altId);
                    addParameter(eParams, "$$dateFeeDue$$", paymentDueDate);
                    var rFiles = [];
                    var priEmail = "" + priContact.capContact.getEmail();
                    sendNotification(sysFromEmail, priEmail, "", emailTemplate, eParams, rFiles,capId)
                }
            }
        }
    }
    logDebug("Total CAPS qualified : " + myCaps.length);
    logDebug("Ignored due to balance due: " + capFilterBalance);
    logDebug("Ignored due to record status: " + capFilterStatus);
    logDebug("Total CAPS processed: " + capCount);

} catch (err) {
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


function getRecordParams4Notification(params) {

	itemCapId = (arguments.length == 2) ? arguments[1] : capId;
	// pass in a hashtable and it will add the additional parameters to the table

	var itemCapIDString = itemCapId.getCustomID();
	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	var itemCapName = itemCap.getSpecialText();
	var itemCapStatus = itemCap.getCapStatus();
	var itemFileDate = itemCap.getFileDate();
	var itemCapTypeAlias = itemCap.getCapType().getAlias();
	var itemHouseCount;
	var itemFeesInvoicedTotal;
	var itemBalanceDue;
	
	var itemCapDetailObjResult = aa.cap.getCapDetail(itemCapId);		
	if (itemCapDetailObjResult.getSuccess())
	{
		itemCapDetail = capDetailObjResult.getOutput();
		itemHouseCount = itemCapDetail.getHouseCount();
		itemFeesInvoicedTotal = itemCapDetail.getTotalFee();
		itemBalanceDue = itemCapDetail.getBalance();
	}
	
	var workDesc = workDescGet(itemCapId);

	addParameter(params, "$$altID$$", itemCapIDString);

	addParameter(params, "$$capName$$", itemCapName);
	
	addParameter(params, "$$recordTypeAlias$$", itemCapTypeAlias);

	addParameter(params, "$$capStatus$$", itemCapStatus);

	addParameter(params, "$$fileDate$$", itemFileDate);

	addParameter(params, "$$balanceDue$$", "$" + parseFloat(itemBalanceDue).toFixed(2));
	
	addParameter(params, "$$workDesc$$", (workDesc) ? workDesc : "");

	return params;

}

