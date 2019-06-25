try {
// Link Amendment record to License reord as a child
	var parentAltId = AInfo["License Number"];
	addParent(parentAltId);
	
// Set alt id the amendment record based on the number of chlild amendments records linked to the license record
	parentId = aa.cap.getCapID(parentAltId).getOutput();
	cIds = getChildren("Licenses/Cultivator/Amendment/Science",parentId);
	if(matches(cIds, null, "", undefined)) 
		amendNbr = amendNbr = "00" + 1;
	else {
		cIdLen = cIds.length 
		if(cIds.length < 9)
			amendNbr = "00" +  cIdLen;
		else
			if(cIds.length < 99)
				amendNbr = "0" +  cIdLen;
			else
				amendNbr = cIdLen;
	}
	newAltId = parentId.getCustomID() + "-SA" + amendNbr;
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
	editAppSpecific("Premise Address",PInfo["Premise Address"]);
	editAppSpecific("Premise City",PInfo["Premise City"]);
	editAppSpecific("Premise State",PInfo["Premise State"]);
	editAppSpecific("Premise Zip",PInfo["Premise Zip"]);
	editAppSpecific("Premise County",PInfo["Premise County"]);
	editAppSpecific("APN",PInfo["APN"]);
	editAppSpecific("Grid",PInfo["Grid"]);
//	editAppSpecific("Grid Update",PInfo["Grid"]);
	editAppSpecific("Solar",PInfo["Solar"]);
//	editAppSpecific("Solar Update",PInfo["Solar"]);
	editAppSpecific("Generator",PInfo["Generator"]);
//	editAppSpecific("Generator Update",PInfo["Generator"]);
	editAppSpecific("Generator Under 50 HP",PInfo["Generator Under 50 HP"]);
//	editAppSpecific("G50 Update",PInfo["Generator Under 50 HP"]);
	editAppSpecific("Other",PInfo["Other"]);
//	editAppSpecific("Other Update",PInfo["Other"]);
	editAppSpecific("Other Source Description",PInfo["Other Source Description"]);
	copyASITables(parentId,capId,"DEFICIENCIES","DENIAL REASONS","OWNERS","CANNABIS FINANCIAL INTEREST");
	editAppName(PInfo["License Type"]);
	updateShortNotes(getShortNotes(parentId));
	updateWorkDesc(workDescGet(parentId));
	
//  Send email notification to DRP
	var priContact = getContactObj(capId,"Designated Responsible Party");
	if(priContact){
		var eParams = aa.util.newHashtable(); 
		addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
		var contPhone = priContact.capContact.phone1;
		if(contPhone){
			var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
		}else{
			var fmtPhone = "";
		}
		addParameter(eParams, "$$altId$$", newAltId);
		addParameter(eParams, "$$contactPhone1$$", fmtPhone);
		addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
		addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
		addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
		addParameter(eParams, "$$parentId$$", parentAltId);
		var rFiles = [];
		var priEmail = ""+priContact.capContact.getEmail();
		sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_SUBMISSION",eParams, rFiles,capId)
	//	emailRptContact("", "LCA_AMENDMENT_SUBMISSION", "", false, capStatus, capId, "Designated Responsible Party");
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(priChannel.indexOf("Postal") > -1 ){
				var sName = createSet("Amendment Submission","Amendment Notifications", "New");
				if(sName){
					setAddResult=aa.set.add(sName,capId);
					if(setAddResult.getSuccess()){
						logDebug(capId.getCustomID() + " successfully added to set " +sName);
					}else{
						logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
					}
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/ADMINISTRATIVE: " + err.message);
	logDebug(err.stack);
}