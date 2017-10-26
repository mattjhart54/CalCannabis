/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CAT_UPDATE
| Version 1.0 - Base Version.
|
| Script to run nightly to send license updates to CAT
| Batch job name: CAT Nightly Update
/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var showMessage = true;				// Set to true to see results in popup window
var disableTokens = false;
var showDebug = true;					// Set to true to see debug messages in email confirmation
var maxSeconds = 4 * 60;				// number of seconds allowed for batch processing, usually < 5*60
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = true;	// Use Group name when populating Task Specific Info Values
var currentUserID = "ADMIN";
var publicUser = null;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var GLOBAL_VERSION = 3.0;

var cancel = false;

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var startDate = new Date();
var startTime = startDate.getTime();
var message = "";						// Message String
var debug = "";							// Debug String
var br = "<BR>";						// Break Tag
var emailText = "";
var SCRIPT_VERSION = 2.0;

var useSA = false;
var SA = null;
var SAScript = null;

var catAPIChunkSize = 10;

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
    eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
    eval(getMasterScriptText(SAScript, SA));
}
else {
    eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

function getMasterScriptText(vScriptName) {
    var servProvCode = aa.getServiceProviderCode();
    if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        return emseScript.getScriptText() + "";
    }
    catch (err) {
        return "";
    }
}

function getScriptText(vScriptName) {
    var servProvCode = aa.getServiceProviderCode();
    if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
        return emseScript.getScriptText() + "";
    }
    catch (err) {
        return "";
    }
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//Needed HERE to log parameters below in eventLog
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");

var failureEmail = aa.env.getValue("failureEmail"); // email address to send failures
var failureEmailCC = aa.env.getValue("failureEmailCC"); // email address to cc failures
var baseUrl = aa.env.getValue("baseUrl"); // base url for CAT API
var apiKey = aa.env.getValue("apiKey"); // key for CAT API

var successEmail = aa.env.getValue("successEmail");
var successEmailCC = aa.env.getValue("successEmailCC");

showMessage = true;
showDebug = true;

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//
// Your variables go here
// Ex. var appGroup = getParam("Group");
//
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|-----------------------------------------------------------------------------------------------------+/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
var SET_ID = "CAT_UPDATES";

try {
    var theSet = aa.set.getSetByPK(SET_ID).getOutput();
    var status = theSet.getSetStatus();
    var setId = theSet.getSetID();
    var memberResult = aa.set.getCAPSetMembersByPK(SET_ID);
    if (!memberResult.getSuccess()) {
        logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage());
    } else {
        var members = memberResult.getOutput().toArray();
        var size = members.length;
        if (members.length > 0) {
            var compositeResult = {
                totalCount: size,
                activeCount: 0,
                inactiveCount: 0,
                errorRecordCount: 0,
                errorRecords: [],
                errors: []
            };
            logDebug("capSet: loaded set " + setId + " of status " + status + " with " + size + " records");
            var licenseNos = capIdsToLicenseNos(members);
            var start, end, licenseNosChunk;
            for (start = 0, end = licenseNos.length; start < end; start += catAPIChunkSize) { //chunk calls to the API
                licenseNosChunk = licenseNos.slice(start, start + catAPIChunkSize);
                var putResult = initiateCatPut(licenseNosChunk, String(baseUrl), String(apiKey));
                if (putResult.getSuccess()) {
                    var resultObject = putResult.getOutput();
                    removeFromSet(licenseNosToCapIds(licenseNosChunk), resultObject.errorRecords);
                    compositeResult = {
                        totalCount: compositeResult.totalCount,
                        activeCount: compositeResult.activeCount + resultObject.activeCount,
                        inactiveCount: compositeResult.inactiveCount + resultObject.inactiveCount,
                        errorRecordCount: compositeResult.errorRecordCount + resultObject.errorRecordCount,
                        errorRecords: compositeResult.errorRecords.concat(resultObject.errorRecords),
                        errors: compositeResult.errors.concat(resultObject.errors)
                    };
                } else {
                    message = "ERROR: " + putResult.getErrorType() + " " + putResult.getErrorMessage();
                    aa.env.setValue("returnCode", "-1"); // error
                    aa.env.setValue("returnValue", message);
                }
            }

            if (aa.env.getValue("returnCode") != "-1") {
                message = 'Completed successfully \n' +
                    'Active Records = ' + compositeResult.activeCount + '\n' +
                    'Inactive Records = ' + compositeResult.inactiveCount + '\n';
                if (compositeResult.errorRecords.length > 0) {
                    message += 'WARNING \n' +
                        'Error Record Count = ' + compositeResult.errorRecordCount + '\n' +
                        'Error Record Messages = ' + compositeResult.errors;
                }
                aa.env.setValue("returnCode", "0"); // success
                aa.env.setValue("returnValue", message);
            }

        } else {
            aa.env.setValue("returnCode", "0"); // success
            message = "Completed successfully: No records to process";
            aa.env.setValue("returnValue", message);
        }
    }
    logDebug("CAT update finished: ");
} catch (err) {
    logDebug("ERROR: " + err.message + " In " + batchJobName);
    logDebug("Stack: " + err.stack);
    message = "ERROR: " + err.message + " " + err.stack;
    aa.env.setValue("returnCode", "-1"); // error
    aa.env.setValue("returnValue", message);
}

logDebug(message);
aa.print(debug);

//
// Your script goes here
// Ex. var appGroup = getParam("Group");
//
/*------------------------------------------------------------------------------------------------------/
| <=========== Errors and Reporting
/------------------------------------------------------------------------------------------------------*/
var currentEnvironment = getCurrentEnvironment();

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("returnCode", "-1"); // error
    aa.env.setValue("returnValue", debug);
    aa.sendMail("noreply@accela.com", failureEmail, failureEmailCC, "ERROR - CAT INTERFACE (" + currentEnvironment + ")", debug);
} else if (aa.env.getValue("returnCode") == "-1") {
    aa.sendMail("noreply@accela.com", failureEmail, failureEmailCC, "ERROR - CAT INTERFACE (" + currentEnvironment + ")", message);
} else {
    if (showDebug) {
        aa.env.setValue("ScriptReturnDebug", debug);
    }
    if (successEmail) {
        aa.sendMail("noreply@accela.com", successEmail, successEmailCC, "SUCCESS - CAT INTERFACE (" + currentEnvironment + ")", message);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <=========== Errors and Reporting
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function capIdsToLicenseNos(capIdArray) {
    var licenseNoArray = [];
    for (var i = 0, len = capIdArray.length; i < len; i++) {
        var licenseNo = toLicenseNumber(capIdArray[i]);
        logDebug("Processing " + licenseNo);
        licenseNoArray.push(licenseNo.toString());
    }
    return licenseNoArray;
}

function toLicenseNumber(capId) {
    return String(aa.cap.getCap(capId).getOutput().getCapID().getCustomID());
}

function licenseNosToCapIds(licenseNoArray) {
    var capIdArray = [];
    for (var i = 0, len = licenseNoArray.length; i < len; i++) {
        var capId = toCapId(licenseNoArray[i]);
        capIdArray.push(capId);
    }
    return capIdArray;
}

function toCapId(licenseNo) {
    return aa.cap.getCapID(licenseNo).getOutput();
}

function removeFromSet(capIds, errorLicenseNumbers) {
    for (var i = 0, len = capIds.length; i < len; i++) {
        var licenseNumber = toLicenseNumber(capIds[i]);
        if (contains(errorLicenseNumbers, licenseNumber)) {
            logDebug("error number " + licenseNumber + "/" + capIds[i] + " not removing from set");
        } else {
            var removeResult = aa.set.removeSetHeadersListByCap(SET_ID, capIds[i]);
            if (!removeResult.getSuccess()) {
                logDebug("**WARNING** error removing record from set " + SET_ID + " : " + removeResult.getErrorMessage());
            } else {
                logDebug("capSet: removed record " + capIds[i] + " from set " + SET_ID);
            }
        }
    }
}

function contains(stringArray, string) {
    for (var i = 0, len = stringArray.length; i < len; i++) {
        if (String(stringArray[i]) == String(string)) {
            return true;
        }
    }
    return false;
}
