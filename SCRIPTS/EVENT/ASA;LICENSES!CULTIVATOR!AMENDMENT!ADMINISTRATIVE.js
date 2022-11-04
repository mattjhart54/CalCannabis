try {
// Link Amendment record to License reord as a child
	var parentAltId = AInfo["License Number"];
	addParent(parentAltId);
	
// Set alt id the amendment record based on the number of chlild amendments records linked to the license record
	parentId = aa.cap.getCapID(parentAltId).getOutput();
	cIds = getChildren("Licenses/Cultivator/Amendment/Administrative",parentId);
	if(matches(cIds, null, "", undefined)) 
		amendNbr = amendNbr = "00" + 1;
	else {
		cIdLen = cIds.length
		if(cIds.length <= 9)
			amendNbr = "00" +  cIdLen;
		else
			if(cIds.length <= 99)
				amendNbr = "0" +  cIdLen;
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
	copyContactsByType_rev(parentId,capId,"Business");
	copyContactsByType_rev(parentId,capId,"Agent for Service of Process");
	
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
	editAppSpecific("Secretary of State Registration Entity",PInfo["Secretary of State Registration Entity"]);
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
	editAppSpecific("Local Authorization State",PInfo["Local Authorization State"]);
	editAppSpecific("Local Authorizaton Zip",PInfo["Local Authorizaton Zip"]);
	editAppSpecific("Local Authority County",PInfo["Local Authority County"]);
	editAppSpecific("Local Authority Phone",PInfo["Local Authority Phone"]);
	editAppSpecific("Doing Business As",PInfo["Doing Business As"]);
	copyASITables(parentId,capId,"DEFICIENCIES","DENIAL REASONS","Premises Addresses","Owners","Source of Water Supply");
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