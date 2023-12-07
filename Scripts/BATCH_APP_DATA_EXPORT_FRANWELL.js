/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_APP_DATA_EXPORT_FRANWELL
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to select records for export.
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
aa.env.setValue("lookAheadDays", "-14");
aa.env.setValue("daySpan", "14");
aa.env.setValue("emailAddress", "eshanower@trustvip.com");
aa.env.setValue("sendToEmail", "eshanower@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("reportName", "CDFA_Franwell_Export");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "Medical,Adult Use");
aa.env.setValue("recordCategory", "Application");
aa.env.setValue("contactType", "Designated Responsible Party");
*/
var emailAddress = getJobParam("emailAddress");			// email to send report
var lookAheadDays = getJobParam("lookAheadDays");
var daySpan = getJobParam("daySpan");
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appCategory = getJobParam("recordCategory");
var contactType = getJobParam("contactType");
var sArray = getJobParam("recordSubType").split(",");
var filepath = "c://test"; 

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
	var recdsFound = false;
	var badStatus = 0;
	var incompRecd = 0;
	var noContactType = 0;
	var capCount = 0;
	var rptDate = new Date();
	var pYear = rptDate.getYear() + 1900;
	var pMonth = rptDate.getMonth();
	var pDay = rptDate.getDate();
	var pHour = rptDate.getHours();
	var pMinute = rptDate.getMinutes();
	if(pMonth<12){
		pMonth++;
	}else{
		pMonth=1;
	}
	if (pMonth > 9)
		var mth = pMonth.toString();
	else
		var mth = "0" + pMonth.toString();
	if (pDay > 9)
		var day = pDay.toString();
	else
		var day = "0" + pDay.toString();
	if (pHour > 9)
		var hour = pHour.toString();
	else
		var hour = "0" + pHour.toString();
	if (pMinute > 9)
		var minute = pMinute.toString();
	else
		var minute = "0" + pMinute.toString();
	
	var rptDateFormatted = "" + pYear.toString() + mth + day + hour + minute;
	var newRptName = "CDFA" + rptDateFormatted + ".CSV";
	logDebug("newRptName: " + newRptName);
	var rptToEmail = filepath + "/" + newRptName;
	var capFilterBalance = 0;
	var capFilterDateRange = 0;
	var capCount = 0;
	var capList = new Array();
	for (i in sArray) {
		logDebug("type: " + sArray[i]);
		// Specify the application type to query
		var capModel = aa.cap.getCapModel().getOutput();
		capTypeModel = capModel.getCapType();
		capTypeModel.setGroup(appGroup);
		capTypeModel.setType(appTypeType);
		capTypeModel.setSubType(sArray[i]);
		capTypeModel.setCategory(appCategory); 
		capModel.setCapType(capTypeModel);
		capListResult = aa.cap.getCapListByCollection(capModel,null,null,dFromDate, dToDate, null, new Array())
		if (capListResult.getSuccess()) {
			tempcapList = capListResult.getOutput();
			logDebug("Status count: " + tempcapList.length);
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
    	capId = capList[myCapsXX].getCapID();
		//capId = aa.cap.getCapID(capList[myCapsXX].ID1, capList[myCapsXX].ID2, capList[myCapsXX].ID3).getOutput();
   		//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		altId =	 capId.getCustomID();
		if(getCapIdStatusClass(capId)!="COMPLETE"){
			incompRecd++;
			continue;
		}
		cap = aa.cap.getCap(capId).getOutput();	
		capStatus = cap.getCapStatus();
		if(matches(capStatus, "Closed","Denied","Disqualified","Pending Final Affidavit","Pending Owner Applications","Voided","Withdrawn","License Issued","Provisional License Issued","Under Scientific Review","Scientific Review Complete","Additional Information Needed")) {
			badStatus++;
			continue;
		}
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		logDebug("Processing altId: " + altId + " Status: " + capStatus);
		//capCount++;
		var rptLine = "";
		rptLine = altId+",";
		var thisContact = getContactByType(contactType,capId);
		if(thisContact){
			if(thisContact.firstName==null){
				rptLine+","
			}else{
				if(thisContact.firstName.length>100){
					var fName = testForSpecialCharacter(thisContact.firstName.substring(0,100));
				}else{
					var fName = testForSpecialCharacter(thisContact.firstName);
				}
				rptLine+=fName +",";
			}
			rptLine+=",";
			if(thisContact.lastName==null){
				rptLine+","
			}else{
				if(thisContact.lastName.length>100){
					var lName = testForSpecialCharacter(thisContact.lastName.substring(0,100));
				}else{
					var lName = testForSpecialCharacter(thisContact.lastName);
				}
				rptLine+=lName +",";
			}
			if(thisContact.email==null){
				rptLine+=","
			}else{
				if(thisContact.email.length>255){
					var eMail = testForSpecialCharacter(thisContact.email.substring(0,255));
				}else{
					var eMail = testForSpecialCharacter(thisContact.email);
				}
				rptLine+=eMail +",";
			}
			rptLine+=thisContact.phone3 +",";
			var bsnsName = workDescGet(capId);
			if(bsnsName==null){
				rptLine+=","
			}else{
				if(bsnsName.length>100){
					var bName = testForSpecialCharacter(bsnsName.substring(0,100));
				}else{
					var bName = testForSpecialCharacter(bsnsName);
				}
				rptLine+=bName;
			}
			//Line return after each record has been written.
			rptLine += "\r\n";
			aa.util.writeToFile(rptLine,rptToEmail);
			recdsFound = true;
			capCount ++;
		}else{
			logDebug("Skipping due to no contact type: " + contactType);
			noContactType++;
		}
	}
	if(recdsFound){
		var rFiles = [];
		rFiles.push(rptToEmail);
		//sendNotification(sysFromEmail,sendToEmail,"","","", rFiles,null);
		var result = aa.sendEmail(sysFromEmail, sendToEmail, "", newRptName, ".", rFiles);
		if(result.getSuccess()){
			logDebug("Sent email successfully!");
		}else{
			logDebug("Failed to send mail. - " + result.getErrorType());
		}
	}
 	logDebug("Total CAPS qualified : " + capList.length);
  	logDebug("Ignored due to Status: " + badStatus);
 	logDebug("Ignored due to incomplete record: " + incompRecd);
 	logDebug("Ignored due to no contact type: " + noContactType);
 	logDebug("Total CAPS processed: " + capCount);
}
catch (err){
	logDebug("An error occurred in BATCH_APP_DATA_EXPORT_FRANWELL: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, emailAddress, "", "An error has occurred in " + batchJobName, err.message + br + err.stack + br + "env: av6(prod)");
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

function testForSpecialCharacter(testPhrase){
	var testPhraseNew = "";
	if (testPhrase.indexOf('"') != -1) {
		testPhrase = (""+testPhrase).replace(/"/g, '""');
		testPhrase = '"' + testPhrase + '"';
	}else{
		if (testPhrase.indexOf(',')!= -1) {
			testPhrase = '"' + testPhrase + '"';
		}
	}
	return testPhrase;
}