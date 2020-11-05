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
			comment("The total Percent Ownership must be greater than 0 and less than 100.");
		}
	}
} catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: AltID Logic: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Percent Ownership: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
try{
	statusArray = [];
	smallRetailCheck = true;
	if(matches(AInfo["LSA Review Status"],"Annual", "Provisional")) {
		var lsaCheck = true;
		if(!matches(AInfo["APN Matches Premises-LSA"],"Yes","N/A","No")) {
			lsaCheck = false;
		}
		if(!matches(AInfo["APN Matches Adjacent Parcel"],"Yes","N/A","No")) {
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
	if (typeof(SOURCEOFWATERSUPPLY) == "object"){
		if(SOURCEOFWATERSUPPLY.length > 0){
			for(xx in SOURCEOFWATERSUPPLY){
				statusArray.push(SOURCEOFWATERSUPPLY[xx]["Type of Water Supply"]);
			}
		}
	}		
	if(AInfo["Water Rights Review Status"] == "Complete") {
		wrRows = 0;
		for(wr in WATERRIGHTS) {
			if(WATERRIGHTS[wr]["Currently used for Cannabis?"] != "No") {
				wrRows++;
			}
		}
		if(getOccurrence(statusArray, "Diversion from Waterbody") != wrRows) {
			cancel = true;
			showMessage = true;
			comment("The number of water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
		}
	}
	if(AInfo["Rainwater Catchment Review Status"] == "Complete") {
		wsRows = 0;
		rainwaterCheck = true;
		for(rc in RAINWATERCATCHMENT) {
			rcRows++;
			if(RAINWATERCATCHMENT[rc]["Total Square footage of catchment footprint"] != "Yes")
				rainwaterCheck = false;
			if(RAINWATERCATCHMENT[rc]["Total storage capacity"] != "Yes")
				rainwaterCheck = false;
			if(RAINWATERCATCHMENT[rc]["Detailed description of the type, nature, and location of each catchment surface"] != "Yes")
				rainwaterCheck = false;
			if(RAINWATERCATCHMENT[rc]["Photos of the rainwater catchment system infrastructure"] != "Yes")
				rainwaterCheck = false;
			if(!matches(RAINWATERCATCHMENT[rc]["Currently Used for Cannabis?"], "Yes", "No"))
				rainwaterCheck = false;
			if(matches(RAINWATERCATCHMENT[rc]["Catchment Latitude"], null,"", undefined))
				rainwaterCheck = false;
			if(matches(RAINWATERCATCHMENT[rc]["Catchment Longitude"], null,"", undefined))
				rainwaterCheck = false;
		}
		
		if(getOccurrence(statusArray, "Rainwater Catchment") != wsRows) {
			cancel = true;
			showMessage = true;
			comment("The number of water sources in the Rain Catchment table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
		}
		if(!rainwaterCheck) {
			cancel = true;
			showMessage = true;
			comment("The Rainwater Catchment Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	
	if(AInfo["Groundwater Well Review Status"] == "Complete") {
		gwRows = 0;
		groundwaterCheck = true;
		for(gw in  GROUNDWATERWELL) {
			gwRows++;
			if(!matches(GROUNDWATERWELL[gw]["Currently Used for Cannabis"],"Yes","No"))
				groundwaterCheck = false;
			if(!matches(GROUNDWATERWELL[gw]["APN Address Matches Premises"],"Yes","No"))
				groundwaterCheck = false;
			if(!matches(GROUNDWATERWELL[gw]["DWR Letter"], "Yes", "N/A"))
				groundwaterCheck = false;
			if(!matches(GROUNDWATERWELL[gw]["Copy of Well completion report from DWR"], "Yes", "N/A"))
				groundwaterCheck = false;
			if(matches(GROUNDWATERWELL[gw]["Well Latitude"], null,"", undefined))
				groundwaterCheck = false;
			if(matches(GROUNDWATERWELL[gw]["Well Longitude"], null,"", undefined))
				groundwaterCheck = false;
		}
		if(getOccurrence(statusArray, "Groundwater Well") != gwRows) {
			cancel = true;
			showMessage = true;
			comment("The number of water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
		}
		if(!groundwaterCheck) {
			cancel = true;
			showMessage = true;
			comment("The Groundwater Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	if(AInfo["Retail Water Supplier Review Status"] == "Complete") {
		rsRows = 0;
		waterSupplierCheck = true;
		for(rs in  RETAILWATERSUPPLIER) {
			rsRows++;
			if(matches(RETAILWATERSUPPLIER[rs]["Retail Water Supplier"], null, "", undefined))
				waterSupplierCheck = false;
			if(!matches(RETAILWATERSUPPLIER[rs]["Currently Used for Cannabis"], "Yes", "No"))
				waterSupplierCheck = false;
			if(RETAILWATERSUPPLIER[rs]["Name of Retail Water Supplier"] != "Yes")
				waterSupplierCheck = false;
			if(RETAILWATERSUPPLIER[rs]["A copy of the most recent water service bill"] != "Yes")
				waterSupplierCheck = false;
			if(RETAILWATERSUPPLIER[rs]["Water Bill Address Matches Premises"] != "Yes")
				waterSupplierCheck = false;

		}
		if(getOccurrence(statusArray, "Retail Supplier") != rsRows) {
			cancel = true;
			showMessage = true;
			comment("The number of Retail Supplier water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
		}
		if(!waterSupplierCheck) {
			cancel = true;
			showMessage = true;
			comment("The Retail Water Supplier Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	if(AInfo["Small Retail Water Supplier Review Status"] == "Complete") {
		srRows = 0;
		for(sr in  SMALLRETAILWATERSUPPLIERS) {
			srRows++;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Currently Used for Cannabis"],"Yes","No"))
				smallRetailCheck = false;
			if(SMALLRETAILWATERSUPPLIERS[sr]["Verified Small Retail Water Supplier "] != "Yes")
				smallRetailCheck = false;
			if(SMALLRETAILWATERSUPPLIERS[sr]["Water Bill Address Matches Premises"] != "Yes")
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Coordinates of any POD"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Is the water source a diversion?"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Name of Retail Water Supplier Provided?"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Water source for diversion"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Authorized place of use"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Maximum Amount of Water delivered to Applicant?"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Copy of most recent water service bill?"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Is the water source a well?"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Name of retail supplier under the contract provided?"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Coordinates of well provided?"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Maximum amount of water delivered"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Copy of well completion report"],"Yes","No","N/A"))
				smallRetailCheck = false;
			if(!matches(SMALLRETAILWATERSUPPLIERS[sr]["Copy of the most recent water service bill?"],"Yes","No","N/A"))
				smallRetailCheck = false;
		}
		if((getOccurrence(statusArray, "Small Retail Supplier Diversion") + getOccurrence(statusArray, "Small Retail Supplier - Delivery or Pickup from a Groundwater Well")) != srRows) {
			cancel = true;
			showMessage = true;
			comment("The number of water sources in this table and the Source of Water Supply Data Table do not match. Please verify the number of line items on each table.");
		}
		if(!smallRetailCheck) {
			cancel = true;
			showMessage = true;
			comment("The Small Retail Water Supplier Review Status cannot be marked Complete as at least one of the fields is insufficient.");
		}
	}
	
}catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Water Source Reviews: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASIUB:LICENSES/CULTIVATOR/*/APPLICATION: Water Source Reviews: "+ startDate, capId + br+ err.message+ br+ err.stack);
}
