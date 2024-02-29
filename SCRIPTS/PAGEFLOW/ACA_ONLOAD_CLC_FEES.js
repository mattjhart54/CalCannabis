/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_CLC_FEES.JS
| Event   : ACA Page Flow onload attachments component
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var SCRIPT_VERSION = 3;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, true));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS","CALCANNABIS",true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", "CALCANNABIS",true));
}

eval(getScriptText("INCLUDES_CUSTOM", null,true));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

var cap = aa.env.getValue("CapModel");
var parentCapId = cap.getParentCapID();
var AInfo = new Array();						// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 
// page flow custom code begin

try {
//parentCapID = "DUB23-00000-0000X"
		var parentAltId = parentCapId.getCustomID();
		pCap = aa.cap.getCap(parentCapId).getOutput();
		var pStatus = pCap.getCapStatus();
		b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
		var curDate = new Date();
		if (b1ExpResult.getSuccess()) {
			this.b1Exp = b1ExpResult.getOutput();
			expDate = this.b1Exp.getExpDate();
			expDate = fixDate(expDate);
			if(expDate) {
				tmpExpDate = (expDate.getMonth() +1) + "/" + expDate.getDate() + "/" + expDate.getFullYear();
				tmpFromDate = (expDate.getMonth() +1) + "/" + expDate.getDate() + "/" + (expDate.getFullYear() -1); 				
				var expDate = new Date(tmpExpDate);
				var fromDate = new Date(tmpFromDate);
			}
		}       
		var fees = false;
		var feeAmt = 0;
		var overFeeAmt = 0;
		voidRemoveAllFees();
		var daysDiff = 0;
		var daysFromDiff = 0;
		var lastBaseFee = 0;
		var lastOverFee = 0;
		var lastFee = 0;
		var newExpDateStr = AInfo["New Expiration Date"];
		var submitDate = fileDate;
		var licType = getAppSpecific("License Type",parentCapId);
		var sqft = getAppSpecific("Canopy SF",parentCapId);
		
		if(AInfo["License Change"] == "Yes"){
			var newLicType = AInfo["New License Type"];
			var newSqft = getAppSpecific("Aggragate Canopy Square Footage");
		} 
		else {
			var newLicType = getAppSpecific("License Type",parentCapId);
			var newSqft = getAppSpecific("Canopy SF",parentCapId);
		}
			
    //Check for Expiration Date Change and Calculate Days
		if (newExpDateStr) {
		// Calculate the number of days to new expiration date
			var newExpDate = new Date(newExpDateStr);
			var timeDiff = newExpDate.getTime() - curDate.getTime();
			daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
			
		// Calculate the number of days from current date to expiration date				
		//	curDate = new Date();
			var validFromDiff = expDate.getTime() - curDate.getTime();
			daysFromDiff = Math.floor(validFromDiff / (1000 * 60 * 60 * 24));

	// Get last renewal fee
		var feeDesc = licType + " - Renewal Fee";
		var feeSchedule = "LIC_CC_REN";
		var feeQty = 1;
		thisFee = getFeeDefByDesc(feeSchedule, feeDesc);
		lastBaseFee = thisFee.formula*feeQty
		if(licType.substring(0,5) == "Large") {
			lType = lookup("LIC_CC_LICENSE_TYPE", licType);
			if(!matches(lType,"", null, undefined)){
				licTbl = lType.split(";");
				var base = parseInt(licTbl[3] -1);
				feeDescR = licType + " - Per 2,000 sq ft over " + maskTheMoneyNumber(base);
				qty = (parseInt(sqft) - base) / 2000;
				thisFee = getFeeDefByDesc("LIC_CC_REN", feeDescR);
				lastOverFeeFee = thisFee.formula * qty;
			}
		}
		if(AInfo["Limited Operations"] == "Yes") 
			lastFee = ((lastBaseFee + lastOverFee) *.2);
		else
			lastFee = lastBaseFee + lastOverFee;
			
		lastDailyRate = lastFee/365;
//		logDebug("last Fee " + lastFee + " days " + daysFromDiff + " rate " + lastDailyRate);
		lastFeeCredit = lastDailyRate * daysFromDiff;
		
		//Get new fee 
			var feeDesc = newLicType + " - Renewal Fee with Date Change";
			var feeSchedule = "LIC_CC_REN_EXP";
			var feeQty = daysDiff;
			var thisFee = getFeeDefByDesc(feeSchedule, feeDesc);
			if(AInfo["Limited Operation"] == "Yes")
				feeAmt = ((thisFee.formula*feeQty)*.2);
			else 
				feeAmt = (thisFee.formula*feeQty);
			if(newLicType.substring(0,5) == "Large") {
				lType = lookup("LIC_CC_LICENSE_TYPE", newLicType);
				if(!matches(lType,"", null, undefined)){
					licTbl = lType.split(";");
					var base = parseInt(licTbl[3] -1);
					feeDesc = newLicType + " - Per 2,000 sq ft over " + maskTheMoneyNumber(base) + " with Date Change";
					qty = (parseInt(newSqft) - base) / 2000;
					thisFee = getFeeDefByDesc("LIC_CC_REN_EXP", feeDesc);
					if(AInfo["Limited Operation"] != "Yes") {
						overFeeAmt = ((thisFee.formula*parseInt(qty))/365)*feeQty;
					}else {
						overFeeAmt = (((thisFee.formula*parseInt(qty))/365)*feeQty)*.2;
					}			
				} 
			}
			newFee = feeAmt  + overFeeAmt;
			newBalance = newFee - lastFeeCredit;
			lastFeeCredit = lastFeeCredit.toFixed(2);
			newFee = newFee.toFixed(2);
			newBalance = newBalance.toFixed(2);
//			logDebug("new fee " + newFee + " fee credit " + lastFeeCredit + " balance " + newBalance);
			editAppSpecific4ACA("Current Base Fee", lastFeeCredit);
			editAppSpecific4ACA("New Base Fee", newFee);
			editAppSpecific4ACA("Net Due/Refund",newBalance);
			if(newBalance > 0) {
				var feeDesc = newLicType + " - License Fee with Date Change";
				var feeSchedule = "LIC_CC_EXP";
				var thisFee = getFeeDefByDesc(feeSchedule, feeDesc);
				updateFee(thisFee.feeCode,feeSchedule, "FINAL", newBalance, "Y", "N");
			}	
		}
} catch(err){
    logDebug("An error has occurred in ACA_Onload CLC Fees: " + err.message);
    logDebug(err.stack);
    aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ACA_Onload CLC Fees:  "+ parentCapId, capId + br + err.message+ br+ err.stack + br + currEnv);
}
function fixDate(dateObj) {
	// date object with getClass assumes that this is an Accela Date object
	if (dateObj.getClass) {
		return new Date(dateObj.getEpochMilliseconds());
	} else {
		logDebug("Date is not an Accela Date object");
		return dateObj;
	}
}
/*===========================================
Title: voidRemoveAllFees
Purpose: Voids or removes all fees, depending on if they're 
	invoiced or not
Author: Lynda Wacht		
Functional Area : Reports
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Parameters:
	capId (Optional): capId: To remove fees from a 
		record that isn't the current one
============================================== */
function voidRemoveAllFees() {
try{
	var feeSeqArray = new Array();
	var invoiceNbrArray = new Array();
	var feeAllocationArray = new Array();
	var itemCap = capId;
	if (arguments.length > 0)
	itemCap = arguments[0];
	var targetFees = loadFees(itemCap);
	for (tFeeNum in targetFees) {
		targetFee = targetFees[tFeeNum];
		if (targetFee.status == "INVOICED") {
			var editResult = aa.finance.voidFeeItem(itemCap, targetFee.sequence);
			if (editResult.getSuccess())
				logDebug("Voided existing Fee Item: " + targetFee.code);
			else{ 
				logDebug( "**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); 
				return false; 
			}
			var feeSeqArray = new Array();
			var paymentPeriodArray = new Array();
			feeSeqArray.push(targetFee.sequence);
			paymentPeriodArray.push(targetFee.period);
			var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
			if (!invoiceResult_L.getSuccess()) {
				logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
				return false;
			}
		}
		if (targetFee.status == "NEW") {
			var editResult = aa.finance.removeFeeItem(itemCap, targetFee.sequence);
			if (editResult.getSuccess())
				logDebug("Removed existing Fee Item: " + targetFee.code);
			else
				{ logDebug( "**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }
		}
	}  // each  fee
}catch(err){
	logDebug("An error occurred in voidRemoveAllFees: " + err.message);
	logDebug(err.stack);
}
}  // function
function getFeeDefByDesc (fsched, feeDesc) {
try {
	var arrFeesResult = aa.finance.getFeeItemList(null,fsched,null);
	if (arrFeesResult.getSuccess()) {
		var arrFees = arrFeesResult.getOutput();
		for (xx in arrFees) {
			var fDesc = arrFees[xx].getFeeDes();
			if (fDesc.equals(feeDesc)) {
				var f = new FeeDef();
				f.feeCode = arrFees[xx].getFeeCod();
				f.feeDesc = fDesc;
				f.formula = arrFees[xx].getFormula();
				f.calcProc = arrFees[xx].getCalProc();
				var rft = arrFees[xx].getrFreeItem();
				f.comments = rft.getComments();
				return f;
			}
	
		} // for xx
	}else { 
		logDebug("Error getting fee schedule " + arrFeesResult.getErrorMessage());
		return false;
	}
}catch(err){
	logDebug("An error has occurred in getFeeDefByDesc: " + err.message);
	logDebug(err.stack);
}}

function FeeDef () { // Fee Definition object 
try{
	this.formula = null;
	this.feeUnit = null;
	this.feeDesc = null;
	this.feeCode = null;
	this.comments = null;
	this.calcProc = null;
	this.subGroup = null;
	this.minFee = null;
	this.maxFee = null;
	this.feeAllocationType = null;
	this.displayOrder = null;
	this.unitDesc = null;
	this.accountCode1 = null;
	this.accountCode2 = null;
	this.accountCode3 = null;
	this.defaultFlag = null;
}catch(err){
	logDebug("An error has occurred in FeeDef: " + err.message);
	logDebug(err.stack);
}}
function maskTheMoneyNumber(val) {
   //set regex pattern for mask
    var pattern;
    pattern = /\B(?=(\d{3})+(?!\d))/g; //add commas to number
	if (val == null || val == '') {
        return '';
    }
	var strVal = new String(val.toString());
    var cleanVal = strVal.replace(/,/g, ""); //remove commas before masking
    var maskedVal = cleanVal.replace(pattern, ",")
	return maskedVal;
}
