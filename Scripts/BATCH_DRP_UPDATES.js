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
var appSubtype = "Amendment"						//   app subtype to process {NA}
var appCategory = "DRP Declaration"						//   app category to process {NA}
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
	var processedArray = [];
	
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
		var editCount = false;
		capId = aa.cap.getCapID(vCapList[x].getCapID().getID1(),vCapList[x].getCapID().getID2(),vCapList[x].getCapID().getID3()).getOutput();
		if (String(capId.getCustomID()).substr(0,3) == "CCL"){
			var parentAltId = getAppSpecific("License Number",capId);
			if (matches(parentAltId,null,undefined,"")){logDebug(capId.getCustomID() + " Missing Parent ID"); continue;}
			parentId = aa.cap.getCapID(parentAltId).getOutput();
			appIds = getChildren("Licenses/Cultivator/*/Application",parentId);
			for(a in appIds) {
				decIds = getChildren("Licenses/Cultivator/Medical/Declaration",appIds[a]);
				for(d in decIds) {
					decId = decIds[d];
				}
			}
			var recordASIGroup = aa.appSpecificInfo.getByCapID(capId);
			if (recordASIGroup.getSuccess()){
				var recordASIGroupArray = recordASIGroup.getOutput();
				for (i in recordASIGroupArray) {
					var group = recordASIGroupArray[i];
					var groupName = String(group.getGroupCode());
					var recordField = String(group.getCheckboxDesc());
					var subGroup = String(group.getCheckboxType());
					var fieldValue = String(group.getChecklistComment());
					var decValue = String(getAppSpecific(recordField,decId));
					if (matches(subGroup,"DISCLOSURES","DECLARATION")){
						if (!matches(recordField,"hide_da_disc","hide_da_dcl")){
							if(fieldValue != decValue){
								logDebug("Record: " + capId.getCustomID() + " Editing: " + recordField + ": " + fieldValue + " To: " + decValue);
								editAppSpecific(recordField,decValue,capId);
								if (processedArray.indexOf(String(capId.getCustomID())) < 0){
									processedArray.push(String(capId.getCustomID()));
								}
								editCount = true;
							}
						}
					}
				}
			}
			var appName = String(aa.cap.getCap(capId).getOutput().getSpecialText());
			var parentAppName = String(aa.cap.getCap(parentId).getOutput().getSpecialText());
			if (appName != parentAppName){
				editAppName(parentAppName);
				logDebug("Record: " + capId.getCustomID() + " appName: " + appName + " Edited to: " + parentAppName);
				editCount = true;
				if (processedArray.indexOf(String(capId.getCustomID())) < 0){
					processedArray.push(String(capId.getCustomID()));
				}
			}
			if (editCount){
				capFilterStatus++;
			}
		}
	}
	
	logDebug("Total Caps: " + capCount);
	logDebug("Number Caps Processed: " + capFilterStatus);
	logDebug("List of Caps Processed: " + processedArray);
}catch (err){
	logDebug("BATCH_DRP_Updates: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}