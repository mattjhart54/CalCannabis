try {
// Link Amendment record to License reord as a child
	var parentAltId = AInfo["License Number"];
	addParent(parentAltId)
	
// Set alt id the amendment record based on the number of chlild amendments records linked to the license record
	parentId = aa.cap.getCapID(parentAltId).getOutput();
	cIds = getChildren("Licenses/Cultivator/Amendment/Owner Information",parentId);
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
	newAltId = parentId.getCustomID() + "-OA" + amendNbr;
	var updateResult = aa.cap.updateCapAltID(capId, newAltId);
	if (updateResult.getSuccess()) 
		logDebug("Updated amendment record AltId to " + newAltId + ".");
	else 
		logDebug("Error renaming amendment record " + capId);
// Get Owner Change records then get child Owner Application records
	var ownAppFnd = false;
	OCRecs = getChildren("Licenses/Cultivator/Amendment/Owner Change",parentId);
	for(oc in OCRecs) {
		ocId = OCRecs[oc];
		ownApps = getChildren("Licenses/Cultivator/Medical/Owner Application",ocId);
		for(oa in ownApps) {
			ownId = ownApps[oa];
			var ownContact = getContactObj(ownId,"Owner");
			if(ownContact) {
				if(AInfo["Owner Email"].toUpperCase() == ownContact.capContact.email.toUpperCase() && AInfo["Owner First Name"].toUpperCase() == ownContact.capContact.firstName.toUpperCase() &&
				   AInfo["Owner Last Name"].toUpperCase() == ownContact.capContact.lastName.toUpperCase()) {
					ownAppFnd = true;
					break;
				}
			}
		}
		if(ownAppFnd) 
			break;
			
	}
	if(!ownAppFnd) {
// Get Owner Application record
		appRecs = getChildren("Licenses/Cultivator/*/Application",parentId);
		var appFnd = false;
		for(a in appRecs) {
			appId = appRecs[a];
			appCap = aa.cap.getCap(appRecs[a]).getOutput();
			typeResult = appCap.getCapType();
			typeString = typeResult.toString();
			typeArray = typeString.split("/");
			if(matches(typeArray[2],"Medical","Adult Use")) {
				appFnd = true;
				break;
			}
		}
		if(appFnd) {
			ownRecs = getChildren("Licenses/Cultivator/Medical/Owner Application",appId);
			ownAppFnd = false;
			for(o in ownRecs) {
				ownId = ownRecs[o];
				var ownContact = getContactObj(ownId,"Owner");
				if(ownContact) {
					if(AInfo["Owner Email"].toUpperCase() == ownContact.capContact.email.toUpperCase() && AInfo["Owner First Name"].toUpperCase() == ownContact.capContact.firstName.toUpperCase() &&
						AInfo["Owner Last Name"].toUpperCase() == ownContact.capContact.lastName.toUpperCase()) {
						ownAppFnd = true;
						break;
					}
				}
			}
		}
	}
	if(ownAppFnd) {
	// Copy custom fields from the owner application record to the amendment record
		var ownAmendRecs = getChildren("Licenses/Cultivator/Amendment/Owner Information",ownId);
		if(ownAmendRecs != null && ownAmendRecs.length > 0) {
			for(oa in ownAmendRecs) {
				ownId = ownAmendRecs[oa];
			}
			holdId = capId;
			capId = ownId;
			PInfo = new Array;
			loadAppSpecific(PInfo);
			capId = holdId;
	//		editAppSpecific("Percent Ownership",PInfo["Percent Update"]);
	//		editAppSpecific("Date Owner Acquired Interest",PInfo["DOAI Update"]);
			if(!matches(PInfo["CSI Update"],null,"",undefined)) 
				editAppSpecific("CA State issued ID #",PInfo["CSI Update"]);
			else
				editAppSpecific("CA State issued ID #",PInfo["CA State issued ID #"]);
			if(!matches(PInfo["OGI Update"],null,"",undefined)) 
				editAppSpecific("Other Government issued ID #",PInfo["OGI Update"]);
			else
				editAppSpecific("Other Government issued ID #",PInfo["Other Government issued ID #"]);
			if(!matches(PInfo["ATI Update"],null,"",undefined))
				editAppSpecific("ATI Code",PInfo["ATI Update"]);
			else
				editAppSpecific("ATI Code",PInfo["ATI Code"]);
			if(!matches(PInfo["COC Update"],null,"",undefined))
				editAppSpecific("Convicted of a Crime",PInfo["COC Update"]);
			else
				editAppSpecific("Convicted of a Crime",PInfo["Convicted of a Crime"]);
			if(!matches(PInfo["LR Update"],null,"",undefined))
				editAppSpecific("License Revoked",PInfo["LR Update"]);
			else
				editAppSpecific("License Revoked",PInfo["License Revoked"]);
			if(!matches(PInfo["SF Update"],null,"",undefined))
				editAppSpecific("Subject to Fines",PInfo["SF Update"]);
			else
				editAppSpecific("Subject to Fines",PInfo["Subject to Fines"]);
			if(!matches(PInfo["DA Update"],null,"",undefined))
				editAppSpecific("Disciplinary Actions",PInfo["DA Update"]);
			else
				editAppSpecific("Disciplinary Actions",PInfo["Disciplinary Actions"]);
			copyASITables(ownId,capId,"DEFICIENCIES","ATTAHMENTS");
			editAppName(AInfo["Owner Email"] + "-" + AInfo["Owner First Name"] + " " +  AInfo["Owner Last Name"]);
		}
		else {
			holdId = capId;
			capId = ownId;
			PInfo = new Array;
			loadAppSpecific(PInfo);
			capId = holdId;
	//		editAppSpecific("Percent Ownership",PInfo["Percent Ownership"]);
	//		editAppSpecific("Date Owner Acquired Interest",PInfo["Date Owner Acquired Interest"]);
			editAppSpecific("CA State issued ID #",PInfo["CA State issued ID #"]);
			editAppSpecific("Other Government issued ID #",PInfo["Other Government issued ID #"]);
			editAppSpecific("ATI Code",PInfo["ATI Code"]);
			editAppSpecific("Convicted of a Crime",PInfo["Convicted of a Crime"]);
			editAppSpecific("License Revoked",PInfo["License Revoked"]);
			editAppSpecific("Subject to Fines",PInfo["Subject to Fines"]);
			editAppSpecific("Disciplinary Actions",PInfo["Disciplinary Actions"]);
			copyASITables(ownId,capId,"DEFICIENCIES","ATTAHMENTS");
			editAppName(AInfo["Owner Email"] + "-" + AInfo["Owner First Name"] + " " +  AInfo["Owner Last Name"]);
		}
// Link Amendment record to License reord as a child
		var ownerAltId = ownId.getCustomID();
		addParent(ownerAltId);
// Copy the Owner contact from the License Application to the Amendment record			
		copyContactsByType_rev(ownId,capId,"Owner");
//  Send email notification to Owner
		var priContact = getContactObj(capId,"Owner");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			var acaSite = getACABaseUrl();   
			addParameter(eParams, "$$acaURL$$", acaSite);
			
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			addParameter(eParams, "$$altId$$", newAltId);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$parentId$$", parentAltId);
			var rFiles = [];
			var priEmail = ""+priContact.capContact.getEmail();
			sendNotification(sysFromEmail,priEmail,"","LCA_AMENDMENT_SUBMISSION",eParams, rFiles,capId)
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
	}
	else {
		showMessage = true;
		comment("No matching Owner application record found");
	}
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/Owner Information: " + err.message);
	logDebug(err.stack);
}