try {
	if(matches(wfStatus,"Physical Modification Approved","Approved for Provisional Renewal","Transition Amendment Approved","Approved")) {
		// Copy custom fields from the license record to the parent record
		pIds = getParents("Licenses/Cultivator/License/License");
		if(!matches(pIds,null,'',undefined)) {
			parentCapId = pIds[0];
			parentAltId = parentCapId.getCustomID();
			editAppSpecific("License Number",parentAltId,capId);
		}else {
			parentAltId = parentCapId.getCustomID();
		}
		var updateCat = false;
		if(!matches(AInfo["PA Update"],null,"",undefined)) {
			editAppSpecific("Premise Address",AInfo["PA Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["PC Update"],null,"",undefined)) {
			editAppSpecific("Premise City",AInfo["PC Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["PZ Update"],null,"",undefined)) {
			editAppSpecific("Premise Zip",AInfo["PZ Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["PCNTY Update"],null,"",undefined)) {
			editAppSpecific("Premise County",AInfo["PCNTY Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["APN Update"],null,"",undefined)) {
			editAppSpecific("APN",AInfo["APN Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["Tribal Land Update"],null,"",undefined)) {
			editAppSpecific("Tribal Land",AInfo["Tribal Land Update"],parentCapId);
			updateCat = true;
		}
		if(!matches(AInfo["Tribal Land Information Update"],null,"",undefined)) {
			editAppSpecific("Tribal Land Information",AInfo["Tribal Land Information Update"],parentCapId);
			updateCat = true;
		}
		editAppSpecific("Grid",AInfo["Grid Update"],parentCapId);
		editAppSpecific("Solar",AInfo["Solar Update"],parentCapId);
		editAppSpecific("Generator",AInfo["Generator Update"],parentCapId);
		editAppSpecific("Generator Under 50 HP",AInfo["G50 Update"],parentCapId);
		useAppSpecificGroupName = true; 
		editAppSpecific("POWER SOURCE.Other",AInfo["Other Update"],parentCapId);
		useAppSpecificGroupName = false;
		if(matches(AInfo["Other Update"],null,"",undefined)){
			editAppSpecific("Other Source Description","",parentCapId);
		}
		else {
			if(!matches(AInfo["OSD Update"],null,"",undefined)) {
				editAppSpecific("Other Source Description",AInfo["OSD Update"],parentCapId);
			}
		}
		editAppSpecific("On-site Composting of Cannabis Waste",AInfo["On-site Composting of Cannabis Waste-NEW"],parentCapId);
		editAppSpecific("Local Agency Franchised or Contracted/Permitted Waste Hauler",AInfo["Local Agency Franchised or Contracted/Permitted Waste Hauler-NEW"],parentCapId);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility",AInfo["Self-Haul to a Manned Fully Permitted Solid Waste Landfill/Transform Facility-NEW"],parentCapId);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Composting Facility/Operation",AInfo["Self-Haul to a Manned Fully Permitted Composting Facility/Operation-NEW"],parentCapId);
		editAppSpecific("Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation",AInfo["Self-Haul to a Manned Fully Permitted In-Vessel Digestion Facility/Operation-NEW"],parentCapId);
		editAppSpecific("Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation ",AInfo["Self-Haul to a Manned Fully Permitted Transfer/Processing Facility/Operation -NEW"],parentCapId);
		editAppSpecific("OSelf-Haul to a Manned Fully Permitted Chip-and-Grind Operation or Facility",AInfo["Self-Haul to a Manned Fully Permitted Chip-and-Grind Operation or FacilityNEW"],parentCapId);
		editAppSpecific("Self-Haul to a Recycling Center That Meets Regulations Requirements",AInfo["Self-Haul to a Recycling Center That Meets Regulations Requirements-NEW"],parentCapId);
		editAppSpecific("Reintroduction of cannabis waste back into Agricultural operations",AInfo["Reintroduction of cannabis waste back into Agricultural operations-NEW"],parentCapId);
		useAppSpecificGroupName = true;
		editAppSpecific("WASTE MANAGEMENT.Other",AInfo["Other-NEW"],parentCapId);
		useAppSpecificGroupName = false;
		if(matches(AInfo["Other-NEW"],null,"",undefined)){
			editAppSpecific("Other Waste Management Method","",parentCapId);
		}
		else {
			if(!matches(AInfo["Other Waste Management Method-NEW"],null,"",undefined)) {
				editAppSpecific("Other Waste Management Method",AInfo["Other Waste Management Method-NEW"],parentCapId);
			}
		}
		//Story 6622 Copy New Value Fields to license
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
						editAppSpecific(parentRecordField,newFieldValue,parentCapId);
						logDebug(parentRecordField + "edited to: " + newFieldValue);
					}
				}
			}
		}
		ignoreTableArray = [];
		removeASITable("APN SPATIAL INFORMATION",parentCapId);
		removeASITable("LAKE AND STREAMBED ALTERATION",parentCapId);
		removeASITable("ELECTRICITY USAGE",parentCapId);
		removeASITable("AVERAGE WEIGHTED GGEI",parentCapId);
		if (matches(getAppSpecific("Small Retail Water Supplier Review Status-NEW"),"Complete","N/A")){
			removeASITable("SMALL RETAIL WATER SUPPLIERS",parentCapId);
		}else{
			ignoreTableArray.push("SMALL RETAIL WATER SUPPLIERS");
		}
		if (matches(getAppSpecific("Retail Water Supplier Review Status-NEW"),"Complete","N/A")){
			removeASITable("RETAIL WATER SUPPLIER",parentCapId);
		}else{
			ignoreTableArray.push("RETAIL WATER SUPPLIER");
		}
		if (matches(getAppSpecific("Groundwater Well Review Status-NEW"),"Complete","N/A")){
			removeASITable("GROUNDWATER WELL",parentCapId);
		}else{
			ignoreTableArray.push("GROUNDWATER WELL");
		}
		if (matches(getAppSpecific("Rainwater Catchment Review Status-NEW"),"Complete","N/A")){
			removeASITable("RAINWATER CATCHMENT",parentCapId);
		}else{
			ignoreTableArray.push("RAINWATER CATCHMENT");
		}
		if (matches(getAppSpecific("Water Rights Review Status-NEW"),"Complete","N/A")){
			removeASITable("WATER RIGHTS",parentCapId);
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
				removeASITable("PREMISES ADDRESSES",parentCapId);
				addASITable("PREMISES ADDRESSES",premTable,parentCapId);
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
				removeASITable("SOURCE OF WATER SUPPLY",parentCapId);
				addASITable("SOURCE OF WATER SUPPLY",multTable,parentCapId);
			}
		}
		if (typeof(ELECTRICITYUSAGE) == "object"){
			if(ELECTRICITYUSAGE.length > 0){
				ignoreTableArray.push("ELECTRICITY USAGE");
				var elecTable = new Array(); 
				for(yy in ELECTRICITYUSAGE){
					var elecRow = ELECTRICITYUSAGE[yy];
					row = new Array();
					if(elecRow["Status"] != "Delete"){
						row["Reporting Year"] = elecRow["Reporting Year"];
						row["Usage Type"] = elecRow["Usage Type"];
						row["Type of Off Grid Renewable Source"] = elecRow["Type of Off Grid Renewable Source"];
						row["Type of Other Source"] = elecRow["Type of Other Source"];
						row["Other Source description"] = elecRow["Other Source description"];
						row["Name of Utility Provider"] = elecRow["Name of Utility Provider"];
						row["Total Electricity Supplied (kWh)"] = elecRow["Total Electricity Supplied (kWh)"];
						row["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"] = elecRow["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"];
						row["GGEI (lbs CO2e/kWh)"] = elecRow["GGEI (lbs CO2e/kWh)"];
						elecTable.push(row);
					}
				}
				removeASITable("ELECTRICITY USAGE",parentCapId);
				addASITable("ELECTRICITY USAGE",elecTable,parentCapId);
			}
		}
		if (typeof(AVERAGEWEIGHTEDGGEI) == "object"){
			if(AVERAGEWEIGHTEDGGEI.length > 0){
				ignoreTableArray.push("AVERAGE WEIGHTED GGEI");
				var weightedTable = new Array(); 
				for(ii in AVERAGEWEIGHTEDGGEI){
					var weightedRow = AVERAGEWEIGHTEDGGEI[ii];
					row = new Array();
					if(weightedRow["Status"] != "Delete"){
						row["Reporting year"] = weightedRow["Reporting year"];
						row["Average Weighted GGEI"] = weightedRow["Average Weighted GGEI"];
						weightedTable.push(row);
					}
				}
				removeASITable("AVERAGE WEIGHTED GGEI",parentCapId);
				addASITable("AVERAGE WEIGHTED GGEI",weightedTable,parentCapId);
			}
		}
		logDebug("Not copying the following Tables: " + ignoreTableArray);
		copyASITables(capId,parentCapId,ignoreTableArray);
//		runReportAttach(capId,"Scientific Review Checklist","altID",capId.getCustomID());
		var saAltId = capId.getCustomID();
		var licAltId = parentCapId.getCustomID();
		var scriptName = "asyncRunScientificChecklist";
		var envParameters = aa.util.newHashMap();
		envParameters.put("saCap",saAltId);
		envParameters.put("licCap",licAltId); 
		envParameters.put("reportName","Scientific Review Checklist"); 
		envParameters.put("currentUserID",currentUserID);
		aa.runAsyncScript(scriptName, envParameters);
//End Story 6622 
		var rFiles = [];
		if(updateCat) {
			addToCat(parentCapId);
		}
		var priContact = getContactObj(capId,"Designated Responsible Party");
		if(priContact){
			if(wfStatus == "Physical Modification Approved") {
				if(updateCat) {
				//Run Official License Certificate and Physical Modification Approved email the DRP
					var appAltId = capId.getCustomID();
					var licAltId = parentCapId.getCustomID();
					var scriptName = "asyncRunOfficialLicenseRpt";
					var envParameters = aa.util.newHashMap();
					envParameters.put("approvalLetter", "");
					envParameters.put("emailTemplate", "LCA_PHYSICAL_MOD_APPROVED");
					envParameters.put("reason", "");
					envParameters.put("appCap",appAltId);
					envParameters.put("licCap",licAltId); 
					envParameters.put("reportName","Official License Certificate"); 
					envParameters.put("currentUserID",currentUserID);
					envParameters.put("contType","Designated Responsible Party");
					envParameters.put("fromEmail",sysFromEmail);
					aa.runAsyncScript(scriptName, envParameters);
				}
				else {
		//  Send Physical Modification Approval email notification to DRP
					var eParams = aa.util.newHashtable(); 
					addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
					var contPhone = priContact.capContact.phone1;
					if(contPhone){
						var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
					}else{
						var fmtPhone = "";
					}
					addParameter(eParams, "$$altId$$", capId.getCustomID());
					addParameter(eParams, "$$contactPhone1$$", fmtPhone);
					addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
					addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
					addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
					addParameter(eParams, "$$parentId$$", licAltId);
					var priEmail = ""+priContact.capContact.getEmail();
					emailTemplate = "LCA_PHYSICAL_MOD_APPROVED";
					var rFiles = [];
					sendNotification(sysFromEmail,priEmail,"",emailTemplate,eParams, rFiles,capId);
				}
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						var sName = createSet("Physical Modification Amendment Approval","Amendment Notifications", "New");
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
			if(wfStatus == "Approved for Provisional Renewal") {
				TInfo = [];
				loadTaskSpecific(TInfo);
				var reason = TInfo["Reason for Provisional Renewal"];
				if(updateCat) {
				//Run Official License Certificate and Approved for Provisional Renewal email the DRP
					var appAltId = capId.getCustomID();
					var licAltId = parentCapId.getCustomID();
					var scriptName = "asyncRunOfficialLicenseRpt";
					var envParameters = aa.util.newHashMap();
					envParameters.put("approvalLetter", "");
					envParameters.put("emailTemplate", "LCA_APPROVED_FOR_PROVISIONAL_RENEWAL");
					envParameters.put("reason", reason);
					envParameters.put("appCap",appAltId);
					envParameters.put("licCap",licAltId); 
					envParameters.put("reportName","Official License Certificate"); 
					envParameters.put("currentUserID",currentUserID);
					envParameters.put("contType","Designated Responsible Party");
					envParameters.put("fromEmail",sysFromEmail);
					aa.runAsyncScript(scriptName, envParameters);
				}else{
		//  Send  Approved for Provisional Renewal email notification to DRP
					var eParams = aa.util.newHashtable(); 
					addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
					var contPhone = priContact.capContact.phone1;
					if(contPhone){
						var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
					}else{
						var fmtPhone = "";
					}
					addParameter(eParams, "$$reason$$", reason);					
					addParameter(eParams, "$$altId$$", capId.getCustomID());
					addParameter(eParams, "$$contactPhone1$$", fmtPhone);
					addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
					addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
					addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
					addParameter(eParams, "$$parentId$$", licAltId);
					var priEmail = ""+priContact.capContact.getEmail();
					emailTemplate = "LCA_APPROVED_FOR_PROVISIONAL_RENEWAL";
					var rFiles = [];
					sendNotification(sysFromEmail,priEmail,"",emailTemplate,eParams, rFiles,capId);
				}
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						var sName = createSet("APPROVED FOR PROVISIONAL RENEWAL","Amendment Notifications", "New");
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
			if(wfStatus == "Approved") {
				if(updateCat) {
				//Run Official License Certificate and Approved for Provisional Renewal email the DRP
					var appAltId = capId.getCustomID();
					var licAltId = parentCapId.getCustomID();
					var scriptName = "asyncRunOfficialLicenseRpt";
					var envParameters = aa.util.newHashMap();
					envParameters.put("approvalLetter", "");
					envParameters.put("emailTemplate", "LCA_SA_APPROVED_FOR_RENEWAL");
					envParameters.put("reason", reason);
					envParameters.put("appCap",appAltId);
					envParameters.put("licCap",licAltId); 
					envParameters.put("reportName","Official License Certificate"); 
					envParameters.put("currentUserID",currentUserID);
					envParameters.put("contType","Designated Responsible Party");
					envParameters.put("fromEmail",sysFromEmail);
					aa.runAsyncScript(scriptName, envParameters);
				}else{
				//  Send  Approved Renewal email notification to DRP
					var eParams = aa.util.newHashtable(); 				
					addParameter(eParams, "$$altId$$", capId.getCustomID());
					addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
					addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
					addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
					var priEmail = ""+priContact.capContact.getEmail();
					emailTemplate = "LCA_SA_APPROVED_FOR_RENEWAL";
					var rFiles = [];
					sendNotification(sysFromEmail,priEmail,"",emailTemplate,eParams, rFiles,capId);
				}
			}
			if(wfStatus == "Transition Amendment Approved") {
//				if(AInfo["Transition"] == "Yes") {
					editAppSpecific("License Issued Type", "Annual",parentCapId);
					var licType = getAppSpecific("License Type",parentCapId);
					var cType = getAppSpecific("Cultivator Type",parentCapId);
					editAppName("Annual " + cType + " - " + licType,parentCapId);
					editAppSpecific("Transition Date",jsDateToASIDate(new Date()),parentCapId);
					updateCat = true;
//				}
			//Run Official License Certificate and Transistion Approval Letter and email the DRP	
				var scriptName = "asyncRunOfficialLicenseRpt";
				var envParameters = aa.util.newHashMap();
				envParameters.put("approvalLetter", "Amendment Approval - Transition");
				envParameters.put("emailTemplate", "LCA_TRANSITION_APPROVAL");
				envParameters.put("reason", "");
				envParameters.put("appCap",capId.getCustomID());
				envParameters.put("licCap",parentAltId); 
				envParameters.put("reportName","Official License Certificate"); 
				envParameters.put("currentUserID",currentUserID);
				envParameters.put("contType","Designated Responsible Party");
				envParameters.put("fromEmail",sysFromEmail);
				aa.runAsyncScript(scriptName, envParameters);
				
				var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
				if(!matches(priChannel, "",null,"undefined", false)){
					if(priChannel.indexOf("Postal") > -1 ){
						var sName = createSet("Transistion Amendment Approval","Amendment Notifications", "New");
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
	}
	if(wfStatus == "Amendment Rejected") {
//  Send rejected email notification to DRP
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
			TInfo = [];
			loadTaskSpecific(TInfo);
			addParameter(eParams, "$$rejectReason$$", TInfo["Rejection Reason"]);
			addParameter(eParams, "$$altId$$", capId.getCustomID());
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$parentId$$", parentCapId.getCustomID());
			var priEmail = ""+priContact.capContact.getEmail();
			var rFiles = [];
			sendNotification(sysFromEmail,priEmail,"","LCA_SCIENCE_AMENDMENT_REJECTED",eParams, rFiles,capId);
	//		emailRptContact("", "LCA_AMENDMENT_APPROVAL", "", false, capStatus, capId, "Designated Responsible Party");
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("Amendment Rejected","Amendment Notifications", "New");
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
	
	if (wfTask == "Science Manager Review" && wfStatus == "Revisions Required"){
		activateTask("Science Amendment Review");
		updateTask("Science Amendment Review","Revisions Required","","");
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/AMENDMENT/SCIENCE: " + err.message);
	logDebug(err.stack);
}
