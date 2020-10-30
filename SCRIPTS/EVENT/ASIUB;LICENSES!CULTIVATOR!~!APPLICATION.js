// MHART 121118 user Story 5831 - Owner Table Percentage Check
try{
	if(!publicUser) {
		var totPct = 0;
		if (typeof(OWNERS) == "object") {
			for(x in OWNERS) {
				var ownPct = parseFloat(OWNERS[x]["Percent Ownership"]);
				totPct = totPct + ownPct 
			}
		}
		if (totPct > 100 || totPct < 0) {
			cancel = true;
			showMessage = true;
			comment("The total Percent Ownership must be greater than 0 and less than 100.")
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Percent Ownership: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
try{
	if(matches(AInfo["LSA Review Status"],"Annual", "Provisional")) {
		var cmplt = true;
		if(!matches(AInfo["APN Matches Premises-LSA"],"Yes","N/A","No")) {
			cmplt = false;
		}
		if(!matches(AInfo["APN Matches Adjacent Parcel"],"Yes","N/A","No")) {
			cmplt = false;
		}
		for(ls in LAKEANDSTREAMBEDALTERATION) {
			if(matches(LAKEANDSTREAMBEDALTERATION[ls]["LSA ID Number"], null,"",undefined)) {
				cmplt = false;
			}
			if(matches(LAKEANDSTREAMBEDALTERATION[ls]["Document Type"], null,"",undefined)) {
			 	cmplt = false;
			}
		}
		
		if(!cmplt) {
			cancel = true;
			showMessage = true;
			comment("The LSA Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	if(AInfo["Water Rights Review Status"] == "Complete") {
		wsRows = 0;
		wrRows = 0;
		for(ws in SOURCEOFWATERSUPPLY) {
			if(SOURCEOFWATERSUPPLY[ws]["Type of Water Supply"] == "Diversion from Waterbody") {
				wsRows = wsRows + 1;
			}
		}
			for(wr in WATERRIGHTS) {
			if(WATERRIGHTS[wr]["Currently used for Cannabis?"] != "No") {
				wrRows = wrRows + 1;
			}
		}
		logDebug("wsRows " + wsRows + " wrRows " + wrRows);
		if(wsRows != wrRows) {
			cancel = true;
			showmessage = true;
			comment("The number of water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.")
		}
	}
		if(AInfo["Rainwater Catchment Review Status"] == "Complete") {
		wsRows = 0;
		rcRows = 0;
		cmplt = true;
		for(ws in SOURCEOFWATERSUPPLY) {
			if(SOURCEOFWATERSUPPLY[ws]["Type of Water Supply"] == "Rainwater Catchment System") {
				wsRows = wsRows + 1;
			}
		}
		for(rc in RAINWATERCATCHMENT) {
			if(RAINWATERCATCHMENT[rc]["Currently Used for Cannabis?"] != "No") 
				rcRows = rcRows + 1;
			if(RAINWATERCATCHMENT[rc]["Total Square footage of catchment footprint"] != "Yes")
				cmplt = false;
			if(RAINWATERCATCHMENT[rc]["Total storage capacity"] != "Yes")
				cmplt = false;
			if(RAINWATERCATCHMENT[rc]["Detailed description of the type, nature, and location of each catchment surface"] != "Yes")
				cmplt = false;
			if(RAINWATERCATCHMENT[rc]["Photos of the rainwater catchment system infrastructure"] != "Yes")
				cmplt = false;
			if(!matches(RAINWATERCATCHMENT[rc]["Currently Used for Cannabis?"], "Yes", "No"))
				cmplt = false;
			if(matches(RAINWATERCATCHMENT[rc]["Catchment Latitude"], null,"", undefined))
				cmplt = false;
			if(matches(RAINWATERCATCHMENT[rc]["Catchment Longitude"], null,"", undefined))
				cmplt = false;
		}
		if(wsRows != rcRows) {
			cancel = true;
			showmessage = true;
			comment("The number of water sources in the Rain Catchment table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.")
		}
		if(!cmplt) {
			cancel = true;
			showmessage = true;
			comment("The Rainwater Catchment Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	
	if(AInfo["Groundwater Well Review Status"] == "Complete") {
		wsRows = 0;
		gwRows = 0;
		cmplt = true;
		for(ws in SOURCEOFWATERSUPPLY) {
			if(SOURCEOFWATERSUPPLY[ws]["Type of Water Supply"] == "Groundwater Well") {
				wsRows = wsRows + 1;
			}
		}
		for(gw in  GROUNDWATERWELL) {
			if(GROUNDWATERWELL[gw]["Currently Used for Cannabis?"] != "No") 
				gwRows = gwRows + 1;
			if(!matches(GROUNDWATERWELL[gw]["Currently Used for Cannabis"],"Yes","No"))
				cmplt = false;
			if(!matches(GROUNDWATERWELL[gw]["APN Address Matches Premises"],"Yes","No"))
				cmplt = false;
			if(!matches(GROUNDWATERWELL[gw]["DWR Letter"], "Yes", "N/A"))
				cmplt = false;
			if(!matches(GROUNDWATERWELL[gw]["Copy of Well completion report from DWR"], "Yes", "N/A"))
				cmplt = false;
			if(matches(GROUNDWATERWELL[gw]["Well Latitude"], null,"", undefined))
				cmplt = false;
			if(matches(GROUNDWATERWELL[gw]["Well Longitude"], null,"", undefined))
				cmplt = false;
		}
		if(wsRows != gwRows) {
			cancel = true;
			showmessage = true;
			comment("The number of water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.")
		}
		if(!cmplt) {
			cancel = true;
			showmessage = true;
			comment("The Groundwater Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	if(AInfo["Retail Water Supplier Review Status"] == "Complete") {
		wsRows = 0;
		rsRows = 0;
		cmplt = true;
		for(ws in SOURCEOFWATERSUPPLY) {
			if(SOURCEOFWATERSUPPLY[ws]["Type of Water Supply"] == "Retail Supplier") {
				wsRows = wsRows + 1;
			}
		}
		for(rs in  RETAILWATERSUPPLIER) {
			rsRows = rsRows+1;
			if(matches(RETAILWATERSUPPLIER[rs]["Retail Water Supplier"], null, "", undefined))
				cmplt = false;
			if(!matches(RETAILWATERSUPPLIER[rs]["Currently Used for Cannabis"], "Yes", "No"))
				cmplt = false;
			if(RETAILWATERSUPPLIER[rs]["Name of Retail Water Supplier"] != "Yes")
				cmplt = false;
			if(RETAILWATERSUPPLIER[rs]["A copy of the most recent water service bill"] != "Yes")
				cmplt = false;
			if(RETAILWATERSUPPLIER[rs]["Water Bill Address Matches Premises"] != "Yes")
				cmplt = false;

		}
		if(wsRows != rsRows) {
			cancel = true;
			showmessage = true;
			comment("The number of Retail Supplier water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.")
		}
		if(!cmplt) {
			cancel = true;
			showmessage = true;
			comment("The Retail Water Supplier Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
		if(AInfo["Small Retail Water Supplier Review Status"] == "Complete") {
		wsRows = 0;
		srRows = 0;
		cmplt = true;
		for(ws in SOURCEOFWATERSUPPLY) {
			if(SOURCEOFWATERSUPPLY[ws]["Type of Water Supply"] == "Retail Supplier") {
				wsRows = wsRows + 1;
			}
		}
		for(sr in  SMALLRETAILWATERSUPPLIERS) {
			srRows = srRows+1;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Currently Used for Cannabis"],"Yes","No"))
				cmplt = false;
			if(SMALLRETAILWATERSUPPLIERS[sr]["Verified Small Retail Water Supplier "] != "Yes")
				cmplt = false;
			if(SMALLRETAILWATERSUPPLIERS[sr]["Water Bill Address Matches Premises"] != "Yes")
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Coordinates of any POD"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Is the water source a diversion?"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Name of Retail Water Supplier Provided?"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Water source for diversion"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Authorized place of use"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Maximum Amount of Water delivered to Applicant?"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Copy of most recent water service bill?"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Is the water source a well?"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Name of retail supplier under the contract provided?"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Coordinates of well provided?"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Maximum amount of water delivered"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Copy of well completion report"],"Yes","No","N/A"))
				cmplt = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Copy of the most recent water service bill?"],"Yes","No","N/A"))
				cmplt = false;
		}
		if(wsRows != srRows) {
			cancel = true;
			showmessage = true;
			comment("The number of water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.")
		}
		if(!cmplt) {
			cancel = true;
			showmessage = true;
			comment("The Small Retail Water Supplier Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	
}catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Water Source Reviews: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Water Source Reviews: "+ startDate, capId + br+ err.message+ br+ err.stack);
}
