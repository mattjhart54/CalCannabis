/*-----------------------------------------------------------------
	Generate the Invoice and email to the DRP
------------------------------------------------------------------*/
var maxSeconds = 4 * 60;				// number of seconds allowed for batch processing, usually < 5*60
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = true;	// Use Group name when populating Task Specific Info Values
var currentUserID = "ADMIN";
var publicUser = null;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var showDebug = true;	

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var startDate = new Date();
var startTime = startDate.getTime();
var timeExpired = false;
var message = "";						// Message String
var debug = "";							// Debug String
var br = "<BR>";						// Break Tag
var emailText = "";
var catAPIChunkSize = 10;

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
try{
//---------------------------------------

	var licCap = "" + aa.env.getValue("licCap");
	var invNbr = "" + aa.env.getValue("invNbr");	
	var currentUserID = "" + aa.env.getValue("currentUserID");
	var reportName = "CDFA_INVOICE_PARAMS";
	var br = "<BR>";
	var eTxt = "";
	var sDate = new Date();
	var sTime = sDate.getTime();
//-----------------------

runReportAttach(capId,"CDFA_Invoice_Params","capID",capId.getCustomID(),"invoiceNbr", String(invNbr)),"agencyId", "CALCANNABIS";	
//----------------------- 
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	var eTime = (thisTime - sTime) / 1000
} catch(err){
	logDebug("An error has occurred in asyncRunCDFAInvoiceParamsRpt: " + err.message);
	logDebug(err.stack);
	aa.sendMail("calcannabislicensing@cdfa.ca.gov", "jshear@trustvip.com", "", "AN ERROR HAS OCCURRED IN asyncRunInvoiceParamsRpt: ",  tmpID + br + "altId: " + licCap + br +  eTxt);
}
 function runReportAttach(itemCapId,aaReportName)
	{
	// optional parameters are report parameter pairs
	// for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");
	

	var reportName = aaReportName;

	reportResult = aa.reportManager.getReportInfoModelByName(reportName);

	if (!reportResult.getSuccess())
		{ logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); return false; }

	var report = reportResult.getOutput(); 

	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");

	report.setModule(appTypeArray[0]); 
	report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3()); 
	report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());

	var parameters = aa.util.newHashMap();              

	for (var i = 2; i < arguments.length ; i = i+2)
		{
		parameters.put(arguments[i],arguments[i+1]);
		logDebug("Report parameter: " + arguments[i] + " = " + arguments[i+1]);
		}	

	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
		{ 
		var reportResult = aa.reportManager.getReportResult(report); 

		logDebug("Report " + aaReportName + " has been run for " + itemCapId.getCustomID());

		}
	else
		logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
}