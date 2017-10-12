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

var _debug = true;
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
_debug = true;

batchJobID = 0;
if (batchJobResult.getSuccess())
{
batchJobID = batchJobResult.getOutput();
_logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else
_logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


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

_logDebug("Start of Job");
mainProcess();
_logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
    try {
        var theSet = aa.set.getSetByPK(SET_ID).getOutput();
        var status = theSet.getSetStatus();
        var setId = theSet.getSetID();
        var memberResult = aa.set.getCAPSetMembersByPK(SET_ID);
        if (!memberResult.getSuccess()) {
            _logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage());
        } else {
            var members = memberResult.getOutput().toArray();
            var size = members.length;
            if (members.length > 0) {
                _logDebug("capSet: loaded set " + setId +" of status " + status + " with " + size + " records");
                var putResult = initiateCATPut(capIdsToLicenseNos(members), String(baseUrl), String(apiKey));
                if(putResult.getSuccess()) {
                    _logDebug(JSON.stringify(putResult.getOutput(), null, 4));
                    removeFromSet(members);
                }
            }
        }
        _logDebug("CAT update finished: ");
        return putResult;
    } catch (err) {
        _logDebug("ERROR: " + err.message + " In " + batchJobName);
        _logDebug("Stack: " + err.stack);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

/**
 * Override the logDebug function to work for this script
 */
function _logDebug(dstr){
    if(_debug) {
        aa.print(dstr);
    }
}

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

function capIdsToLicenseNos(capIdArray) {
    var licenseNoArray = [];
    for (var i = 0, len = capIdArray.length; i < len; i++) {
        var capScriptObj = aa.cap.getCap(capIdArray[i]);
        var capIDModel = (capScriptObj.getOutput()).getCapID();
        var licenseNo = capIDModel.getCustomID();
        _logDebug("Processing " + licenseNo);
        licenseNoArray.push(licenseNo.toString());
    }
    return licenseNoArray;
}

function removeFromSet(capIds) {
    for (var i = 0, len = capIds.length; i < len; i++) {
        var removeResult = aa.set.removeSetHeadersListByCap(SET_ID, capIds[i]);
        if (!removeResult.getSuccess()) {
            _logDebug("**WARNING** error removing record from set " + SET_ID + " : " + removeResult.getErrorMessage() );
        } else {
            _logDebug("capSet: removed record " + capIds[i] + " from set " + SET_ID);
        }
    }
}
