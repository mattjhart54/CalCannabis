
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_PREM Update
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

var emailAddress = "mhart@trustvip.com";
var sysFromEmail = "calcannabislicensing@cdfa.ca.gov";
var useAppSpecificGroupName = false;
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var PREM = 
[
 {
   "License_Number": "CCL18-0003516",
   "Application_Number": "LCA18-0003516",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "No",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005192",
   "Application_Number": "LCA19-0005192",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004657",
   "Application_Number": "LCA19-0004657",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0003733",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001315",
   "Application_Number": "LCA19-0001315",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0001294",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "No",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004012",
   "Application_Number": "LCA19-0004012",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA18-0003735",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0005173",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0000160",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "lca19-0000162",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0003069",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "No",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004711",
   "Application_Number": "LCA19-0004711",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005240",
   "Application_Number": "LCA19-0005240",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005292",
   "Application_Number": "LCA19-0005292",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003702",
   "Application_Number": "LCA18-0003702",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005048",
   "Application_Number": "LCA19-0005048",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0000153",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "No",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0003185",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001190",
   "Application_Number": "LCA19-0001190",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0004772",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0003534",
   "Application_Number": "LCA19-0003534",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001154",
   "Application_Number": "LCA18-0001154",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001703",
   "Application_Number": "LCA18-0001703",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002664",
   "Application_Number": "LCA18-0002664",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005403",
   "Application_Number": "LCA19-0005403",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA18-0003785",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001341",
   "Application_Number": "LCA19-0001341",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005288",
   "Application_Number": "LCA19-0005288",
   "Premises Review Status": "Complete",
   "Processing_Area": "No",
   "Packaging_Area": "No",
   "Composting_Area": "No",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001672",
   "Application_Number": "LCA19-0001672",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005431",
   "Application_Number": "LCA19-0005431",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005317",
   "Application_Number": "LCA19-0005317",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002531",
   "Application_Number": "LCA19-0002531",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "No",
   "Composting_Area": "No",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004999",
   "Application_Number": "LCA19-0004999",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002738",
   "Application_Number": "LCA18-0002738",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005100",
   "Application_Number": "LCA19-0005100",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003820",
   "Application_Number": "LCA18-0003820",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005191",
   "Application_Number": "LCA19-0005191",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005132",
   "Application_Number": "LCA19-0005132",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001074",
   "Application_Number": "LCA19-0001074",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005409",
   "Application_Number": "LCA19-0005409",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001689",
   "Application_Number": "LCA18-0001689",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000194",
   "Application_Number": "lca19-0000194",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005350",
   "Application_Number": "LCA19-0005350",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": "Yes"
 },
 {
   "License_Number": "CCL19-0005567",
   "Application_Number": "LCA19-0005567",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005570",
   "Application_Number": "LCA19-0005570",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "No",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004621",
   "Application_Number": "LCA19-0004621",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0000445",
   "Application_Number": "LCA18-0000445",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000064",
   "Application_Number": "LCA19-0000064",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002991",
   "Application_Number": "LCA18-0002991",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003034",
   "Application_Number": "LCA18-0003034",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002256",
   "Application_Number": "LCA18-0002256",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001422",
   "Application_Number": "LCA18-0001422",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "No",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001919",
   "Application_Number": "LCA19-0001919",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000712",
   "Application_Number": "LCA19-0000712",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0000717",
   "Application_Number": "LCA18-0000717",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001544",
   "Application_Number": "LCA18-0001544",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": "Yes"
 },
 {
   "License_Number": "CCL18-0003514",
   "Application_Number": "LCA18-0003514",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002868",
   "Application_Number": "LCA19-0002868",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001348",
   "Application_Number": "LCA18-0001348",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002817",
   "Application_Number": "LCA18-0002817",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002660",
   "Application_Number": "LCA18-0002660",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003170",
   "Application_Number": "LCA18-0003170",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000316",
   "Application_Number": "LCA19-0000316",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0000223",
   "Application_Number": "LCA18-0000223",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003307",
   "Application_Number": "LCA18-0003307",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000589",
   "Application_Number": "LCA19-0000589",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "No",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005310",
   "Application_Number": "LCA19-0005310",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003219",
   "Application_Number": "LCA18-0003219",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001346",
   "Application_Number": "LCA18-0001346",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002194",
   "Application_Number": "LCA18-0002194",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000333",
   "Application_Number": "LCA19-0000333",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000696",
   "Application_Number": "LCA19-0000696",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002333",
   "Application_Number": "LCA19-0002333",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001641",
   "Application_Number": "LCA19-0001641",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "No",
   "Composting_Area": "No",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "No",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0003373",
   "Application_Number": "LCA19-0003373",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001879",
   "Application_Number": "LCA19-0001879",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003436",
   "Application_Number": "LCA18-0003436",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003249",
   "Application_Number": "LCA18-0003249",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003482",
   "Application_Number": "LCA18-0003482",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001777",
   "Application_Number": "LCA18-0001777",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000676",
   "Application_Number": "LCA19-0000676",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003133",
   "Application_Number": "LCA18-0003133",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002100",
   "Application_Number": "LCA19-0002100",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000899",
   "Application_Number": "LCA19-0000899",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001790",
   "Application_Number": "LCA18-0001790",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003202",
   "Application_Number": "LCA18-0003202",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001731",
   "Application_Number": "LCA19-0001731",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0003785",
   "Application_Number": "LCA19-0003785",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001694",
   "Application_Number": "lca19-0001694",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "N/A",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "N/A",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002595",
   "Application_Number": "LCA18-0002595",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003712",
   "Application_Number": "LCA18-0003712",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001540",
   "Application_Number": "LCA19-0001540",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002347",
   "Application_Number": "LCA19-0002347",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003119",
   "Application_Number": "LCA18-0003119",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003564",
   "Application_Number": "LCA18-0003564",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001603",
   "Application_Number": "LCA19-0001603",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002279",
   "Application_Number": "LCA19-0002279",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003250",
   "Application_Number": "LCA18-0003250",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002207",
   "Application_Number": "LCA19-0002207",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "No",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001583",
   "Application_Number": "LCA18-0001583",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0003256",
   "Application_Number": "LCA19-0003256",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0003221",
   "Application_Number": "LCA18-0003221",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004719",
   "Application_Number": "LCA19-0004719",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000808",
   "Application_Number": "LCA19-0000808",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001095",
   "Application_Number": "LCA19-0001095",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0002650",
   "Application_Number": "LCA18-0002650",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000972",
   "Application_Number": "LCA19-0000972",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002070",
   "Application_Number": "LCA19-0002070",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0001847",
   "Application_Number": "LCA19-0001847",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0002601",
   "Application_Number": "LCA19-0002601",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0003057",
   "Application_Number": "LCA19-0003057",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "N/A",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "N/A",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0003141",
   "Application_Number": "LCA19-0003141",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004464",
   "Application_Number": "LCA19-0004464",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "No",
   "Composting_Area": "No",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "No",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005092",
   "Application_Number": "LCA19-0005092",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0000639",
   "Application_Number": "LCA19-0000639",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004576",
   "Application_Number": "LCA19-0004576",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000327",
   "Application_Number": "LCA20-0000327",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0004913",
   "Application_Number": "LCA19-0004913",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000467",
   "Application_Number": "LCA20-0000467",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0001393",
   "Application_Number": "LCA18-0001393",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA19-0005619",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "No",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "No",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0000976",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": "Yes"
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0000666",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": "Yes"
 },
 {
   "License_Number": "CCL19-0000461",
   "Application_Number": "LCA19-0000461",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": "Yes"
 },
 {
   "License_Number": "CCL19-0005452",
   "Application_Number": "LCA19-0005452",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000287",
   "Application_Number": "LCA20-0000287",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL18-0000395",
   "Application_Number": "LCA18-0000395",
   "Premises Review Status": "Incomplete",
   "Processing_Area": "Yes",
   "Packaging_Area": "No",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "No",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0000017",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000177",
   "Application_Number": "LCA20-0000177",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000737",
   "Application_Number": "LCA20-0000737",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0001587",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0001817",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0001862",
   "Application_Number": "LCA20-0001862",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0002194",
   "Application_Number": "LCA20-0002194",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0002238",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0001586",
   "Application_Number": "LCA20-0001586",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": "Yes"
 },
 {
   "License_Number": "CCL20-0001837",
   "Application_Number": "LCA20-0001837",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": "Yes"
 },
 {
   "License_Number": "CCL19-0005197",
   "Application_Number": "LCA19-0005197",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": "Yes"
 },
 {
   "License_Number": "CCL20-0000431",
   "Application_Number": "LCA20-0000431",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0001306",
   "Application_Number": "LCA20-0001306",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000385",
   "Application_Number": "LCA20-0000385",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": "N/A"
 },
 {
   "License_Number": "CCL19-0000236",
   "Application_Number": "LCA19-0000236",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005189",
   "Application_Number": "LCA19-0005189",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0000936",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000479",
   "Application_Number": "LCA20-0000479",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000329",
   "Application_Number": "LCA20-0000329",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0001455",
   "Application_Number": "LCA20-0001455",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0000755",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0001738",
   "Application_Number": "LCA20-0001738",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0001073",
   "Application_Number": "LCA20-0001073",
   "Premises Review Status": "Complete",
   "Processing_Area": "yes",
   "Packaging_Area": "yes",
   "Composting_Area": "n/a",
   "Cannabis_Waste_Area": "yes",
   "Harvest_Storage_Area": "yes",
   "Designated shared area(s)": "n/a",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "",
   "Application_Number": "LCA20-0000816",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "Yes",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL19-0005524",
   "Application_Number": "LCA19-0005524",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000325",
   "Application_Number": "LCA20-0000325",
   "Premises Review Status": "",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0001631",
   "Application_Number": "LCA20-0001631",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "N/A",
   "Composting_Area": "Yes",
   "Cannabis_Waste_Area": "N/A",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 },
 {
   "License_Number": "CCL20-0000355",
   "Application_Number": "LCA20-0000355",
   "Premises Review Status": "Complete",
   "Processing_Area": "Yes",
   "Packaging_Area": "Yes",
   "Composting_Area": "N/A",
   "Cannabis_Waste_Area": "Yes",
   "Harvest_Storage_Area": "Yes",
   "Designated shared area(s)": "N/A",
   "Common Use Area(s)": ""
 }
]
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
	logDebug("ERROR: BATCH_PREM Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{ 
	var recCnt = 0;
	var rejCnt = 0;
	for (i in PREM) {
		if(!matches(PREM[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(PREM[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("PREM row for " + PREM[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(PREM[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("PREM row for " + PREM[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		recCnt++;;
		editAppSpecific("Premises Diagram Review Status",PREM[i]["Premises Review Status"]);
		editAppSpecific("Composting area",PREM[i]["Composting area (if applicable)?"]);
		editAppSpecific("Cannabis Waste Area",PREM[i]["Cannabis Wase Area (if different than composting)?"]);
		editAppSpecific("Designated shared area(s)",PREM[i]["Designated shared area(s)"]);
		editAppSpecific("Common Use Area(s)",PREM[i]["Common Use Area(s)"]);
		editAppSpecific("Processing Area-P",PREM[i]["Processing_Area"]);
		editAppSpecific("Packaging Area-P",PREM[i]["Packaging_Area"]);
		editAppSpecific("Harvest Storage Area-P",PREM[i]["Harvest_Storage_Area"]);

	}
	logDebug("Total Records Processed : " + PREM.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: BATCH_PremProc: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
