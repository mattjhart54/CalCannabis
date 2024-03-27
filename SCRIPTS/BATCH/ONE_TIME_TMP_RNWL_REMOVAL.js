/*------------------------------------------------------------------------------------------------------/
| Program: PERMIT_ONEYEAR_INSPECTION.js  Trigger: Batch
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
maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_BATCH"));


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

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = aa.env.getValue("showDebug").substring(0,1).toUpperCase().equals("Y");

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


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;


var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING","RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));

var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var AInfo = new Array();

var appGroup = "Licenses";
var appTypeType = "Cultivator";
var appSubtype = "License";
var appCategory = "Renewal";
var appType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;
arrProcessAppList = "Renewal";

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
	
	var tmpArray = [];
	var tmpCount = 0;
	
	var getCapResult = aa.cap.getByAppType(appGroup,appTypeType);
		
	if (getCapResult.getSuccess()){
		var apsArray = getCapResult.getOutput();
		for (aps in apsArray){
			var myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
			b1CapId = apsArray[aps].getCapID();
			var capIDString = b1CapId.getCustomID(); 
			
			appTypeResult = myCap.getCapType();   // Get CapTypeModel from CapScriptModel
			appTypeString = appTypeResult.toString();
			appTypeArray = appTypeString.split("/");	
			
			if (appTypeArray[3] != "Renewal") {
				continue;
			}else{	
				if (capIDString.indexOf("TMP") > 0){
					var renCap = aa.cap.getCap(b1CapId).getOutput();
					if (renCap.getCapModel().getAuditStatus() == "A"){
						var capResults = aa.cap.getCapID(capIDString);
						if (capResults.getSuccess()){
							var capIdModel=capResults.getOutput();	
							var licNum = getAppSpecific("License Number",b1CapId);
							if (!matches(licNum,null,undefined,"")){
								var parCapId = getApplication(licNum);
								if  (!matches(parCapId,null,undefined,"")){
									var b1ExpResultRec=aa.expiration.getLicensesByCapID(parCapId);									
									if(b1ExpResultRec.getSuccess()){
										b1ExpResult=b1ExpResultRec.getOutput();
										var b1Status = b1ExpResult.getExpStatus();
										logDebug("Record Number: : " + parCapId.getCustomID() + " Exp Status" + b1Status);
										if (b1Status == "About to Expire"){
											renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parCapId);
											if (renewalCapProject != null) {
												var renCapId = renewalCapProject.getCapID();
												var renCapIDString = String(renCapId);
												var b1CapIdString = String(b1CapId);
												var renewalCap = aa.cap.getCap(renCapId).getOutput();
												var capIdStatusClass = getCapIdStatusClass(renCapId);
												if (capIdStatusClass == "INCOMPLETE EST"){
													if (renCapIDString != b1CapIdString){
														if (capIDString.indexOf("-R") == -1){
															tmpArray.push(capIDString);
															tmpCount++;
															aa.cap.updateAccessByACA(b1CapId,"N");
															renCap.getCapModel().setAuditStatus("I");
															aa.cap.editCapByPK(renCap.getCapModel());
															logDebug("Removed TMP Record from " + parCapId.getCustomID());
														}
													}
												}
											}else{
												if (capIDString.indexOf("-R") == -1){
													tmpArray.push(capIDString);
													tmpCount++;
													aa.cap.updateAccessByACA(b1CapId,"N");
													renCap.getCapModel().setAuditStatus("I");
													aa.cap.editCapByPK(renCap.getCapModel());
													logDebug("Removed TMP Record from " + parCapId.getCustomID());
												}
											}
												
										}else{
											if (capIDString.indexOf("-R") == -1){
												tmpArray.push(capIDString);
												tmpCount++;
												aa.cap.updateAccessByACA(b1CapId,"N");
												renCap.getCapModel().setAuditStatus("I");
												aa.cap.editCapByPK(renCap.getCapModel());
												logDebug("Removed TMP Record from " + parCapId.getCustomID());
											}
										}	
									}
								}else{
									if (capIDString.indexOf("-R") == -1){
										tmpArray.push(capIDString);
										tmpCount++;
										aa.cap.updateAccessByACA(b1CapId,"N");
										renCap.getCapModel().setAuditStatus("I");
										aa.cap.editCapByPK(renCap.getCapModel());
									}
								}
							}
						}
					}
				}
			}
		}
	}
	logDebug("Qualifying Records: " + tmpCount);
	logDebug("TMPS Deleted: " + tmpArray);
}


