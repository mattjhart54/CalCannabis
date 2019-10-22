/*-----------------------------------------------------------------
	Generate the License Certificate for conversion and email to the DRP
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
var noticeDate = jsDateToMMDDYYYY(startDate);
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
	aa.env.setValue("oldLicNum", "PML18-0000293");
	aa.env.setValue("newLicNum", "CCL18-0000293");
	aa.env.setValue("currentUserID", "ADMIN");
	aa.env.setValue("reportName", "Official License Certificate");
	aa.env.setValue("contType", "Designated Responsible Party");
	aa.env.setValue("licStatus", "Active");
	aa.env.setValue("fromEmail","calcannabislicensing@cdfa.ca.gov");
*/
	var reportName = "" + aa.env.getValue("reportName");
	var oldLicNum = "" + aa.env.getValue("oldLicNum");
	var newLicNum = "" + aa.env.getValue("newLicNum");
	var licStatus = "" + aa.env.getValue("licStatus");	
	var currentUserID = "" + aa.env.getValue("currentUserID");
	var contType = "" + aa.env.getValue("contType");
	var sysFromEmail = "" + aa.env.getValue("fromEmail");
	var br = "<BR>";
	var eTxt = "";
	var sDate = new Date();
	var sTime = sDate.getTime();
//-----------------------
	var licCapId = aa.cap.getCapID(oldLicNum).getOutput();
	var rFiles = [];
	if(licStatus == 'Active') {
		reportResult = aa.reportManager.getReportInfoModelByName("Official License Certificate");
		if (!reportResult.getSuccess()){
			logDebug("**WARNING** couldn't load report " + "Official License Certificate" + " " + reportResult.getErrorMessage()); 
		}
		var report = reportResult.getOutput(); 
		report.setModule("Licenses"); 
		report.setCapId(licCapId.getID1() + "-" + licCapId.getID2() + "-" + licCapId.getID3()); 
		report.getEDMSEntityIdModel().setAltId(newLicNum);
		var parameters = aa.util.newHashMap(); 
		parameters.put("altId",newLicNum);
		report.setReportParameters(parameters);
		var permit = aa.reportManager.hasPermission("Official License Certificate",currentUserID); 
		if(permit.getOutput().booleanValue()) { 
			var reportResult = aa.reportManager.getReportResult(report); 
			if(reportResult) {
				reportOutput = reportResult.getOutput();
				var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
				rFile=reportFile.getOutput();
				rFiles.push(rFile);
	//			logDebug("Report '" + "Official License Certificate" + "' has been run for " + newLicNum);
			}else {
				logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
			}
		}else{
			logDebug("No permission to report: "+ "Official License Certificate" + " for user: " + currentUserID);
		}
	}

// Send notification and add record to set for manual notification if preferred channel is Postal
	if(licStatus == 'Active') {
		var notification = 'LCA_LICENSE_CONVERSION';
	}
	else {
		var notification = 'LCA_LICENSE_CONVERSION_INACTIVE';
	}
	var priContact = getContactObj(licCapId,"Designated Responsible Party");
	if(priContact){
		var eParams = aa.util.newHashtable(); 
		addParameter(eParams, "$$oldAltID$$", oldLicNum);
		addParameter(eParams, "$$newAltID$$", newLicNum);
		addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
		addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
		drpAddresses = priContact.addresses;
		var addrType = false;
		for (x in drpAddresses){
			thisAddr = drpAddresses[x];
			//lwacht 171214: should use mailing address if it exists
			if(thisAddr.getAddressType()=="Mailing"){
				addrType = "Mailing";
				addParameter(eParams, "$$address$$", thisAddr.addressLine1);
				addParameter(eParams, "$$cityStZip$$", thisAddr.city + ", " + thisAddr.state + " " + thisAddr.zip);
			}else{
				if(thisAddr.getAddressType()=="Business"){
					addrType = "Business";
					addParameter(eParams, "$$address$$", thisAddr.addressLine1);
					addParameter(eParams, "$$cityStZip$$", thisAddr.city + ", " + thisAddr.state + " " + thisAddr.zip);
				}else{
					if(thisAddr.getAddressType()=="Home"){
						addrType = "Home";
						addParameter(eParams, "$$address$$", thisAddr.addressLine1);
						addParameter(eParams, "$$cityStZip$$", thisAddr.city + ", " + thisAddr.state + " " + thisAddr.zip);
					}
				}
			}
		}
		addParameter(eParams, "$$date$$", noticeDate);
		var priEmail = ""+priContact.capContact.getEmail();
		sendApprovalNotification(sysFromEmail,priEmail,"",notification,eParams, rFiles,licCapId);
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(priChannel.indexOf("Postal") > -1 ){
				if(licStatus == 'Active')
					var sName = createSet("LICENSE CONVERSION NOTIFICATION","License Notifications", "New");
				else
					var sName = createSet("LICENSE CONVERSION NOTIFICATION INACTIVE","License Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,licCapId);
						if(setAddResult.getSuccess()){
							logDebug(licCapId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
			}
		}
	}
	else{
			logDebug("An error occurred retrieving the contactObj for Designated Responsible Party on record " + altId);
	}	
} catch(err){
	logDebug("An error has occurred in asyncRunOfficialLicenseRpt: " + err.message);
	logDebug(err.stack);
	aa.sendMail("calcannabislicensing@cdfa.ca.gov", "mhart@trustvip.com", "", "AN ERROR HAS OCCURRED IN asyncRunOfficialLicenseRpt: ",  licCapId + br + "altId: " + oldLicNum + br + eTxt);
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
function jsDateToMMDDYYYY(pJavaScriptDate)
	{
	//converts javascript date to string in MM/DD/YYYY format
	//
	if (pJavaScriptDate != null)
		{
		if (Date.prototype.isPrototypeOf(pJavaScriptDate))
	return (pJavaScriptDate.getMonth()+1).toString()+"/"+pJavaScriptDate.getDate()+"/"+pJavaScriptDate.getFullYear();
		else
			{
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
			}
		}
	else
		{
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
		}
	}