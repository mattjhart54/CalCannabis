/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_APP_DISQUAL_NOTICE
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
aa.env.setValue("appStatus", "Additional Information Needed");
aa.env.setValue("lookAheadDays", "25");
aa.env.setValue("daySpan", "12");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("asiField", "App Expiry Date");
aa.env.setValue("asiGroup", "INTERNAL");
aa.env.setValue("sendEmailNotifications","Y");
aa.env.setValue("emailTemplate","LCA_GENERAL_NOTIFICATION");
aa.env.setValue("sendEmailToContactTypes", "Designated Responsible Party");
aa.env.setValue("sysFromEmail", "noreply@cannabis.ca.gov");
aa.env.setValue("setNonEmailPrefix", "30_DAY_DISQUAL_NOTICE");
aa.env.setValue("reportName", "30 Day Deficiency Notification Letter");
aa.env.setValue("sendEmailAddressType", "Mailing");
*/
var appStatus = getParam("appStatus");
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var emailAddress = getParam("emailAddress");			// email to send report
var asiField = getParam("asiField");
var asiGroup = getParam("asiGroup");
var eRegDate = getParam("eRegsEffectiveDate");
var sendEmailNotifications = getParam("sendEmailNotifications");
var emailTemplate = getParam("emailTemplate");
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");
var sysFromEmail = getParam("sysFromEmail");
var setNonEmailPrefix = getParam("setNonEmailPrefix");
var rptName = getParam("reportName");
var ownerRptName = getParam("ownerReportName");
var addrType = getParam("sendEmailAddressType");
var skipAppStatus = getParam("skipAppStatus").split(","); //   Skip records with one of these application statuses
var skipAppStatusCont = getParam("skipAppStatusCont").split(","); //   Skip records with one of these application statuses - Used for overflow
var skipAppStatusArray = skipAppStatus.concat(skipAppStatusCont); //used to concatenate skipAppStatus and skipAppStatusCont
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
	var capFilterTaskDate= 0;
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
	for (myCapsXX in myCaps) {
// MJH Story 5843 - Remove timeout logic
/*		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
			logDebug("WARNING: A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
		}
*/
		capId = myCaps[myCapsXX].getCapID();
	//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		if (!capId) {
			logDebug("Could not get Cap ID");
			continue;
		}
		altId = capId.getCustomID();
		cap = aa.cap.getCap(capId).getOutput();	
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		
//	if(altId != "LCA18-0000136") continue;

//MJH 20190219 User Story 5838 - Removed logic to close owner records.  Added logic to send email notifications to Owners.
		if (capStatus != appStatus) {
			capFilterType++;
			logDebug(altId + ": skipping due to application status of " + capStatus)
			continue;
		}
		// Filter by CAP Status
		if (exists(capStatus, skipAppStatusArray)) {
			capFilterStatus++;
			logDebug("     " +"skipping, due to application status of " + capStatus)
			continue;
		}
		
		//getting last task date for "Deficiency Letter Sent Status"
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess()){
			var wfObj = workflowResult.getOutput();
			for (i in wfObj) {
				fTask = wfObj[i];
				wfTask = fTask.getTaskDescription();
				if (fTask.getDisposition().equals("Deficiency Letter Sent")){
					if(wfTask == "Administrative Manager Review"){
						var defDate = getAppSpecific("Admin Deficiency Letter Sent",capId);				
					}else{
						var defDate = getAppSpecific("Science Deficiency Letter Sent",capId);
					}
				}
			}
		}else{ 
			logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
			++capFilterTaskDate;
			continue;
		}
		//filter by eRegs Date
		var eRegJSDate = new Date(eRegDate);
		var defJSDate = new Date(defDate);
		if (defJSDate > eRegJSDate){
			logDebug(altId + " skipping, due to Task Date. Deficiency Sent Date: " + defJSDate + " eRegJSDate: " + eRegJSDate);
			++capFilterTaskDate;
			continue;
		}
			
		capCount++;
		logDebug("----Processing record " + altId + br);
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
			childArray = getChildren("Licenses/Cultivator/Medical/Owner Application");
			for (x in childArray) {
				childCapId = childArray[x];
				childCap = aa.cap.getCap(childCapId).getOutput();	
				var childCapStatus = childCap.getCapStatus();
				if(childCapStatus == appStatus) {
					var	conArray = getContactArray(childCapId);
					for (thisCon in conArray) {
						var conEmail = false;
						thisContact = conArray[thisCon];
						if(thisContact["contactType"] == "Owner"){
							pContact = getContactObj(childCapId,thisContact["contactType"]);
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
								setAddResult=aa.set.add(sNonEmailSet,childCapId);
							}
							conEmail = thisContact["email"];
							if (conEmail) {
								runReportAttach(childCapId,ownerRptName, "altId", childCapId.getCustomID(), "contactType", "Owner", "addressType", "Home"); 
								holdId = capId;
								capId = childCapId;
								emailRptContact("BATCH", emailTemplate, "", false, "Deficiency Letter Sent", childCapId, thisContact["contactType"]);
								capId = holdId;
								logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact["contactType"] + " : " + conEmail);
							}
						}
					}	
				}
			}
		}
//MJH: 20190219 Story 5838 - End
	}
	if(setCreated){
		aa.sendMail(sysFromEmail, emailAddress, "", sNonEmailSet + " Set Created ", "Records in this set will need to be sent the '" + rptName + "'.");
	}
	logDebug("Total CAPS qualified : " + myCaps.length);
	logDebug("Ignored due to application type: " + capFilterType);
	logDebug("Ignored due to CAP Status: " + capFilterStatus);
	logDebug("Ignored due to eRegs Date: " + capFilterTaskDate);
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

function createExpirationSet( prefix ){
// Create Set
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
		if (!setExist) 
		{
			//var setCreateResult= aa.set.createSet(setName,setDescription);
			//var s = new capSet(setName,prefix,"License Notifications", "Notification records processed by Batch Job " + batchJobName + " Job ID " + batchJobID);
			
			var setCreateResult= aa.set.createSet(setName,prefix,"License Notifications","Created via batch script " + batchJobName);
			if( setCreateResult.getSuccess() )
			{
				logDebug("New Set ID "+setName+" created for CAPs processed by this batch job.<br>");
				return setName;
			}
			else
				logDebug("ERROR: Unable to create new Set ID "+setName+" for CAPs processed by this batch job.");
			return false;
		}
		else
		{
			logDebug("Set " + setName + " already exists and will be used for this batch run<br>");
			return setName;
		}
	}
}


