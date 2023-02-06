/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_Convert_Temp_Records
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to convert Annual applications where Declaration has been submitted but application fee has 
| not been paid.
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
var testRecordToConvert = "17TMP-001797";
var myCapId = "xxxxx";
var myUserId = "ADMIN";
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

//if (emailAddress.length)
//	aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);

if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try {
	showDebug = true;
	projectbiz = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.ProjectBusiness").getOutput();
	acaDocBiz = aa.proxyInvoker.newInstance("com.accela.aa.ads.ads.EDMS4ACABusiness").getOutput();

	var t = getTempRecordsAll();
	
//	for (var i = 0 ; i < 10 ; i++) {
	for(i in t) {
		if(i>10) break;		
		var parentId = null;
		doOneTimeConvert(t[i].Record);
	}

//	var parentId = null;
//	doOneTimeConvert(testRecordToConvert);

}
catch (err) {
	logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
	}
// end user code
//aa.env.setValue("ScriptReturnCode", "0"); 	aa.env.setValue("ScriptReturnMessage", debug)
}

function doOneTimeConvert(capIdString) {
	capId = aa.cap.getCapID(capIdString).getOutput();
	if (capId) {
		capModel = aa.cap.getCapViewBySingle4ACA(capId);
		capBalance = getBalanceByCapId(null, null, null, capId);
		if (capBalance > 0) { 
			logDebug("Record " + capId.getCustomID() + " with balance: $" + capBalance);

		// don't forget the children.
			var xx = projectbiz.getChildProjects(capId, "ADMIN");

		// convert the parent
			convert2RealCAP2(capModel, "");
			parentRecId = capModel.getCapID().getCustomID();
			parentId = getApplication(parentRecId);
			updateAppStatus("Application Fee Due", "Updated via ASA:LICENSES/CULTIVATOR/* /APPLICATION",parentId);

		// now the children
		//var xx = projectbiz.getProjectByChildCapID(capId, "AssoForm", "INCOMPLETE");
			if (xx) {
				x = xx.toArray();
				for (var i in x) {
					capModelChild = aa.cap.getCapViewBySingle4ACA(x[i].getCapID());
					convert2RealCAP2(capModelChild, "");

					/*
					aa.print(x[i].getCapID() + " Relationship: " + x[i].getRelationShip() + " Status: " + x[i].getStatus());
					x[i].setRelationShip("R");
					x[i].setStatus(null);
					projectbiz.updateProject(x[i], "ADMIN");
					logDebug("   Relationship set to Related Record");
					*/
				}
			} else {
				logDebug(capId.getCustomID() + " has no children");
			}
		} else {
			logDebug("No CAP balance " + capIdString);
		}
	}else {
		logDebug("No CAP found " + capIdString);
	}
}

function convert2RealCAP2(capModel, transactions)
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
		createCapComment("This record was converted from temporary record " + originalRecId + " on " + jsDateToMMDDYYYY(startDate),capModel.getCapID());
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

	childId = capModel.getCapID();
	childCap = aa.cap.getCap(childId).getOutput();
	fileDateObj = childCap.getFileDate();
	fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
	appTypeResult = childCap.getCapType();
	appTypeString = appTypeResult.toString();
	appTypeArray = appTypeString.split("/");
	if (appTypeArray[3] == "Owner Application") {
		updateAppStatus("Submitted","Updated via CTRCA:Licenses/Cultivator//Owner Application",childId);
		editAppSpecific("Application ID", parentRecId, childId);
		editAppSpecific("Created Date", fileDate, childId);
		updateFileDt(null);

		nbrToTry = 1;
		if(childId.getCustomID().substring(0,3)!="LCA"){
			var ownerGotNewAltId = false;
			var newIdErrMsg = "";
			for (i = 0; i <= 100; i++) {
				if(nbrToTry<10){
					var nbrOwner = "00" + nbrToTry;
				}else{
					if(nbrToTry<100){
						var nbrOwner = "0" + nbrToTry
					}
					var nbrOwner = ""+ nbrToTry;
				}
				var newAltId = parentId.getCustomID() + "-" + nbrOwner + "O";
				var updateResult = aa.cap.updateCapAltID(childId, newAltId);
				if (updateResult.getSuccess()) {
					logDebug("Updated owner record AltId to " + newAltId + ".");
					ownerGotNewAltId = true;
					break;
				}else {
					newIdErrMsg += updateResult.getErrorMessage() +"; ";
					nbrToTry++;
				}
			}
			if(!ownerGotNewAltId){
				logDebug("Error renaming owner record " + childId + ":  " + newIdErrMsg);
			}
		}else{
			logDebug("Owner record AltId already updated: "+ childId.getCustomID());
		}
	}
	if (appTypeArray[3] == "Declaration") {
		editAppSpecific("Application ID", parentRecId, childId);
		editAppSpecific("Created Date", fileDate, childId);
		updateFileDt(null);
		if(childId.getCustomID().substring(0,3)!="LCA"){
			var newAltId = parentId.getCustomID() + "-DEC";
			var updateResult = aa.cap.updateCapAltID(childId, newAltId);
			var newIdErrMsg = updateResult.getErrorMessage() +"; ";
			if (updateResult.getSuccess()) {
				logDebug("Updated Declaration record AltId to " + newAltId + ".");
			}else {
				logDebug("Error renaming declar record " + childId + ":  " + newIdErrMsg);
			}
		}
	}
	if (appTypeArray[3] == "Application") {
		holdId = capId;
		capId = childId;
		altId = capId.getCustomID();
		var cType = "License Required Documents";
		var capCondResult = aa.capCondition.getCapConditions(capId,cType);
		if (!capCondResult.getSuccess()){
			logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()) ; 
		}else{
			var ccs = capCondResult.getOutput();
			for (pc1 in ccs){
				var rmCapCondResult = aa.capCondition.deleteCapCondition(capId,ccs[pc1].getConditionNumber()); 
				if (rmCapCondResult.getSuccess())
					logDebug("Successfully removed condition to CAP : " + capId + "  (" + cType + ") ");
				else
					logDebug( "**ERROR: removing condition  (" + cType + "): " + rmCapCondResult.getErrorMessage());
			}
		}
		updateLegalBusinessName1();
		AInfo = new Array();
		loadAppSpecific(AInfo);
		licType = getAppSpecific("License Type");
		county = getAppSpecific("Premise County")
		editAppName(licType);
		updateShortNotes(county);
		deactivateTask("Owner Application Reviews");
		deactivateTask("Administrative Review");
		editAppSpecific("Created Date", fileDate);
		updateFileDt(null);

		var eTxt = "";
		var sDate = new Date();
		var sTime = sDate.getTime();
		var scriptName = "asyncRunComplApplicRpt";
		var envParameters = aa.util.newHashMap();
		envParameters.put("sendCap",altId); 
		envParameters.put("currentUserID",currentUserID);
		aa.runAsyncScript(scriptName, envParameters);
		capId = holdId;
	}
	return capModel;
}



function getBalanceByCapId(feestr, feeSch, invoicedOnly, capId) {
    var amtFee = 0,
       amtPaid = 0,
       ff;

    invoicedOnly = (invoicedOnly == undefined || invoicedOnly == null) ? false : invoicedOnly;

    var feeResult = aa.fee.getFeeItems(capId, feestr, null);
    if (feeResult.getSuccess()) {
        var feeObjArr = feeResult.getOutput();
    }
    else {
        logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
        return 999999;
    }

    for (ff in feeObjArr)
        if ((!feestr || feestr.equals(feeObjArr[ff].getFeeCod())) && (!feeSch || feeSch.equals(feeObjArr[ff].getF4FeeItemModel().getFeeSchudle()))) {
            if (!(matches(feeObjArr[ff].feeitemStatus, "VOIDED", "CREDITED"))) {  //if fee is voided or credited - exclude
                if (!invoicedOnly || feeObjArr[ff].feeitemStatus == "INVOICED") {
                    amtFee += feeObjArr[ff].getFee();
                    var pfResult = aa.finance.getPaymentFeeItems(capId, null);
                    if (pfResult.getSuccess()) {
                        var pfObj = pfResult.getOutput();
                        for (ij in pfObj) {
                            if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()) {
                                amtPaid += pfObj[ij].getFeeAllocation()
                            }
                        }
                        logDebug("feestr=" + feestr + " - " + "status=" + feeObjArr[ff].feeitemStatus + " - " + "amtFee=" + amtFee + " - " + "amtPaid=" + amtPaid);
                    }
                }
                else {
                    logDebug("feestr=" + feestr + ' ---- NOT  Invoiced');
                }
            }
            else {
                logDebug("feestr=" + feestr + ' ---- Voided/Credited');
            }
        }
    return amtFee - amtPaid;
}

function updateFileDt(newDate){
	var tDay = dateAdd(newDate,0);
	var thisDate = aa.date.parseDate(tDay)
	var updFileDt = childCap.setFileDate(thisDate);
	var childModel = childCap.getCapModel();
	setDateResult = aa.cap.editCapByPK(childModel);
	if (!setDateResult.getSuccess()) {
		logDebug("**WARNING: error setting file date : " + setDateResult.getErrorMessage());
		return false;
	}else{
		logDebug("File date successfully updated to " + tDay);
		return true;
	}
}

function updateLegalBusinessName1() {
	cList = getContactArray1();
	for(c in cList) {
		if(cList[c]["contactType"] == "Business") {
			if(!matches(cList[c]["middleName"], null, "", undefined)) {
				updateWorkDesc(cList[c]["middleName"]);
			}
			else {
				updateWorkDesc("No legal business name provided");
			}
		}
	}
}
function getContactArray1()	{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];

	var cArray = new Array();

//	if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
//		{
//		capContactArray = cap.getContactsGroup().toArray() ;
//		}
//	else
//		{
		var capContactResult = aa.people.getCapContactByCapID(thisCap);
		if (capContactResult.getSuccess())
			{
			var capContactArray = capContactResult.getOutput();
			}
//		}

	if (capContactArray)
		{
		for (yy in capContactArray)
			{
			var aArray = new Array();
			aArray["lastName"] = capContactArray[yy].getPeople().lastName;
			aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
			aArray["firstName"] = capContactArray[yy].getPeople().firstName;
			aArray["middleName"] = capContactArray[yy].getPeople().middleName;
			aArray["businessName"] = capContactArray[yy].getPeople().businessName;
			aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
			aArray["contactType"] =capContactArray[yy].getPeople().contactType;
			aArray["relation"] = capContactArray[yy].getPeople().relation;
			aArray["phone1"] = capContactArray[yy].getPeople().phone1;
			aArray["phone2"] = capContactArray[yy].getPeople().phone2;
			aArray["email"] = capContactArray[yy].getPeople().email;
			aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
			aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
			aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
			aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
			aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
			aArray["fax"] = capContactArray[yy].getPeople().fax;
			aArray["notes"] = capContactArray[yy].getPeople().notes;
			aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
			aArray["fullName"] = capContactArray[yy].getPeople().fullName;
			aArray["peopleModel"] = capContactArray[yy].getPeople();

			var pa = new Array();

//			if (arguments.length == 0 && !cap.isCompleteCap()) {
//				var paR = capContactArray[yy].getPeople().getAttributes();
//				if (paR) pa = paR.toArray();
//				}
//			else
				var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
	                for (xx1 in pa)
                   		aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

        	cArray.push(aArray);
			}
		}
	return cArray;
}

function getTempRecordsAll() {
	return [
		{
		    "Record": "18TMP-000824"
		}
]
}