try{
// Link Amendment record to License reord as a child
	var parentAltId = AInfo["Case Nbr"];
	addParent(parentAltId);
	
// Copy custom fields from the license record to the parent record
	holdId = capId;
	capId = parentId;
	PInfo = new Array;
	loadAppSpecific(PInfo);
	capId = holdId;
	editAppSpecific("Priority",PInfo["Priority"]);
	editAppSpecific("Due Date",PInfo["Due Date"]);
	editAppSpecific("Source of Complaint",PInfo["Source of Complaint"]);
	editAppSpecific("Other Source",PInfo["Other Source"]);
	editAppSpecific("Type of Submittal",PInfo["Type of Submittal"]);
	editAppSpecific("Location",PInfo["Location"]);
	editAppSpecific("City",PInfo["City"]);
	editAppSpecific("County",PInfo["County"]);
	editAppSpecific("APN",PInfo["APN"]);
}catch (err){
	logDebug("A JavaScript Error occurred: ASA:Enforcement/Case/Citation/NA: Update Case Information: " + err.message);
	logDebug(err.stack);
}