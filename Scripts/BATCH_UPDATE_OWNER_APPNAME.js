/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_UPDATE_OWNER_APPNAME
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to update any owner application record where the license type is null with the owner name and email.
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
aa.env.setValue("recordSubType", "Medical");
aa.env.setValue("recordCategory", "Owner Application");
*/
var emailAddress = getJobParam("emailAddress");			// email to send report
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appCategory = getJobParam("recordCategory");
var sArray = getJobParam("recordSubType").split(",");

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
	var goodRec = 0;
	var updateRec = 0;
	var capList = new Array();
	for (i in sArray) {
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
	for (myCapsXX in capList) {
		capId = capList[myCapsXX].getCapID();
		cap = aa.cap.getCap(capId).getOutput();
		capName = cap.getSpecialText();
		altId =	 capId.getCustomID();
		AInfo = new Array();
		loadAppSpecific(AInfo);
		perId1 = capId.getID1();
//		if(altId != "LCA19-0000114-003O") continue;
		if(matches(perId1,"17EST","18EST","19EST")) {
			tmpRec++;
			continue;
		}
		if(!matches(capName, null, "", undefined)) {
			goodRec++;
			continue;
		}

		var priContact = getContactObj(capId,"Owner");
		if(priContact){	
			ownName = priContact.capContact.firstName + " " + priContact.capContact.lastName + " (" + priContact.capContact.email + ")";
			logDebug("Processing Record: " + altId + " License Type was updated to: " + ownName);
			editAppName(ownName);
			updateRec++;
		}

	}
	logDebug("Total Owner Recs : " + capList.length);
 	logDebug("Ignored due temp record: " + tmpRec);
	logDebug("Records with License Type already updated: " + goodRec);
	logDebug("Records updated with Owner Name and Email: " + updateRec);
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

function getContactObj_rev(itemCap,typeToLoad)
{
    // returning the first match on contact type
    var capContactArray = null;
    var cArray = new Array();
    if (itemCap.getClass() == "com.accela.aa.aamain.cap.CapModel")   { // page flow script 
        var capContactArray = cap.getContactsGroup().toArray() ;
        }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }
    if (capContactArray) {
        for (var yy in capContactArray) {
            if (capContactArray[yy].getPeople().contactType.toUpperCase().equals(typeToLoad.toUpperCase())) {
                logDebug("getContactObj returned the first contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
                return new contactObj(capContactArray[yy]);
            }
        }
    }
//    logDebug("getContactObj could not find a contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
    return false;
} 