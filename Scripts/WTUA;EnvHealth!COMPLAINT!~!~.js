facilityId = AInfo["Facility ID"]; 
if ( wfTask == "Complaint Closed" && wfStatus == "Closed" && AInfo["Existing Facility"]=='Yes' )
{
existingFacility = aa.cap.getCapID(facilityId).getOutput(); 
aa.cap.createAppHierarchy(existingFacility, capId);
}
