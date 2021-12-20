function getReqdDocs(recdType){ //optional callingPgm variable since now having to call this from ASB
try{
	//lwacht: 180605: story 5544: remove conditions that are disabled
	var cType = "License Required Documents";
	var capCondResult = aa.capCondition.getCapConditions(capId,cType);
	if (!capCondResult.getSuccess()){
		logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()) ; 
	}else{
		var ccs = capCondResult.getOutput();
		for (pc1 in ccs){
			var thisCond = ccs[pc1];
			var stdCond = aa.capCondition.getStandardConditions(cType, thisCond.resConditionDescription).getOutput();
			if(stdCond.length <1){
				var rmCapCondResult = aa.capCondition.deleteCapCondition(capId,thisCond.getConditionNumber()); 
				if (rmCapCondResult.getSuccess()){
					logDebug("Successfully removed condition to CAP : " + capId + "  (" + thisCond.resConditionDescription + ") ");
				}else{
					logDebug( "**ERROR: removing condition  (" + cType + "): " + rmCapCondResult.getErrorMessage());
				}
			}
		}
	}
	//lwacht: 180605: story 5544: end
	if (arguments.length == 2){
		var callPgm = arguments[1];
	}else{
		callPgm = "";
	}
	if(!matches(recdType, "Application", "Owner")){
		logDebug("Function is currently only set up for Application and Owner documentation.");
		return false;
	}
	//optional capId
	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args

	//because there are different options for these, need a different way to track so don't remove
	//the condition unnecessarily
	AInfo = [];
	if(callPgm=="AV"){
		loadAppSpecificBefore(AInfo); 
		loadASITablesBefore();
		logDebug("loadASITablesBefore");
	}else{
		loadAppSpecific4ACA(AInfo); 
		loadASITables4ACA_corrected();
	}
	var need_premiseDiagram = false;
	var need_wastePlan = false;
	var need_pestPlan = false;
	var need_lightDiagram = false;	
	//application documents
	var conditionType = "License Required Documents";
	var businessHOO = {condition : "Business - Hours of Operation", document : "Business - Hours of Operation"};
    var businessFormation = {condition : "Business - Formation Documents", document : "Business - Formation Documents"};
    var businessFI = {condition : "Business - List of Financial Interest Holders", document : "Business - List of Financial Interest Holders"};
    var businessBond = {condition : "Business - Evidence Surety Bond", document : "Business - Evidence Surety Bond"};
	var foriegnCorp = {condition : "Business - Foreign Corp. Certificate of Qualification", document : "Business - Foreign Corp. Certificate of Qualification"};
	var stateDocuments = {condition : "Business - CA Secretary of State Documents", document : "Business - CA Secretary of State Documents"};
	var soveriegnImmunity = {condition : "Business - Waiver of Sovereign Immunity", document : "Business - Waiver of Sovereign Immunity"};
	//var localOrdinance = {condition : "VI - Copy of the Local Ordinance", document : "VI - Copy of the Local Ordinance"};
	//var cannabisActivity = {condition : "VI - Evidence of Conducting Cannabis Activity", document : "VI - Evidence of Conducting Cannabis Activity"};
	//var BOE = {condition : "VI - Registration with CA BOE", document : "VI - Registration with CA BOE"};
	//var fullCompliance = {condition : "VI - Evidence of Full Local Compliance", document : "VI - Evidence of Full Local Compliance"};
	var occupyUse = {condition : "Premises - Legal Right to Occupy and Use", document : "Premises - Legal Right to Occupy and Use"};
	var ownership = {condition : "Premises - Property Ownership Documentation", document : "Premises - Property Ownership Documentation"};
	//var operationDate = {condition : "Premises - Evidence of the Date Operations Began", document : "Premises - Evidence of the Date Operations Began"};
	var enviroStor = {condition : "Premises - EnviroStor Hazardous Materials Search", document : "Premises - EnviroStor Hazardous Materials Search"};
	//mhart 180411 user story 5353 new doc types	
	//var premiseDiagram = {condition : "Cultivation Plan - Property Diagram and Detailed Premises Diagram", document : "Cultivation Plan - Property Diagram and Detailed Premises Diagram"};
	var propertyDiagram = {condition : "Cultivation Plan - Property Diagram", document : "Cultivation Plan - Property Diagram"};
	//lwacht: 180502: story 5445: changing condition name
	var detailPremises = {condition : "Cultivation Plan - Detailed Premises", document : "Cultivation Plan - Detailed Premises"};
	//hwacht: 180529: story 5445: THIS STORY SUPERCEDES 5353
	//var detailPremises = {condition : "Cultivation Plan - Detailed Premises Diagram", document : "Cultivation Plan - Detailed Premises Diagram"};
	var detailPremises = {condition : "Cultivation Plan - Detailed Premises Diagram", document : "Cultivation Plan - Detailed Premises Diagram"};
	//hwacht: 180529: story 5445: end
	//lwacht: 180502: story 5445: end
	//mhart 180411 user story 5353
	var wastePlan = {condition : "Cultivation Plan - Waste Management Plan", document : "Cultivation Plan - Waste Management Plan"};
	var pestPlan = {condition : "Cultivation Plan - Pest Management Plan", document : "Cultivation Plan - Pest Management Plan"};
	var lightDiagram = {condition : "Cultivation Plan - Lighting Diagram", document : "Cultivation Plan - Lighting Diagram"};
	var streambedAlter = {condition : "Water - Lake and Streambed Alteration Document", document : "Water - Lake and Streambed Alteration Document"};
	var wellLog = {condition : "Water - Groundwater Well Log", document : "Water - Groundwater Well Log"};
	var srs2WellLog = {condition : "Water - Small Retail Supplier Well Log", document : "Water - Small Retail Supplier Well Log"};
	var SWRCBAhuth = {condition : "Water - SWRCB Diversion Authorization", document : "Water - SWRCB Diversion Authorization"};
	var waterBill = {condition : "Water - Retail Water Service Bill", document : "Water - Retail Water Service Bill"};
	var divWaterBill = {condition : "Water - SR Diversion Water Service Bill", document : "Water - SR Diversion Water Service Bill"};
	var gwWaterBill = {condition : "Water - SR Groundwater Well Water Service Bill", document : "Water - SR Groundwater Well Water Service Bill"};
	var rcPhoto = {condition : "Water - Rainwater Catchment Photographs", document : "Water - Rainwater Catchment Photographs"};
	//lwacht 171130 new doc type
	var docWtrSmRetSupDiv = {condition : "Water - Small Retail Supplier Diversion", document : "Water - Small Retail Supplier Diversion"};
	//lwacht 171130 end
	/*lwacht 171127: no longer needed
	var SWRCBExcept = {condition : "Water - SWRCB Exception Document", document : "Water - SWRCB Exception Document"};
	*/
	var waterQuality = {condition : "Water - Water Quality Protection Permit", document : "Water - Water Quality Protection Permit"};
	//var localAuth = {condition : "Local - Local Authorization", document : "Local - Local Authorization"};
	//var planningPermit = {condition : "Local - Certified Planning Permit", document : "Local - Certified Planning Permit"};
	var goodStanding = {condition : "Local - Evidence of Good Standing", document : "Local - Evidence of Good Standing"};
	var CEQA = {condition : "Local - Evidence of CEQA Compliance", document : "Local - Evidence of CEQA Compliance"};
	var equity = {condition : "Local - Equity Fee Waiver Application", document : "Local - Equity Fee Waiver Application"};
	//var localComply = {condition : "Local - Certification of Local Compliance", document : "Local - Certification of Local Compliance"};
	var coopMembers = {condition : "Cannabis Cooperative Association Member List", document : "Cannabis Cooperative Association Member List"};
	var useCompassionate = {condition : "Priority Review - Compassionate Use Act of 1996", document : "Priority Review - Compassionate Use Act"};
	//lwacht 171127: changed condition and doc name
	var pwrGenerator = {condition : "Power Source - Generator 50HP or Greater", document : "Power Source – Generator 50 HP or greater"};
	
	
	//owner documents
    var governmentIssuedID = {condition : "Government Issued ID", document : "Government Issued ID"};
    var fingerprintApp = {condition : "Electronic Fingerprint Application", document : "Electronic Fingerprint Application"};
    var evidenceOfDismissal = {condition : "Evidence of Dismissal", document : "Evidence of Dismissal"};
    var certificateOfRehabilitation = {condition : "Certificate of Rehabilitation", document : "Certificate of Rehabilitation"};
    var referenceLetters = {condition : "Reference Letters", document : "Reference Letters"};
	//var convictions = {condition : "History of Convictions", document : "History of Convictions"};
	//var calResidency = {condition : "Evidence of California Residency", document : "Evidence of California Residency"};

	//Required Documents for Cultivator Applications
	if(recdType == "Application"){
		arrReqdDocs_App = new Array();
		
	//Business documents
		if (AInfo["Business Entity Structure"] != "Sole Proprietorship"){
			arrReqdDocs_App.push(businessFormation);
		}else{
			if(appHasCondition(conditionType, null, businessFormation.condition, null)){
				removeCapCondition(conditionType, businessFormation.condition);
			}
		}
		
		arrReqdDocs_App.push(businessBond);
		
		if (AInfo["Foreign Corporation"] == "Yes"){
			arrReqdDocs_App.push(foriegnCorp);
		}else{
			if(appHasCondition(conditionType, null, foriegnCorp.condition, null)){
				removeCapCondition(conditionType, foriegnCorp.condition);
			}
		}
		
		arrReqdDocs_App.push(businessHOO);		
		arrReqdDocs_App.push(businessFI);
		
		if (AInfo["Business Entity Structure"] == "Sovereign Entity"){
			arrReqdDocs_App.push(soveriegnImmunity);
		}else{
			if(appHasCondition(conditionType, null, soveriegnImmunity.condition, null)){
				removeCapCondition(conditionType, soveriegnImmunity.condition);
			}
		}
		//Co-Op documents
		if (AInfo["Cooperative Association"] == "Yes"){
			arrReqdDocs_App.push(coopMembers);
		}else{
			if(appHasCondition(conditionType, null, coopMembers.condition, null)){
				removeCapCondition(conditionType, coopMembers.condition);
			}
		}
		
		//Cultivation Plan documents
		if(matches(AInfo["License Type"],"Specialty Cottage Indoor","Specialty Cottage Mixed-Light Tier 1","Specialty Cottage Mixed-Light Tier 2",
				"Specialty Indoor","Specialty Mixed-Light Tier 1","Specialty Mixed-Light Tier 2","Small Indoor","Small Mixed-Light Tier 1","Small Mixed-Light Tier 2",
				"Medium Indoor","Medium Mixed-Light Tier 1","Medium Mixed-Light Tier 2")) {
//mhart 180411 user story 5353 new doc types				
			need_propertyDiagram = true;
			need_detailPremises = true;	
//mhart 180411 user story 5353 end			
			need_wastePlan = true;
			need_pestPlan = true;
			need_lightDiagram = true;		}
		if(matches(AInfo["License Type"],"Specialty Cottage Outdoor","Specialty Outdoor","Small Outdoor","Medium Outdoor","Nursery")) {
//mhart 180411 user story 5353 new doc types		
			need_propertyDiagram = true;
			need_detailPremises = true;
//mhart 180411 user story 5353 end			
			need_wastePlan = true;
			need_pestPlan = true;
		}
		if(AInfo["License Type"] =="Processor") {
//mhart 180411 user story 5353 new doc types		
			need_propertyDiagram = true;
			need_detailPremises = true;
//mhart 180411 user story 5353 end			
			need_wastePlan = true;
		}

		if(need_lightDiagram){
			arrReqdDocs_App.push(lightDiagram);
		}else{
			if(appHasCondition(conditionType, null, lightDiagram.condition, null)){
				removeCapCondition(conditionType, lightDiagram.condition);
			}
		}
//mhart 180411 user story 5353 new doc types
		if(need_detailPremises){
			arrReqdDocs_App.push(detailPremises);
		}else{
			if(appHasCondition(conditionType, null, detailPremises.condition, null)){
				removeCapCondition(conditionType, detailPremises.condition);
			}
		}
		if(need_propertyDiagram){
			arrReqdDocs_App.push(propertyDiagram);
		}else{
			if(appHasCondition(conditionType, null, propertyDiagram.condition, null)){
				removeCapCondition(conditionType, propertyDiagram.condition);
			}
		}
//mhart 180411 user story 5353 end		
		if(need_pestPlan){
			arrReqdDocs_App.push(pestPlan);
		}else{
			if(appHasCondition(conditionType, null, pestPlan.condition, null)){
				removeCapCondition(conditionType, pestPlan.condition);
			}
		}
		if(need_wastePlan){
			arrReqdDocs_App.push(wastePlan);
		}else{
			if(appHasCondition(conditionType, null, wastePlan.condition, null)){
				removeCapCondition(conditionType, wastePlan.condition);
			}
		}
		
	// Local Permit Documents
		//arrReqdDocs_App.push(planningPermit);
		if(AInfo["Apply for Equity Waiver"] == "Yes") {
			arrReqdDocs_App.push(equity);
		}else{
			if(appHasCondition(conditionType, null, equity.condition, null)){
				removeCapCondition(conditionType, equity.condition);
			}
		}
		arrReqdDocs_App.push(CEQA);
	
	// Premise Documents
		arrReqdDocs_App.push(enviroStor);	
		
		if(AInfo["Legal Possession"] == "Own") {
			arrReqdDocs_App.push(ownership);
		}else{
			if(appHasCondition(conditionType, null, ownership.condition, null)){
				removeCapCondition(conditionType, ownership.condition);
			}
		}
		if(AInfo["Legal Possession"] == "Rent/Lease" || AInfo["Legal Possession"] == "Other") {
			arrReqdDocs_App.push(occupyUse);
		}else{
			if(appHasCondition(conditionType, null, occupyUse.condition, null)){
				removeCapCondition(conditionType, occupyUse.condition);
			}
		}

	// Water Documents
		arrReqdDocs_App.push(streambedAlter);
		arrReqdDocs_App.push(waterQuality);
//MJH 040819 story 5916 Add code to make water bill document required		
		var gw=false;
		var sr=false;
		var di=false;
		var de=false;
		var wtrSmRetSupDiv=false;
		var rs = false;
		var rc=false;
		if(typeof(SOURCEOFWATERSUPPLY)=="object"){
			var tblWater = SOURCEOFWATERSUPPLY;
			for(x in tblWater) {
				if (tblWater[x]["Type of Water Supply"] == "Retail Supplier"){
					rs=true;
				}
				if (tblWater[x]["Type of Water Supply"] == "Groundwater Well"){
					gw=true;
				}
				if (tblWater[x]["Type of Water Supply"] == "Small Retail Supplier - Delivery or pickup of water from a groundwater well"){
					sr=true;
				}
				//lwacht 171127: new water supply type "Small Retail Supplier Diversion" 
				//lwacht 171130 new doc type
				if(matches(tblWater[x]["Type of Water Supply"], "Diversion from Waterbody")){
					di=true;
				}
				//lwacht 171127 end
				if(matches(tblWater[x]["Type of Water Supply"], "Small Retail Supplier Diversion")){
					wtrSmRetSupDiv=true;
				}
				//lwacht 171130 end
				if (tblWater[x]["Type of Water Supply"] == "Diversion with Exception from Requirement to File a Statement of Diversion and Use"){
					de=true;
				}
				if(matches(tblWater[x]["Type of Water Supply"], "Rainwater Catchment System")){
					rc=true;
				}
			}
		}
	if(rs == true) {
		arrReqdDocs_App.push(waterBill);
	}else{
		if(appHasCondition(conditionType, null, waterBill.condition, null)){
			removeCapCondition(conditionType, waterBill.condition);
		}
	}
	if(rc == true) {
		arrReqdDocs_App.push(rcPhoto);
	}else{
		if(appHasCondition(conditionType, null, rcPhoto.condition, null)){
			removeCapCondition(conditionType, rcPhoto.condition);
		}
	}
	if(gw == true) {
		arrReqdDocs_App.push(wellLog);
	}else{
		if(appHasCondition(conditionType, null, wellLog.condition, null)){
			removeCapCondition(conditionType, wellLog.condition);
		}
	}
	if(sr == true) {
		arrReqdDocs_App.push(srs2WellLog);
		arrReqdDocs_App.push(gwWaterBill);
	}else{
		if(appHasCondition(conditionType, null, srs2WellLog.condition, null)){
			removeCapCondition(conditionType, srs2WellLog.condition);	
		}
		if(appHasCondition(conditionType, null, gwWaterBill.condition, null)){
			removeCapCondition(conditionType, gwWaterBill.condition);
		}
	}
	if(di == true) {
		arrReqdDocs_App.push(SWRCBAhuth);
	}else{
		if(appHasCondition(conditionType, null, SWRCBAhuth.condition, null)){
			removeCapCondition(conditionType, SWRCBAhuth.condition);
		}
	}
	//lwacht 171130: new doc type
	if(wtrSmRetSupDiv == true) {
		arrReqdDocs_App.push(docWtrSmRetSupDiv);
		arrReqdDocs_App.push(divWaterBill);
	}else{
		if(appHasCondition(conditionType, null, docWtrSmRetSupDiv.condition, null)){
			removeCapCondition(conditionType, docWtrSmRetSupDiv.condition);
		}
		if(appHasCondition(conditionType, null, divWaterBill.condition, null)){
			removeCapCondition(conditionType, divWaterBill.condition);
		}
	}
//MJH 040819 story 5916 Add code to make water bill document required	
	//lwacht 171130 end
	/*lwacht 171127: no longer needed
	if(de == true) {
		arrReqdDocs_App.push(SWRCBExcept);
	}else{
		if(appHasCondition(conditionType, null, SWRCBExcept.condition, null)){
			removeCapCondition(conditionType, SWRCBExcept.condition);
		}
	}
	*/
	//lwacht 171109 power source
	//mhart 180517 user story 5431 Remove power source document requirement
	/*
	if(AInfo["Generator"] == "CHECKED" ) {
		arrReqdDocs_App.push(pwrGenerator);
	}else{
		if(appHasCondition(conditionType, null, pwrGenerator.condition, null)){
			removeCapCondition(conditionType, pwrGenerator.condition);
		}
	}
	*/
	//lwacht 171109 compassionate user
	if(!matches(AInfo["Date of Intitial Operation"], "",null,"undefined")){
		dateInitOp = convertDate(AInfo["Date of Intitial Operation"]);
		dateCompare = convertDate("09/01/2016");
		if(dateInitOp < dateCompare) {
			arrReqdDocs_App.push(useCompassionate);
		}else{
			if(appHasCondition(conditionType, null, useCompassionate.condition, null)){
				removeCapCondition(conditionType, useCompassionate.condition);
			}
		}
	}
	
/*	Documents no longer required	
		var medicalPriorityDate = "01/01/2016";
		var adultPriorityDate = "09/01/2016";
		
		if(AInfo["Date of Intitial Operation"] != null && AInfo["Date of Intitial Operation"] != "" && appTypeArray[2] == "Medical") {
			if(dateDiff(AInfo["Date of Intitial Operation"],medicalPriorityDate) >= 0) {
				arrReqdDocs_App.push(operationDate);
			}else{
				if(appHasCondition(conditionType, null, operationDate.condition, null)){
					removeCapCondition(conditionType, operationDate.condition);
				}
			}
		}
		if(AInfo["Date of Intitial Operation"] != null && AInfo["Date of Intitial Operation"] != "" && appTypeArray[2] == "Adult Use") {
			if(dateDiff(AInfo["Date of Intitial Operation"],adultPriorityDate) >= 0) {
				arrReqdDocs_App.push(operationDate);
			}else{
				if(appHasCondition(conditionType, null, operationDate.condition, null)){
					removeCapCondition(conditionType, operationDate.condition);
				}
			}
		}
		if (AInfo["Vertical Integration"] == "CHECKED"){
			arrReqdDocs_App.push(localOrdinance);
			arrReqdDocs_App.push(cannabisActivity);
			arrReqdDocs_App.push(fullCompliance);
			arrReqdDocs_App.push(BOE);
		}else{
			if(appHasCondition(conditionType, null, localOrdinance.condition, null)){
				removeCapCondition(conditionType, localOrdinance.condition);
			}
			if(appHasCondition(conditionType, null, cannabisActivity.condition, null)){
				removeCapCondition(conditionType, cannabisActivity.condition);
			}
			if(appHasCondition(conditionType, null, fullCompliance.condition, null)){
				removeCapCondition(conditionType, fullCompliance.condition);
			}
			if(appHasCondition(conditionType, null, BOE.condition, null)){
				removeCapCondition(conditionType, BOE.condition);
			}
		}	
		
		if(AInfo["Local Authority Type"] != "" && AInfo["Local Authority Type"] != null) {
			arrReqdDocs_App.push(localAuth);
			arrReqdDocs_App.push(planningPermit);
		}else{
			if(appHasCondition(conditionType, null, localAuth.condition, null)){
				removeCapCondition(conditionType, localAuth.condition);
			}
			if(appHasCondition(conditionType, null, planningPermit.condition, null)){
				removeCapCondition(conditionType, planningPermit.condition);
			}
		}
*/

		return arrReqdDocs_App;
	}
	
// Required Documents for Owner Applications
	if(recdType == "Owner"){
		arrReqdDocs_Own = new Array();
		
	//these documents are always required
		//lwacht : 180322: story ????: only require fingerprint doc when live scan is available
		var liveScanNotActive = lookup("LIVESCAN_NOT_AVAILABLE","LIVESCAN_NOT_AVAILABLE");
		//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: getReqdDocs: " + startDate, "capId: " + capId + ": " + br + liveScanNotActive);
		if(!matches(liveScanNotActive,true, "true")){
			arrReqdDocs_Own.push(fingerprintApp);
		}
		//lwacht : 180322: story ????: end
		
	//these are now optional documents

		//if (AInfo["Convicted of a Crime"] == "Yes"){
		//		arrReqdDocs_Own.push(evidenceOfDismissal);
		//		arrReqdDocs_Own.push(certificateOfRehabilitation);
		//		arrReqdDocs_Own.push(referenceLetters);
		//}

		return arrReqdDocs_Own;
	}
}catch (err){
	logDebug("A JavaScript Error occurred:getReqdDocs: " + err.message);
	logDebug(err.stack);
}
}
