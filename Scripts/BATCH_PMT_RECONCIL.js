/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_PMT_RECONCIL
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to populate a payment reconciliation record with the day's payments.
| Story 5585
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
aa.env.setValue("lookAheadDays", "-1");
aa.env.setValue("daySpan", "1");
aa.env.setValue("emailAddress", "mhart@trustvip.com");
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "*");
aa.env.setValue("recordCategory", "*");
aa.env.setValue("licenseContactType", "Designated Responsible Party");
*/ 
var emailAddress = getJobParam("emailAddress");			// email to send report
var lookAheadDays = getJobParam("lookAheadDays");
var daySpan = getJobParam("daySpan");
var sysFromEmail = getJobParam("sysFromEmail");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
var appSubtype = getJobParam("recordSubType");
var appCategory = getJobParam("recordCategory");
var licenseContactType = getJobParam("licenseContactType");


if(appTypeType=="*") appTypeType="";
if(appSubtype=="*")  appSubtype="";
if(appCategory=="*") appCategory="";
var filepath = "c://test"; 


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
var fromDate = dateAdd(null,parseInt(lookAheadDays));
var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan));
fromJSDate = new Date(fromDate);
toJSDate = new Date(toDate);
//Set start time
fromJSDate.setHours(00) 		//Only set hours if param has hours and minutes
fromJSDate.setMinutes(0)
fromJSDate.setSeconds(0)

//Set end time
toJSDate.setHours(23)
toJSDate.setMinutes(59)
toJSDate.setSeconds(59)
logDebug("fromDate: " + fromJSDate );
logDebug("toDate: " + toJSDate);

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
	var recdsFound = false;
	var badType = 0;
	var badDate = 0;

	var capFilterBalance = 0;
	var capFilterDateRange = 0;
	var capCount = 0;
	var payResult = aa.finance.getPaymentByDate(fromJSDate,toJSDate,null)
	if (payResult.getSuccess()) {
		paymentResult = payResult.getOutput();
		logDebug("Payment count: " + paymentResult.length);
		var chkYear = (fromJSDate.getYear()-100);
		var thisMonth = fromJSDate.getMonth()+1;
		if(thisMonth<10){
			var chkMonth = "0"+thisMonth;
		}else{
			var chkMonth = thisMonth;
		}
		if(fromJSDate.getDate()<10){
			var chkDate = "0"+fromJSDate.getDate();
		}else{
			var chkDate = fromJSDate.getDate();
		}
		var checkAltId = "RECON" + chkYear + "-" + chkMonth + "-" + chkDate;
		var thisYear =  1900+fromJSDate.getYear();
		var paidDate = chkMonth +"/"+chkDate+"/" +thisYear;
		var recRecd = getApplication(checkAltId);
		if(matches(recRecd, "", null,"undefined")){
			var recRecd = createCap("Licenses/Cultivator/Reconciliation/NA", "");
			var updAltId = aa.cap.updateCapAltID(recRecd, checkAltId);
			if(updAltId.getSuccess()==true){
				logDebug("Alt ID set to " + checkAltId);
			}else{
				logDebug("Error updating Alt ID: " +updAltId.getErrorMessage());
			}
		}
		for (var temp in paymentResult){
			var thisPmt = paymentResult[temp];
			//capId = aa.cap.getCapID(capList[myCapsXX].ID1, capList[myCapsXX].ID2, capList[myCapsXX].ID3).getOutput();
			//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
			var thisCap = ""+thisPmt.capID;
			var arrCap = thisCap.split("-");
			capId = aa.cap.getCapID(arrCap[0], arrCap[1], arrCap[2]).getOutput();
			//capId = aa.cap.getCapID(thisCapId).getOutput();
			altId =	 capId.getCustomID();
			cap = aa.cap.getCap(capId).getOutput();	
			var capModel = aa.cap.getCap(capId).getOutput().getCapModel();
			var rptDateOrig = capModel.getFileDate().toString().substring(0,10);
			var rptDateConv = rptDateOrig.split("-");
			var rptDate = new Date(""+rptDateConv[0], ""+rptDateConv[1] - 1, ""+rptDateConv[2]);
			appTypeResult = cap.getCapType();	
			appTypeString = appTypeResult.toString();	
			appTypeArray = appTypeString.split("/");
			if(appTypeArray[0]!=appGroup && appTypeArray[3]!= appCategory){
				logDebug("Skipping due to incorrect record type: " + altId + ": " + appTypeString);
				badType++;
				continue;
			}
			var feeType="N/A";
			var pfResult = aa.finance.getPaymentFeeItems(capId, null).getOutput();
			for (i in pfResult ){
				payItem = pfResult[i];
				logDebug("payItem.paymentSeqNbr: " + payItem.paymentSeqNbr);
				logDebug("thisPmt.paymentSeqNbr: " + thisPmt.paymentSeqNbr);
				if(payItem.paymentSeqNbr==thisPmt.paymentSeqNbr){
					var feeResult=aa.fee.getFeeItems(capId);
					if (feeResult.getSuccess()){ 
						var feeObjArr = feeResult.getOutput(); 
						for (ff in feeObjArr){
							fFee = feeObjArr[ff];
							if(fFee.feeSeqNbr==payItem.feeSeqNbr){
								if(fFee.feeDescription.indexOf("License")>-1){
									feeType="License"
									continue;
								}
								if(fFee.feeDescription.indexOf("Application")>-1){
									feeType="Application"
									continue
								}
								if(fFee.feeDescription.indexOf("Renewal")>-1){
									feeType="Renewal"
									continue;
								}
								if(fFee.feeDescription.indexOf("Late")>-1) {
									if(feeType == "Renewal") {
										feeType="Renewal- Late"
											continue;
									}else {
										feeType="Late"
											continue;
									}
								}
							}
						}
					}
				}
			}
			var pmtStatus = thisPmt.paymentStatus;
			if(matches(pmtStatus,"VOIDED")){
				var ttlPaid = thisPmt.paymentAmount *-1;
			}else{
				var ttlPaid = thisPmt.paymentAmount;
			}
			var ttlInvoiced = thisPmt.totalInvoiceAmount;
			var cashierSesh = thisPmt.sessionNbr;
			var cashierId = thisPmt.cashierID;
			var rcNbr = "";
			var rcDate = "";
			if(!matches(cashierSesh, null, "","undefined")){
/*				var cashierSessionResult = aa.finance.getCashierSessionFromDB();
				var cashierSession = null;
				if (cashierSessionResult.getSuccess())
				{
					logDebug("Get cashier session from database success.");
					cashierSession = cashierSessionResult.getOutput();
					if(!matches(cashierSession, null, "","undefined")){
//	mhart 180913 story 5718 Add additional error handling
						if (cashierSession.sessionNumber == cashierSesh){
							rcNbr = cashierSession.depositSlip;
						}
//	mhart 180913 story 5718 end						
					}
				}
				else
				{
					logDebug("Get cashier session from database failed.");
					logDebug(cashierSessionResult.getErrorMessage());
				}
*/
//	mhart 180914 story 5719 update RC# and RC Date
				var cashBiz = aa.proxyInvoker.newInstance("com.accela.aa.finance.cashier.CashierBusiness").getOutput();
				var cashModel = aa.proxyInvoker.newInstance("com.accela.aa.finance.cashier.CashierSessionModel").getOutput();
				cashModel.setSessionNumber(cashierSesh);
				cashModel.setServiceProviderCode(aa.getServiceProviderCode());
				test=cashBiz.searchCashierSession(cashModel,null);
				var c = cashBiz.searchCashierSession(cashModel,null).toArray();
				rcNbr = ""+c[0].getDepositSlip();
				if(!matches(c[0].getDepositDate(),null,"","undefined")) {
					depDate = c[0].getDepositDate().toString();
					rcDate = depDate.substring(5,7) + "/" + depDate.substring(8,10) + "/" + depDate.substring(0,4);
				}
//	mhart 180914 story 5719 end
			}
			var methodType = thisPmt.paymentMethod;
			var transCode = (thisPmt.tranCode==null) ? "" : thisPmt.tranCode;
			var payeeName = (thisPmt.payee==null) ? "" : thisPmt.payee;
			if(matches(transCode, "",null)){
				var transCode = (thisPmt.paymentRefNbr==null) ? "" : thisPmt.paymentRefNbr;
			}
			var capContactResult = aa.people.getCapContactByCapID(capId);
			if (capContactResult.getSuccess()){
				var licNotFound = true;
				var busNotFound = true;
				var Contacts = capContactResult.getOutput();
				for (var yy in Contacts){
					var thisContact = Contacts[yy].getCapContactModel();
					var licContactType =licenseContactType;
					if(thisContact.contactType==licContactType && licNotFound){
						var drpContact = thisContact.firstName + " " + thisContact.lastName;
					}
				}
			}
			var tblRow = [];
			logDebug("-----------------------");
			logDebug("Record ID: " +altId); 
			logDebug("Fee Type: " +feeType); 
			logDebug("Date Paid: " +paidDate); 
			logDebug("Total Invoiced: " +ttlInvoiced); 
			logDebug("Total Paid: " +ttlPaid); 
			logDebug("Payee Name: " +payeeName); 
			logDebug("Payment Status: " +pmtStatus); 
			logDebug("DRP: " +drpContact); 
			logDebug("Cashier Session: " +cashierSesh); 
			logDebug("Cashier: " +cashierId); 
			logDebug("Method Type: " +methodType); 
			logDebug("Transaction Code: " +transCode); 
			logDebug("Comments: " ); 
			logDebug("RC Number: " +rcNbr); 
			logDebug("RC Date: " + rcDate); 
			tblRow["Record ID"] = ""+altId; 
			tblRow["Fee Type"] = ""+feeType; 
			tblRow["Total Paid"] = ""+ttlPaid; 
			tblRow["Payee Name"] = ""+payeeName; 
			tblRow["Total Invoiced"] = ""+ttlInvoiced; 
			tblRow["Date Paid"] = ""+paidDate; 
			tblRow["Payment Status"] = ""+pmtStatus; 
			tblRow["DRP"] = ""+drpContact; 
			tblRow["Cashier Session"] = ""+cashierSesh; 
			tblRow["Cashier"] = ""+cashierId; 
			tblRow["Method Type"] = ""+methodType; 
			tblRow["Transaction Code"] = ""+transCode; 
			tblRow["Comments"] = ""; 
			tblRow["RC Number"] = ""+rcNbr; 
			tblRow["RC Date"] = ""+rcDate; 
			addToASITable("RECONCILIATION",tblRow,recRecd);
			capCount++;
		}
	
	}else{
		logDebug("Error retrieving payments: " + payResult.getErrorMessage());
		return false;
	}

 	logDebug("Total Payments qualified : " + paymentResult.length);
 	logDebug("Ignored due to incorrect record types: " + badType);
 	logDebug("Total Payments processed: " + capCount);

}catch (err){
	logDebug("An error occurred in BATCH_PMT_RECONCIL: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, emailAddress, "", "An error has occurred in " + batchJobName, err.message + br + err.stack + br + "env: av6(prod)");
}}
	
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
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
}}

function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
}


function removeSpecialCharacters(testPhrase){
	testPhrase = (""+testPhrase).replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
	return testPhrase;
}

function testForSpecialCharacter(testPhrase){
	if (testPhrase.indexOf('"') != -1) {
		testPhrase = (""+testPhrase).replace(/"/g, '""');
		testPhrase = '"' + testPhrase + '"';
	}else{
		if (testPhrase.indexOf(',')!= -1) {
			testPhrase = '"' + testPhrase + '"';
		}
	}
	return testPhrase;
}

function zeroPad(num,count){ 
	var numZeropad = num + '';
	while(numZeropad.length < count) {
		numZeropad = "0" + numZeropad; 
	}
	return numZeropad;
}

function zeroPadRight(num,count){ 
	var numZeropad = num + '';
	while(numZeropad.length < count) {
		numZeropad = numZeropad + "0" ; 
	}
	return numZeropad;
}

function spacePad(num,count){ 
	var numZeropad = num + '';
	while(numZeropad.length < count) {
		numZeropad = numZeropad +" "; 
	}
	return numZeropad;
}