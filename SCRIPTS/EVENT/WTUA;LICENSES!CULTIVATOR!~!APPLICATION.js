//lwacht
//create the license record and copy DRP and Owner contacts to it
try{
	if("License Issuance".equals(wfTask) && "Issued".equals(wfStatus){
		var licCapId = createLicense("Active",false);
		if(licCapId){
			copyContactsByType(capId, licCapId, "Designated Responsible Party");
			var arrChild = getChildren("LICENSES/CULTIVATOR/*/OWNER APPLICATION");
			for(ch in arrChild){
				copyContactsByType(arrChild[ch], licCapId, "Owner");
			}
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/APPLICATION: License Issuance: " + err.message);
	logDebug(err.stack);
}
