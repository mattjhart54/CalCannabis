/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LICENSE_RECORD CONVERSION
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
|  Script to convert all license record to one license record type.
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
var maxSeconds = 4.5 * 60;
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

aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sendToEmail", "mhart@trustvip.com"); //ca-licensees@metrc.com
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("reportName", "CDFA_purge");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("testRecord", "CAL19-0000253");
aa.env.setValue("recordSubType", "Medical,Adult Use");
aa.env.setValue("recordCategory", "License,Provisional");
*/
var emailAddress = getJobParam("emailAddress");			// email to send report
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appCategory = getJobParam("recordCategory");
var testRecord = getJobParam("testRecord");
var sArray = getJobParam("recordSubType").split(",");
var cArray = getJobParam("recordCategory").split(",");

if(appTypeType=="*") appTypeType="";
if(appCategory=="*") appCategory="";

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var noticeDate = jsDateToMMDDYYYY(startDate);
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
	acaDocBiz = aa.proxyInvoker.newInstance("com.accela.aa.ads.ads.EDMS4ACABusiness").getOutput();
	var rcdsCreated = 0;
	AInfo = new Array();
	var capList = new Array();
	for (i in sArray) {
		for(c in cArray) {
			capListResult = aa.cap.getByAppType(appGroup,appTypeType,sArray[i],cArray[c]);
			if (capListResult.getSuccess()) {
				tempcapList = capListResult.getOutput();
				logDebug(sArray[i] + " - " + cArray[c] + " Type Count: " + tempcapList.length);
				if (tempcapList.length > 0) {
					capList = capList.concat(tempcapList);
				}
			}else{
				logDebug("Error retrieving records: " + capListResult.getErrorMessage());
			}
		}
	}
	if (capList.length > 0) {
		logDebug("Found " + capList.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
	for (myCapsXX in capList) {
		capId = capList[myCapsXX].getCapID();
		cap = aa.cap.getCap(capId).getOutput();
		fileDateObj = cap.getFileDate();
		var appName = cap.getSpecialText();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		capStatus = cap.getCapStatus();
		altId =	 capId.getCustomID();
		loadAppSpecific(AInfo);
 
		if(!matches(testRecord,null,"",undefined)) {
			if(altId != testRecord) {
				continue;
			}
		}
		
		logDebug("Processing License Record " + altId);
		var licNum = capId.getCustomID();
		
// create the new license record
		if(appTypeArray[2] == "Medical" && appTypeArray[3] == "Provisional") 
			var newAppName = "Provisional Medicinal - "  + appName;
		if(appTypeArray[2] == "Medical" && appTypeArray[3] == "License") 
			var newAppName = "Annual Medicinal - "  + appName;
		if(appTypeArray[2] == "Adult Use" && appTypeArray[3] == "Provisional") 
			var newAppName = "Provisional Adult-Use - "  + appName;
		if(appTypeArray[2] == "Adult Use" && appTypeArray[3] == "License") 
			var newAppName = "Annual Adult-Use - "  + appName;
			
		licCapId = createNewLicense(capStatus,false,newAppName);
		
//	Update the Renewal information on both the new and current license record

		var newAltLast = licNum.substr(3,licNum.length());
		var newLicNum = "CCL" + newAltLast;
		var updAltId = aa.cap.updateCapAltID(licCapId,newLicNum);
		if(!updAltId.getSuccess()){
			logDebug("Error updating Alt Id: " + newLicNum + ":: " +updAltId.getErrorMessage());
		}else{
			logDebug("License record ID updated to : " + newLicNum);
		}
		var tmpNewDate = "";
		var tmpNewStatus = "";
		b1ExpResult = aa.expiration.getLicensesByCapID(capId);
		if (b1ExpResult.getSuccess()) {
			this.b1Exp = b1ExpResult.getOutput();
			expDate = this.b1Exp.getExpDate();	
			if(expDate)
				tmpNewDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
			tmpNewStatus = this.b1Exp.getExpStatus();
		}

		thisLic = new licenseObject(newLicNum,licCapId); 
		thisLic.setExpiration(dateAdd(tmpNewDate,0));
		thisLic.setStatus(tmpNewStatus); 
		logDebug("Successfully set the expiration date and status for " + newLicNum);
	
		thisLic = new licenseObject(licNum,capId); 
		thisLic.setStatus("Inactive"); 
		logDebug("Successfully set the expiration date and status for " + licNum);

		if(matches(AInfo["Premise City"], null, "")) {
			updateShortNotes(AInfo["Premise County"],licCapId);
		}
		else {
			updateShortNotes(AInfo["Premise City"] + " - " + AInfo["Premise County"],licCapId);
		}
		
//	Set file date on new license record
		var capMdl = aa.cap.getCap(licCapId).getOutput(); //returns CapScriptModel object
		var updFileDt = capMdl.setFileDate(fileDateObj);
		var capModel = capMdl.getCapModel();
		setDateResult = aa.cap.editCapByPK(capModel);
		if (!setDateResult.getSuccess()) {
			logDebug("**WARNING: error setting file date : " + setDateResult.getErrorMessage());
		}else{
			logDebug("File date successfully updated to " + fileDateObj);
		}
		
// copy data from the current record to the new record
		updateWorkDesc(workDescGet(capId),licCapId);
		copyConditions(capId, licCapId);
		copyAppSpecific(licCapId);
		copyASITables(capId,licCapId,"DEFICIENCIES","DENIAL REASONS");
		if(appTypeArray[2] == "Medical") {
			editAppSpecific("Cultivator Type","Medicinal",licCapId);
		}
		else {
			editAppSpecific("Cultivator Type","Adult-Use",licCapId);
		}
		if(appTypeArray[3] == "Provisional")
			editAppSpecific("License Issued Type",appTypeArray[3],licCapId);
		else
			editAppSpecific("License Issued Type","Annual",licCapId);
			
//	Update the current record status
		updateAppStatus("Retired","License converted to new license record type on " + sysDate);

//	Add related records to the new license record
		cId = getChildren("Licenses/Cultivator/*/*");
		for(x in cId) {
			holdId = capId;
			capId = cId[x];
			addParent(licCapId);
			capId = holdId;
		}
		cId = getChildren("Enforcement/*/*/*");
		for(x in cId) {
			holdId = capId;
			capId = cId[x];
			addParent(licCapId);
			capId = holdId;
		}
		
//	Copy documents from the current record to the new record
		capModelOriginal = aa.cap.getCapViewBySingle(capId);
		var originalCAPID = capModel.getCapID();
		var targetCaps = aa.util.newArrayList();
		capModel = aa.cap.getCapViewBySingle(licCapId);
		targetCaps.add(capModel.getCapID());
		acaDocBiz.transferDocument(aa.getServiceProviderCode(), originalCAPID, targetCaps,"Licenses", "ADMIN");
		
		rcdsCreated++;
	
// Run the official license report
		var rFiles = [];
		if(capStatus == 'Active') {
			reportResult = aa.reportManager.getReportInfoModelByName("Official License Certificate");
			if (!reportResult.getSuccess()){
				logDebug("**WARNING** couldn't load report " + "Official License Certificate" + " " + reportResult.getErrorMessage()); 
			}
			var report = reportResult.getOutput(); 
			report.setModule(appTypeArray[0]); 
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
					logDebug("Report '" + "Official License Certificate" + "' has been run for " + newLicNum);
				}else {
					logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
				}
			}else{
				logDebug("No permission to report: "+ "Official License Certificate" + " for user: " + currentUserID);
			}
		}
// Send notification and add record to set for manual notification if preferred channel is Postal
		if(capStatus == 'Active') {
			var notification = 'LCA_LICENSE_CONVERSION';
		}
		else {
			var notification = 'LCA_LICENSE_CONVERSION_INACTIVE';
		}
		var priContact = getContactObj(licCapId,"Designated Responsible Party");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$oldAltID$$", altId);
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
					if(capStatus == 'Active')
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
			logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
		}
	}	

	
	
	logDebug("Total Records qualified : " + capList.length);
	logDebug("Total Records Created: " + rcdsCreated);
	
}catch(err){
	logDebug("An error has occurred in Batch License Update: " + err.message);
	logDebug(err.stack);
}
}	
function getCapIdByIDs(s_id1, s_id2, s_id3)  {
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
    if(s_capResult.getSuccess())
		return s_capResult.getOutput();
    else
       return null;
}

function getJobParam(pParamName){ //gets parameter value and logs message showing param value
	try{
		var ret;
		if (aa.env.getValue("paramStdChoice") != "") {
			var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"),pParamName);
			if (b.getSuccess()) {
				ret = b.getOutput().getDescription();
				}	
			ret = ret ? "" + ret : "";   // convert to String
			logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
			}
		else {
			ret = "" + aa.env.getValue(pParamName);
			logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
		}
		return ret;
	}catch (err){
		logDebug("ERROR: getJobParam: " + err.message + " In " + batchJobName);
		logDebug("Stack: " + err.stack);
	}
}

function createNewLicense(initStatus,copyASI,appName) {
	//initStatus - record status to set the license to initially
	//copyASI - copy ASI from Application to License? (true/false)
	var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
	var newLicenseType = appTypeArray[2];
//create the license record
	newLicId = createParent(appTypeArray[0], appTypeArray[1], "License", "License",appName);
//field repurposed to represent the current term effective date
	editScheduledDate(sysDateMMDDYYYY,newLicId);
//field repurposed to represent the original effective date
	editFirstIssuedDate(sysDateMMDDYYYY,newLicId);
	newLicIdString = newLicId.getCustomID();
	updateAppStatus(initStatus,"",newLicId);
//copy all ASI
	if(copyASI) {
		copyAppSpecific(newLicId);
	}
	return newLicId;	
}

function createNewParent(grp,typ,stype,cat,desc) {
// creates the new application and returns the capID object
// updated by JHS 10/23/12 to use copyContacts that handles addresses
	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess()){
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
	// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);
		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(newId, capId); 
		if (result.getSuccess())
			logDebug("Parent application successfully linked");
		else
			logDebug("Could not link applications");
	// Copy Parcels
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess()){
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels){
				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(Parcels[zz]);
				newCapParcel.setCapIDModel(newId);
				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
				aa.parcel.createCapParcel(newCapParcel);
			}
		}
	// Copy Contacts
		copyContacts(capId,newId);
	// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(capId);
		if (capAddressResult.getSuccess()){
			Address = capAddressResult.getOutput();
			for (yy in Address){
				newAddress = Address[yy];
				newAddress.setCapID(newId);
				aa.address.createAddress(newAddress);
				logDebug("added address");
			}
		}
		return newId;
	}
	else{
		logDebug( "**ERROR: adding parent App: " + appCreateResult.getErrorMessage());
	}

}
function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
}

function setLicExpirationDate(licCap,newLicCap) {
    var newLicNum = newLicCap.getCustomID();
	var licNum = licCap.getCustomID();
    var tmpNewDate = "";
	var tmpNewStatus = "";
    b1ExpResult = aa.expiration.getLicensesByCapID(licCap);
    if (b1ExpResult.getSuccess()) {
        this.b1Exp = b1ExpResult.getOutput();
		expDate = this.b1Exp.getExpDate();
		if(expDate)
			tmpNewDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
		tmpNewStatus = this.b1Exp.getExpStatus();
	}

    thisLic = new licenseObject(newLicNum,newLicCap); 
    thisLic.setExpiration(dateAdd(tmpNewDate,0));
    thisLic.setStatus(tmpNewStatus); 
    logDebug("Successfully set the expiration date and status for " + newLicNum);
	
	thisLic = new licenseObject(licNum,licCap); 
    thisLic.setStatus("Inactive"); 
    logDebug("Successfully set the expiration date and status for " + licNum);
	
    return true;
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