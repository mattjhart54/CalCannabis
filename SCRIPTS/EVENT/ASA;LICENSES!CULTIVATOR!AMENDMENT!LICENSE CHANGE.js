
try {
	copyContactsByType_rev(parentCapId,capId,"Designated Responsible Party");
	copyContactsByType_rev(parentCapId,capId,"Business");
/*    if(AInfo['License Change'] == "Yes"){
	var licType = AInfo["New License Type"];
    }else {
	var licType = AInfo["License Type"];
    } 
    var newBalance = AInfo["Net Due/Refund"];
    if (newBalance > 0) {
    	var feeDesc = licType + " - License Fee with Date Change";
    	var feeSchedule = "LIC_CC_EXP";
    	var thisFee = getFeeDefByDesc(feeSchedule, feeDesc);
    	updateFee(thisFee.feeCode, feeSchedule, "FINAL", newBalance, "Y");
    }
*/
/*
// Invoice fees if fees are only assessed
    var invNbr = 0;
    var feeAmount = 0;
    var feeSeq = 0;
    var feeCode = "";
    var feePeriod = "";
    var feeQty = 0;
    var vFeeSeqArray = new Array();
    var vPaymentPeriodArray = new Array();
    var newFeeFound = false;
    var targetFees = loadFees(capId);
    for (tFeeNum in targetFees) {
        targetFee = targetFees[tFeeNum];
        logDebug("fee status is " + targetFee.status);
        if (targetFee.status == "NEW") {
            feeSeq = targetFee.sequence;
            feePeriod = targetFee.period;
            feeCode = targetFee.code;
            feeQty = targetFee.unit;
            feeSched = targetFee.sched;
        }
    }
    var isFeeInv = invoiceFee(feeCode, feePeriod);
    logDebug("isFeeInv = " + isFeeInv);
*/

} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/LICENSE CHANGE: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/LICENSE CHANGE: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
