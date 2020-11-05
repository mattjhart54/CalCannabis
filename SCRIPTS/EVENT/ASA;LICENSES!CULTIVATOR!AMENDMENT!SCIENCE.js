try {
	if(!publicUser){
// Link Amendment record to License reord as a child
		var parentAltId = AInfo["License Number"];
		addParent(parentAltId);
	
// Set alt id the amendment record based on the number of chlild amendments records linked to the license record
		parentId = aa.cap.getCapID(parentAltId).getOutput();
		cIds = getChildren("Licenses/Cultivator/Amendment/Science",parentId);
		var recCnt = 0;
		for(x in cIds) {
			var recId = "" + cIds[x];
			if(recId.substring(2,5) != "EST") {
				recCnt++;
				logDebug("id " + recId.substring(2,5) + " cnt" + recCnt);
			}
		}
		if(matches(cIds, null, "", undefined)) 
			amendNbr = amendNbr = "00" + 1;
		else {
			if(recCnt <= 9)
				amendNbr = "00" +  recCnt;
			else
				if(recCnt <= 99)
					amendNbr = "0" +  recCnt;
				else
					amendNbr = recCnt;
		}
		newAltId = parentId.getCustomID() + "-SA" + amendNbr;
		var updateResult = aa.cap.updateCapAltID(capId, newAltId);
		if (updateResult.getSuccess()) 
			logDebug("Updated amendment record AltId to " + newAltId + ".");
		else 
			logDebug("Error renaming amendment record " + capId + " to " + newAltId);
	
		
// Copy the Designated resposible Party contact from the License Record to the Amanedment record
		copyContactsByType_rev(parentId,capId,"Designated Responsible Party");
	
// Copy custom fields from the license record to the parent record
		holdId = capId;
		capId = parentId;
		PInfo = new Array;
		loadAppSpecific(PInfo);
		capId = holdId;
		editAppSpecific("License Issued Type", PInfo["License Issued Type"]);
		editAppSpecific("Premise Address",PInfo["Premise Address"]);
		editAppSpecific("Premise City",PInfo["Premise City"]);
		editAppSpecific("Premise State",PInfo["Premise State"]);
		editAppSpecific("Premise Zip",PInfo["Premise Zip"]);
		editAppSpecific("Premise County",PInfo["Premise County"]);
		editAppSpecific("APN",PInfo["APN"]);
		editAppSpecific("Grid",PInfo["Grid"]);
		editAppSpecific("Grid Update",PInfo["Grid"]);
		editAppSpecific("Solar",PInfo["Solar"]);
		editAppSpecific("Solar Update",PInfo["Solar"]);
		editAppSpecific("Generator",PInfo["Generator"]);
		editAppSpecific("Generator Update",PInfo["Generator"]);
		editAppSpecific("Generator Under 50 HP",PInfo["Generator Under 50 HP"]);
		editAppSpecific("G50 Update",PInfo["Generator Under 50 HP"]);
		editAppSpecific("Other",PInfo["Other"]);
		editAppSpecific("Other Update",PInfo["Other"]);
		editAppSpecific("Other Source Description",PInfo["Other Source Description"]);
		editAppSpecific("Administrative hold area", PInfo["Administrative hold area"]);
		editAppSpecific("Aggregate square footage of noncontiguous canopy", PInfo["Aggregate square footage of noncontiguous canopy"]);
		editAppSpecific("Cannabis Waste Area", PInfo["Cannabis Waste Area"]);
		editAppSpecific("Canopy area included", PInfo["Canopy area included"]);
		editAppSpecific("Canopy Plant Count", PInfo["Canopy Plant Count"]);
		editAppSpecific("Canopy SF", PInfo["Canopy SF"]);
		editAppSpecific("Canopy SF Limit", PInfo["Canopy SF Limit"]);
		editAppSpecific("Canopy SF Limit", PInfo["Canopy SF Limit-NEW"]);
		editAppSpecific("Common Use Area(s)", PInfo["Common Use Area(s)"]);
		editAppSpecific("Designated shared area(s)", PInfo["Designated shared area(s)"]);
		editAppSpecific("Does the square footage match dimensions", PInfo["Does the square footage match dimensions"]);
		editAppSpecific("Does the square footage match the license type selected", PInfo["Does the square footage match the license type selected"]);
		editAppSpecific("Harvest storage area", PInfo["Harvest storage area"]);
		editAppSpecific("Immature Plant Area SF", PInfo["Immature Plant Area SF"]);
		editAppSpecific("Immature plant area(s) (if applicable)", PInfo["Immature plant area(s) (if applicable)"]);
		editAppSpecific("Packaging area", PInfo["Packaging area"]);
		editAppSpecific("Pesticide and agricultural chemical storage area", PInfo["Pesticide and agricultural chemical storage area"]);
		editAppSpecific("Processing area", PInfo["Processing area"]);
		editAppSpecific("Cannabis Waste Area-P", PInfo["Cannabis Waste Area-P"]);
		editAppSpecific("Common Use Area(s)-P", PInfo["Common Use Area(s)-P"]);
		editAppSpecific("Composting Area-P", PInfo["Composting Area-P"]);
		editAppSpecific("Designated shared area(s)-P", PInfo["Designated shared area(s)-P"]);
		editAppSpecific("Harvest Storage Area-P", PInfo["Harvest Storage Area-P"]);
		editAppSpecific("Packaging Area-P", PInfo["Packaging Area-P"]);
		editAppSpecific("Processing Area-P", PInfo["Processing Area-P"]);
		editAppSpecific("Immature canopy square footage-N", PInfo["Immature canopy square footage-N"]);
		editAppSpecific("Immature Plant Area-N", PInfo["Immature Plant Area-N"]);
		editAppSpecific("Seed Production Area-N", PInfo["Seed Production Area-N"]);
		editAppSpecific("Research and Development Area-N", PInfo["Research and Development Area-N"]);
		editAppSpecific("Pesticide and Agricultural Chemical Storage Area-N", PInfo["Pesticide and Agricultural Chemical Storage Area-N"]);
		editAppSpecific("Composting Area-N", PInfo["Composting Area-N"]);
		editAppSpecific("Cannabis Waste Area-N", PInfo["Cannabis Waste Area-N"]);
		editAppSpecific("Designated shared area(s)-N", PInfo["Designated shared area(s)-N"]);
		editAppSpecific("Common Use Area(s)-N", PInfo["Common Use Area(s)-N"]);
		editAppSpecific("Composting area", PInfo["Composting area"]);
		editAppSpecific("Property Diagram Review Status", ["Property Diagram Review Status"]);
		editAppSpecific("APN-PD", ["APN-PD"]);
		editAppSpecific("APN located in correct city/county?", ["APN located in correct city/county?"]);
		editAppSpecific("Property boundaries w/dimensions?", ["Property boundaries w/dimensions?"]);
		editAppSpecific("Premises boundaries w/dimensions?", ["Premises boundaries w/dimensions?"]);
		editAppSpecific("Entrances and Exits to the property?", ["Entrances and Exits to the property?"]);
		editAppSpecific("Entrances and Exits to the Premises?", ["Entrances and Exits to the Premises?"]);
		editAppSpecific("Does diagram clearly define and label premises from property?", ["Does diagram clearly define and label premises from property?"]);
		editAppSpecific("All roads labeled?", ["All roads labeled?"]);
		editAppSpecific("All water crossings labeled?", ["All water crossings labeled?"]);
		editAppSpecific("All water sources identified and labeled for beneficial use?", ["All water sources identified and labeled for beneficial use?"]);
		editAppSpecific("Location and coordinates of all sources of water used?", ["Location and coordinates of all sources of water used?"]);
		editAppSpecific("Location, coordinates, type, and capacity of each storage unit?", ["Location, coordinates, type, and capacity of each storage unit?"]);
		editAppSpecific("Water Distribution Lines?", ["Water Distribution Lines?"]);
		editAppSpecific("Does the diagram contain highlighting?", ["Does the diagram contain highlighting?"]);
		editAppSpecific("Is the diagram to scale?", ["Is the diagram to scale?"]);
		editAppSpecific("Premises is Contiguous?", ["Premises is Contiguous?"]);
		editAppSpecific("Lighting Diagram Review Status", ["Lighting Diagram Review Status"]);
		editAppSpecific("Location of All Lights in Canopy", ["Location of All Lights in Canopy"]);
		editAppSpecific("Max Wattage of Each Light", ["Max Wattage of Each Light"]);
		editAppSpecific("Reviewer Calculated Watt/SF", ["Reviewer Calculated Watt/SF"]);
		editAppSpecific("Does the Watts per Sqft Match the License Type", ["Does the Watts per Sqft Match the License Type"]);
		editAppSpecific("Watts/SF", ["Watts/SF"]);
		editAppSpecific("Watts/SF limit", ["Watts/SF limit"]);
		editAppSpecific("Watts/SF limit", ["Watts/SF limit-NEW"]);
		editAppSpecific("Some or all of the canopy is Light Dep", ["Some or all of the canopy is Light Dep"]);
		editAppSpecific("Pest Management Review Status", ["Pest Management Review Status"]);
		editAppSpecific("Pesticide(s) product name(s)", ["Pesticide(s) product name(s)"]);
		editAppSpecific("Pesticide(s) active ingredient", ["Pesticide(s) active ingredient"]);
		editAppSpecific("Biological controls", ["Biological controls"]);
		editAppSpecific("Cultural controls", ["Cultural controls"]);
		editAppSpecific("Chemical controls", ["Chemical controls"]);
		editAppSpecific("Waste Management Review Status", ["Waste Management Review Status"]);
		editAppSpecific("On-site Composting of Cannabis Waste", ["On-site Composting of Cannabis Waste"]);
		editAppSpecific("On-site Composting of Cannabis Waste", ["On-site Composting of Cannabis Waste-NEW"]);
		editAppSpecific("Local Agency Franchised or Contracted/Permitted Waste Hauler", ["Local Agency Franchised or Contracted/Permitted Waste Hauler"]);
		editAppSpecific("Local Agency Franchised or Contracted/Permitted Waste Hauler", ["Local Agency Franchised or Contracted/Permitted Waste Hauler-NEW"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility", ["Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility", ["Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility-NEW"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Composting Facility/Operation", ["Self-Haul to a Manned Fully Permitted Composting Facility/Operation"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Composting Facility/Operation", ["Self-Haul to a Manned Fully Permitted Composting Facility/Operation-NEW"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation", ["Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation", ["Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation-NEW"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation", ["Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation", ["Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation-NEW"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility", ["Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility"]);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility", ["Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility-NEW"]);
		editAppSpecific("Self-Haul to a Recycling Center That Meets Regulations Requirements", ["Self-Haul to a Recycling Center That Meets Regulations Requirements"]);
		editAppSpecific("Self-Haul to a Recycling Center That Meets Regulations Requirements", ["Self-Haul to a Recycling Center That Meets Regulations Requirements-NEW"]);
		editAppSpecific("Reintroduction of cannabis waste back into Agricultural operations", ["Reintroduction of cannabis waste back into Agricultural operations"]);
		editAppSpecific("Reintroduction of cannabis waste back into Agricultural operations", ["Reintroduction of cannabis waste back into Agricultural operations-NEW"]);
		editAppSpecific("Other", ["Other"]);
		editAppSpecific("Other", ["Other-NEW"]);
		editAppSpecific("Other Waste Management Method", ["Other Waste Management Method"]);
		editAppSpecific("Envirostor Review Status", ["Envirostor Review Status"]);
		editAppSpecific("Evidence of an Envirostor Search", ["Evidence of an Envirostor Search"]);
		editAppSpecific("Search Criteria matches the cultivation property", ["Search Criteria matches the cultivation property"]);
		editAppSpecific("Is a mitigation(s)/Employee Protection Plan supplied, if hazardous materials were identified on site", ["Is a mitigation(s)/Employee Protection Plan supplied, if hazardous materials were identified on site"]);
		editAppSpecific("CEQA Review Status", ["CEQA Review Status"]);
		editAppSpecific("CEQA Status", ["CEQA Status"]);
		editAppSpecific("CEQA Document Provided", ["CEQA Document Provided"]);
		editAppSpecific("Other CEQA Document Provided ", ["Other CEQA Document Provided "]);
		editAppSpecific("APN Matches Premises-CEQA", ["APN Matches Premises-CEQA"]);
		editAppSpecific("CDFA CEQA Action", ["CDFA CEQA Action"]);
		editAppSpecific("Other CDFA CEQA Action", ["Other CDFA CEQA Action"]);
		editAppSpecific("CEQA Notes", ["CEQA Notes"]);
		editAppSpecific("NOA Review Status", ["NOA Review Status"]);
		editAppSpecific("WDID", ["WDID"]);
		editAppSpecific("APN Matches Premises", ["APN Matches Premises"]);
		editAppSpecific("Issue Date", ["Issue Date"]);
		editAppSpecific("Expiration Date", ["Expiration Date"]);
		editAppSpecific("General Order", ["General Order"]);
		editAppSpecific("Order Number", ["Order Number"]);
		editAppSpecific("Enrollment Level", ["Enrollment Level"]);
		editAppSpecific("Other Description", ["Other Description"]);
		editAppSpecific("Water Source Review Status", ["Water Source Review Status"]);
		editAppSpecific("Rainwater Catchment Review Status", ["Rainwater Catchment Review Status"]);
		editAppSpecific("Groundwater Well Review Status", ["Groundwater Well Review Status"]);
		editAppSpecific("Small Retail Water Supplier Review Status", ["Small Retail Water Supplier Review Status"]);
		editAppSpecific("Retail Water Supplier Review Status", ["Retail Water Supplier Review Status"]);
		editAppSpecific("Water Rights Review Status", ["Water Rights Review Status"]);
		editAppSpecific("LSA Review Status", ["LSA Review Status"]);
		editAppSpecific("APN Matches Premises-LSA", ["APN Matches Premises-LSA"]);
		editAppSpecific("APN Matches Adjacent Parcel", ["APN Matches Adjacent Parcel"]);
		editAppSpecific("Notes", ["Notes"]);
		copyASITables(parentId,capId,"DEFICIENCIES","DENIAL REASONS","OWNERS","CANNABIS FINANCIAL INTEREST");
		editAppName(PInfo["Cultivator Type"] + " " + PInfo["License Issued Type"] + " - " +PInfo["License Type"]);
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
			sendNotification(sysFromEmail,priEmail,"","LCA_SCIENCE_AMENDMENT_SUBMITTED",eParams, rFiles,capId)
	//	emailRptContact("", "LCA_AMENDMENT_SUBMISSION", "", false, capStatus, capId, "Designated Responsible Party");
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("Science Amendment Submission","Amendment Notifications", "New");
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
}catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: " + err.message);
	logDebug(err.stack);
}
