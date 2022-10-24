try {
	pId = AInfo["License Number"]; 
	plId = aa.cap.getCapID(pId).getOutput(); 
	var currCap = capId; 
	capId = plId;
	PInfo = new Array;
	loadAppSpecific(PInfo);
	var legalBusName = PInfo['Legal Business Name'];
	var lightType = PInfo['License Type'];
	var lightTypeArray = lightType.split(" ");
	capId = currCap;
		
//error messages
	var licTypeMessage = "Neither the DRP or Legal Business Name match the Primary record’s DRP or Legal Business Name. If a change has occurred, you must first submit a <a href=" + '"https://cannabis.ca.gov/wp-content/uploads/sites/2/2021/12/DCC-LIC-027-Notifications-and-Requests-to-Modify-a-License.pdf"'+" target="+'"_blank"'+">Notification and Request Form (DCC-LIC-027)</a>" + " to request a modification to the license record before you can proceed with a conversion request." + br;
	var lightTypeMessage = "The lighting type does not match the primary record lighting type of " + lightType + ". The lighting type refers to Indoor, Outdoor, Mixed-light Tier 1, or Mixed-light Tier 2." + br;
	errorMessage = "";
		
	var c = aa.people.getCapContactByCapID(plId).getOutput();
	for(i in c) {
		var con = c[i];
		var conType = con.getCapContactModel().getContactType();
		if(conType == "Designated Responsible Party") {
			var licFirstName = con.getCapContactModel().getFirstName();	
			var licLastName  = con.getCapContactModel().getLastName();
		}
	}
//Compare Data from Licenses to Convert Table to Primary License Info
	if (typeof(LICENSERECORDSFORCONVERSION) == "object") {
		if(LICENSERECORDSFORCONVERSION.length > 0){
			for (var x in LICENSERECORDSFORCONVERSION) {
				var theRow = LICENSERECORDSFORCONVERSION[x];
				var convFirstName = theRow["DRP First Name"];
				logDebug("convFirstName: " + convFirstName);
				var convLastName = theRow["DRP Last Name"];
				var convLegalBusName = theRow["Legal Business Name"];
				var convLightType = theRow["Lighting Type"];
				var convLightTypeArray = convLightType.split(" ");
				var convLicRec = theRow["License Record ID"];
				convCapId = getApplication(convLicRec);
				var convCap = aa.cap.getCap(convCapId).getOutput();
				var convStatus = convCap.getCapStatus();
				if (matches(convStatus,"Active", "About to Expire", "Expired - Pending Renewal")){
					if ((convFirstName.toUpperCase() != licFirstName.toUpperCase()) || (convLastName.toUpperCase() != licLastName.toUpperCase())
						|| (convLegalBusName.toUpperCase() != legalBusName.toUpperCase())){	
						errorMessage += convLicRec + ": " + licTypeMessage;
					}
				}
				if (lightTypeArray[lightTypeArray.length - 1].toUpperCase() != convLightTypeArray[convLightTypeArray.length - 1].toUpperCase()){
					errorMessage += convLicRec + ": " + lightTypeMessage;
				}
			}
		}
	}	
	cIds = getChildren("Licenses/Cultivator/License/License");
	if(cIds.length > 0) {
		for( c in cIds) {
			found = false;
			child = cIds[c];
			logDebug("plid " + plId.getCustomID() + " child " + child.getCustomID());
			if(plId.getCustomID() == child.getCustomID()) {
				found = true;
			}
			logDebug("found " + found + " plid " + plId + " child " + child);
			if(LICENSERECORDSFORCONVERSION.length > 0) {
				for (x in LICENSERECORDSFORCONVERSION){
					licId = getApplication(LICENSERECORDSFORCONVERSION[x]["License Record ID"]);
					logDebug("licid " + plId + " chi;d " +child);
					if(licId == child)
						found = true;
				}
				if(found == false) {
					aa.cap.removeProjectChild(capId, child)
					logDebug("removed child " + child);
				}
			}else {
				if(found == false) {
					aa.cap.removeProjectChild(capId, child)
					logDebug("removed child " + child);
				}
			}	
		}
	}		
	if(LICENSERECORDSFORCONVERSION.length > 0){
		if (typeof(LICENSERECORDSFORCONVERSION) == "object") {
			for (x in LICENSERECORDSFORCONVERSION){
				licId = getApplication(LICENSERECORDSFORCONVERSION[x]["License Record ID"]);
				found = false;
				for(c in cIds) {
					if(licId == cIds[c])
						found = true;
				}
				if(!found) {
					aa.cap.createAppHierarchy(capId,licId);
					logDebug("added child " + LICENSERECORDSFORCONVERSION[x]["License Record ID"]);	
				}
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUA:Licenses/Cultivation/Conversion Request/*: Update conversion license table: " + err.message);
	logDebug(err.stack);
}
