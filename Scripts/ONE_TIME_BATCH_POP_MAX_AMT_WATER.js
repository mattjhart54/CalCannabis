/*------------------------------------------------------------------------------------------------------/
| Program: ONE_TIME_BATCH_POP_MAX_AMT_WATER
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| One Time Batch Script to set "Maximum amount of water to be diverted for cannabis cultivation" with '0' value
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var sysFromEmail = "noreply@cannabis.ca.gov";
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

showDebug = "Y";

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
/* test parameters

aa.env.setValue("emailAddress", "jshear@trustvip.com");
*/
var emailAddress = getParam("emailAddress");			// email to send report


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var startDate = new Date();
var timeExpired = false;
var startTime = startDate.getTime(); // Start timer

var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING","RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));

var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var AInfo = new Array();

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

function mainProcess(){
	
	var capModel = aa.cap.getCapModel().getOutput();
	
	//Get the Permits from the system 
	var emptyGISArray=new Array();
	capTypeModel = capModel.getCapType();
	capTypeModel.setGroup("Licenses");
	capTypeModel.setType("Cultivator");
	capTypeModel.setSubType("");
	capTypeModel.setCategory("");
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

	var editArray = new Array();

	for (x in vCapList) {
		capId = aa.cap.getCapID(vCapList[x].getCapID().getID1(),vCapList[x].getCapID().getID2(),vCapList[x].getCapID().getID3()).getOutput();
		var altID = capId.getCustomID();
		
		var capResult = aa.cap.getCap(capId);

		if (!capResult.getSuccess()) {
			logDebug(altId + ": Record is deactivated, skipping");
			continue;
		} else {
			var cap = capResult.getOutput();
		}
		var capStatus = cap.getCapStatus();
		appTypeResult = cap.getCapType(); //create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		
		var appStatus = aa.cap.getCap(capId).getOutput().getCapStatus();
		if (appMatch("Licenses/Cultivator/Medical/Application",capId) || appMatch("Licenses/Cultivator/Adult Use/Application",capId) || appMatch("Licenses/Cultivator/License/License",capId) || appMatch("Licenses/Cultivator/Amendment/Science",capId)){
			var valuesList = aa.util.newArrayList();
			valuesList.add("Diversion from Waterbody");
			valuesList.add("Groundwater Well");
			updateRowsToASIT("SOURCE OF WATER SUPPLY","Type of Water Supply",valuesList,"Maximum amount of water to be diverted for cannabis cultivation","0",capId);
			var GROUNDWATERWELL= loadASITable("GROUNDWATER WELL",capId);
			if (typeof(GROUNDWATERWELL) == "object"){
				if(GROUNDWATERWELL.length > 0){
					logDebug("Updateding GROUNDWATER WELL within Record: " + altID);
					for (i in GROUNDWATERWELL) {
						var gwValuesList = aa.util.newArrayList();
						rowID = GROUNDWATERWELL[i];
						gwColumnArray =['Well Latitude','Well Longitude','Copy of Well completion report from DWR','DWR Letter','APN Address Matches Premises','Currently Used for Cannabis'];
						for(x in gwColumnArray){
							var gwColumn = gwColumnArray[x];
							if (!matches(rowID[gwColumn].fieldValue,null,undefined,"")){
								gwValuesList.add(rowID[gwColumn].fieldValue);
								break;
							}
						}
						updateRowsToASIT("GROUNDWATER WELL",gwColumn,gwValuesList,"Maximum amount of water to be diverted for cannabis cultivation","0",capId);
					}
					
					editArray.push(altID);
				}
			}
			logDebug("gwValuesList: " + gwValuesList);
			var WATERRIGHTS= loadASITable("WATER RIGHTS",capId);
			if (typeof(WATERRIGHTS) == "object"){
				if(WATERRIGHTS.length > 0){
					logDebug("Updateding Record: " + altID);
					for (ii in WATERRIGHTS) {
						var wrValuesList = aa.util.newArrayList();
						wtrRowID = WATERRIGHTS[ii];
						wrColumnArray =['Water Right Number','Copy of Document(s) Provided?','APN Matches Premises','Diversion Type','Other Diversion Description','Diversion Latitude','Diversion Longitude','Currently used for Cannabis?'];
						for(xx in wrColumnArray){
							var wrColumn = wrColumnArray[xx];
							if (!matches(wtrRowID[wrColumn].fieldValue,null,undefined,"")){
								wrValuesList.add(wtrRowID[wrColumn].fieldValue);
								break;
							}
						}
					}
					
					editArray.push(altID);
				}
			}

		}			
	}
	logDebug("Number of Records Edited: " + editArray.length);
	logDebug("Record IDs: " + editArray);
}
	
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/