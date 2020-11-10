try {
	if(matches(wfStatus,"Physical Modification Approved","Approved for Provisional Renewal","Transition Amendment Approved")) {
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
		editAppSpecific("Grid",AInfo["Grid Update"],parentCapId);
		editAppSpecific("Solar",AInfo["Solar Update"],parentCapId);
		editAppSpecific("Generator",AInfo["Generator Update"],parentCapId);
		editAppSpecific("Generator Under 50 HP",AInfo["G50 Update"],parentCapId);
		editAppSpecific("Other",AInfo["Other Update"],parentCapId);
		if(matches(AInfo["Other Update"],null,"",undefined)){
			editAppSpecific("Other Source Description","",parentCapId);
		}
		else {
			if(!matches(AInfo["OSD Update"],null,"",undefined)) {
				editAppSpecific("Other Source Description",AInfo["OSD Update"],parentCapId);
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
						var newFieldValue = group.getChecklistComment();
						editAppSpecific(parentRecordField,newFieldValue,parentCapId);
						logDebug(parentRecordField + "edited to: " + newFieldValue);
					}
				}
			}
		}
		ignoreTableArray = [];
		if (matches(getAppSpecific("Small Retail Water Supplier Review Status"),"Complete","N/A")){
			removeASITable("SMALL RETAIL WATER SUPPLIERS",parentCapId);
		}else{
			ignoreTableArray.push("SMALL RETAIL WATER SUPPLIERS");
		}
		if (matches(getAppSpecific("Retail Water Supplier Review Status"),"Complete","N/A")){
			removeASITable("RETAIL WATER SUPPLIER",parentCapId);
		}else{
			ignoreTableArray.push("RETAIL WATER SUPPLIER");
		}
		if (matches(getAppSpecific("Groundwater Well Review Status "),"Complete","N/A")){
			removeASITable("GROUNDWATER WELL",parentCapId);
		}else{
			ignoreTableArray.push("GROUNDWATER WELL");
		}
		if (matches(getAppSpecific("Rainwater Catchment Review Status"),"Complete","N/A")){
			removeASITable("RAINWATER CATCHMENT",parentCapId);
		}else{
			ignoreTableArray.push("RAINWATER CATCHMENT");
		}
		if (matches(getAppSpecific("Water Rights Review Status"),"Complete","N/A")){
			removeASITable("WATER RIGHTS",parentCapId);
		}else{
			ignoreTableArray.push("WATER RIGHTS");
		}
		if (typeof(PREMISESADDRESSES) == "object"){
			if(PREMISESADDRESSES.length > 0){
				for(x in PREMISESADDRESSES){
					var premAddrRow = PREMISESADDRESSES[x];
					multTable = new Array();
					if(!matches(premAddrRow["UID"],"",null,"undefined")){
						var columnName ="UID";
						var tableName = "PREMISES ADDRESSES";
						var valuesList = aa.util.newArrayList();
						valuesList.add(premAddrRow["UID"].fieldValue);
						if (premAddrRow["Status"].fieldValue == "Delete"){
							var searchConditionMap = aa.util.newHashMap(); 
							searchConditionMap.put(columnName, valuesList);
							deleteRowFromASIT(tableName,searchConditionMap,parentCapId)
						}
						if (premAddrRow["Status"].fieldValue == "Modify"){
							updateRowsToASIT(tableName,columnName,valuesList,"APN",String(premAddrRow["APN"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Premises Address",String(premAddrRow["Premises Address"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Premises City",String(premAddrRow["Premises City"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Premises State",String(premAddrRow["Premises State"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Premises Zip",String(premAddrRow["Premises Zip"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Premises County",String(premAddrRow["Premises County"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Type of Possession",String(premAddrRow["Type of Possession"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Owner Address",String(premAddrRow["Owner Address"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Owner Phone",String(premAddrRow["Owner Phone"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"UID",premAddrRow["UID"].fieldValue,parentCapId);
						}
						if (premAddrRow["Status"].fieldValue == "New"){
							var tableValuesArray = {};
							tableValuesArray["APN"] = new asiTableValObj("APN", String(premAddrRow["APN"]), "N");
							tableValuesArray["Premises Address"] = new asiTableValObj("Premises Address", String(premAddrRow["Premises Address"]), "N");
							tableValuesArray["Premises City"] = new asiTableValObj("Premises City", String(premAddrRow["Premises City"]), "N");
							tableValuesArray["Premises State"] = new asiTableValObj("Premises State", String(premAddrRow["Premises State"]), "N");
							tableValuesArray["Premises Zip"] = new asiTableValObj("Premises Zip", String(premAddrRow["Premises Zip"]), "N");
							tableValuesArray["Premises County"] = new asiTableValObj("Premises County", String(premAddrRow["Premises County"]), "N");
							tableValuesArray["Type of Possession"] = new asiTableValObj("Type of Possession", String(premAddrRow["Type of Possession"]), "N");
							tableValuesArray["Owner Address"] = new asiTableValObj("Owner Address", String(premAddrRow["Type of Possession"]), "N");
							tableValuesArray["Owner Phone"] = new asiTableValObj("Owner Phone", String(premAddrRow["Owner Phone"]), "N");
							var thisDate = new Date();
							var thisTime = ""+thisDate.getTime();
							var UID=String(thisTime);
							tableValuesArray["UID"] = new asiTableValObj("UID", String(UID), "Y");
							addASITValueToRecord(tableName, tableValuesArray, parentCapId);
						}
					}
				}
			}
		}
		
		if (typeof(SOURCEOFWATERSUPPLY) == "object"){
			if(SOURCEOFWATERSUPPLY.length > 0){
				for(x in SOURCEOFWATERSUPPLY){
					var wtrSrcRow = SOURCEOFWATERSUPPLY[x];
					multTable = new Array();
					if(!matches(wtrSrcRow["UID"],"",null,"undefined")){
						var columnName ="UID";
						var tableName = "SOURCE OF WATER SUPPLY";
						var valuesList = aa.util.newArrayList();
						valuesList.add(wtrSrcRow["UID"].fieldValue);
						if (wtrSrcRow["Status"].fieldValue == "Delete"){
							var searchConditionMap = aa.util.newHashMap(); 
							searchConditionMap.put(columnName, valuesList);
							deleteRowFromASIT(tableName,searchConditionMap,parentCapId)
						}
						if (wtrSrcRow["Status"].fieldValue == "Modify"){
							updateRowsToASIT(tableName,columnName,valuesList,"Type of Water Supply",String(wtrSrcRow["Type of Water Supply"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Name of Supplier",String(wtrSrcRow["Name of Supplier"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Geographical Location Coordinates",String(wtrSrcRow["Geographical Location Coordinates"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Groundwater Well Geographic Location Coordinates",String(wtrSrcRow["Groundwater Well Geographic Location Coordinates"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Authorized Place of Use",String(wtrSrcRow["Authorized Place of Use"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Maximum Amount of Water Delivered",String(wtrSrcRow["Maximum Amount of Water Delivered"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Total Square Footage",String(wtrSrcRow["Total Square Footage"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Total Storage Capacity",String(wtrSrcRow["Total Storage Capacity"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Description",String(wtrSrcRow["Description"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Diversion Number",String(wtrSrcRow["Diversion Number"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"Water Source",String(wtrSrcRow["Water Source"]),parentCapId);
							updateRowsToASIT(tableName,columnName,valuesList,"UID",wtrSrcRow["UID"].fieldValue,parentCapId);
						}
						if (wtrSrcRow["Status"].fieldValue == "New"){
							var tableValuesArray = {};
							tableValuesArray["Type of Water Supply"] = new asiTableValObj("Type of Water Supply", String(wtrSrcRow["Type of Water Supply"]), "N");
							tableValuesArray["Name of Supplier"] = new asiTableValObj("Name of Supplier", String(wtrSrcRow["Name of Supplier"]), "N");
							tableValuesArray["Geographical Location Coordinates"] = new asiTableValObj("Geographical Location Coordinates", String(wtrSrcRow["Geographical Location Coordinates"]), "N");
							tableValuesArray["Groundwater Well Geographic Location Coordinates"] = new asiTableValObj("Groundwater Well Geographic Location Coordinates", String(wtrSrcRow["Groundwater Well Geographic Location Coordinates"]), "N");
							tableValuesArray["Authorized Place of Use"] = new asiTableValObj("Authorized Place of Use", String(wtrSrcRow["Authorized Place of Use"]), "N");
							tableValuesArray["Maximum Amount of Water Delivered"] = new asiTableValObj("Maximum Amount of Water Delivered", String(wtrSrcRow["Maximum Amount of Water Delivered"]), "N");
							tableValuesArray["Total Square Footage"] = new asiTableValObj("Total Square Footage", String(wtrSrcRow["Total Square Footage"]), "N");
							tableValuesArray["Total Storage Capacity"] = new asiTableValObj("Total Storage Capacity", String(wtrSrcRow["Total Storage Capacity"]), "N");
							tableValuesArray["Description"] = new asiTableValObj("Description", String(wtrSrcRow["Description"]), "N");
							tableValuesArray["Diversion Number"] = new asiTableValObj("Diversion Number", String(wtrSrcRow["Diversion Number"]), "N");
							tableValuesArray["Water Source"] = new asiTableValObj("Water Source", String(wtrSrcRow["Water Source"]), "N");
							var thisDate = new Date();
							var thisTime = ""+thisDate.getTime();
							var UID=String(thisTime);
							tableValuesArray["UID"] = new asiTableValObj("UID", String(UID), "Y");
							addASITValueToRecord(tableName, tableValuesArray, parentCapId);
						}
					}
				}
			}
		}
				
		copyASITables(capId,parentCapId,ignoreTableArray);	
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
					envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
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
					envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
					aa.runAsyncScript(scriptName, envParameters);
				}
				else {
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
				envParameters.put("fromEmail","calcannabislicensing@cdfa.ca.gov");
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