try {
// Link Amendment record to License reord as a child
	var parentAltId = AInfo["License Number"];
	addParent(parentAltId);
	
// Set alt id the amendment record based on the number of chlild amendments records linked to the license record
	parentId = aa.cap.getCapID(parentAltId).getOutput();
	cIds = getChildren("Licenses/Cultivator/Amendment/DRP Declaration",parentId);
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
	newAltId = parentId.getCustomID() + "-DA" + amendNbr;
	var updateResult = aa.cap.updateCapAltID(capId, newAltId);
	if (updateResult.getSuccess()) 
		logDebug("Updated amendment record AltId to " + newAltId + ".");
	else 
		logDebug("Error renaming amendment record " + capId);
	
			
// Copy the Designated resposible Party contact from the License Record to the Amanedment record
 
    copyContactsByType_rev(parentId,capId,"Designated Responsible Party");
	if(AInfo["Change DRP"] == "Yes" && !matches(AInfo["New DRP Email Address"],null,"",undefined)) {
		addRefContactByEmailLastName(AInfo["New DRP First Name"], AInfo["New DRP Last Name"], AInfo["New DRP Email Address"]);
		editContactType("Individual", "Designated Responsible Party");
	}
	//	copyContactsByType_revT(parentId,capId,"Owner",AInfo["New DRP Email Address"]);
	
// Copy custom fields from the license record to the child amendment record

//	if(parentAltId.substring(1,2) == "M")
	var cType = getAppSpecific("Cultivator Type",parentId)
//	if(cType == "Medicinal")
//		appIds = getChildren("Licenses/Cultivator/Medical/Application",parentId);
//	else
//		appIds = getChildren("Licenses/Cultivator/Adult Use/Application",parentId);
	appIds = getChildren("Licenses/Cultivator/*/Application",parentId);
	for(a in appIds) {
		decIds = getChildren("Licenses/Cultivator/Medical/Declaration",appIds[a]);
		for(d in decIds) {
			decId = decIds[d];
		}
	}
	holdId = capId;
	capId = decId;
	PInfo = new Array;
	loadAppSpecific(PInfo);
	capId = holdId;
	editAppSpecific("Conflicting License",PInfo["Conflicting License"]);
	editAppSpecific("Unlicensed Activity",PInfo["Unlicensed Activity"]);
	editAppSpecific("Documented Conduct",PInfo["Documented Conduct"]);
	editAppSpecific("Fines or Penalties",PInfo["Fines or Penalties"]);
	editAppSpecific("D1",PInfo["D1"]);
	editAppSpecific("D2",PInfo["D2"]);
	editAppSpecific("D3",PInfo["D3"]);
	editAppSpecific("D4",PInfo["D4"]);
	editAppSpecific("D5",PInfo["D5"]);
	editAppSpecific("D7",PInfo["D7"]);
	editAppSpecific("D8",PInfo["D8"]);
	editAppSpecific("D9",PInfo["D9"]);
	editAppSpecific("D10",PInfo["D10"]);
	editAppSpecific("D11",PInfo["D11"]);
	editAppSpecific("Certification",PInfo["Certification"]);
	editAppName(getAppSpecific("License Type",parentId));
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
		var acaSite = getACABaseUrl();   
		addParameter(eParams, "$$acaURL$$", acaSite);
		
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
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/DRP Declaration: " + err.message);
	logDebug(err.stack);
}