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
//lwacht: 180418: story 5411: moving to batch folder, cleaning up
var maxSeconds = 4 * 60;				// number of seconds allowed for batch processing, usually < 5*60
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = true;	// Use Group name when populating Task Specific Info Values
var currentUserID = "ADMIN";
var publicUser = null;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var showDebug = true;	

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var startDate = new Date();
var startTime = startDate.getTime();
var timeExpired = false;
var message = "";						// Message String
var debug = "";							// Debug String
var br = "<BR>";						// Break Tag
var emailText = "";


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

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");

/*test params  
aa.env.setValue("emailAddress", "lwacht@trustvip.com");
aa.env.setValue("baseUrl", "https://testing-services-ca.metrc.com/licenses/facility");
aa.env.setValue("apiKey", "6gka3YS4EzoZAG1jrsv-qhe5OszsP8SPJZ4ZoPOCjCGPK1Ra");
aa.env.setValue("sysFromEmail", "noreply@cannabis.ca.gov");
aa.env.setValue("nbrDays", "45")
*/


var emailAddress = aa.env.getValue("emailAddress"); // email address to send failures
var baseUrl = aa.env.getValue("baseUrl"); // base url for CAT API
var apiKey = aa.env.getValue("apiKey"); // key for CAT API
var nbrDays = aa.env.getValue("nbrDays");
var catAPIChunkSize = aa.env.getValue("chunkSize"); //get Number of records to send to CAT during each iteration
var SET_ID = aa.env.getValue("setId"); //Set that records will be processing from
var sysFromEmail = aa.env.getValue("sysFromEmail");



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
logDebug("Start of Job");

try {
    var theSet = aa.set.getSetByPK(SET_ID).getOutput();
    var status = theSet.getSetStatus();
    var setId = theSet.getSetID();
	var members = [];
	var correctionArray = [];
	var correctionRecordCount = 0;
	var expWithinNbrDays = [];
	var expWithinNbrDaysCount = 0; 
	var invalidRecordArray = [];
	var invalidRecordCount = 0;
	var inactiveWithinNbrDays = [];
	var inactiveWithinNbrDaysCount = 0;
	
	memberResult=aa.set.getSetByPK(SET_ID); 
	if(!memberResult.getSuccess()) { 
		logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage());
    } else {
		memberResult=memberResult.getOutput(); 
		
		var setMembers=aa.set.getCAPSetMembersByPK(memberResult.getSetID()); 
		var array=new Array(); 
		array=setMembers.getOutput();

		for(x=0;x<array.size();x++){
			
			var setMember=array.get(x);
			setMember=setMember.toString();
			var ids=new Array();
			ids=setMember.split("-");
			var license = aa.cap.getCap(ids[0], ids[1], ids[2]);
			license= license.getOutput();
			capId = license.getCapID();
			var altId = capId.getCustomID();
			cap = aa.cap.getCap(capId).getOutput();
			capStatus = cap.getCapStatus();
			AInfo = new Array();
			loadAppSpecific(AInfo);
			
			if(capStatus == "Expired") {
				var vLicenseObj = new licenseObject(altId);
				var licExp = vLicenseObj.b1ExpDate;
				var diff = getDateDiff(licExp);
				if(diff < nbrDays) {
					logDebug(altId + ": Ignored, Expired within last 45 days");
					expWithinNbrDays.push(altId);
					expWithinNbrDaysCount++;
					continue;
				}
			}
			if(capStatus == "Cancelled") {
				var cDate = AInfo["Conversion Date"];
				var diff = getDateDiff(cDate);
				if(diff < 30) {
					logDebug(altId + ": Ignored, Cancelled within last 30 days");
					expWithinNbrDays.push(altId);
					expWithinNbrDaysCount++;
					continue;
				}
			}
			if(capStatus == "Inactive" || capStatus == "Cancelled") {
				var workflowResult = aa.workflow.getTasks(capId);
				var statusDate = "";
				if (workflowResult.getSuccess()){
					var wfObj = workflowResult.getOutput();
					for (i in wfObj) {
						fTask = wfObj[i];
						wfStatus = String(fTask.getDisposition());
						if(wfStatus=="Inactive"){
							statusDate = fTask.getStatusDate();
						}
					}
				}else{ 
					logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
				}
				if (!matches(statusDate,null,undefined,"")){
					var statusDiff = getDateDiff(statusDate);
					if(statusDiff < 30) {
						logDebug(altId + ": Ignored, Inactive Status set within last 30 days");
						inactiveWithinNbrDays.push(altId);
						inactiveWithinNbrDaysCount++;
						continue;
					}
				}
			}
			
			var AInfo = [];
			var validationMessage = "";
			loadAppSpecific(AInfo);
			if (String(altId.substr(0,3)) != "CCL"){
				logDebug("Record " + altId + " is not a valid record number");	
				invalidRecordArray.push(altId);
				invalidRecordCount++;
				continue;
			}else{
				if(AInfo["Legal Business Name"]!=null){
					if(isUnicode(String(AInfo["Legal Business Name"]))){	
						validationMessage += " An illegal character has been found in Legal Business Name of " + altId;
					}
				}
				if(matches(AInfo["Cultivator Type"],null,undefined,"")){
					validationMessage += " Record " + altId + " - License Type is null";
				}else{
					if(!matches(AInfo["Cultivator Type"],"Adult-Use","Medicinal")){
						validationMessage += " Record " + altId + " - Cultivation Type field is invalid";
					}
				}
				if(matches(AInfo["Valid From Date"],null,undefined,"")){
					validationMessage += " Record " + altId + " - Invalid Valid from Date";
				}
				var vLicenseObj = new licenseObject(altId);
				var expDate = vLicenseObj.b1ExpDate;
				if (!expDate){
					validationMessage += " Record " + altId + "- Invalid Expiration Date";
				}
				var contDRP = getContactByType("Designated Responsible Party",capId);
				var contBsns = getContactByType("Business",capId);
				if (matches(contDRP.phone3,null,undefined,"")){
					validationMessage += " Record " + altId + "- Invalid DRP phone number";
				}
				if (matches(contBsns.phone3,null,undefined,"")){
					validationMessage += " Record " + altId + " - Invalid Business phone number";
				}
				if (matches(contDRP.email,null,undefined,"")){
					validationMessage += " Record " + altId + " - The DRP email address is null";
				}
				if(!matches(AInfo["Premise Address"],null,undefined,"")){
					if(isUnicode(String(AInfo["Premise Address"]))){
						validationMessage += " An illegal character has been found in Premise Address of " + altId;
					}
				}
				if(AInfo["Premise County"]==null){
					validationMessage += " Record " + altId + "- The Premises County is null";
				}
				if(matches(contDRP.firstName,null,undefined,"")){
					validationMessage += " Record " + altId + "- The Designated Responsible Party first name is null";
				}
				if(matches(contDRP.lastName,null,undefined,"")){
					validationMessage += " Record " + altId + "- The Designated Responsible Party last name is null";
				}
				if(AInfo["APN"]==null){
					validationMessage += " Record " + altId +  "- The Premise APN is null";
				}
				if(!matches(validationMessage,null,undefined,"")){
					correctionArray.push(altId);
					correctionRecordCount++;
					logDebug("Record " + altId + " was not processed due to validation errors: " + validationMessage);
					continue;
				}else{
					members.push(altId);
				}	
			}	
		
		}
	}		
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
		//logDebug("capSet: loaded set " + setId + " of status " + status + " with " + size + " records");
		logDebug("capSet: loaded set " + setId + " with " + size + " records");
		var start, end, licenseNosChunk;
		for (start = 0, end = members.length; start < end; start += catAPIChunkSize) { //chunk calls to the API
// MJH Story 5843 - Remove timeout logic
/*            	if (elapsed() > maxSeconds) { // only continue if time hasn"t expired
				logDebug("WARNING: A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
				timeExpired = true ;
				break; 
			}
*/				
			licenseNosChunk = members.slice(start, start + catAPIChunkSize);
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
				logDebug( "ERROR: " + putResult.getErrorType() + " " + putResult.getErrorMessage());
			}
		}
	} else {
		logDebug("Completed successfully: No records to process");
	}
	logDebug(correctionRecordCount + " records have invalid information and were not processed.");
	logDebug("records to be corrected: " + correctionArray);
	logDebug(expWithinNbrDaysCount + " records have been skipped, because they have expired within last 45 days.");
	logDebug("records expired within last 45 days: " + expWithinNbrDays);
	logDebug(inactiveWithinNbrDaysCount + " records have been skipped, because they have been set to Inactive within last 30 days.");
	logDebug("records set to Inactive within last 30 days: " + inactiveWithinNbrDays);
	logDebug(invalidRecordCount + " records have invalid Record Numbers.");
	logDebug("records to be corrected: " + invalidRecordArray);
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
	if (emailAddress.length)
		aa.sendMail(sysFromEmail, emailAddress, "",batchJobID + " " + batchJobName + " Results for " + sysDateMMDDYYYY, emailText);

	if (showDebug) {
		aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
	}
} catch (err) {
    logDebug("ERROR: " + err.message + " In " + batchJobName);
    logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/


function licenseNosToCapIds(licenseNoArray) {
    var capIdArray = [];
    for (var i = 0, len = licenseNoArray.length; i < len; i++) {
        var capId = aa.cap.getCapID(licenseNoArray[i]).getOutput();
        capIdArray.push(capId);
    }
    return capIdArray;
}

function removeFromSet(capIds, errorLicenseNumbers) {
    for (var i = 0, len = capIds.length; i < len; i++) {
        var licenseNumber = capIds[i].getCustomID();
        if (exists(licenseNumber,errorLicenseNumbers)) {
            logDebug("error number " + licenseNumber + "/" + capIds[i] + " not removed from set");
        } else {
            var removeResult = aa.set.removeSetHeadersListByCap(SET_ID, capIds[i]);
            if (!removeResult.getSuccess()) {
                logDebug("**WARNING** error removing record from set " + SET_ID + " : " + removeResult.getErrorMessage());
            } else {
                logDebug("capSet: removed record " + capIds[i].getCustomID() + " from set " + SET_ID);
            }
        }
    }
}
