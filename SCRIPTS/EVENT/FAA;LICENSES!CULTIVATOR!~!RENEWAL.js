
try{
// JSHEAR 09032020 user Story 6613 - Send Balance Due Report when Fee Manually Assessed 
	var scriptName = "asyncRunBalanceDueRpt";
	var envParameters = aa.util.newHashMap();
	envParameters.put("altId",capId.getCustomID()); 
	envParameters.put("reportName","Balance Due Report"); 
	envParameters.put("contType","Designated Responsible Party"); 
	envParameters.put("currentUserID",currentUserID);
	envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
	aa.runAsyncScript(scriptName, envParameters);
				
} catch(err){
	logDebug("An error has occurred in FAA:LICENSES/CULTIVATOR/*/RENEWAL: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in FAA:LICENSES/CULTIVATOR/*/RENEWAL: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}