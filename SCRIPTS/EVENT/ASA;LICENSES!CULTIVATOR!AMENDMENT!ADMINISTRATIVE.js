try {
// Link Amendment record to License reord as a child
	var parentAltId = AInfo["License Number"];
	addParent(parentAltId)
	
// Set alt id the amendment record based on the number of chlild amendments records linked to the license record
	parentId = aa.cap.getCapID(parentAltId).getOutput();
	cIds = getChildren("Licenses/Cultivator/Amendment/Administrative");
	if(matches(cIds, null, "", undefined)) 
		amendNbr = amendNbr = "00" + 1;
	else {
		if(cids.length < 9)
			amendNbr = "00" +  cids.length + 1;
		else
			if(cids.length < 99)
				amendNbr = "00" +  cids.length + 1;
			else
				amendNbr = cids.length + 1
	}
	newAltId = parentId.getCustomID() + "-AA" + amendNbr;
	var updateResult = aa.cap.updateCapAltID(capId, newAltId);
	if (updateResult.getSuccess()) 
		logDebug("Updated amendment record AltId to " + newAltId + ".");
	else 
		logDebug("Error renaming amendment record " + capId);
		
// Copy the Designated Responsible Party contact from the License Record to the Amanedment record
	copyContactsByType_rev(parentId,capId,"Designated Responsible Party");
	
// Copy custom fields from the license record to the parent record
	copyAppSpecific(parentId);
	
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/ADMINISTRATIVE: " + err.message);
	logDebug(err.stack);
}