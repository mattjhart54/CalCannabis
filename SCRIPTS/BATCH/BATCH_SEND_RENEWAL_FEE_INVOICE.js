/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_SEND_RENEWAL_FEE_INVOICE
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to send the receipt fpr the license fee paid 
| Batch job name: LCA_SEND_INVOICE
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
aa.env.setValue("lookAheadDays", "-2");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("emailTemplate","LCA_GENERAL_NOTIFICATION");
aa.env.setValue("sendEmailToContactTypes", "Designated Responsible Party");
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("reportName", "CDFA Receipt Batch");
*/
var lookAheadDays = getParam("lookAheadDays");
var emailAddress = getParam("emailAddress");			// email to send report
var emailTemplate = getParam("emailTemplate");
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");
var sysFromEmail = getParam("sysFromEmail");
var reportName = getParam("reportName");

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
var parmDate = dateAdd(null,parseInt(lookAheadDays));

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
	try {
		var emailCnt = 0;
		var invCnt = 0;
		var startDate = new Date(parmDate);
		var yy = startDate.getFullYear().toString().substr(2,2);
		var mm = (startDate.getMonth() +1 ).toString(); //getMonth() returns (0 - 11)
		if (mm.length<2)
			mm = "0"+mm;
		var dd = startDate.getDate().toString();
		if (dd.length<2)
			dd = "0"+dd;
		var setName = "RENEWAL_INVOICE" + "_" + yy + mm + dd;
		invDate = "20" + yy + "-"+ mm + "-" + dd;
		logDebug("Set Name " + setName + " Invoice Date " + invDate);
		var memberResult = aa.set.getCAPSetMembersByPK(setName);
		if (!memberResult.getSuccess()) {
			logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage());
		}else{
			var members = memberResult.getOutput().toArray();
			var setSize = members.length;
			for(x in members) {
				capId = aa.cap.getCapID(members[x].ID1, members[x].ID2, members[x].ID3).getOutput();
				var altId = capId.getCustomID();
				reportResult = aa.reportManager.getReportInfoModelByName(reportName);
				if (!reportResult.getSuccess()){
					logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
				}
				var rFiles = [];
				var report = reportResult.getOutput(); 
				cap = aa.cap.getCap(capId).getOutput();
				var appGroup = "Licenses"
				report.setModule(appGroup); 
				report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3()); 
				report.getEDMSEntityIdModel().setAltId(altId);
				iListResult = aa.finance.getInvoiceByCapID(capId,null);
				if (iListResult.getSuccess()) {
					iList = iListResult.getOutput();
					invNbr = "";
					iFound = false;
					for (iNum in iList){
						invNbr = iList[iNum].getInvNbr();
						logDebug("invNbr: " + invNbr);
						if (!matches(invNbr,null,undefined,"")){
							iFound = true;
							var parameters = aa.util.newHashMap(); 
							parameters.put("capID",altId);
							parameters.put("invoiceNbr", String(invNbr));
							parameters.put("agencyId", "CALCANNABIS");
							report.setReportParameters(parameters);
							var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
							if(permit.getOutput().booleanValue()) { 
								var reportResult = aa.reportManager.getReportResult(report); 
								if(reportResult) {
									reportOutput = reportResult.getOutput();
									var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
									rFile=reportFile.getOutput();
									rFiles.push(rFile);
									++invCnt;
									logDebug("Report '" + reportName + "' has been run for " + altId);
								}else {
									logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
								}
							}else{
								logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
							}
						}
					}
					if(iFound){
						var conTypeArray = sendEmailToContactTypes.split(",");
						var	conArray = getContactArray(capId);
						var contactFound = false;
						for (thisCon in conArray) {
							thisContact = conArray[thisCon];
							if (exists(thisContact["contactType"],conTypeArray)){
								contactFound = true;
								var conEmail = true;
								priContact = getContactObj(capId,thisContact["contactType"]);
								logDebug("Processing record " + altId); 
								var fromEmail = "calcannabislicensing@cdfa.ca.gov";
								var eParams = aa.util.newHashtable(); 
								addParameter(eParams, "$$altID$$", altId);
								addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
								addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
								var priEmail = ""+priContact.capContact.getEmail();
								logDebug(" Sending invoice to " + priContact.capContact.getEmail());
								emailCnt++;
								sendApprovalNotification(fromEmail,priEmail,"","LCA_GENERAL_NOTIFICATION",eParams, rFiles,capId);
							}
						}
					}else{
						logMessage("Invoice not found");					
					}
				}
			}
			logDebug("Total Set Members : " + setSize);
			logDebug("invoice Attached: " + invCnt);
			logDebug("Emails Sent: " + emailCnt);
		}		
	}catch (err){
		logDebug("ERROR: " + err.message + " In " + batchJobName);
		logDebug("Stack: " + err.stack);
	}
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