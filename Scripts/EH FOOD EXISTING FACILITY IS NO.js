newPermit = null; 
newFacility = null; 
newPermitIdString = null; 
newFacilityIdString = null;
isavailabledate = false; 
if( !matches(availableExpDate,"null",undefined,null) ) { isavailabledate = ( String(availableExpDate).indexOf("NaN") < 0 ); }

appTypeArray[3]="Permit"; 
newPermit = createCap(permitString,null); 
aa.cap.createAppHierarchy(newPermit, capId);
newFacility = createCap("EH/Facility/NA/NA",null); 
aa.cap.createAppHierarchy(newFacility, newPermit); // create the EH Facility record

var ignore = lookup("EMSE:ASI Copy Exceptions","EH/*/*/*"); 
var ignoreArr = new Array(); 
if(ignore != null) 
    ignoreArr = ignore.split("|"); 

var capAppName = aa.cap.getCapByPK(capId, true).getOutput().getSpecialText();
var capAppDesc = aa.cap.getCapWorkDesByPK(capId).getOutput().getCapWorkDesModel().getDescription();

if(newFacility){
    newFacilityIdString = newFacility.getCustomID(); 
    updateAppStatus("Active","Originally Issued",newFacility);  
    
    editAppName(capAppName,newFacility);
    var facilityCapWorkDesc = aa.cap.getCapWorkDesByPK(newFacility).getOutput().getCapWorkDesModel();
    facilityCapWorkDesc.setDescription(capAppDesc);
    aa.cap.editCapWorkDes(facilityCapWorkDesc);
    
    copyASIFields(capId,newFacility,ignoreArr);
    copyASITables(capId, newFacility);
    copyContacts(capId, newFacility); 
    copyAddresses(capId, newFacility); 
    copyOwner(capId, newFacility); 
    copyParcels(capId, newFacility); 
    aa.cap.copyRenewCapDocument(capId,newFacility,currentUserID);
	changeCapContactTypes("Applicant","Permit Holder", newFacility); 
}

if(newPermit){
    newPermitIdString = newPermit.getCustomID(); 
	updateAppStatus("Active","Originally Issued",newPermit); 
    
	editAppName(capAppName,newPermit);
	var permitCapWorkDesc = aa.cap.getCapWorkDesByPK(newPermit).getOutput().getCapWorkDesModel(); 
	permitCapWorkDesc.setDescription(capAppDesc);
	aa.cap.editCapWorkDes(permitCapWorkDesc);
    
	if( isavailabledate ) {
    thisPermit = new licenseObject(newPermitIdString,newPermit);  
    thisPermit.setStatus("Active"); 
    thisPermit.setExpiration(availableExpDate);
    }
	else
	{
		logDebug("Warning: Failed to update the permit renewal info because cannot to find the renewal rule for the permit type in related standard choice EH_RENEWAL_INTERVAL or EH_RENEWAL_FIXED_DATE._JAVA")
	}
	
	var risk =AInfo["Risk"];
    scheduleInspectionBasedOnRisk(newPermit, wfDateMMDDYYYY,  risk);
    copyASIFields(capId,newPermit,ignoreArr);
    copyASITables(capId, newPermit);
    copyContacts(capId, newPermit); 
    copyAddresses(capId, newPermit);
    copyOwner(capId, newPermit); 
    copyParcels(capId, newPermit); 
	aa.cap.copyRenewCapDocument(capId,newPermit,currentUserID);
	changeCapContactTypes("Applicant","Permit Holder", newPermit); 

}
