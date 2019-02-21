/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_DISQUALIFY_EXISTING_AMENDMENTS.js
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| User Story 5869 Run once to disqualify existing amendments where the main application has already been disqualified. 
| Batch job name: LCA_Disqualify_Amendments
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
var maxSeconds = 10 * 60;
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
aa.env.setValue("newAppStatus", "Disqualified");
aa.env.setValue("appStatus", "Disqualified");
aa.env.setValue("emailAddress", "eshanower@trustvip.com");
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
*/
var emailAddress = getParam("emailAddress");
var appStatus = getParam("appStatus");
var newAppStatus = getParam("newAppStatus");
var sysFromEmail = getParam("sysFromEmail");

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
try{
	
	projectbiz = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.ProjectBusiness").getOutput();
	acaDocBiz = aa.proxyInvoker.newInstance("com.accela.aa.ads.ads.EDMS4ACABusiness").getOutput();
	
	var capFilterAppType = 0
	var capCount = 0;
	var convertedCount = 0;
	var disqualifiedCount = 0;
	var setCreated = false;
	var currDate = new Date();
	var capList = new Array();
	capTypeModel = aa.cap.getCapTypeModel().getOutput();
	capModel = aa.cap.getCapModel().getOutput();
	capModel.setCapType(capTypeModel);
	capModel.setCapStatus(appStatus);

// query a list of records based on the above criteria
	capListResult = aa.cap.getCapIDListByCapModel(capModel);
	if (capListResult.getSuccess()) {
		capList = capListResult.getOutput();
	}else{
		logDebug("Error retrieving records: " + capListResult.getErrorMessage());
		}
	if (capList.length > 0) {
		logDebug("Found " + capList.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
	for (myCapsXX in capList) {
		capId = aa.cap.getCapID(capList[myCapsXX].ID1, capList[myCapsXX].ID2, capList[myCapsXX].ID3).getOutput();
		if (!capId) {
			logDebug("Could not get Cap ID");
			continue;
		}
		altId = capId.getCustomID();
		
//	if(altId != "LCA18-0000131") continue;
				
		cap = aa.cap.getCap(capId).getOutput();	
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
//	Exclude all except submitted Applications and Owner Applications as parents
		if((appTypeArray[3] != "Application" && appTypeArray[3] != "Owner Application") || (altId.indexOf("TMP") >= 0)) {
				capFilterAppType++;
				continue;
		}

		logDebug("----Processing children of record " + altId + br);
		capCount++;
		
//	Close Amendment records when parent record is Disqualified. 
		if (capStatus && capStatus == "Disqualified") {
			holdId = capId;
			childArray = getChildren("Licenses/Cultivator/*/Amendment");
			for (x in childArray) {
				capId = childArray[x];
				childCap = aa.cap.getCap(capId).getOutput();
				childCapStatus = childCap.getCapStatus();
				var childIdStatusClass = getCapIdStatusClass(capId);
				if(childIdStatusClass == "INCOMPLETE CAP") {
					capModelChild = aa.cap.getCapViewBySingle4ACA(capId);
					// start catch error before going to convert function
					try {
						var originalCAPID = capModel.getCapID();
					} catch(err) {
						logDebug("Cannot convert child record: " + childCap.getCustomID() + " :: " + err.message());
						continue;
					}					
					// end catch error before going to convert function
					convert2RealCAP2(capModelChild, "", altId);
					logDebug("Converted: " + newAltId);
					convertedCount++;
				}
				else {
					var childCap = aa.cap.getCap(capId).getOutput();
					var childCapStatus = childCap.getCapStatus();
					if (matches(childCapStatus,null,"","Pending")){
						updateAppStatus(newAppStatus, "set by " + batchJobName +  " batch");
						deactivateTask("Amendment Review");
						logDebug("Updated submitted record: " + capId.getCustomID());
						disqualifiedCount++;
					}
					else {
						logDebug("Submitted DEF record " + capId.getCustomID() + " not updated due to Status: " + childCapStatus);
					}
				}
			}
			capId = holdId;
		}
	}

	logDebug("Total CAPS qualified : " + capList.length);
	logDebug("Ignored due to Record Type: " + capFilterAppType);
	logDebug("Total CAPS processed: " + capCount);
	logDebug("Total unsubmitted records converted and disqualified: " + convertedCount);
	logDebug("Total submitted records disqualified: " + disqualifiedCount);

}	catch (err){
	logDebug("ERROR: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
	}
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function convert2RealCAP2(capModel, transactions, parentId)
{
	var originalCAPID = capModel.getCapID();
	var originalRecId = capModel.getCapID().getCustomID();
	var originalCAP = capModel;
	var capWithTemplateResult = aa.cap.getCapWithTemplateAttributes(capModel);
	var capWithTemplate = null;
	if (capWithTemplateResult.getSuccess()) 	{
		capWithTemplate = capWithTemplateResult.getOutput();
	}
	else {
		logDebug(capWithTemplateResult.getErrorMessage());
		return null;
	}
	
// 2. Convert asi group.
	aa.cap.convertAppSpecificInfoGroups2appSpecificInfos4ACA(capModel);
	if (capModel.getAppSpecificTableGroupModel() != null) {
			aa.cap.convertAppSpecTableField2Value4ACA(capModel);
	}
	
// 3. Trigger event before convert to real CAP.
	aa.cap.runEMSEScriptBeforeCreateRealCap(capModel, null);
	
// 4. Convert to real CAP.
	convertResult = aa.cap.createRegularCapModel4ACA(capModel, null, false, false);
	if (convertResult.getSuccess()) {
		capModel = convertResult.getOutput();
		logDebug("Commit OK: Convert partial CAP to real CAP successful: " + originalRecId + " to " + capModel.getCapID().getCustomID());
	}
	else {
		logDebug(convertResult.getErrorMessage());
		return null;
	}
// 5. Transfer docs
	var targetCaps = aa.util.newArrayList();
	targetCaps.add(capModel.getCapID());
	acaDocBiz.transferDocument(aa.getServiceProviderCode(), originalCAPID, targetCaps,"Licenses", "ADMIN");
	
// 6. Create template after convert to real CAP.
	aa.cap.createTemplateAttributes(capWithTemplate, capModel);

// update record after convert to real CAP.

	holdChildId = capId;
	capId = capModel.getCapID();
	updateAppStatus(newAppStatus, "set by " + batchJobName +  " batch", capId);
	deactivateTask("Amendment Review");
	newAltId = getAppSpecific("AltId", capId);
	var updAltId = aa.cap.updateCapAltID(capId,newAltId);
	if(!updAltId.getSuccess()){
		logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
	}else{
		logDebug("Deficiency record ID updated to : " + newAltId);
	}
	addParent(parentId);
	capid = holdChildId;
}
