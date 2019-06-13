/*-----------------------------------------------------------------
	Generate the Amendment Letters
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
/*---------------------------------------
	aa.env.setValue("licCap", "CAL18-0000121");
	aa.env.setValue("amendCap", "CAL18-0000121-OC001");
	aa.env.setValue("currentUserID", "MHART");
	aa.env.setValue("reportName", "Amendment Owner Change New");
	aa.env.setValue("email", "mhart@trustvip.com");
*/
	var reportName = "" + aa.env.getValue("reportName");
	var amendCap = "" + aa.env.getValue("amendCap");
	var licCap = "" + aa.env.getValue("licCap");
	var currentUserID = "" + aa.env.getValue("currentUserID");
	var email = "" + aa.env.getValue("email");
	var br = "<BR>";
	var eTxt = "";
	var sDate = new Date();
	var sTime = sDate.getTime();
//-----------------------
// Run the amendment letter report
	reportResult = aa.reportManager.getReportInfoModelByName(reportName);
	if (!reportResult.getSuccess()){
		logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
		eTxt+="**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage() +br; 
	}
	var report = reportResult.getOutput(); 
	var tmpID = aa.cap.getCapID(amendCap).getOutput(); 
	cap = aa.cap.getCap(tmpID).getOutput();
	appTypeResult = cap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
	report.setModule(appTypeArray[0]); 
	//report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3()); 
	report.setCapId(tmpID.getID1() + "-" + tmpID.getID2() + "-" + tmpID.getID3()); 
	report.getEDMSEntityIdModel().setAltId(amendCap);
	eTxt+="reportName: " + reportName + br;
	eTxt+="reportName: " + typeof(reportName) + br;
	var parameters = aa.util.newHashMap(); 
	parameters.put("p2value",amendCap);
	parameters.put("p1value",licCap);
	parameters.put("p3value",email);
	report.setReportParameters(parameters);
	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) { 
		var reportResult = aa.reportManager.getReportResult(report); 
		if(reportResult) {
			reportOutput = reportResult.getOutput();
			var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
			logDebug("Report '" + reportName + "' has been run for " + amendCap);
			eTxt+=("Report '" + reportName + "' has been run for " + amendCap) +br;
		}else {
			logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
		}
	}else{
		logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
		eTxt+="No permission to report: "+ reportName + " for user: " + currentUserID;
	}

//----------------------- 
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	var eTime = (thisTime - sTime) / 1000
} catch(err){
	logDebug("An error has occurred in asyncRunSubmittedApplicRpt: " + err.message);
	logDebug(err.stack);
	aa.sendMail("calcannabislicensing@cdfa.ca.gov", "mhart@trustvip.com", "", "AN ERROR HAS OCCURRED IN asyncRunAmendmentLetter: ",  tmpID + br +"elapsed time: " + eTime + " seconds. " + br + "altId: " + amendCap + br + "avpre6" + br + eTxt);
}