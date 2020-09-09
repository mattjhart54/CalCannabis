
try{
	// JSHEAR 09032020 user Story 6613 - Send Balance Due Report when Fee Manually Assessed 
	var feeResult = aa.fee.getFeeItems(capId);
	if(feeResult.getSuccess()) {
		feeItem = feeResult.getOutput();
		for(f in feeItem) {
			var feeStatus = feeItem[f].getFeeitemStatus();
			var feeDate = feeItem[f].getApplyDate();
			cDate = new Date();
			curDateFormatted =  dateFormatted(cDate.getMonth()+1,cDate.getDate(),cDate.getFullYear(),"YY-MM-DD");
			feeDateFormatted = dateFormatted(feeDate.getMonth(),feeDate.getDayOfMonth(),feeDate.getYear(),"YY-MM-DD");
			if(curDateFormatted == feeDateFormatted && feeStatus == "INVOICED"){
				var scriptName = "asyncRunBalanceDueRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("recNum",capId.getCustomID()); 
				envParameters.put("reportName","Balance Due Report"); 
				envParameters.put("contType","Designated Responsible Party"); 
				envParameters.put("currentUserID",currentUserID);
				envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
				aa.runAsyncScript(scriptName, envParameters);
				logDebug("Sent email with Balance Due Report");
				break;
			}
		}
	}
				
} catch(err){
	logDebug("An error has occurred in FAA:LICENSES/CULTIVATOR/*/RENEWAL: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in FAA:LICENSES/CULTIVATOR/*/RENEWAL: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}