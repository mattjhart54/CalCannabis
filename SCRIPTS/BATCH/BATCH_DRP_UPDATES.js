/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_PROVISIONAL_RENEWAL_MISSING_SA.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 03/05/2013 - Jaime Shear
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
showDebug = false;	
maxSeconds = 15 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0


eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName) {
vScriptName = vScriptName.toUpperCase();
var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;


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

var appGroup = "Licenses"							//   app Group to process {Licenses}
var appTypeType = "Cultivator"						//   app type to process {Rental License}
var appSubtype = "License"						//   app subtype to process {NA}
var appCategory = "Renewal"						//   app category to process {NA}
var caseTypeFieldValue = "Renewal Allowed"
var caseDescFieldValue = "Provisional Renewal Missing Science Amendment"
var caseOpenByFieldValue = "Science Provisional"
var priorityFieldValue = "Moderate"
var emailAddress = ""					// email to send report
var sendEmailToContactTypes = "";// send out emails?
var emailTemplate = "";				// email Template


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();


//logDebug("Historical Date Check: " + dateCheck);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
logDebug("********************************");

if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess(){

try{	
	var capFilterStatus = 0;
	var capCount  =0;
	
	var capModel = aa.cap.getCapModel().getOutput();
	//Get the Permits from the system 
	var emptyGISArray=new Array();
	capTypeModel = capModel.getCapType();
	capTypeModel.setGroup(appGroup);
	capTypeModel.setType(appTypeType);
	capTypeModel.setSubType(appSubtype);
	capTypeModel.setCategory(appCategory);
	capModel.setCapType(capTypeModel);
	
	var typeResult = aa.cap.getCapIDListByCapModel(capModel);
	if (typeResult.getSuccess())
	{
		vCapList = typeResult.getOutput();
	}
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + typeResult.getErrorType() + ":" + typeResult.getErrorMessage());
	}


	for (x in vCapList) {
		capCount++;
		capId = aa.cap.getCapID(vCapList[x].getCapID().getID1(),vCapList[x].getCapID().getID2(),vCapList[x].getCapID().getID3()).getOutput();
		var parentAltId = getAppSpecific("License Number",capId);
		parentId = aa.cap.getCapID(parentAltId).getOutput();
		appIds = getChildren("Licenses/Cultivator/*/Application",parentId);
		for(a in appIds) {
			decIds = getChildren("Licenses/Cultivator/Medical/Declaration",appIds[a]);
			for(d in decIds) {
				decId = decIds[d];
			}
		}
       holdId = capId;
       capId = decId;
       PInfo = new Array;
       loadAppSpecific(PInfo);
       capId = holdId;
       editAppSpecific("Conflicting License",PInfo["Conflicting License"]);
       editAppSpecific("Unlicensed Activity",PInfo["Unlicensed Activity"]);
       editAppSpecific("Documented Conduct",PInfo["Documented Conduct"]);
       editAppSpecific("Fines or Penalties",PInfo["Fines or Penalties"]);
       editAppSpecific("D1",PInfo["D1"]);
       editAppSpecific("D2",PInfo["D2"]);
       editAppSpecific("D3",PInfo["D3"]);
       editAppSpecific("D4",PInfo["D4"]);
       editAppSpecific("D5",PInfo["D5"]);
       editAppSpecific("D7",PInfo["D7"]);
       editAppSpecific("D8",PInfo["D8"]);
       editAppSpecific("D9",PInfo["D9"]);
       editAppSpecific("D10",PInfo["D10"]);
       editAppSpecific("D11",PInfo["D11"]);
       editAppSpecific("Certification",PInfo["Certification"]);
       editAppName(getAppSpecific("License Type",parentId));
       updateShortNotes(getShortNotes(parentId));
       updateWorkDesc(workDescGet(parentId));
	}
	
	logDebug("Total Caps: " + capCount);
}catch (err){
	logDebug("BATCH_PROVISIONAL_RENEWAL_MISSING_SA: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}