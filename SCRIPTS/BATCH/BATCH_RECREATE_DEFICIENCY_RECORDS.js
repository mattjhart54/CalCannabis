/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_Create_deficiency records
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to create temporary deficiency records that were purged. 
| not been paid.
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
var testRecordToConvert = "17TMP-001797";
var myCapId = "xxxxx";
var myUserId = "ADMIN";
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
  
var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0,0,0,0);
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var acaUrl = "https://aca.test6.accela.com/CALCANNABIS";
var sysFromEmail = "calcannabislicensing@cdfa.ca.gov";

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

//if (emailAddress.length)
//	aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);

if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try {
	showDebug = true;
	var recCnt = 0;
	var t = getTempRecordsAll();
	
	for(i in t) {
		if(i>10) break;
		capIdString = t[i].Record;
		newDate = t[i].FileDate;
		
		capId = aa.cap.getCapID(capIdString).getOutput();
		cap = aa.cap.getCap(capId).getOutput();		
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		capName = cap.getSpecialText();
		capStatus = cap.getCapStatus();
		AInfo = new Array();
		loadAppSpecific(AInfo); 						
		loadTaskSpecific(AInfo);						
		loadParcelAttributes(AInfo);					
		loadASITables();
		if(appTypeArray[3] == "Application" && appTypeArray[2] != "Temporary") {
			var newAppName = "Deficiency: " + capName;
		//create child amendment record
			ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
			ctm.setGroup("Licenses");
			ctm.setType("Cultivator");
			ctm.setSubType("Medical");
			ctm.setCategory("Amendment");
			var resDefId = aa.cap.createSimplePartialRecord(ctm,newAppName, "INCOMPLETE CAP");
			if(resDefId.getSuccess()){
				recCnt++;
				var newDefId = resDefId.getOutput();
		//relate amendment to application
				var resCreateRelat = aa.cap.createAppHierarchy(capId, newDefId); 
				if (resCreateRelat.getSuccess()){
					logDebug("Child application successfully linked");
				}else{
					logDebug("Could not link applications: " + resCreateRelat.getErrorMessage());
				}
				editAppSpecific("ParentCapId", capIdString,newDefId);
				var tblODefic = [];
				var arrDef = [];
				for (row in DEFICIENCIES){
					if(DEFICIENCIES[row]["Status"]=="Deficient"){
						arrDef.push(DEFICIENCIES[row]);
					}
				}
				addASITable("DEFICIENCIES", arrDef, newDefId);
				copyContactsByType(capId, newDefId,"Designated Responsible Party");
	//	find out how many amendment records there have been so we can create an AltId
				var childAmend = getChildren("Licenses/Cultivator/Medical/Amendment");
				var cntChild = childAmend.length;
				if(cntChild<10){
					cntChild = "0" +cntChild;
				}
				var newAltId = capIdString +"-DEF"+ ""+cntChild;
				var defAltIdT = newAltId + "TR"
				var updAltId = aa.cap.updateCapAltID(newDefId,defAltIdT);
				if(!updAltId.getSuccess()){
					logDebug("Error updating Alt Id: " + defAltIdT + ":: " +updAltId.getErrorMessage());
				}else{
					editAppSpecific("AltId", newAltId,newDefId);
					logDebug("Deficiency record ID updated to : " + defAltIdT);
				}
				var capMdl = aa.cap.getCap(newDefId).getOutput(); //returns CapScriptModel object
				var tDay = dateAdd(newDate,0);
				var thisDate = aa.date.parseDate(tDay)
				var updFileDt = capMdl.setFileDate(thisDate);
				var capModel = capMdl.getCapModel();
				setDateResult = aa.cap.editCapByPK(capModel);
				if (!setDateResult.getSuccess()) {
					logDebug("**WARNING: error setting file date : " + setDateResult.getErrorMessage());
				}else{
					logDebug("File date successfully updated to " + tDay);
				}
				if(!matches(capStatus,"Disqualified", "Voided", "Withdrawn", "Review Complete")) {
					var	conArray = getContactArray(capId);
					for (thisCon in conArray) {
						thisContact = conArray[thisCon];
						if (thisContact["contactType"] == "Designated Responsible Party"){
							conEmail = thisContact["email"];
							conFirst = thisContact["firstName"];
							conLast = thisContact["lastName"];
							var rFiles = [];
							if (conEmail) {
								var eParams = aa.util.newHashtable(); 
								addParameter(eParams, "$$ALTID$$", capId.getCustomID());
								addParameter(eParams, "$$DEFICIENCYID$$", defAltIdT);
								addParameter(eParams, "$$firstName$$", conFirst);
								addParameter(eParams, "$$lastName$$", conLast);
								addParameter(eParams, "$$acaRecordUrl$$", acaUrl);
								runReportAttach(capId,"One-Time Deficiency Replacement Letter", "p1value",capIdString,"p2value",defAltIdT,"p3value","Designated Responsible Party","p4value","Mailing");
								sendNotification(sysFromEmail,conEmail,"","LCA_DEF_REPLACEMENT",eParams, rFiles,capId);
							}
							else {
								logDebug("Deficiency letter not generated and email not sent as no DRP found on record " + capIdString);
							}
						}
					}
				}
			}
			else {
				logDebug("Deficiency record not created for record " + capIdString);
				}
		}
		if(appTypeArray[3] == "Owner Application") {			
	//		now process the child owner applications for any deficiencies
			var thisOwnCapId = capId;
			var ownCap = aa.cap.getCap(thisOwnCapId).getOutput();
			var ownAppStatus = ownCap.getCapStatus();
			var ownAppName = ownCap.getSpecialText();
			var newOwnAppName = "Deficiency: " + ownAppName;
	//		create child deficiency record for the owner
			ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
			ctm.setGroup("Licenses");
			ctm.setType("Cultivator");
			ctm.setSubType("Owner");
			ctm.setCategory("Amendment");
			var newODefId = aa.cap.createSimplePartialRecord(ctm,newOwnAppName, "INCOMPLETE CAP").getOutput();
			if(newODefId){
				recCnt++;
				var resOCreateRelat = aa.cap.createAppHierarchy(thisOwnCapId, newODefId); 
				if (resOCreateRelat.getSuccess()){
					logDebug("Child application successfully linked");
				}else{
					logDebug("Could not link applications: " + resOCreateRelat.getErrorMessage());
				}
				editAppSpecific("ParentCapId", thisOwnCapId.getCustomID(),newODefId);
				var tblODefic = loadASITable("DEFICIENCIES",thisOwnCapId);
				var arrDef = [];
				for (row in tblODefic){
					if(tblODefic[row]["Status"]=="Deficient"){
						arrDef.push(tblODefic[row]);
					}
				}
				addASITable("DEFICIENCIES", arrDef, newODefId);
				copyContacts(thisOwnCapId, newODefId);
	//			get the current number of deficiency children to set the AltId
				var currCapId = capId;
				capId = thisOwnCapId;
				var childOAmend = getChildren("Licenses/Cultivator/Owner/Amendment");
				capId = currCapId;
				var cntOChild = childOAmend.length;
				if(cntOChild<10){
					cntOChild = "0" +cntOChild;
				}
				var newOAltId = thisOwnCapId.getCustomID() +"-DEF"  + cntOChild;
				var defAltIdT = newOAltId + "TR";
				var updOAltId = aa.cap.updateCapAltID(newODefId,defAltIdT);
				if(!updOAltId.getSuccess()){
					logDebug("Error updating Owner Alt Id: " + defAltIdT + ":: " +updOAltId.getErrorMessage());
				}else{
					editAppSpecific("AltId", newOAltId,newODefId);
					logDebug("Deficiency owner record ID updated to : " + newOAltId);
				}
				var capMdl = aa.cap.getCap(newODefId).getOutput(); //returns CapScriptModel object
				var tDay = dateAdd(newDate,0);
				var thisDate = aa.date.parseDate(tDay)
				var updFileDt = capMdl.setFileDate(thisDate);
				var capModel = capMdl.getCapModel();
				setDateResult = aa.cap.editCapByPK(capModel);
				if (!setDateResult.getSuccess()) {
					logDebug("**WARNING: error setting file date : " + setDateResult.getErrorMessage());
				}else{
					logDebug("File date successfully updated to " + tDay);
				}
				if(!matches(capStatus,"Disqualified", "Voided", "Withdrawn", "Review Complete")) {
					var	conArray = getContactArray(thisOwnCapId);
					for (thisCon in conArray) {
						thisContact = conArray[thisCon];
						if (thisContact["contactType"] == "Owner"){
							conEmail = thisContact["email"];
							conFirst = thisContact["firstName"];
							conLast = thisContact["lastName"];
							var rFiles = [];
							if (conEmail) {
								var eParams = aa.util.newHashtable(); 
								addParameter(eParams, "$$ALTID$$", thisOwnCapId.getCustomID());
								addParameter(eParams, "$$DEFICIENCYID$$", defAltIdT);
								addParameter(eParams, "$$firstName$$", conFirst);
								addParameter(eParams, "$$lastName$$", conLast);
								addParameter(eParams, "$$acaRecordUrl$$", acaUrl);
								runReportAttach(thisOwnCapId,"One-Time Deficiency Replacement Letter - Owner", "p1value",capIdString,"p2value",defAltIdT,"p3value","Owner","p4value","Home");
								sendNotification(sysFromEmail,conEmail,"","LCA_DEF_REPLACEMENT_OWNER",eParams, rFiles,thisOwnCapId);
							}
							else {
								logDebug("Deficiency letter not generated and email not sent as no DRP found on record " + capIdString);
							}
						}
					}	
				}
			}
			else {
				logDebug("Deficiency record not created for record " + capIdString);
			}
		}
	}
	logDebug("Total Records to Process : " + t.length);
	logDebug("Number of deficiency records created: " + recCnt);
}
catch (err) {
	logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
	}
// end user code
//aa.env.setValue("ScriptReturnCode", "0"); 	aa.env.setValue("ScriptReturnMessage", debug)
}
function getTempRecordsAll() {
	return [
  {
    "Record": "LCA18-0000163",
    "FileDate": "01/09/2019"
  },
   {
    "Record": "LCA18-0000163-001O",
    "FileDate": "01/09/2019"
  }
 ]
}

