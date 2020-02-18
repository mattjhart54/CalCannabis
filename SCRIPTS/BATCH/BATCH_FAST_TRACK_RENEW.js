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
maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
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

var appGroup = "Licenses";							//   app Group to process {Licenses}
var appTypeType = "Cultivator";						//   app type to process {Rental License}
var appSubtype = "License";						//   app subtype to process {NA}
var appCategory = "Renewal";						//   app category to process {NA}
var emailAddress = getParam("emailAddress");

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;
var currentUserID = "ADMIN";
var useAppSpecificGroupName = false;


var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING","RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));


var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();


if (appGroup == "*")
	appGroup = "";

if (appTypeType == "*")
	appTypeType = "";

if (appSubtype == "*")
	appSubtype = "";

if (appCategory == "*")
	appCategory = "";

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
	var recordSkippedArray = [];
	var recordRenewArray = [];
	
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
		
		capId = aa.cap.getCapID(vCapList[x].getCapID().getID1(),vCapList[x].getCapID().getID2(),vCapList[x].getCapID().getID3()).getOutput();
		var capValue = aa.cap.getCap(capId).getOutput();
		altId = capId.getCustomID();
		var capStatus = aa.cap.getCap(capId).getOutput().getCapStatus();
		
		if (capValue.isCompleteCap()){
			if (!matches(capStatus,"Approved","Renewal Denied","Disqualified")){
				capFilterStatus++;
				var capDetailObjResult = aa.cap.getCapDetail(capId);
				if (capDetailObjResult.getSuccess()){
					capDetail = capDetailObjResult.getOutput();
					var balanceDue = capDetail.getBalance();
					if (balanceDue == 0){
						var wftaskStatusCheck = acceptaedTaskValue(capId);
						if(!isTaskActive("License Manager") && wftaskStatusCheck){
							vLicenseID = getParentLicenseCapID(capId);
							vIDArray = String(vLicenseID).split("-");
							vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
							if (vLicenseID){
								if (!vLicenseID.toString().contains("EST")){
									licCapStatus = aa.cap.getCap(vLicenseID).getOutput().getCapStatus();
									logDebug("Parent: " + vLicenseID.getCustomID() + " License Status: " + licCapStatus + " Renewal: " + altId);
									if (!matches(licCapStatus,"Cancelled","Expired","Inactive","Retired","Revoked","Surrendered","Suspended")){
										licAltId = vLicenseID.getCustomID();
										var caseVerify = licCaseCheck(vLicenseID);
										if (caseVerify){
											var condResult = aa.capCondition.getCapConditions(vLicenseID);
											if (condResult.getSuccess()){
												var capConds = condResult.getOutput();
												if (capConds.length > 0){
													var condVerified = true;
													for (cc in capConds){
														var thisCond = capConds[cc];
														var cStatusType = thisCond.getConditionStatusType();
														logDebug(thisCond.getConditionDescription());
														if (matches(thisCond.getConditionDescription(),"Local Non-Compliance","DOJ LiveScan Match") && cStatusType == "Applied"){
															condVerified = false;
															break;
														}
													}
													if(condVerified){
														processRenewal(capId);
														recordRenewArray.push(altId);
														capCount++;
													}else{
														recordSkippedArray.push(altId);
														logDebug("Skipping Record " + altId + " License Record has Condition " + thisCond.getConditionDescription() + " applied.");
													}
												}else{
													processRenewal(capId);
													recordRenewArray.push(altId);
													capCount++;
												}
											}
										}else{
											logDebug("Skipping Record " + altId + " License Record has a License Case that does not meet criteria.");
											recordSkippedArray.push(altId);
											continue;
										}
									}else{
										logDebug("Skipping Record " + altId + " License Record has a Status of " + licCapStatus);
										recordSkippedArray.push(altId);
										continue;
									}
								}
							}
						}else{
							logDebug("Skipping Record, " + altId +" workflow status does not meet criteria");
							recordSkippedArray.push(altId);
							continue;
						}
					}else{
						logDebug(altId + " has Fee Due, skipping Record");
						recordSkippedArray.push(altId);
						continue;
					}
				}
			}
		}
	}
	logDebug("*************************Batch Job Stats******************************");
	logDebug("Total Open Renewals: " + capFilterStatus);
	logDebug("Total CAPS processed: " + capCount);
	logDebug("Processed Following Records: " + recordRenewArray.join('\n'));
	logDebug("Skipped Following Records: " + recordSkippedArray.join('\n'));
}catch (err){
	logDebug("BATCH_PROVISIONAL_RENEWAL_MISSING_SA: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}


function licCaseCheck(vLicenseID){
	cIds = getChildren("Licenses/Cultivator/License Case/*",vLicenseID);
	for (x in cIds){
		caseCapId = cIds[x];
		var caseCapValue = aa.cap.getCap(caseCapId).getOutput();
		var caseAltID = caseCapId.getCustomID();
		var caseCapStatus = aa.cap.getCap(caseCapId).getOutput().getCapStatus();
		if (!matches(caseCapStatus,"Resolved","Closed") && getAppSpecific("Case Renewal Type",caseCapId) != "Renewal Allowed"){
			return false;
		}
	}
	return true;
}
function acceptaedTaskValue(capId){

	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess()){
		var wfObj = workflowResult.getOutput();
	}else{ 
		logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
	}
	var fTask;
	var stepnumber;
	var wftask;
	var taskArray = ['Renewal Review','Provisional Renewal Review','Annual Renewal Review'];
	for (i in wfObj) {
		fTask = wfObj[i];
		wftask = fTask.getTaskDescription();
		stepnumber = fTask.getStepNumber();
		if (exists(wftask,taskArray)) {
			if(fTask.getActiveFlag() == "Y" && !matches(fTask.getDisposition(),"Additional Information Needed","Under Review")) {
				return true;
			}
		}
	}
	return false;
}
 function sendApprovalNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{
	itemCap = arguments[6]; 
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

function processRenewal(renCapId){
	logDebug("*****************************Processing Renewal Record " + altId + " for License Record " + licAltId + "****************************");
// Get current expiration date.
		vLicenseObj = new licenseObject(null, vLicenseID);
		vExpDate = vLicenseObj.b1ExpDate;
		vExpDate = new Date(vExpDate);
// Extend license expiration by 1 year
		vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
// Update license expiration date
		vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
// Set license record expiration and status to active
			var b1ExpResult = aa.expiration.getLicensesByCapID(vLicenseID);
			if(b1ExpResult.getSuccess()){
				logDebug("Setting Exp Status");
				b1ExpResult = b1ExpResult.getOutput();
				b1ExpResult.setExpStatus("Active");
				aa.expiration.editB1Expiration(b1ExpResult.getB1Expiration());
				logDebug("Exp Status: " + b1ExpResult.getExpStatus());
			}
			updateAppStatus("Active","License Renewed",vLicenseID);
// Update the Cultivation Type on the license record
		if(getAppSpecific("Designation Change",capId) == "Yes") {
			editAppSpecific("Cultivator Type",getAppSpecific("Designation Type",capId),vLicenseID);
			editAppName(getAppSpecific("Designation Type",capId) + " - " + getAppSpecific("License Type",capId),vLicenseID);
		}
//Set renewal to complete, used to prevent more than one renewal record for the same cycle
		renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
		if (renewalCapProject != null) {
			renewalCapProject.setStatus("Complete");
			renewalCapProject.setRelationShip("R");  // move to related records
			aa.cap.updateProject(renewalCapProject);
		}
		
//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
		if (getAppSpecific("License Issued Type",capId) == "Provisional"){
			var approvalLetter = "Provisional Renewal Approval";
		}else{
			var approvalLetter = "Approval Letter Renewal";
		}
		//*****************Forcing Report Run Bypassing asyncRunOfficialLicenseRpt**********************************
			var reportName = "Official License Certificate";
			var appCap = altId;
			var licCap = licAltId;
			var licType = "";	
			var approvalLetter = approvalLetter;
			var emailTemplate = "LCA_RENEWAL_APPROVAL";
			var reason = "";
			var currentUserID = "ADMIN";
			var contType = "Designated Responsible Party";
			var fromEmail = "calcannabislicensing@cdfa.ca.gov";
			var br = "<BR>";
			var eTxt = "";
			var sDate = new Date();
			var sTime = sDate.getTime();
		//-----------------------
			var rFiles = [];
		// Run the official license report
			reportResult = aa.reportManager.getReportInfoModelByName(reportName);
			if (!reportResult.getSuccess()){
				logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
				eTxt+="**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage() +br; 
			}
			var report = reportResult.getOutput(); 
			var tmpID = aa.cap.getCapID(licCap).getOutput(); 
			cap = aa.cap.getCap(tmpID).getOutput();
			appTypeResult = cap.getCapType();
			appTypeString = appTypeResult.toString(); 
			appTypeArray = appTypeString.split("/");
			report.setModule(appTypeArray[0]); 
			//report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3()); 
			report.setCapId(tmpID.getID1() + "-" + tmpID.getID2() + "-" + tmpID.getID3()); 
			report.getEDMSEntityIdModel().setAltId(licCap);
			eTxt+="reportName: " + reportName + br;
			eTxt+="reportName: " + typeof(reportName) + br;
			var parameters = aa.util.newHashMap(); 
			parameters.put("altId",licCap);
			report.setReportParameters(parameters);
			var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
			if(permit.getOutput().booleanValue()) { 
				var reportResult = aa.reportManager.getReportResult(report); 
				if(reportResult) {
					reportOutput = reportResult.getOutput();
					var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
					rFile=reportFile.getOutput();
					rFiles.push(rFile);
					logDebug("Report '" + reportName + "' has been run for " + licCap);
					eTxt+=("Report '" + reportName + "' has been run for " + licCap) +br;
				}else {
					logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
				}
			}else{
				logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
				eTxt+="No permission to report: "+ reportName + " for user: " + currentUserID;
			}
		// Run the Approval Letter
			var tmpID = aa.cap.getCapID(appCap).getOutput(); 
			cap = aa.cap.getCap(tmpID).getOutput();
			appTypeResult = cap.getCapType();
			appTypeString = appTypeResult.toString(); 
			appTypeArray = appTypeString.split("/");
			capStatus = cap.getCapStatus();
			
			if(!matches(approvalLetter,"",null,undefined)) {
				reportName = approvalLetter;
				reportResult = aa.reportManager.getReportInfoModelByName(reportName);
				if (!reportResult.getSuccess()){
					logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
					eTxt+="**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage() +br; 
				}
				var report = reportResult.getOutput(); 
				report.setModule(appTypeArray[0]); 
				//report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3()); 
				report.setCapId(tmpID.getID1() + "-" + tmpID.getID2() + "-" + tmpID.getID3()); 
				report.getEDMSEntityIdModel().setAltId(appCap);
				eTxt+="reportName: " + reportName + br;
				eTxt+="reportName: " + typeof(reportName) + br;
				var parameters = aa.util.newHashMap(); 
				parameters.put("p1value",appCap);
				parameters.put("p2value","Designated Responsible Party");
				parameters.put("p3value","Mailing");
				report.setReportParameters(parameters);
				var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
				eTxt+="Has Permission: " + permit.getOutput().booleanValue() + br;
				if(permit.getOutput().booleanValue()) { 
					var reportResult = aa.reportManager.getReportResult(report); 
					eTxt+="Get Report: " + reportResult.getOutput() + br;
					if(reportResult) {
						reportOutput = reportResult.getOutput();
						var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
						eTxt+="Store Report to Disk: " + reportFile + br;
						rFile=reportFile.getOutput();
						rFiles.push(rFile);
						logDebug("Report '" + reportName + "' has been run for " + appCap);
						eTxt+=("Report '" + reportName + "' has been run for " + appCap) +br;
					}else {
						logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
					}
				}else{
					logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
					eTxt+="No permission to report: "+ reportName + " for user: " + currentUserID;
				}
			}
			var priContact = getContactObj(tmpID,contType);
			if(priContact){
				var eParams = aa.util.newHashtable(); 
				addParameter(eParams, "$$altID$$", tmpID.getCustomID());
				addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
				addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
				addParameter(eParams, "$$parentId$$", licCap);
				addParameter(eParams, "$$licType$$", licType);
				addParameter(eParams, "$$reason$$", reason);
				var priEmail = ""+priContact.capContact.getEmail();
				sendApprovalNotification(fromEmail,priEmail,"",emailTemplate,eParams, rFiles,tmpID);
			}else{
				logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
			}
		
		//*********************************************************************************************************
		var priContact = getContactObj(renCapId,"Designated Responsible Party");
	// If DRP preference is Postal add license record to Annual/Provisional Renewal A set
		if(priContact){
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					
					if (getAppSpecific('License Issued Type',capId) == "Provisional") {
						var sName = createSet("PROVISIONAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
					}
					if (getAppSpecific('License Issued Type',capId) == "Annual"){
						var sName = createSet("ANNUAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
					}
					if(sName){
						setAddResult=aa.set.add(sName,vLicenseID);
						if(setAddResult.getSuccess()){
							logDebug(renCapId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
		editAppSpecific("Fast Track","CHECKED",capId);
		if (isTaskActive("Renewal Review")){ 
			closeTask("Renewal Review","Approved","","");
		}
		if (isTaskActive("Provisional Renewal Review")){ 
			closeTask("Provisional Renewal Review","Approved","","");
		}
		if (isTaskActive("Annual Renewal Review")){ 
			closeTask("Annual Renewal Review","Approved","","");
		}
		//updateAppStatus("Approved","");
// Add record to the CAT set
		addToCat(vLicenseID);
	}

