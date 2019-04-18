/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_APP_DISQUALIFY_RECORDS
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to disqualify applications where requested additional information was not supplied
| within the required 90 day period. 
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
aa.env.setValue("newAppStatus", "Disqualified");
aa.env.setValue("appStatus", "Additional Information Needed");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sendEmailNotifications","Y");
aa.env.setValue("emailTemplate","LCA_GENERAL_NOTIFICATION");
aa.env.setValue("sendEmailToContactTypes", "Designated Responsible Party");
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("setNonEmailPrefix", "FINAL_DISQUALIF");
aa.env.setValue("reportName", "Final Deficiency Disqualification Letter");
aa.env.setValue("sendEmailAddressType", "Mailing");
*/
var emailAddress = getParam("emailAddress");
var appStatus = getParam("appStatus");
var newAppStatus = getParam("newAppStatus");
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");
var emailTemplate = getParam("emailTemplate");
var sendEmailNotifications = getParam("sendEmailNotifications");
var sysFromEmail = getParam("sysFromEmail");
var setNonEmailPrefix = getParam("setNonEmailPrefix");
var rptName = getParam("reportName");
var addrType = getParam("sendEmailAddressType");

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
	projectbiz = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.ProjectBusiness").getOutput();
	acaDocBiz = aa.proxyInvoker.newInstance("com.accela.aa.ads.ads.EDMS4ACABusiness").getOutput();
	
	var capFilterDate = 0;
	var capFilterAppType = 0
	var capFilterOverride = 0
	var capCount = 0;
	var setCreated = false;
	var currDate = new Date();
	var capList = new Array();
	capTypeModel = aa.cap.getCapTypeModel().getOutput();
	capModel = aa.cap.getCapModel().getOutput();
	capModel.setCapType(capTypeModel);
	capModel.setCapStatus(appStatus);

// query a list of records based on the above criteria
	capListResult = aa.cap.getCapIDListByCapModel(capModel);
	if (capListResult.getSuccess()) {
		capList = capListResult.getOutput();
	}else{
		logDebug("Error retrieving records: " + capListResult.getErrorMessage());
		}
	if (capList.length > 0) {
		logDebug("Found " + capList.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
	for (myCapsXX in capList) {
/* MJH Story 5843 - Remove timeout logic
		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
			logDebug("WARNING: A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
		}
*/
		capId = aa.cap.getCapID(capList[myCapsXX].ID1, capList[myCapsXX].ID2, capList[myCapsXX].ID3).getOutput();
		if (!capId) {
			logDebug("Could not get Cap ID");
			continue;
		}
		altId = capId.getCustomID();
		
//		if(altId != "LCA18-0000029") continue;
	
		cap = aa.cap.getCap(capId).getOutput();	
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		if(appTypeArray[3] == "Owner Application" ) {
				capFilterAppType++;
				continue;
		}
		var AInfo = [];
		loadAppSpecific(AInfo);
		expDate = dateAdd(getAppSpecific("App Expiry Date"),1);
		appExpDate = new Date(expDate);
		if(appExpDate >= currDate) {
			capFilterDate++;
			continue;
		 }
		if(isTaskActive("Administrative Manager Review") && matches(AInfo["Admin Deficiency Letter Sent"], null, "", undefined)) {
			capFilterDate++;
			continue;
		}
		if(isTaskActive("Science Manager Review") && matches(AInfo["Science Deficiency Letter Sent"], null, "", undefined)) {
			capFilterDate++;
			continue;
		}
	// MJH: 190213 Story 5842 - Bypass if pending amendments and the exclude field is checked		
		if(AInfo["Exclude from Disqualification"] == "CHECKED") {
			capFilterOverride++;
			continue;
		}

		logDebug("----Processing record " + altId + br);
		capCount++;
		if (newAppStatus && newAppStatus != ""){
			updateAppStatus(newAppStatus, "set by " + batchJobName +  " batch");
		} 
	//MJH: 190213 Story 5842 - Close Amendment records when application Disqualified. 
			holdId = capId;
			childArray = getChildren("Licenses/Cultivator/Medical/Amendment");
			for (x in childArray) {
				capId = childArray[x];
				var childIdStatusClass = getCapIdStatusClass(capId);
				if(childIdStatusClass == "INCOMPLETE CAP") {
					capModelChild = aa.cap.getCapViewBySingle4ACA(capId);
					convert2RealCAP2(capModelChild, "", altId);
				}
				else {
					updateAppStatus(newAppStatus, "set by " + batchJobName +  " batch");
					deactivateTask("Amendment Review");
				}
			}
			capId = holdId;
	//MJH: 1902013 Story 5842 - Close Owner and Owner Amendment records when application Disqualified. 		
			ownArray = getChildren("Licenses/Cultivator/Medical/Owner Application");
			for (x in ownArray) {
				capId = ownArray[x];
				ownAltId = capId.getCustomID();
				updateAppStatus(newAppStatus, "set by " + batchJobName +  " batch");
				deactivateTask("Owner Application Review");
				ownAmendArray = getChildren("Licenses/Cultivator/Owner/Amendment");
				for (x in ownAmendArray) {
					capId = ownAmendArray[x];
					var childIdStatusClass = getCapIdStatusClass(capId);
					if(childIdStatusClass == "INCOMPLETE CAP") {
						capModelChild = aa.cap.getCapViewBySingle4ACA(capId);
						convert2RealCAP2(capModelChild, "", ownAltId);
					}
					else {
						updateAppStatus(newAppStatus, "set by " + batchJobName +  " batch");
						deactivateTask("Amendment Review");
					}
				}
			}
			capId = holdId;

	//MJH: 180809 Story 5842 - End 
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
						emailRptContact("BATCH", emailTemplate, "", false, "Deficiency Letter Sent", capId, thisContact["contactType"], "p1value", capId.getCustomID());
						logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact["contactType"] + " : " + conEmail);
					}
				}
			}
			if(!contactFound){
				logDebug("No contact found for notification: " + altId);
			}
		}
	}
	if(setCreated){
		aa.sendMail(sysFromEmail, emailAddress, "", sNonEmailSet + " Set Created ", "Records in this set will need to be sent the '" + rptName + "'.");
	}
	logDebug("Total CAPS qualified : " + capList.length);
	logDebug("Ignored due to Application Expiration Date: " + capFilterDate);
	logDebug("Ignored due to Record Type: " + capFilterAppType);
	logDebug("Ignored due to Override: " + capFilterOverride);
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
function convert2RealCAP2(capModel, transactions, parentId)
{
	var originalCAPID = capModel.getCapID();
	var originalRecId = capModel.getCapID().getCustomID();
	var originalCAP = capModel;
	var capWithTemplateResult = aa.cap.getCapWithTemplateAttributes(capModel);
	var capWithTemplate = null;
	if (capWithTemplateResult.getSuccess()) 	{
		capWithTemplate = capWithTemplateResult.getOutput();
	}
	else {
		logDebug(capWithTemplateResult.getErrorMessage());
		return null;
	}
	
// 2. Convert asi group.
	aa.cap.convertAppSpecificInfoGroups2appSpecificInfos4ACA(capModel);
	if (capModel.getAppSpecificTableGroupModel() != null) {
			aa.cap.convertAppSpecTableField2Value4ACA(capModel);
	}
	
// 3. Trigger event before convert to real CAP.
	aa.cap.runEMSEScriptBeforeCreateRealCap(capModel, null);
	
// 4. Convert to real CAP.
	convertResult = aa.cap.createRegularCapModel4ACA(capModel, null, false, false);
	if (convertResult.getSuccess()) {
		capModel = convertResult.getOutput();
		logDebug("Commit OK: Convert partial CAP to real CAP successful: " + originalRecId + " to " + capModel.getCapID().getCustomID());
	}
	else {
		logDebug(convertResult.getErrorMessage());
		return null;
	}
// 5. Transfer docs
	var targetCaps = aa.util.newArrayList();
	targetCaps.add(capModel.getCapID());
	acaDocBiz.transferDocument(aa.getServiceProviderCode(), originalCAPID, targetCaps,"Licenses", "ADMIN");
	
// 6. Create template after convert to real CAP.
	aa.cap.createTemplateAttributes(capWithTemplate, capModel);

// update record after convert to real CAP.

	holdChildId = capId;
	capId = capModel.getCapID();
	updateAppStatus(newAppStatus, "set by " + batchJobName +  " batch", capId);
	deactivateTask("Amendment Review");
	newAltId = getAppSpecific("AltId", capId);
	var updAltId = aa.cap.updateCapAltID(capId,newAltId);
	if(!updAltId.getSuccess()){
		logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
	}else{
		logDebug("Deficiency record ID updated to : " + newAltId);
	}
	addParent(parentId);
	capid = holdChildId;
}

