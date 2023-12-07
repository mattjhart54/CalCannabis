/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_UPDATE_LIMITS
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to update the Light and Conopy Limit custom fields .
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
// test parameters
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sendToEmail", "mhart@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "Medical,Adult Use,License,Amendment");
aa.env.setValue("recordCategory", "Application");

var emailAddress = getJobParam("emailAddress");			// email to send report
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appCategory = getJobParam("recordCategory");
var sArray = getJobParam("recordSubType").split(",");

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
	var tmpRec = 0;
	var recSelected = 0;
	var wfUpdate = 0;
	var wfError = 0;
	var capList = new Array();
	for (i in sArray) {
		if(sArray[i] == "License") appCategory = "License";
		if(sArray[i] == "Amendment") appCategory = "Science";
		if(matches(sArray[i],"Medical","Adult Use")) appCategory = "Application";
		
		capListResult = aa.cap.getByAppType(appGroup,appTypeType,sArray[i],appCategory);
		if (capListResult.getSuccess()) {
			tempcapList = capListResult.getOutput();
			logDebug("Type count: " + tempcapList.length);
			if (tempcapList.length > 0) {
				capList = capList.concat(tempcapList);
			}
		}else{
			logDebug("Error retrieving records: " + capListResult.getErrorMessage());
		}
	}
	if (capList.length > 0) {
		logDebug("Found " + capList.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
	for (i in capList) {
		capId = aa.cap.getCapID(capList[i].getCapID().getID1(),capList[i].getCapID().getID2(),capList[i].getCapID().getID3()).getOutput();
	//	capId = capList[myCapsXX].getCapID();
		altId =	 capId.getCustomID();
		AInfo = new Array();
		loadAppSpecific(AInfo);
		cap = aa.cap.getCap(capId).getOutput();
		recStatus = cap.getCapStatus();
		capName = cap.getSpecialText();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		perId1 = capId.getID1();
		if(matches(perId1,"17EST","18EST","19EST","20EST","21EST","20TEMP")) {
			continue;
		}
		if(!matches(AInfo["Watts/SF limit"],"",null,undefined) && !matches(AInfo["Canopy SF Limit"],"",null,undefined)) continue;
//		if(altId != "LCA21-0000005") continue;

		recSelected++;
		logDebug("Processing Record " + altId);
		if(appTypeArray[3] == "Science") {
			if(!matches(capName,null,"",undefined)) {
				if (capName.indexOf('-') > -1){
					var appName = capName.split('-');
					if(appName.length == 4) {
						var licType = appName[2]+"-"+appName[3];
					}else 
						if(appName.length == 3) {
							var licType = appName[2];
						}else{
							var licType = appName[1];
						}
					var licType = licType.trim();
				}
			}else{
				var licType = " ";
			}
			var lightLimit = lookup("LIC_CC_LICENSE_TYPE_WATTS",licType);
			editAppSpecific("Watts/SF limit-NEW", lightLimit);
	
			var lType = lookup("LIC_CC_LICENSE_TYPE", licType );
			if (!matches(lType,null,undefined,"",false)){
				licTypeArray = lType.split(";");
				plantLimit = licTypeArray[2];
				canopyLimit = licTypeArray[0];
				if(plantLimit*1 > 0) {
					editAppSpecific("Canopy SF Limit-NEW",canopyLimit + " or " + plantLimit + " plants");
				}else{
					editAppSpecific("Canopy SF Limit-NEW",canopyLimit);
				}
			}
		}else{
			var licType = AInfo["License Type"];
			var lightLimit = lookup("LIC_CC_LICENSE_TYPE_WATTS",licType);
			editAppSpecific("Watts/SF limit", lightLimit);
	
			var lType = lookup("LIC_CC_LICENSE_TYPE", licType );
			if (!matches(lType,null,undefined,"",false)){
				licTypeArray = lType.split(";");
				plantLimit = licTypeArray[2];
				canopyLimit = licTypeArray[0];
				if(plantLimit*1 > 0) {
					editAppSpecific("Canopy SF Limit",canopyLimit + " or " + plantLimit + " plants");
				}else{
					editAppSpecific("Canopy SF Limit",canopyLimit);
				}
			}
		}
	}
	logDebug("Total Application Records : " + capList.length);
	logDebug("Total Application Records Selected : " + recSelected);
//	logDebug("Total Application Records with workflow updated: " + wfUpdate);
//	logDebug("Total Application Records with workflow update error: " + wfError);
}	
function getCapIdByIDs(s_id1, s_id2, s_id3)  {
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
    if(s_capResult.getSuccess())
		return s_capResult.getOutput();
    else
       return null;
}

function getJobParam(pParamName){ //gets parameter value and logs message showing param value
try{
	var ret;
	if (aa.env.getValue("paramStdChoice") != "") {
		var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"),pParamName);
		if (b.getSuccess()) {
			ret = b.getOutput().getDescription();
			}	

		ret = ret ? "" + ret : "";   // convert to String
		
		logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
		}
	else {
			ret = "" + aa.env.getValue(pParamName);
			logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
		}
	return ret;
}catch (err){
	logDebug("ERROR: getJobParam: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}


