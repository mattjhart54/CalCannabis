/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_Temporary PURGE
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to email DPR that application will be purged if not completed in specified timeframe.
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
aa.env.setValue("lookAheadDays", "-500");
aa.env.setValue("daySpan", "500");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sendToEmail", "mhart@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "Temporary");
aa.env.setValue("recordCategory", "Application");
*/
var lookAheadDays = getJobParam("lookAheadDays");
var daySpan = getJobParam("daySpan");
var emailAddress = getJobParam("emailAddress");			// email to send report
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appSubtype = getJobParam("recordSubType");
var appCategory = getJobParam("recordCategory");
var sArray = getJobParam("recordSubType").split(",");

if(appTypeType=="*") appTypeType="";
if(appSubtype=="*")  appSubtype="";
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
	var tmpRecd = 0;
	var notTmpRec = 0;
	var badDate = 0;
	var totRec = 0;
	var capList = new Array();
	for (i in sArray) {
		var capModel = aa.cap.getCapModel().getOutput();
		capTypeModel = capModel.getCapType();
		capTypeModel.setGroup(appGroup);
		capTypeModel.setType(appTypeType);
		capTypeModel.setSubType(sArray[i]);
		capTypeModel.setCategory(appCategory); 
		capModel.setCapType(capTypeModel);
// query a list of records based on the above criteria
		capListResult = aa.cap.getByAppType(appGroup,appTypeType,appSubtype,appCategory);
//		capListResult = aa.cap.getCapIDListByCapModel(capModel);
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
	for (myCapsXX in capList) {
		totRec++
//		if (totRec > 400) break;
//		capId = aa.cap.getCapID(capList[myCapsXX].ID1, capList[myCapsXX].ID2, capList[myCapsXX].ID3).getOutput();
		capId = capList[myCapsXX].getCapID();
		altId =	 capId.getCustomID();
		perId1 = capId.getID1();
		if(perId1 != "17EST" && perId1 != "18EST") {
			notTmpRec++;
			continue;
		}
		var capModel = aa.cap.getCap(capId).getOutput().getCapModel();
		var recStatus = capModel.getAuditStatus();

		var rptDateOrig = capModel.getFileDate().toString().substring(0,10);
		var rptDateConv = rptDateOrig.split("-");
		var rptDate = new Date(""+rptDateConv[0], ""+rptDateConv[1] - 1, ""+rptDateConv[2]);
		var fromTime = fromJSDate.getTime();
		var toTime = toJSDate.getTime();
		if(rptDate.getTime() < fromTime || rptDate.getTime() > toTime){
//			logDebug("Skipping due to date criteria: " + altId + "( " + rptDateOrig + ")");
			badDate++;
			continue;
		}
		var capIdStatusClass = getCapIdStatusClass(capId);
		var recStatus = capModel.getAuditStatus();
		logDebug("Record " + altId + " Status " + capIdStatusClass);
		tmpRecd++;
		var capBiz = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapBusiness", null).getOutput();
		capBiz.removePartialCap(capId,"ADMIN");
	}
	logDebug("Total CAPS qualified : " + capList.length);
 	logDebug("Ignored due to real record: " + notTmpRec);
 	logDebug("Ignored due to date: " + badDate );
	logDebug("temporary records: " + tmpRecd );
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

