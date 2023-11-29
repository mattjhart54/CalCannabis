/*===========================================
Title: updateConvRecs
Purpose: When Conversion record is approved update primary license and all records being converted
Author: Matt Hart		
Functional Area : Licenses
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : Client specific record
Parameters:
	plId (required): capId of the primary license for conversion
============================================== */

function updateConvRecs (plId) {
try {
	updateAppStatus("License Issued", "updated by script");
	var licType = AInfo["Proposed License Type"];
	pId = AInfo["License Number"]; 
	plId = aa.cap.getCapID(pId).getOutput();
	crId = capId;
	capId = plId;
	PInfo = [];
	loadAppSpecific(PInfo);
	pCap = aa.cap.getCap(capId).getOutput();
	pCapName = pCap.getSpecialText();
	
// Save the current expiration date then Extend license expiration by 1 year	
	vLicenseObj = new licenseObject(null,capId);
	vCurrExpDate = vLicenseObj.b1ExpDate;
	vLicenseObj.setExpiration(dateAddMonths(null,12));
	vLicenseObj.setStatus("Active");
	
//create child histroical record from the primary license record
//before updating the primary license record from the conversion record	

//	histCapId = createChild("Licenses","Cultivator","License","License",pCapName,"Historical record");

	appCreateResult = aa.cap.createApp("Licenses","Cultivator","License","License","Historical record");
	if (appCreateResult.getSuccess()) {
		var histCapId = appCreateResult.getOutput();
		logDebug("Historical record created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(histCapId);
		aa.cap.createCapDetail(capDetailModel);

		var newObj = aa.cap.getCap(histCapId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(crId, histCapId); 
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");
	}
	else{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
	}
	
// Update the Record Number	
	altId = capId.getCustomID();
	histId = String(altId) + "-HIST";
	convIds = getChildren("Licenses/Cultivator/Conversion Request/NA",capId);
	cIdLen = 0;
	if(convIds){
		if(!matches(convIds,null,undefined,"")){
			for (jj in convIds){
				thisRecord = convIds[jj];
				cIds = getChildren("Licenses/Cultivator/License/License",thisRecord);
				if(cIds){
					if(!matches(cIds,null,undefined,"")){
						var count = cIds.filter(function(value) {
							return value.getCustomID().slice(0,18) === histId;
						}).length;
						cIdLen += count;
					}
				}
			}
		}
	}				
	if(cIdLen == 0){
		hisNbr = "00" + 1;
	}else{
		if(cIdLen <= 9) {
			hisNbr = cIdLen + 1;
			hisNbr = "00" +  hisNbr;
		}else {
			hisNbr = "0" + (cIdLen + 1);
		}
	}	
	var newAltId = altId + "-HIST" + hisNbr;
	var updAltId = aa.cap.updateCapAltID(histCapId,newAltId);
	if(!updAltId.getSuccess()){
		logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
	}else{
		logDebug("License record ID updated to : " + newAltId);
	}

//Copy data to new historical record	

	editAppName(pCapName);
	var plShortNotes = getShortNotes(capId);
	updateShortNotes(plShortNotes,histCapId);
	updateWorkDesc(workDescGet(capId),histCapId);
	copyContacts(capId,histCapId);
	var recordASIGroup = aa.appSpecificInfo.getByCapID(capId);
	if (recordASIGroup.getSuccess()){
		var recordASIGroupArray = recordASIGroup.getOutput();	
		for (i in recordASIGroupArray) {
			var group = recordASIGroupArray[i];
			var recordField = String(group.getCheckboxDesc());
			if (!matches(group.getChecklistComment(),null,undefined,"")){
				var newFieldValue = group.getChecklistComment();
				editAppSpecific(recordField,newFieldValue,histCapId);
				logDebug(recordField + "edited to: " + newFieldValue);
			}
		}
	}
	copyASITables(capId,histCapId);
	copyConditions(capId,histCapId);

//update the expiration date and license status
	vLicenseObj = new licenseObject(null,histCapId);
	vLicenseObj.setExpiration(dateAdd(vCurrExpDate,0));
	vLicenseObj.setStatus("Inactive");
	updateAppStatus("Inactive","License Converted",histCapId);
	
// update the primary license record from the Conversion Record.
	capId = crId;
	cDate = new Date();
	
	if(PInfo["License Issued Type"] == "Provisional") {
		if(AInfo["No Transition"] != "CHECKED") {
			editAppSpecific("License Issued Type", "Annual",plId);
			editAppName("Annual " + PInfo["Cultivator Type"] + " - " + licType,plId);
			editAppSpecific("Transition Date", jsDateToASIDate(cDate),plId);
		} else {
			editAppName("Provisional " + PInfo["Cultivator Type"] + " - " + licType,plId);
		}
	} else {
		editAppName("Annual " + PInfo["Cultivator Type"] + " - " + licType,plId);
	}
	editAppSpecific("Conversion Date", jsDateToASIDate(cDate),plId);
	editAppSpecific("License Type",licType,plId);
	editAppSpecific("Original License Type",licType,plId);
	
	if(!matches(AInfo["PA Update"],null,"",undefined)) {
		editAppSpecific("Premise Address",AInfo["PA Update"],plId);
	}
	if(!matches(AInfo["PC Update"],null,"",undefined)) {
		editAppSpecific("Premise City",AInfo["PC Update"],plId);
	}
	if(!matches(AInfo["PZ Update"],null,"",undefined)) {
		editAppSpecific("Premise Zip",AInfo["PZ Update"],plId);
	}
	if(!matches(AInfo["PCNTY Update"],null,"",undefined)) {
		editAppSpecific("Premise County",AInfo["PCNTY Update"],plId);
	}
	if(!matches(AInfo["APN Update"],null,"",undefined)) {
		editAppSpecific("APN",AInfo["APN Update"],plId);
	}
	if(!matches(AInfo["Tribal Land Update"],null,"",undefined)) {
		editAppSpecific("Tribal Land",AInfo["Tribal Land Update"],plId);
	}
	if(!matches(AInfo["Tribal Land Information Update"],null,"",undefined)) {
		editAppSpecific("Tribal Land Information",AInfo["Tribal Land Information Update"],plId);
	}
	editAppSpecific("Grid",AInfo["Grid Update"],plId);
	editAppSpecific("Solar",AInfo["Solar Update"],plId);
	editAppSpecific("Generator",AInfo["Generator Update"],plId);
	editAppSpecific("Generator Under 50 HP",AInfo["G50 Update"],plId);
	editAppSpecific("Other",AInfo["Other Update"],plId);
	if(matches(AInfo["Other Update"],null,"",undefined)){
		editAppSpecific("Other Source Description","",plId);
	}
	else {
		if(!matches(AInfo["OSD Update"],null,"",undefined)) {
			editAppSpecific("Other Source Description",AInfo["OSD Update"],plId);
		}
	}
	editAppSpecific("On-site Composting of Cannabis Waste",AInfo["On-site Composting of Cannabis Waste-NEW"],plId);
	editAppSpecific("Local Agency Franchised or Contracted/Permitted Waste Hauler",AInfo["Local Agency Franchised or Contracted/Permitted Waste Hauler-NEW"],plId);
	editAppSpecific("Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility",AInfo["Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility-NEW"],plId);
	editAppSpecific("Self-Haul to a Manned Fully Permitted Composting Facility/Operation",AInfo["Self-Haul to a Manned Fully Permitted Composting Facility/Operation-NEW"],plId);
	editAppSpecific("Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation",AInfo["Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation-NEW"],plId);
	editAppSpecific("Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation ",AInfo["Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation -NEW"],plId);
	editAppSpecific("OSelf-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility",AInfo["Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or FacilityNEW"],plId);
	editAppSpecific("Self-Haul to a Recycling Center That Meets Regulations Requirements",AInfo["Self-Haul to a Recycling Center That Meets Regulations Requirements-NEW"],plId);
	editAppSpecific("Reintroduction of cannabis waste back into Agricultural operations",AInfo["Reintroduction of cannabis waste back into Agricultural operations-NEW"],plId);		
	editAppSpecific("Other",AInfo["Other-NEW"],plId);
	if(matches(AInfo["Other-NEW"],null,"",undefined)){
		editAppSpecific("Other Waste Management Method","",plId);
	}
	else {
		if(!matches(AInfo["Other Waste Management Method-NEW"],null,"",undefined)) {
			editAppSpecific("Other Waste Management Method",AInfo["Other Waste Management Method-NEW"],plId);
		}
	}
		var recordASIGroup = aa.appSpecificInfo.getByCapID(capId);
	if (recordASIGroup.getSuccess()){
		var recordASIGroupArray = recordASIGroup.getOutput();
		
		for (i in recordASIGroupArray) {
			var group = recordASIGroupArray[i];
			var recordField = String(group.getCheckboxDesc());
			if (recordField.slice(-4) == "-NEW"){
				if (!matches(group.getChecklistComment(),null,undefined,"")){
					var parentRecordField = recordField.slice(0,-4);
					if (group.getCheckboxType() == "PROPERTY DIAGRAM" && !matches(parentRecordField,"Property Diagram Review Status","APN-PD","Does the diagram contain highlighting?")){
						parentRecordField= parentRecordField+"?";
					}
					if (group.getCheckboxType() == "ENVIROSTOR" && parentRecordField == "Is a mitigation(s)/Employee Protection Plan supplied"){
						parentRecordField = "Is a mitigation(s)/Employee Protection Plan supplied, if hazardous materials were identified on site";
					}
					var newFieldValue = group.getChecklistComment();
					editAppSpecific(parentRecordField,newFieldValue,plId);
					logDebug(parentRecordField + "edited to: " + newFieldValue);
				}
			}
		}
	}
	
	ignoreTableArray = [];
	removeASITable("OWNERS",plId);
	removeASITable("APN SPATIAL INFORMATION",plId);
	removeASITable("LAKE AND STREAMBED ALTERATION",plId);
	removeASITable("ELECTRICITY USAGE",plId);
	removeASITable("AVERAGE WEIGHTED GGEI",plId);
	if (matches(getAppSpecific("Small Retail Water Supplier Review Status-NEW"),"Complete","N/A")){
		removeASITable("SMALL RETAIL WATER SUPPLIERS",plId);
	}else{
		ignoreTableArray.push("SMALL RETAIL WATER SUPPLIERS");
	}
	if (matches(getAppSpecific("Retail Water Supplier Review Status-NEW"),"Complete","N/A")){
		removeASITable("RETAIL WATER SUPPLIER",plId);
	}else{
		ignoreTableArray.push("RETAIL WATER SUPPLIER");
	}
	if (matches(getAppSpecific("Groundwater Well Review Status-NEW"),"Complete","N/A")){
		removeASITable("GROUNDWATER WELL",plId);
	}else{
		ignoreTableArray.push("GROUNDWATER WELL");
	}
	if (matches(getAppSpecific("Rainwater Catchment Review Status-NEW"),"Complete","N/A")){
		removeASITable("RAINWATER CATCHMENT",plId);
	}else{
		ignoreTableArray.push("RAINWATER CATCHMENT");
	}
	if (matches(getAppSpecific("Water Rights Review Status-NEW"),"Complete","N/A")){
		removeASITable("WATER RIGHTS",plId);
	}else{
		ignoreTableArray.push("WATER RIGHTS");
	}
	if (typeof(PREMISESADDRESSES) == "object"){
		if(PREMISESADDRESSES.length > 0){
			premTable = new Array();
			ignoreTableArray.push("PREMISES ADDRESSES");
			for(x in PREMISESADDRESSES){
				var premAddrRow = PREMISESADDRESSES[x];
				if (premAddrRow["Status"].fieldValue != "Delete"){
					premRow = new Array();
					premRow["APN"] = premAddrRow["APN"];
					premRow["Premises Address"] = premAddrRow["Premises Address"];
					premRow["Premises City"] = premAddrRow["Premises City"];
					premRow["Premises State"] = premAddrRow["Premises State"];
					premRow["Premises Zip"] = premAddrRow["Premises Zip"];
					premRow["Premises County"] = premAddrRow["Premises County"];
					premRow["Type of Possession"] = premAddrRow["Type of Possession"];
					premRow["Owner Address"] = premAddrRow["Type of Possession"];
					premRow["Owner Phone"] = premAddrRow["Owner Phone"];
					premTable.push(premRow);
				}
			}
			removeASITable("PREMISES ADDRESSES",plId);
			addASITable("PREMISES ADDRESSES",premTable,plId);
		}
	}
	
	if (typeof(SOURCEOFWATERSUPPLY) == "object"){
		if(SOURCEOFWATERSUPPLY.length > 0){
			ignoreTableArray.push("SOURCE OF WATER SUPPLY");
			var multTable = new Array(); 
			for(x in SOURCEOFWATERSUPPLY){
				var wtrSrcRow = SOURCEOFWATERSUPPLY[x];
				row = new Array();
				if(wtrSrcRow["Status"] != "Delete"){
					row["Type of Water Supply"] = wtrSrcRow["Type of Water Supply"];
					row["Name of Supplier"] = wtrSrcRow["Name of Supplier"];
					row["Geographical Location Coordinates"] = wtrSrcRow["Geographical Location Coordinates"];
					row["Groundwater Well Geographic Location Coordinates"] = wtrSrcRow["Groundwater Well Geographic Location Coordinates"];
					row["Authorized Place of Use"] = wtrSrcRow["Authorized Place of Use"];
					row["Maximum Amount of Water Delivered"] = wtrSrcRow["Maximum Amount of Water Delivered"];
					row["Total Square Footage"] = wtrSrcRow["Total Square Footage"];
					row["Total Storage Capacity"] = wtrSrcRow["Total Storage Capacity"];
					row["Description"] = wtrSrcRow["Description"];
					row["Diversion Number"] = wtrSrcRow["Diversion Number"];
					row["Water Source"] = wtrSrcRow["Water Source"];
					multTable.push(row);
				}
			}
			removeASITable("SOURCE OF WATER SUPPLY",plId);
			addASITable("SOURCE OF WATER SUPPLY",multTable,plId);
		}
	}
	logDebug("Not copying the following Tables: " + ignoreTableArray);
	copyASITables(capId,plId,ignoreTableArray);

	//Story 7750: Create Equity Relief Table entry
	var recordASIGroup = aa.appSpecificInfo.getByCapID(capId);
	if (recordASIGroup.getSuccess()){
		var recordASIGroupArray = recordASIGroup.getOutput();
		var equityTable = new Array();
		var equityRow = new Array(); 

		for (i in recordASIGroupArray) {
			var group = recordASIGroupArray[i];
			if (String(group.getCheckboxType()) == "EQUITY FEE RELIEF"){
				recordField = String(group.getCheckboxDesc());
				fieldValue = group.getChecklistComment();
				if (!matches(fieldValue,null,undefined,"")){
					equityRow[recordField] = "" + String(fieldValue);
				}
								
			}
		}
		if (Object.keys(equityRow).length > 0){
			equityRow["Relief Record Number"] = "" + capId.getCustomID();
			equityTable.push(equityRow);
			addASITable("EQUITY FEE RELIEF", equityTable, plId);
		}
	}
	//end Story 7750
	
	//send Primary to CAT Interface
	addToCat(plId);
	
// Set status to Cancelled on all converted records
	for(c in LICENSERECORDSFORCONVERSION) {
		convNbr = LICENSERECORDSFORCONVERSION[c]["License Record ID"];
		convId = aa.cap.getCapID(convNbr).getOutput();
		updateAppStatus("Cancelled", "Record converted to " + licType + " on license " + plId.getCustomID(),convId);
		editAppSpecific("Conversion Date", jsDateToASIDate(cDate),convId);
		addToCat(convId);
	}
		
}catch(err){
	logDebug("An error has occurred in function updateConvRecs " + err.message);
	logDebug(err.stack);
}
}
