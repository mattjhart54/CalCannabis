try {
// Link Case record to License record as a child
	var parentAltId = AInfo["License Number"];
	addParent(parentAltId);
	
// Set alt id for the case record based on the number of child case records linked to the license record
	parentId = aa.cap.getCapID(parentAltId).getOutput();
	cIds = getChildren("Licenses/Cultivator/License Case/*",parentId);
	if(matches(cIds, null, "", undefined)) 
		amendNbr = amendNbr = "000" + 1;
	else {
		cIdLen = cIds.length
		if(cIds.length <= 9)
			amendNbr = "000" +  cIdLen;
		else
			if(cIds.length <= 99)
				amendNbr = "00" +  cIdLen;
			else
				if(cIds.length <= 999)
					amendNbr = "00" +  cIdLen;
				else
					amendNbr = cIdLen
	}
	altId = capId.getCustomID();
	yy = altId.substring(0,2);
	newAltId = parentId.getCustomID() + "-LC"+ yy + "-" + amendNbr;
	var updateResult = aa.cap.updateCapAltID(capId, newAltId);
	if (updateResult.getSuccess()) 
		logDebug("Updated amendment record AltId to " + newAltId + ".");
	else 
		logDebug("Error renaming amendment record " + capId);
	
			
// Copy the Designated resposible Party contact from the License Record to the Case record
	copyContactsByType_rev(parentId,capId,"Designated Responsible Party");
	
// Copy custom fields from the license record to the Case record
	holdId = capId;
	capId = parentId;
	PInfo = new Array;
	loadAppSpecific(PInfo);
	capId = holdId;
	editAppSpecific("License Type",PInfo["License Type"]);
	editAppSpecific("Legal Business Name",PInfo["Legal Business Name"]);
	editAppSpecific("Premises City",PInfo["Premise City"]);
	editAppSpecific("Premises County",PInfo["Premise County"]);
	editAppSpecific("Local Authority Type",PInfo["Local Authority Type"]);
	editAppSpecific("Type of License",PInfo["License Issued Type"]);
	editAppSpecific("License Start Date",PInfo["Valid From Date"]);
	editAppName(AInfo["Case Renewal Type"]);
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/License Case/*: " + err.message);
	logDebug(err.stack);
}