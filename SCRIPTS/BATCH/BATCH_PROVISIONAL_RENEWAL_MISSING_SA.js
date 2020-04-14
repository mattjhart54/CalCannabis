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
		var capValue = aa.cap.getCap(capId).getOutput();
		if (capValue.isCompleteCap() && getAppSpecific("License Issued Type",capId) == "Provisional"){
			if(appHasCondition("Application Condition","Applied","Provisional Renewal Missing Science Amendment",null)){
				logDebug("Provisional Renewal Missing Science Amendment Condition Applied to " + capId);
				vLicenseID = getParentLicenseCapID(capId);
				vIDArray = String(vLicenseID).split("-");
				vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
				renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
				if (matches(renewalCapProject,undefined,null,"")) {
					vLicenseID = getParent();
				}
				if (vLicenseID){
					if (String(vLicenseID.getCustomID()).substr(0,3) == "CCL"){
						logDebug("altID: " + vLicenseID.getCustomID());
						capFilterStatus++;
						var licCaseId = createChild("Licenses","Cultivator","License Case","NA","",vLicenseID);
						if (licCaseId){
							// Set alt id for the case record based on the number of child case records linked to the license record
							cIds = getChildren("Licenses/Cultivator/License Case/*",vLicenseID);
							if(matches(cIds, null, "", undefined)){
								amendNbr = "000" + 1;
							}else{
								var cIdLen = cIds.length
								if(cIds.length <= 9){
									amendNbr = "000" +  cIdLen;
								}else{
									if(cIds.length <= 99){
										amendNbr = "00" +  cIdLen;
									}else{
										if(cIds.length <= 999){
											amendNbr = "00" +  cIdLen;
										}else{
											amendNbr = cIdLen
										}
									}
								}
							}
							licCaseAltId = licCaseId.getCustomID();
							yy = licCaseAltId.substring(0,2);
							newAltId = vLicenseID.getCustomID() + "-LC"+ yy + "-" + amendNbr;
							var updateResult = aa.cap.updateCapAltID(licCaseId, newAltId);
							if (updateResult.getSuccess()){
								logDebug("Created License Case: " + newAltId + ".");
							}else{ 
								logDebug("Error renaming amendment record " + licCaseId);
							}
							// Copy the Designated resposible Party contact from the License Record to the Case record
							//copyContactsByType_rev(vLicenseID,licCaseId,"Designated Responsible Party");
							
							// Copy custom fields from the license record to the Case record
							holdId = capId;
							capId = vLicenseID;
							PInfo = new Array;
							loadAppSpecific(PInfo);
							capId = holdId;
							editAppSpecific("License Number",vLicenseID.getCustomID(),licCaseId);
							editAppSpecific("License Type",PInfo["License Type"],licCaseId);
							editAppSpecific("Legal Business Name",PInfo["Legal Business Name"],licCaseId);
							editAppSpecific("Premises City",PInfo["Premise City"],licCaseId);
							editAppSpecific("Premises County",PInfo["Premise County"],licCaseId);
							editAppSpecific("Local Authority Type",PInfo["Local Authority Type"],licCaseId);
							editAppSpecific("Case Renewal Type",caseTypeFieldValue,licCaseId);
							editAppSpecific("Case Description",caseDescFieldValue,licCaseId);
							editAppSpecific("Case Opened By",caseOpenByFieldValue,licCaseId);
							editAppSpecific("Priority",priorityFieldValue,licCaseId);
							editAppName(caseTypeFieldValue,licCaseId);
							editCapConditionStatus("Application Condition","Provisional Renewal Missing Science Amendment","Condition Met","Not Applied");
						}else{
							logDebug("Failed to create License Case Record for " + vLicenseID.getCustomID());
						}
					}
				}
			}
		}
	}
	
	logDebug("Total Renewal Caps: " + capCount);
	logDebug("Total CAPS processed: " + capFilterStatus);
}catch (err){
	logDebug("BATCH_PROVISIONAL_RENEWAL_MISSING_SA: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}