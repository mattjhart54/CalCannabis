newPermit = null; 
facilityId=AInfo["Facility ID"]; 
newPermitIdString = null;
newFacilityIdString = null;
isavailabledate = false; 
if( !matches(availableExpDate,"null",undefined,null) ) { isavailabledate = ( String(availableExpDate).indexOf("NaN") < 0 ); }
appTypeArray[3]="Permit"; 
newPermit = createCap(permitString,null); 
aa.cap.createAppHierarchy(newPermit, capId);

existingFacility = aa.cap.getCapID(facilityId).getOutput(); 
aa.cap.createAppHierarchy(existingFacility, newPermit);

var ignore = lookup("EMSE:ASI Copy Exceptions","EH/*/*/*"); 
var ignoreArr = new Array(); 
if(ignore != null) 
    ignoreArr = ignore.split("|"); 
if(existingFacility){
    existingFacilityIdString = existingFacility.getCustomID(); 
    updateAppStatus("Active","Existing Facility",existingFacility);  
    //editAppName("",existingFacility);
    
    //copyASIFields(capId,existingFacility,ignoreArr);
    //copyASITables(capId, existingFacility);
    //copyContacts(capId, existingFacility); 
    //copyAddresses(capId, existingFacility); 
    //copyOwner(capId, existingFacility); 
    //copyParcels(capId, existingFacility); 
    //aa.cap.copyRenewCapDocument(capId,existingFacility,currentUserID);
	//changeCapContactTypes("Applicant","Permit Holder", existingFacility); 
} 


var capAppName = aa.cap.getCapByPK(capId, true).getOutput().getSpecialText();
var capAppDesc = aa.cap.getCapWorkDesByPK(capId).getOutput().getCapWorkDesModel().getDescription();

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
		logDebug("Warning: Failed to update the permit renewal info because cannot to find the renewal rule for the permit type in related standard choice EH_RENEWAL_INTERVAL or EH_RENEWAL_FIXED_DATE._JAVA");
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
