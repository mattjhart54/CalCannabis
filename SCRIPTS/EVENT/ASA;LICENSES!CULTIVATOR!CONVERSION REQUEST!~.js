try {
	if(!publicUser){
// Link Requested License(s) to Conversion Request Record as a child

		primaryRecId = getApplication(AInfo['License Number']);
		if(primaryRecId){
			aa.cap.createAppHierarchy(capId,primaryRecId);
			loadASITables();

			if (typeof(LICENSERECORDSFORCONVERSION) == "object") {
				if(LICENSERECORDSFORCONVERSION.length > 0){
					for (x in LICENSERECORDSFORCONVERSION){
						var convCapId = getApplication(LICENSERECORDSFORCONVERSION[x]["License Record ID"]);
						aa.cap.createAppHierarchy(capId,convCapId);
					}
				}
			}
			updateAppStatus("Submitted","");
		
			
	// Copy the Designated resposible Party and Business contact from the License Record to the Amanedment record
			copyContactsByType_rev(primaryRecId,capId,"Designated Responsible Party");
			copyContactsByType_rev(primaryRecId,capId,"Business");
		
	// Copy custom fields from the license record to the parent record
			holdId = capId;
			capId = primaryRecId;
			PInfo = new Array;
			loadAppSpecific(PInfo);
			vLicenseObj = new licenseObject(null,capId);
			vCurrExpDate = vLicenseObj.b1ExpDate;
			capId = holdId;
			editAppSpecific("Current License Type", PInfo["License Type"]);
			editAppSpecific("Submitted License Type", AInfo["Proposed License Type"])
			editAppSpecific("License Expiration Date", vCurrExpDate);
			editAppSpecific("Legal Business Name", PInfo["Legal Business Name"]);
			updateWorkDesc(PInfo["Legal Business Name"]);
			updateShortNotes(PInfo["Premise County"]);
			editAppSpecific("License Issued Type", PInfo["License Issued Type"]);
			editAppSpecific("Premise Address",PInfo["Premise Address"]);
			editAppSpecific("Premise City",PInfo["Premise City"]);
			editAppSpecific("Premise State",PInfo["Premise State"]);
			editAppSpecific("Premise Zip",PInfo["Premise Zip"]);
			editAppSpecific("Premise County",PInfo["Premise County"]);
			editAppSpecific("APN",PInfo["APN"]);
			editAppSpecific("Tribal Land",PInfo["Tribal Land"]);
			editAppSpecific("Tribal Land Information",PInfo["Tribal Land Information"]);
			editAppSpecific("Grid",PInfo["Grid"]);
			editAppSpecific("Grid Update",PInfo["Grid"]);
			editAppSpecific("Solar",PInfo["Solar"]);
			editAppSpecific("Solar Update",PInfo["Solar"]);
			editAppSpecific("Generator",PInfo["Generator"]);
			editAppSpecific("Generator Update",PInfo["Generator"]);
			editAppSpecific("Generator Under 50 HP",PInfo["Generator Under 50 HP"]);
			editAppSpecific("G50 Update",PInfo["Generator Under 50 HP"]);
			useAppSpecificGroupName = true; 
			var powerOther = getAppSpecific("POWER SOURCE.Other",primaryRecId);
			editAppSpecific("POWER SOURCE.Other",powerOther);
			useAppSpecificGroupName = false;
			editAppSpecific("Other Update",PInfo["Other"]);
			editAppSpecific("Other Source Description",PInfo["Other Source Description"]);
			editAppSpecific("Medium Validation",PInfo["Medium Validation"]);
			editAppSpecific("Premises Diagram Review Status",PInfo["Premises Diagram Review Status"]);
			editAppSpecific("Administrative hold area", PInfo["Administrative hold area"]);
			editAppSpecific("Administrative hold area-NEW", PInfo["Administrative hold area"]);
			editAppSpecific("Aggregate square footage of noncontiguous canopy", PInfo["Aggregate square footage of noncontiguous canopy"]);
			editAppSpecific("Cannabis Waste Area", PInfo["Cannabis Waste Area"]);
			editAppSpecific("Canopy area included", PInfo["Canopy area included"]);
			editAppSpecific("Canopy Plant Count", PInfo["Canopy Plant Count"]);
			editAppSpecific("Canopy SF", PInfo["Canopy SF"]);
			editAppSpecific("Canopy SF Limit", PInfo["Canopy SF Limit"]);
			editAppSpecific("Canopy SF Limit-NEW", PInfo["Canopy SF Limit"]);
			editAppSpecific("Common Use Area(s)", PInfo["Common Use Area(s)"]);
			editAppSpecific("Designated shared area(s)", PInfo["Designated shared area(s)"]);
			editAppSpecific("Does the square footage match dimensions", PInfo["Does the square footage match dimensions"]);
			editAppSpecific("Does the square footage match the license type selected", PInfo["Does the square footage match the license type selected"]);
			editAppSpecific("Harvest storage area", PInfo["Harvest storage area"]);
			editAppSpecific("Immature Plant Area SF", PInfo["Immature Plant Area SF"]);
			editAppSpecific("Trade sample(s)", PInfo["Trade sample(s)"]);
			editAppSpecific("Immature plant area(s) (if applicable)", PInfo["Immature plant area(s) (if applicable)"]);
			editAppSpecific("Packaging area", PInfo["Packaging area"]);
			editAppSpecific("Pesticide and agricultural chemical storage area", PInfo["Pesticide and agricultural chemical storage area"]);
			editAppSpecific("Processing area", PInfo["Processing area"]);
			editAppSpecific("Cannabis Waste Area-P", PInfo["Cannabis Waste Area-P"]);
			editAppSpecific("Common Use Area(s)-P", PInfo["Common Use Area(s)-P"]);
			editAppSpecific("Composting Area-P", PInfo["Composting Area-P"]);
			editAppSpecific("Trade sample(s)-P", PInfo["Trade sample(s)-P"]);
			editAppSpecific("Designated shared area(s)-P", PInfo["Designated shared area(s)-P"]);
			editAppSpecific("Harvest Storage Area-P", PInfo["Harvest Storage Area-P"]);
			editAppSpecific("Packaging Area-P", PInfo["Packaging Area-P"]);
			editAppSpecific("Processing Area-P", PInfo["Processing Area-P"]);
			editAppSpecific("Immature canopy square footage-N", PInfo["Immature canopy square footage-N"]);
			editAppSpecific("Immature Plant Area-N", PInfo["Immature Plant Area-N"]);
			editAppSpecific("Seed Production Area-N", PInfo["Seed Production Area-N"]);
			editAppSpecific("Trade sample(s)-N", PInfo["Trade sample(s)-N"]);
			editAppSpecific("Research and Development Area-N", PInfo["Research and Development Area-N"]);
			editAppSpecific("Pesticide and Agricultural Chemical Storage Area-N", PInfo["Pesticide and Agricultural Chemical Storage Area-N"]);
			editAppSpecific("Composting Area-N", PInfo["Composting Area-N"]);
			editAppSpecific("Cannabis Waste Area-N", PInfo["Cannabis Waste Area-N"]);
			editAppSpecific("Designated shared area(s)-N", PInfo["Designated shared area(s)-N"]);
			editAppSpecific("Common Use Area(s)-N", PInfo["Common Use Area(s)-N"]);
			editAppSpecific("Composting area", PInfo["Composting area"]);
			editAppSpecific("Property Diagram Review Status",PInfo["Property Diagram Review Status"]);
			editAppSpecific("APN-PD", PInfo["APN-PD"]);
			editAppSpecific("APN located in correct city/county?", PInfo["APN located in correct city/county?"]);
			editAppSpecific("Property boundaries w/dimensions?", PInfo["Property boundaries w/dimensions?"]);
			editAppSpecific("Premises boundaries w/dimensions?", PInfo["Premises boundaries w/dimensions?"]);
			editAppSpecific("Entrances and Exits to the property?", PInfo["Entrances and Exits to the property?"]);
			editAppSpecific("Entrances and Exits to the Premises?", PInfo["Entrances and Exits to the Premises?"]);
			editAppSpecific("Does diagram clearly define and label premises from property?", PInfo["Does diagram clearly define and label premises from property?"]);
			editAppSpecific("All roads labeled?", PInfo["All roads labeled?"]);
			editAppSpecific("Other Licenses and Land Uses Identified Clearly?", PInfo["Other Licenses and Land Uses Identified Clearly?"]);
			editAppSpecific("All water crossings labeled?", PInfo["All water crossings labeled?"]);
			editAppSpecific("All water sources identified and labeled for beneficial use?", PInfo["All water sources identified and labeled for beneficial use?"]);
			editAppSpecific("Location and coordinates of all sources of water used?", PInfo["Location and coordinates of all sources of water used?"]);
			editAppSpecific("Location, coordinates, type, and capacity of each storage unit?", PInfo["Location, coordinates, type, and capacity of each storage unit?"]);
			editAppSpecific("Total volume of water storage on site", PInfo["Total volume of water storage on site"]);
			editAppSpecific("Water Distribution Lines?", PInfo["Water Distribution Lines?"]);
			editAppSpecific("Does the diagram contain highlighting?", PInfo["Does the diagram contain highlighting?"]);
			editAppSpecific("Does the diagram contain highlighting?-NEW", PInfo["Does the diagram contain highlighting?"]);
			editAppSpecific("Is the diagram to scale?", PInfo["Is the diagram to scale?"]);
			editAppSpecific("Premises is Contiguous?", PInfo["Premises is Contiguous?"]);
			editAppSpecific("Residence (if applicable)?", PInfo["Residence (if applicable)?"]);
			editAppSpecific("Lighting Diagram Review Status", PInfo["Lighting Diagram Review Status"]);
			editAppSpecific("Location of All Lights in Canopy", PInfo["Location of All Lights in Canopy"]);
			editAppSpecific("Max Wattage of Each Light", PInfo["Max Wattage of Each Light"]);
			editAppSpecific("Reviewer Calculated Watt/SF", PInfo["Reviewer Calculated Watt/SF"]);
			editAppSpecific("Does the Watts per Sqft Match the License Type", PInfo["Does the Watts per Sqft Match the License Type"]);
			editAppSpecific("Watts/SF", PInfo["Watts/SF"]);
			editAppSpecific("Watts/SF limit", PInfo["Watts/SF limit"]);
			editAppSpecific("Watts/SF limit-NEW", PInfo["Watts/SF limit"]);
			editAppSpecific("Some or all of the canopy is Light Dep", PInfo["Some or all of the canopy is Light Dep"]);
			editAppSpecific("Pest Management Review Status", PInfo["Pest Management Review Status"]);
			editAppSpecific("Pesticide(s) product name(s)", PInfo["Pesticide(s) product name(s)"]);
			editAppSpecific("Pesticide(s) active ingredient", PInfo["Pesticide(s) active ingredient"]);
			editAppSpecific("Biological controls", PInfo["Biological controls"]);
			editAppSpecific("Cultural controls", PInfo["Cultural controls"]);
			editAppSpecific("Chemical controls", PInfo["Chemical controls"]);
			editAppSpecific("Waste Management Review Status", PInfo["Waste Management Review Status"]);
			editAppSpecific("On-site Composting of Cannabis Waste", PInfo["On-site Composting of Cannabis Waste"]);
			editAppSpecific("On-site Composting of Cannabis Waste-NEW", PInfo["On-site Composting of Cannabis Waste"]);
			editAppSpecific("Local Agency Franchised or Contracted/Permitted Waste Hauler", PInfo["Local Agency Franchised or Contracted/Permitted Waste Hauler"]);
			editAppSpecific("Local Agency Franchised or Contracted/Permitted Waste Hauler-NEW", PInfo["Local Agency Franchised or Contracted/Permitted Waste Hauler"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility", PInfo["Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility-NEW", PInfo["Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted Composting Facility/Operation", PInfo["Self-Haul to a Manned Fully Permitted Composting Facility/Operation"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted Composting Facility/Operation-NEW", PInfo["Self-Haul to a Manned Fully Permitted Composting Facility/Operation"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation", PInfo["Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation-NEW", PInfo["Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation", PInfo["Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation-NEW", PInfo["Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility", PInfo["Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility"]);
			editAppSpecific("Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility-NEW", PInfo["Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility"]);
			editAppSpecific("Self-Haul to a Recycling Center That Meets Regulations Requirements", PInfo["Self-Haul to a Recycling Center That Meets Regulations Requirements"]);
			editAppSpecific("Self-Haul to a Recycling Center That Meets Regulations Requirements-NEW", PInfo["Self-Haul to a Recycling Center That Meets Regulations Requirements"]);
			editAppSpecific("Reintroduction of cannabis waste back into Agricultural operations", PInfo["Reintroduction of cannabis waste back into Agricultural operations"]);
			editAppSpecific("Reintroduction of cannabis waste back into Agricultural operations-NEW", PInfo["Reintroduction of cannabis waste back into Agricultural operations"]);
			useAppSpecificGroupName = true; 
			var wasteOther = getAppSpecific("WASTE MANAGEMENT.Other",primaryRecId);
			editAppSpecific("WASTE MANAGEMENT.Other", wasteOther);
			useAppSpecificGroupName = false;
			editAppSpecific("Other-NEW", PInfo["Other"]);
			editAppSpecific("Other Waste Management Method", PInfo["Other Waste Management Method"]);
			editAppSpecific("Envirostor Review Status", PInfo["Envirostor Review Status"]);
			editAppSpecific("Evidence of an Envirostor Search", PInfo["Evidence of an Envirostor Search"]);
			editAppSpecific("Search Criteria matches the cultivation property", PInfo["Search Criteria matches the cultivation property"]);
			editAppSpecific("Is a mitigation(s)/Employee Protection Plan supplied, if hazardous materials were identified on site", PInfo["Is a mitigation(s)/Employee Protection Plan supplied, if hazardous materials were identified on site"]);
			editAppSpecific("CEQA Review Status", PInfo["CEQA Review Status"]);
			editAppSpecific("CEQA Status", PInfo["CEQA Status"]);
			editAppSpecific("CEQA Document Provided", PInfo["CEQA Document Provided"]);
			editAppSpecific("Other CEQA Document Provided", PInfo["Other CEQA Document Provided"]);
			editAppSpecific("APN Matches Premises-CEQA", PInfo["APN Matches Premises-CEQA"]);
			editAppSpecific("CDFA CEQA Action", PInfo["CDFA CEQA Action"]);
			editAppSpecific("Other CDFA CEQA Action", PInfo["Other CDFA CEQA Action"]);
			editAppSpecific("CEQA Notes", PInfo["CEQA Notes"]);
			editAppSpecific("NOA Review Status", PInfo["NOA Review Status"]);
			editAppSpecific("WDID", PInfo["WDID"]);
			editAppSpecific("APN Matches Premises", PInfo["APN Matches Premises"]);
			editAppSpecific("Issue Date", PInfo["Issue Date"]);
			editAppSpecific("Expiration Date", PInfo["Expiration Date"]);
			editAppSpecific("General Order", PInfo["General Order"]);
			editAppSpecific("Order Number", PInfo["Order Number"]);
			editAppSpecific("Enrollment Level", PInfo["Enrollment Level"]);
			editAppSpecific("Other Description", PInfo["Other Description"]);
			editAppSpecific("WB Fee Status", PInfo["WB Fee Status"]);
			editAppSpecific("WB Fee Notes", PInfo["WB Fee Notes"]);
			editAppSpecific("Water Source Review Status", PInfo["Water Source Review Status"]);
			editAppSpecific("Rainwater Catchment Review Status", PInfo["Rainwater Catchment Review Status"]);
			editAppSpecific("Groundwater Well Review Status", PInfo["Groundwater Well Review Status"]);
			editAppSpecific("Small Retail Water Supplier Review Status", PInfo["Small Retail Water Supplier Review Status"]);
			editAppSpecific("Retail Water Supplier Review Status", PInfo["Retail Water Supplier Review Status"]);
			editAppSpecific("Water Rights Review Status", PInfo["Water Rights Review Status"]);
			editAppSpecific("LSA Review Status", PInfo["LSA Review Status"]);
			editAppSpecific("APN Matches Premises-LSA", PInfo["APN Matches Premises-LSA"]);
			editAppSpecific("APN Matches Adjacent Parcel", PInfo["APN Matches Adjacent Parcel"]);
			editAppSpecific("Notes", PInfo["Notes"]);
			copyASITablesCDFA(primaryRecId,capId,"DEFICIENCIES","DENIAL REASONS","CANNABIS FINANCIAL INTEREST","OWNERS");
			for(x in SOURCEOFWATERSUPPLY) {
				if(SOURCEOFWATERSUPPLY[x]["Type of Water Supply"] == "Groundwater Well" && matches(SOURCEOFWATERSUPPLY[x]["Status"], "Delete","Modify", "New")) {
					editAppSpecific("Groundwater Well Review Status", "Incomplete");
				}
				if(SOURCEOFWATERSUPPLY[x]["Type of Water Supply"] == "Retail Supplier" && matches(SOURCEOFWATERSUPPLY[x]["Status"], "Delete","Modify", "New")) {
					editAppSpecific("Retail Water Supplier Review Status", "Incomplete");
				}
				if(SOURCEOFWATERSUPPLY[x]["Type of Water Supply"] == "Rainwater Catchment" && matches(SOURCEOFWATERSUPPLY[x]["Status"], "Delete","Modify", "New")) {
					editAppSpecific("Rainwater Catchment Review Status", "Incomplete");
				}
				if(matches(SOURCEOFWATERSUPPLY[x]["Type of Water Supply"], "Small Retail Supplier Diversion", "Small Retail Supplier - Delivery or pickup from a groundwater well") && 
				   matches(SOURCEOFWATERSUPPLY[x]["Status"], "Delete","Modify", "New")) {
					editAppSpecific("Small Retail Water Supplier Review Status", "Incomplete");
					}
				if(SOURCEOFWATERSUPPLY[x]["Type of Water Supply"] == "Diversion from Waterbody" && matches(SOURCEOFWATERSUPPLY[x]["Status"], "Delete","Modify", "New")) {
					editAppSpecific("Water Rights Review Status", "Incomplete");
				}
			}
		//  Load only active owners in the owner table			
			var multTable = new Array(); 
			ownerInfo = loadASITable("OWNERS",primaryRecId);
			if (ownerInfo){
				for (var ii in ownerInfo) {
					if(ownerInfo[ii]["Status"] != "Deleted") {
						row = new Array();
						row["First Name"] = ownerInfo[ii]["First Name"];
						row["Last Name"] = ownerInfo[ii]["Last Name"];
						row["Email Address"] = ownerInfo[ii]["Email Address"];
						row["Percent Ownership"] = ownerInfo[ii]["Percent Ownership"];
						multTable.push(row);
					}
				}
			}
	
			if (multTable.length > 0){
				removeASITable("OWNERS");
				addASITable("OWNERS", multTable);
			}	
			
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
				addParameter(eParams, "$$altId$$", capId.getCustomID());
				addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
				addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
				addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
				var rFiles = [];
				var priEmail = ""+priContact.capContact.getEmail();
				sendNotification(sysFromEmail,priEmail,"","LIC_CC_CCR_SUBMITTED",eParams, rFiles,capId)
			}
		}	
	}
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: " + err.message);
	logDebug(err.stack);
}
