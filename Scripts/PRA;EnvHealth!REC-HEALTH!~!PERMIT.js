//SCRIPT
// PRA:EH/Rec-Health/*/Permit
var renewBal = 0; 
var fees = loadFees(capId); 
for(x in fees) 
{
	if(fees[x].description == "Renewal Fee" && fees[x].status == "INVOICED" ) 
		renewBal += fees[x].amount - fees[x].amountPaid;
}
var fixedDate = aa.bizDomain.getBizDomainByValue("EH_Permit_Renew_Rule" ,"Fixed Date"); 
var doFixedDate = fixedDate.getSuccess() && fixedDate.getOutput().getAuditStatus() != "I";
var permitIssuedDate = aa.bizDomain.getBizDomainByValue("EH_Permit_Renew_Rule" ,"Permit Issued Date"); 
var doPermitIssuedDate = permitIssuedDate.getSuccess() && permitIssuedDate.getOutput().getAuditStatus() != "I";
if(doFixedDate && doPermitIssuedDate){
	var fixedDates= lookup("EH_RENEWAL_FIXED_DATE", appTypeString); 
	if(fixedDates==undefined){
		doFixedDate = false;
	}else{
		doPermitIssuedDate=false;
	}
}
if(renewBal <= 0 && feeExists("050") )
{
	var expDate = aa.expiration.getLicensesByCapID(capId).getOutput().getExpDateString().replaceAll('-','/');
	closeTask("Permit Status"," Renewed","Renewed on "+ sysDate +" via PRA ",null); 
	updateAppStatus("Active");
	if(doPermitIssuedDate){
		monthsToInitialExpire = lookup("EH_RENEWAL_INTERVAL", appTypeString); 
		if(!matches(monthsToInitialExpire,"null",undefined,"")) {
		tmpNewDate = dateAddMonths(expDate, monthsToInitialExpire);
		licEditExpInfo("Active",dateAdd(tmpNewDate,0));
		}
		else
		{ logDebug("Warning: Failed to update the renewal info, please define the permit type in the Standard Choice EH_RENEWAL_INTERVAL."); }
	}
	if(doFixedDate){
		var fixedDates= lookup("EH_RENEWAL_FIXED_DATE", appTypeString);
		if(!matches(fixedDates,"null",undefined,"")) {
		var availableExpDate=getNextAvailableExpDate(fixedDates, expDate); 
		licEditExpInfo("Active", availableExpDate);
		}
		else
		{ logDebug("Warning: Failed to update the renewal info, please define the permit type in the Standard Choice  EH_RENEWAL_FIXED_DATE_Java."); }
	}
}
