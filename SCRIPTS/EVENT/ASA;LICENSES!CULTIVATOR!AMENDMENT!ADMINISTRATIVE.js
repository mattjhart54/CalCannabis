try {
// Link Amendment record to License reord as a child
	var parentAltId = AInfo["License Number"];
	addParent(parentAltId)
	
// Set alt id the amendment record based on the number of chlild amendments records linked to the license record
	parentId = aa.cap.getCapID(parentAltId).getOutput();
	cIds = getChildren("Licenses/Cultivator/Amendment/Administrative",parentId);
	if(matches(cIds, null, "", undefined)) 
		amendNbr = amendNbr = "00" + 1;
	else {
		cIdLen = cIds.length + 1 
		if(cIds.length < 9)
			amendNbr = "00" +  cIdLen;
		else
			if(cIds.length < 99)
				amendNbr = "00" +  cIdLen;
			else
				amendNbr = cIdLen
	}
	newAltId = parentId.getCustomID() + "-AA" + amendNbr;
	var updateResult = aa.cap.updateCapAltID(capId, newAltId);
	if (updateResult.getSuccess()) 
		logDebug("Updated amendment record AltId to " + newAltId + ".");
	else 
		logDebug("Error renaming amendment record " + capId);
		
// Copy the Designated resposible Party contact from the License Record to the Amanedment record
	copyContactsByType_rev(parentId,capId,"Designated Responsible Party");
	
// Copy custom fields from the license record to the parent record
	holdId = capId;
	capId = parentId;
	PInfo = new Array;
	loadAppSpecific(PInfo);
	capId = holdId;
	editAppSpecific("Cooperative Association",PInfo["Cooperative Association"]);
	editAppSpecific("Name of Cannabis Cooperative",PInfo["Name of Cannabis Cooperative"]);
	editAppSpecific("Business Entity Structure",PInfo["Business Entity Structure"]);
	editAppSpecific("Other Entity",PInfo["Other Entity"]);
	editAppSpecific("Foreign Corporation",PInfo["Foreign Corporation"]);
	editAppSpecific("Legal Business Name",PInfo["Legal Business Name"]);
	editAppSpecific("EIN/ITIN",PInfo["EIN/ITIN"]);
	editAppSpecific("SSN/ITIN",PInfo["SSN/ITIN"]);
	editAppSpecific("BOE Seller's Permit Number",PInfo["BOE Seller's Permit Number"]);
	editAppSpecific("Secretary of State Registration Entity ",PInfo["Secretary of State Registration Entity "]);
	editAppSpecific("Date of Intitial Operation",PInfo["Date of Intitial Operation"]);
	editAppSpecific("Records on Premise Acknowledgement",PInfo["Records on Premise Acknowledgement"]);
	editAppSpecific("Legal Possession",PInfo["Legal Possession"]);
	editAppSpecific("Other Possession",PInfo["Other Possession"]);
	editAppSpecific("Property Owner's Mailing Address",PInfo["Property Owner's Mailing Address"]);
	editAppSpecific("Property Owner's Phone Number",PInfo["Property Owner's Phone Number"]);
	editAppSpecific("Local Authority Type",PInfo["Local Authority Type"]);
	editAppSpecific("Local Authority Name",PInfo["Local Authority Name"]);
	editAppSpecific("Local Authorization Number",PInfo["Local Authorization Number"]);
	editAppSpecific("Expiration Date",PInfo["Expiration Date"]);
	editAppSpecific("Local Authority Address",PInfo["Local Authority Address"]);
	editAppSpecific("Local Authority City",PInfo["Local Authority City"]);
	editAppSpecific("Local Authorizaton Zip",PInfo["Local Authorizaton Zip"]);
	editAppSpecific("Local Authority County",PInfo["Local Authority County"]);
	editAppSpecific("Local Authority Phone",PInfo["Local Authority Phone"]);

//  Send email notification to DRP
	emailRptContact("", "LCA_AMENMDENT_SUBMISSION", "", false, capStatus, capId, "Designated Responsible Party");
	
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/ADMINISTRATIVE: " + err.message);
	logDebug(err.stack);
}