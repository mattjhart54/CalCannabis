/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CAT_UPDATE
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to send license updates to CAT
| Batch job name: CAT Nightly Update
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var showDebug = false;	
var showMessage = false;
var emailText = "";
var SET_ID = 'CAT_UPDATES';

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
var SCRIPT_VERSION = '3.0'

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("CAT_PUT"));

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
//aa.env.setValue("emailAddress", "jt@grayquarter.com");
//aa.env.setValue("baseUrl", "http://www.google.com/");
//aa.env.setValue("apiKey", "ABC123");

var emailAddress = aa.env.getValue("emailAddress"); // email address to send failure
var baseUrl = aa.env.getValue("baseUrl"); // base url for CAT API
var apiKey = aa.env.getValue("apiKey"); // key for CAT API

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var startTime = new Date().getTime(); // Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
mainProcess();
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
    try {
        var theSet = aa.set.getSetByPK(SET_ID).getOutput();
        var status = theSet.getSetStatus();
        var setId = theSet.getSetID();
        var memberResult = aa.set.getCAPSetMembersByPK(SET_ID);
        var licenseNoArray = [];
        var capIdArray = [];
        if (!memberResult.getSuccess()) {
            logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage());
        } else {
            var members = memberResult.getOutput().toArray();
            var size = members.length;
            if (members.length > 0) {
                logDebug("capSet: loaded set " + setId +" of status " + status + " with " + size + " records");
                for (var i = 0, len = members.length; i < len; i++) {
                    var capScriptObj = aa.cap.getCap(members[i]);
                    var capIDModel = (capScriptObj.getOutput()).getCapID();
                    var licenseNo = capIDModel.getCustomID();
                    logDebug("Processing " + licenseNo);
                    licenseNoArray.push(licenseNo.toString());
                    capIdArray.push(members[i]);
                }
                var putResult = initiateCATPut(licenseNoArray, String(baseUrl), String(apiKey));
                if(putResult.getSuccess()) {
                    removeFromSet(capIdArray);
                }
            }
        }
        logDebug("CAT update finished: ");
        return putResult;
    } catch (err) {
        logDebug("ERROR: " + err.message + " In " + batchJobName);
        logDebug("Stack: " + err.stack);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

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

function removeFromSet(capIds) {
    for (var i = 0, len = capIds.length; i < len; i++) {
        var removeResult = aa.set.removeSetHeadersListByCap(SET_ID, capIds[i]);
        if (!removeResult.getSuccess()) {
            logDebug("**WARNING** error removing record from set " + SET_ID + " : " + removeResult.getErrorMessage() );
        } else {
            logDebug("capSet: removed record " + capIdArray[i] + " from set " + SET_ID);
        }
    }
}
