try {
	//Copy App Specific
	var sourceRec = getAppSpecific("Record Number",capId);
	var recordASIGroup = aa.appSpecificInfo.getByCapID(capId);
	if (recordASIGroup.getSuccess()){
		var recordASIGroupArray = recordASIGroup.getOutput();
		for (i in recordASIGroupArray) {
			var group = recordASIGroupArray[i];
			var groupName = String(group.getGroupCode());
			var recordField = String(group.getCheckboxDesc());
			var subGroup = String(group.getCheckboxType());
			var fieldValue = String(group.getChecklistComment());

			if (recordField.substring(0, 5) == "Copy_"){
				sourceCapId = getApplication(sourceRec);
				var editField = recordField.substring(5);
				var sourceValue = getAppSpecific(editField,sourceCapId);
				editAppSpecific(editField,sourceValue,capId);
			}
		}
	}
	
	if(matches(appTypeArray[3],"License","Application","Science Amendment")) {
// Science Amendment records do not have the Legal Business Name as a custom field so use the License record to select records
		if(appTypeArray[3] == "Science Amendment") {
			srcRec = AInfo["Record Number"];
			srcRec = srcRec.substring(0,13);
		}else{
			srcRec = AInfo["Record Number"];
		}
logDebug("srcRec " + srcRec);srcRec = AInfo["Record Number"];
		srcRecId = aa.cap.getCapID(srcRec).getOutput();
		LBN = getAppSpecific("Legal Business Name",srcRecId);
		
		var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("Legal Business Name",LBN);
		
		if (getCapResult.getSuccess())
			var apsArray = getCapResult.getOutput();
		else
			logDebug( "**ERROR: getting caps by app type: " + getCapResult.getErrorMessage());
logDebug("Records " + apsArray.length);
// Set the record back to the Science Amendment copy record number		
		if(appTypeArray[3] == "Science Amendment") {
			srcRec = AInfo["Record Number"];
			srcRecId = aa.cap.getCapID(srcRec).getOutput();
		}
		srcCap = aa.cap.getCap(srcRecId).getOutput();	
		srcTypeResult = srcCap.getCapType();	
		srcTypeString = srcTypeResult.toString();
		holdId = capId;
		tgtTable = new Array();
		for(i in apsArray) {
			capId = aa.cap.getCapID(apsArray[i].getCapID().getID1(),apsArray[i].getCapID().getID2(),apsArray[i].getCapID().getID3()).getOutput();
			if (!capId) {
				logDebug("Could not get Cap ID");
				continue;
			}
			recCap = aa.cap.getCap(capId).getOutput();	
			RInfo = new Array();
			loadAppSpecific(RInfo);	
			recTypeResult = recCap.getCapType();	
			recTypeString = recTypeResult.toString();
// Only select record where the record type matches the source record type
			if(srcTypeString != recTypeString)
				continue;
logDebug("Processing Record " + capId.getCustomID() + " capId " + capId);			
			tgtRow = new Array();
			tgtRow["Record ID"] = capId.getCustomID();
			var drpContact = getContactByType("Designated Responsible Party",capId);
			if(drpContact){
				tgtRow["DRP"] = drpContact.getFirstName() + " " + drpContact.getLastName();
			}
			tgtRow["Legal Business Name"] = RInfo["Legal Business Name"];
			tgtRow["APN"] = RInfo["APN"];
			tgtRow["County"] = RInfo["Premise County"];
			tgtRow["City"] = RInfo["Premise City"];
			tgtRow["Record Status"] = recCap.getCapStatus();
			tgtRow["License Type"] = RInfo["License Type"];
			tgtRow["License Issued Type"] = RInfo["License Issued Type"];
			tgtTable.push(tgtRow);
		}
		capId = holdId;
		removeASITable("TARGET RECORDS",capId);
		addASITable("TARGET RECORDS",tgtTable,capId);
		
		if(appTypeArray[3] == "Science Amendment") {
			copyASITables(srcRecId,capId,"APN SPATIAL INFORMATION","PREMISES ADDRESSES","LAKE AND STREAMBED ALTERATION","WATER RIGHTS","RETAIL WATER SUPPLIER","GROUNDWATER WELL","RAINWATER CATCHMENT","SMALL RETAIL WATER SUPPLIERS","SOURCE OF WATER SUPPLY");
		}
	}		
} catch (err) {
	logDebug("An error has occurred in ASA:Licenses/Cultivator/Copy/* Main function: " + err.message);
}
