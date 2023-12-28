var existingFacilityIsYes = false;
var existingFacilityIsNo = false; 

permitString = appTypeArray[0]+"/"+appTypeArray[1]+"/"+appTypeArray[2]+"/Permit";

var fixedDate = aa.bizDomain.getBizDomainByValue("EH_Permit_Renew_Rule" ,"Fixed Date"); 
var doFixedDate = fixedDate.getSuccess() && fixedDate.getOutput().getAuditStatus() != "I";

var permitIssuedDate = aa.bizDomain.getBizDomainByValue("EH_Permit_Renew_Rule" ,"Permit Issued Date"); 
var doPermitIssuedDate = permitIssuedDate.getSuccess() && permitIssuedDate.getOutput().getAuditStatus() != "I";

if(wfTask == "Permit Issuance" && wfStatus == "Issued" && AInfo["Existing Facility"]=='Yes'){
    include("EH Establish Links to Reference Contacts"); 
    existingFacilityIsYes = true;
} 
if(wfTask == "Permit Issuance" && wfStatus == "Issued" && AInfo["Existing Facility"]=='No'){
    include("EH Establish Links to Reference Contacts"); 
    existingFacilityIsNo = true;
}
if(doFixedDate && doPermitIssuedDate){
	var fixedDates= lookup("EH_RENEWAL_FIXED_DATE", permitString); 
	if(fixedDates==undefined){
		doFixedDate = false;
	}else{
		doPermitIssuedDate=false;
	}
}
if(existingFacilityIsYes && doFixedDate){
    var fixedDates= lookup("EH_RENEWAL_FIXED_DATE", permitString);
    availableExpDate=getNextAvailableExpDate(fixedDates, wfDateMMDDYYYY); 
    include("EH Food Existing Facility is YES");
} 
if(existingFacilityIsYes && doPermitIssuedDate){
    var monthsToInitialExpire = lookup("EH_RENEWAL_INTERVAL", permitString); 
    availableExpDate=dateAddMonths(wfDateMMDDYYYY, monthsToInitialExpire); 
    include("EH Food Existing Facility is YES");
}
if(existingFacilityIsNo && doFixedDate){
    var fixedDates= lookup("EH_RENEWAL_FIXED_DATE", permitString);
    availableExpDate=getNextAvailableExpDate(fixedDates, wfDateMMDDYYYY); 
    include("EH Food Existing Facility is No");
}
if(existingFacilityIsNo && doPermitIssuedDate){
    var monthsToInitialExpire = lookup("EH_RENEWAL_INTERVAL", permitString); 
    availableExpDate=dateAddMonths(wfDateMMDDYYYY, monthsToInitialExpire); 
    include("EH Food Existing Facility is No");
}

