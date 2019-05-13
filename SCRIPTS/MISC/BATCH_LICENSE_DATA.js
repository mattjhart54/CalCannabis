/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LICENSE_DATA
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to update license data from application data on existing license records.
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
/* test parameters

aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sendToEmail", "mhart@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("reportName", "CDFA_purge");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "Medical,Adult Use");
aa.env.setValue("recordCategory", "License,Provisional");
*/
var emailAddress = getJobParam("emailAddress");			// email to send report
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appCategory = getJobParam("recordCategory");
var sArray = getJobParam("recordSubType").split(",");
var cArray = getJobParam("recordCategory").split(",");

if(appTypeType=="*") appTypeType="";
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
	var licDateUpdt = 0;
	var adminDateUpdt = 0;
	var sciDateUpdt = 0;
	var capList = new Array();
	for (i in sArray) {
		for(c in cArray) {
			capListResult = aa.cap.getByAppType(appGroup,appTypeType,sArray[i],cArray[c]);
			if (capListResult.getSuccess()) {
				tempcapList = capListResult.getOutput();
				logDebug(sArray[i] + " - " + cArray[c] + " Type Count: " + tempcapList.length);
				if (tempcapList.length > 0) {
					capList = capList.concat(tempcapList);
				}
			}else{
				logDebug("Error retrieving records: " + capListResult.getErrorMessage());
			}
		}
	}
	if (capList.length > 0) {
		logDebug("Found " + capList.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
	for (myCapsXX in capList) {
		capId = capList[myCapsXX].getCapID();
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		altId =	 capId.getCustomID();
		AInfo = new Array();
		loadAppSpecific(AInfo);
		if(altId != "CAL19-0000107") continue;
		subType = 
		cId = getChildren("Licenses/Cultivator/"+appTypeArray[2]+"/Application");
		for(x in cId) {
			holdId = capId;
			capId = cId[x];
			appInfo = new Array();
			loadAppSpecific(appInfo);
			capId = holdId;

			editAppSpecific("Business Entity Structure",appInfo["Business Entity Structure"]);
			editAppSpecific("Other Entity",appInfo["Other Entity"]);
			editAppSpecific("Foreign Corporation",appInfo["Foreign Corporation"]);
			editAppSpecific("Legal Business Name",appInfo["Legal Business Name"]);
			editAppSpecific("EIN/ITIN",appInfo["EIN/ITIN"]);
			editAppSpecific("SSN/ITIN",appInfo["SSN/ITIN"]);
			editAppSpecific("BOE Seller's Permit Number",appInfo["BOE Seller's Permit Number"]);
			editAppSpecific("Secretary of State Registration Entity ",appInfo["Secretary of State Registration Entity "]);
			editAppSpecific("Grid",appInfo["Grid"]);
			editAppSpecific("Solar",appInfo["Solar"]);
			editAppSpecific("Generator",appInfo["Generator"]);
			editAppSpecific("Generator Under 50 HP",appInfo["Generator Under 50 HP"]);
			editAppSpecific("Other",appInfo["Other"]);
			editAppSpecific("Other Source Description",appInfo["Other Source Description"]);
			editAppSpecific("Local Authority Type",appInfo["Local Authority Type"]);
			editAppSpecific("Local Authorization Name",appInfo["Local Authorization Name"]);
			editAppSpecific("Local Authorization Number",appInfo["Local Authorization Number"]);
			editAppSpecific("Expiration Date",appInfo["Expiration Date"]);
			editAppSpecific("Local Authority Address",appInfo["Local Authority Address"]);
			editAppSpecific("Local Authority City",appInfo["Local Authority City"]);
			editAppSpecific("Local Authorizaton Zip",appInfo["Local Authorizaton Zip"]);
			editAppSpecific("Local Authority County",appInfo["Local Authority County"]);
			editAppSpecific("Local Authority Phone",appInfo["Local Authority Phone"]);
		}
			
	}		
	logDebug("Total CAPS qualified : " + capList.length);
// 	logDebug("Ignored due temp record: " + tmpRec);
//	logDebug("Final Review task processed: " + licDateUpdt);
//	logDebug("Admin Manager Review processed: " + adminDateUpdt);
//	logDebug("Science Manager Review processed: " + sciDateUpdt);
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

function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
}