/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_WATER_RIGHT_TABLE
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
|  
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var errLog = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 7 * 60;
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

var emailAddress = "jshear@trustvip.com";
var sysFromEmail = "calcannabislicensing@cdfa.ca.gov";
var useAppSpecificGroupName = false;
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

try {
	mainProcess();
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
	if (emailAddress.length) {
		aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);
		if(errLog != "") {
			aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Errors", errLog);
		}
	}
} catch (err) {
	logDebug("ERROR: BATCH_CEQA Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	
	var capCount  =0;
	var assignRec = 0;
	var qualRec = 0;
	var errrorCount = 0;
	var recArray = new Array();


	
	
	var capModel = aa.cap.getCapModel().getOutput();
	//Get the Permits from the system 
	var emptyGISArray=new Array();
	capTypeModel = capModel.getCapType();
	capTypeModel.setGroup("Licenses");
	capTypeModel.setType("Cultivator");
	capTypeModel.setSubType("License");
	capTypeModel.setCategory("License");
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
		logDebug(capId.getCustomID());
	
		var LICENSERENEWALHISTORY = new Array();
		var toRow = new Array();
			vLicenseObj = new licenseObject(null, capId);
			expDate = vLicenseObj.b1ExpDate;
		var expDateObj = new Date(expDate);
		var renYear = expDateObj.getFullYear();
		var licType = getAppSpecific("License Type",capId);
		var licTypeResult = lookup("LIC_CC_LICENSE_TYPE", licType);

		var licTypeArray = licTypeResult.split(";");
		var plantLimit = licTypeArray[2];
		var canopyLimit = licTypeArray[0];
		var canopySqFtLimit = ""


		if(plantLimit*1 > 0) {
				canopySqFtLimit = canopyLimit + " or " + plantLimit + " plants";
		}else {
				canopySqFtLimit = canopyLimit;
		}


	
		var transferPermitID = new asiTableValObj("LICENSE RENEWAL HISTORY", capId, "N");
		toRow["Renewal Year"] = "" + String(renYear);
		toRow["License Expiration"] = "" + String(expDate);
		toRow["License Status"] = "Active";
		toRow["Limited Operation"] = "No";
		toRow["License Type"] = "" + licType; 
		toRow["Canopy Square Feet"] = "" + (getAppSpecific("Canopy SF",capId) || ""); 
		toRow["Canopy Plant Count"] = "" + (getAppSpecific("Canopy Plant Count",capId) || ""); 
		toRow["Canopy Square Footage Limit"] = "" + canopySqFtLimit; 
		LICENSERENEWALHISTORY.push(toRow);
		addASITable("LICENSE RENEWAL HISTORY", LICENSERENEWALHISTORY, capId);


		editAppSpecific("Limited Operations","No",capId);
		editAppSpecific("Original License Type",licType,capId);
	}
				
			

	logDebug("Total License Case Records : " + capCount);
	
}catch (err){
	logDebug("ERROR: Science Conversion Water Rights: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
