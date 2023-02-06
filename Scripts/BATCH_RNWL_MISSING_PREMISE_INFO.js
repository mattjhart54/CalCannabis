/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_RNWL_MISSING_PREMISE_INFO.js  Trigger: Batch
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


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess(){

try{
	AInfo = [];
	var premAddressCount = 0;
	var premCityCount = 0;
	var premCountyCount = 0;
	var premZipCount = 0;
	var capCount  =0;
	var premArray = [];
	
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
		altId = capId.getCustomID();
		if (String(altId.substr(0,3)) == "CCL"){
			vLicenseID = getParentLicenseCapID(capId);
			vIDArray = String(vLicenseID).split("-");
			vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
			renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
			if (matches(renewalCapProject,undefined,null,"")) {
				vLicenseID = getParent();
			}
			if(!vLicenseID){
				logDebug("Floater: " + capId.getCustomID());
				continue;
			}
			loadAppSpecific(AInfo);
			holdId = capId;
			capId = vLicenseID;
			PInfo = new Array;
			loadAppSpecific(PInfo);
			capId = holdId;
			if (matches(AInfo['Premises Address'],null,undefined,"") && !matches(PInfo['Premise Address'],null,undefined,"")){
				editAppSpecific("Premises Address",PInfo["Premise Address"]);
				premAddressCount++;
				if (premArray.indexOf(altId) < 0) {
					premArray.push(altId);
				}
				
			}
			if (matches(AInfo['Premises City'],null,undefined,"") && !matches(PInfo['Premise City'],null,undefined,"")){
				editAppSpecific("Premises City",PInfo["Premise City"]);
				premCityCount++;
				if (premArray.indexOf(altId) < 0) {
					premArray.push(altId);
				}
				
			}
			if (matches(AInfo['Premises County'],null,undefined,"") && !matches(PInfo['Premise County'],null,undefined,"")){
				editAppSpecific("Premises County",PInfo["Premise County"]);
				premCountyCount++;
				if (premArray.indexOf(altId) < 0) {
					premArray.push(altId);
				}
				
			}
			if (matches(AInfo['Premises Zip'],null,undefined,"") && !matches(PInfo['Premise Zip'],null,undefined,"")){
				editAppSpecific("Premises Zip",PInfo["Premise Zip"]);
				premZipCount++;
				if (premArray.indexOf(altId) < 0) {
					premArray.push(altId);
				}
				
			}
		}
	}
	
	logDebug("Total Renewal Caps: " + capCount);
	logDebug("Total Renewal Caps Adjusted: " + premArray.length);
	logDebug("Total Renewal Premise Address Edits: " + premAddressCount);
	logDebug("Total Renewal Premise City Edits: " + premCityCount);
	logDebug("Total Renewal Premise County Edits: " + premCountyCount);
	logDebug("Total Renewal Premise Zip Edits: " + premZipCount);
	logDebug("Adjusted Premise Data in following Records: " + premArray);
}catch (err){
	logDebug("BATCH_RNWL_MISSING_PREMISE_INFO: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}