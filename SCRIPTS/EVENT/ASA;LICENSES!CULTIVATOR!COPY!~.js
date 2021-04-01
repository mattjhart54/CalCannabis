try {
		if(matches(appTypeArray[3],"License","Application","Science Amendment")) {
		srcRec = AInfo["Record Number"];
		srcRecId = aa.cap.getCapID(srcRec).getOutput();
		LBN = getAppSpecific("Legal Business Name",srcRecId);
		srcCap = aa.cap.getCap(srcRecId).getOutput();	
		srcTypeResult = srcCap.getCapType();	
		srcTypeString = srcTypeResult.toString();
		
		var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("Legal Business Name",LBN);
		
		if (getCapResult.getSuccess())
			var apsArray = getCapResult.getOutput();
		else
			logDebug( "**ERROR: getting caps by app type: " + getCapResult.getErrorMessage());
logDebug("Records " + apsArray.length);
		holdId = capId;
		tgtTable = new Array();
		for(i in apsArray) {
			capId = apsArray[i].getCapID();
			if (!capId) {
				logDebug("Could not get Cap ID");
				continue;
			}
			recCap = aa.cap.getCap(capId).getOutput();	
			RInfo = new Array();
			loadAppSpecific(RInfo);	
			recTypeResult = recCap.getCapType();	
			recTypeString = recTypeResult.toString();
//			logDebug("source: " + srcTypeString + " target: " + recTypeString)
			if(srcTypeString != recTypeString)
				continue;
logDebug("Processing Record " + capId.getCustomID() + " capId " + capId);			
			tgtRow = new Array();
			tgtRow["Record Status"] = recCap.getCapStatus();

			var drpContact = getContactByType("Designated Responsible Party",capId);
			if(drpContact){
				tgtRow["DRP"] = drpContact.getFirstName() + " " + drpContact.getLastName();
			}
			tgtRow["Record ID"] = capId.getCustomID();
			tgtRow["Legal Business Name"] = RInfo["Legal Business Name"];
			tgtRow["APN"] = RInfo["APN"];
			tgtRow["County"] = RInfo["Premise County"];
			tgtRow["City"] = RInfo["Premise City"];
			tgtRow["License Type"] = RInfo["License Type"];
			tgtRow["License Issued Type"] = RInfo["License Issued Type"];
			tgtTable.push(tgtRow);
		}
		capId = holdId;
		removeASITable("TARGET RECORDS",capId);
		addASITable("TARGET RECORDS",tgtTable,capId);
		
		if(appTypeArray[3] == "Science Amendment") {
			srcRec = AInfo["Record Number"];
			srcRecId = aa.cap.getCapID(srcRec).getOutput();
			copyASITables(srcRecId,capId,"APN SPATIOL INFORMATION","PREMISES ADDRESSES","LAKE AND STREAMBED ALTERATION","WATER RIGHTS","RETAIL WATER SUPPLIER","GROUNDWATER WELL","RAINWATER CATCHMENT","SMALL RETAIL WATER SUPPLIERS","SOURCE OF WATER SUPPLY");
		}
	}		
} catch (err) {
	logDebug("An error has occurred in ASA:Licenses/Cultivator/Copy/* Main function: " + err.message);
}
