var facilityId=AInfo["Updated.Facility ID"];
if(facilityId==null) 
	facilityId='';

if(wfTask == "Permit Issuance" && wfStatus == "Issued" && AInfo["Updated.Existing Facility"]=='Yes' &&  facilityId.length()==0){
	showMessage = true;
	cancel = true;
	comment("Facility ID is required if facility exists.");
} 

if(wfTask == "Permit Issuance" && wfStatus == "Issued" && AInfo["Updated.Existing Facility"]=='Yes' &&  facilityId.length()>0 && !aa.cap.getCapID(facilityId).getSuccess()){
	showMessage = true;
	cancel = true;
	comment("Facility ID:" + facilityId+" is not found");
}