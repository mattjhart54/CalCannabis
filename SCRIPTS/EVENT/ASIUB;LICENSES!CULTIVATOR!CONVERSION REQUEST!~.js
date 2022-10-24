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
				var convFirstName = "" + theRow["DRP First Name"];
				logDebug("convFirstName: " + convFirstName);
				var convLastName = "" + theRow["DRP Last Name"];
				var convLegalBusName = "" + theRow["Legal Business Name"];
				var convLightType = "" + theRow["Lighting Type"];
				var convLightTypeArray = convLightType.split(" ");
				var convLicRec = "" + theRow["License Record ID"];
				convCapId = getApplication(convLicRec);
				var convCap = aa.cap.getCap(convCapId).getOutput();
				var convStatus = convCap.getCapStatus();
				if (matches(convStatus,"Active", "About to Expire", "Expired - Pending Renewal")){
					if ((convFirstName.toUpperCase() != licFirstName.toUpperCase()) || (convLastName.toUpperCase() != licLastName.toUpperCase())
						|| (convLegalBusName.toUpperCase() != legalBusName.toUpperCase())){	
						cancel=true;
						showMessage=true;
						comment(convLicRec + ": " + licTypeMessage);
					}
				}
				if (lightTypeArray[lightTypeArray.length - 1].toUpperCase() != convLightTypeArray[convLightTypeArray.length - 1].toUpperCase()){
						cancel=true;
						showMessage=true;
						comment(convLicRec + ": " + lightTypeMessage);
				}
			}
		}
	}	
}catch (err){
	logDebug("A JavaScript Error occurred: ASIUB:Licenses/Cultivation/Conversion Request/*: Update conversion license table: " + err.message);
	logDebug(err.stack);
}

try{
	statusArray = [];
/*	if(matches(AInfo["LSA Review Status-NEW"],"Annual", "Provisional")) {
		var lsaCheck = true;
		if(!matches(AInfo["APN Matches Premises-LSA-NEW"],"Yes","N/A","No")) {
			lsaCheck = false;
		}
		if(!matches(AInfo["APN Matches Adjacent Parcel-NEW"],"Yes","N/A","No")) {
			lsaCheck = false;
		}
		for(ls in LAKEANDSTREAMBEDALTERATION) {
			if(matches(LAKEANDSTREAMBEDALTERATION[ls]["LSA ID Number"], null,"",undefined)) {
				lsaCheck = false;
			}
			if(matches(LAKEANDSTREAMBEDALTERATION[ls]["Document Type"], null,"",undefined)) {
			 	lsaCheck = false;
			}
		}
		
		if(!lsaCheck) {
			cancel = true;
			showMessage = true;
			comment("The LSA Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
*/
	if (typeof(SOURCEOFWATERSUPPLY) == "object"){
		if(SOURCEOFWATERSUPPLY.length > 0){
			for(xx in SOURCEOFWATERSUPPLY){
				if(SOURCEOFWATERSUPPLY[xx]["Status"] != "Delete"){
					statusArray.push(SOURCEOFWATERSUPPLY[xx]["Type of Water Supply"]);
				}
			}
		}
	}		
	if(AInfo["Water Rights Review Status-NEW"] == "Complete") {
		if (WATERRIGHTS.length > 0){
			wrLines = 0;
			for(wr in WATERRIGHTS){
				if (WATERRIGHTS[wr]["Currently used for Cannabis?"] != "No"){
					wrLines++;
				}
			}	
			if(getOccurrence(statusArray, "Diversion from Waterbody") != wrLines) {
				cancel = true;
				showMessage = true;
				comment("The number of Diversion from Waterbody and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
			}
		}else{
			cancel = true;
			showMessage = true;
			comment("The Water Rights Review Status cannot be marked Complete as at least one of the fields is insufficient.");	
		}
	}
	if(AInfo["Rainwater Catchment Review Status-NEW"] == "Complete") {	
		if(RAINWATERCATCHMENT.length > 0){
			rwLines = 0;
			for(rw in RAINWATERCATCHMENT){
				if(RAINWATERCATCHMENT[rw]["Currently Used for Cannabis?"] != "No"){
					rwLines++;
				}
			}			
			if(getOccurrence(statusArray, "Rainwater Catchment System") != rwLines) {
				cancel = true;
				showMessage = true;
				comment("The number of water sources in the Rain Catchment table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
			}
		}else{
				cancel = true;
				showMessage = true;
				comment("The Rainwater Catchment Review Status cannot be marked Complete as at least one of the fields is insufficient");
		}
	}
	
	if(AInfo["Groundwater Well Review Status-NEW"] == "Complete") {
		if(GROUNDWATERWELL.length > 0){
			gwLines = 0;
			for (gw in GROUNDWATERWELL){
				if(GROUNDWATERWELL[gw]["Currently Used for Cannabis"] != "No"){
					gwLines++;
				}
			}
			if(getOccurrence(statusArray, "Groundwater Well") != gwLines) {
				cancel = true;
				showMessage = true;
				comment("The number of Groundwater Well and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
			}
		}else{
			cancel = true;
			showMessage = true;
			comment("The Groundwater Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	if(AInfo["Retail Water Supplier Review Status-NEW"] == "Complete") {
		if(RETAILWATERSUPPLIER.length > 0){
			rwsLines = 0;
			for (rws in RETAILWATERSUPPLIER){
				if(RETAILWATERSUPPLIER[rws]["Currently Used for Cannabis"] != "No"){
					rwsLines++;
				}
			}
			if(getOccurrence(statusArray, "Retail Supplier") != rwsLines) {
				cancel = true;
				showMessage = true;
				comment("The number Retail Supplier sources and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
			}
		}else{
			cancel = true;
			showMessage = true;
			comment("The Retail Water Supplier Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	if(AInfo["Small Retail Water Supplier Review Status-NEW"] == "Complete") {
		if(SMALLRETAILWATERSUPPLIERS.length > 0){
			srLines = 0;
			for (sr in SMALLRETAILWATERSUPPLIERS){
				if (SMALLRETAILWATERSUPPLIERS[sr]["Currently Used for Cannabis"] != "No"){
					srLines++;
				}
			}
			if((getOccurrence(statusArray, "Small Retail Supplier Diversion") + getOccurrence(statusArray, "Small Retail Supplier - Delivery or pickup of water from a groundwater well")) != srLines) {
				cancel = true;
				showMessage = true;
				comment("The number of Small Retail Supplier Diversion sources and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
			}
		}else{
			cancel = true;
			showMessage = true;
			comment("The Small Retail Water Supplier Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	
	/*if (typeof(APNSPATIALINFORMATION) == "object"){
		if(APNSPATIALINFORMATION.length > 0){
			var premCounty = getAppSpecific("Premise County");
			for(apn in APNSPATIALINFORMATION){
				var apnValid = true;
				var valAPN = APNSPATIALINFORMATION[apn]["Validated APN"];
				if(!matches(valAPN,null,undefined,"")){
					var apnPattern = lookup("Lookup:APN County Format",String(premCounty));
					if (!matches(apnPattern,null,undefined,"")){
						var apnPatternArray = String(apnPattern).split("-");
						var variable1Array = String(valAPN).split("-");
						if (apnPatternArray.length == variable1Array.length){
							for (i = 0; i < apnPatternArray.length; i++) {
								if (apnPatternArray[i].length == variable1Array[i].length){
									continue;
								}else{
									apnValid = false;
								}
								
							}
						}else{
							apnValid = false;
						}
					}
				}
			}
		
			if (!apnValid){
				cancel = true;
				showMessage = true;
				comment("APN does not match " + premCounty + " format - the format should be " + apnPattern + ".");
			}
		}
	}*/
	//6893 DRP custom fields must match DRP contact on License
	/*var drpContact = getContactByType("Designated Responsible Party",parentCapId);
	if(drpContact){
		var drpFirst = drpContact.getFirstName();
		var drpLast =  drpContact.getLastName();
		var drpEmail = drpContact.getEmail();
		if ((AInfo['DRP First Name'].trim().toUpperCase() != drpFirst.toUpperCase()) ||  (AInfo['DRP Last Name'].trim().toUpperCase() != drpLast.toUpperCase()) || (AInfo['DRP Email Address'].trim().toUpperCase() != drpEmail.toUpperCase())){
			cancel = true;
			showMessage = true;
			comment("DRP does not match License Record.")
		}
	}*/
}catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/CONVERSION REQUEST/NA: Water Source Reviews: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Water Source Reviews: "+ startDate, capId + br+ err.message+ br+ err.stack);
}
