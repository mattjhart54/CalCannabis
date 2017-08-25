function getReqdDocs(recdType){
try{
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
	loadASITables4ACA();
	var need_premiseDiagram = false;
	var need_wastePlan = false;
	var need_pestPlan = false;
	var need_lightDiagram = false;	
	//application documents
	var conditionType = "License Required Documents";
    var businessFormation = {condition : "Business - Business Formation Documents", document : "Business - Business Formation Documents"};
    var businessBond = {condition : "Business - Evidence Surety Bond", document : "Business - Evidence Surety Bond"};
	var foriegnCorp = {condition : "Business - Foreign Corp. Certificate of Qualification", document : "Business - Foreign Corp. Certificate of Qualification"};
	var stateDocuments = {condition : "Business - CA Secretary of State Documents", document : "Business - CA Secretary of State Documents"};
	var soveriegnImmunity = {condition : "Business - Waiver of Sovereign Immunity", document : "Business - Waiver of Sovereign Immunity"};
//	var localOrdinance = {condition : "VI - Copy of the Local Ordinance", document : "VI - Copy of the Local Ordinance"};
//	var cannabisActivity = {condition : "VI - Evidence of Conducting Cannabis Activity", document : "VI - Evidence of Conducting Cannabis Activity"};
//	var BOE = {condition : "VI - Registration with CA BOE", document : "VI - Registration with CA BOE"};
//	var fullCompliance = {condition : "VI - Evidence of Full Local Compliance", document : "VI - Evidence of Full Local Compliance"};
	var occupyUse = {condition : "Premises - Legal Right to Occupy and Use", document : "Premises - Legal Right to Occupy and Use"};
	var ownership = {condition : "Premises - Property Ownership Documentation", document : "Premises - Property Ownership Documentation"};
//	var operationDate = {condition : "Premises - Evidence of the Date Operations Began", document : "Premises - Evidence of the Date Operations Began"};
	var enviroStor = {condition : "Premises - EnviroStor Hazardous Materials Search", document : "Premises - EnviroStor Hazardous Materials Search"};
	var premiseDiagram = {condition : "Cultivation Plan - Premises Diagram", document : "Cultivation Plan - Premises Diagram"};
	var wastePlan = {condition : "Cultivation Plan - Waste Management Plan", document : "Cultivation Plan - Waste Management Plan"};
	var pestPlan = {condition : "Cultivation Plan - Pest Management Plan", document : "Cultivation Plan - Pest Management Plan"};
	var lightDiagram = {condition : "Cultivation Plan - Lighting Diagram", document : "Cultivation Plan - Lighting Diagram"};
	var streambedAlter = {condition : "Water - Streambed Alteration Document", document : "Water - Streambed Alteration Document"};
	var wellLog = {condition : "Water - Goundwater Well", document : "Water - Groundwaer Well"};
	var srs2WellLog = {condition : "Water - Small Retail Supplier Delivery", document : "Water - Small Retail Supplier Delivery"};
	var SWRCBAhuth = {condition : "Water - SWRCB Diversion Authorization", document : "Water - SWRCB Diversion Authorization"};
	var SWRCBExcept = {condition : "Water - SWRCB Exception Document", document : "Water - SWRCB Exception Document"};
	var waterQuality = {condition : "Water - Water Quality Protection Permit", document : "Water - Water Quality Protection Permit"};
//	var localAuth = {condition : "Local - Local Authorization", document : "Local - Local Authorization"};
	var planningPermit = {condition : "Local - Certified Planning Permit", document : "Local - Certified Planning Permit"};
	var goodStanding = {condition : "Local - Evidence of Good Standing", document : "Local - Evidence of Good Standing"};
	var CEQA = {condition : "Local - Evidence of CEQA Compliance", document : "Local - Evidence of CEQA Compliance"};
//	var localComply = {condition : "Local - Certification of Local Compliance", document : "Local - Certification of Local Compliance"};
	var coopMembers = {condition : "Co-Op - List of Members", document : "Co-Op - List of Members"};
	
	//owner documents
    var governmentIssuedID = {condition : "Government Issued ID", document : "Government Issued ID"};
    var fingerprintApp = {condition : "Electronic Fingerprint Application", document : "Electronic Fingerprint Application"};
    var evidenceOfDismissal = {condition : "Evidence of Dismissal", document : "Evidence of Dismissal"};
    var certificateOfRehabilitation = {condition : "Certificate of Rehabilitation", document : "Certificate of Rehabilitation"};
    var referenceLetters = {condition : "Reference Letters", document : "Reference Letters"};
	var convictions = {condition : "History of Convictions", document : "History of Convictions"};
//	var calResidency = {condition : "Evidence of California Residency", document : "Evidence of California Residency"};

// Required Documents for Cultivator Applications
	if(recdType == "Application"){
		arrReqdDocs_App = new Array();
		
	//Business documents
		if (AInfo["Business Entity Structure"] != "Sole Proprietorship"){
			arrReqdDocs_App.push(stateDocuments);
		}else{
			if(appHasCondition(conditionType, null, stateDocuments.condition, null)){
				removeCapCondition(conditionType, stateDocuments.condition);
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
		if(matches(AInfo["License Type"],"Specialty Cottage Indoor","Specialty Cottage Mixed-Light","Specialty Indoor","Specialty Mixed-Light","Small Indoor","Small Mixed-Light","Medium Indoor","Medium Mixed-Light")) {
			need_premiseDiagram = true;
			need_wastePlan = true;
			need_pestPlan = true;
			need_lightDiagram = true;		}
		if(matches(AInfo["License Type"],"Specialty Cottage Outdoor","Specialty Outdoor","Small Outdoor","Medium Outdoor","Nursery")) {
			need_premiseDiagram = true;
			need_wastePlan = true;
			need_pestPlan = true;
		}
		if(AInfo["License Type"] =="Processor") {
			need_premiseDiagram = true;
			need_wastePlan = true;
		}

		if(need_lightDiagram){
			arrReqdDocs_App.push(lightDiagram);
		}else{
			if(appHasCondition(conditionType, null, lightDiagram.condition, null)){
				removeCapCondition(conditionType, lightDiagram.condition);
			}
		}
		if(need_premiseDiagram){
			arrReqdDocs_App.push(premiseDiagram);
		}else{
			if(appHasCondition(conditionType, null, premiseDiagram.condition, null)){
				removeCapCondition(conditionType, premiseDiagram.condition);
			}
		}
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
		arrReqdDocs_App.push(planningPermit);
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
		if (AInfo["Groundwater Well"] == "CHECKED"){
			arrReqdDocs_App.push(wellLog);
		}else{
			if(appHasCondition(conditionType, null, wellLog.condition, null)){
				removeCapCondition(conditionType, wellLog.condition);
			}
		}
		if (AInfo["Small Retail Supplier 2"] == "CHECKED"){
			arrReqdDocs_App.push(srs2WellLog);
		}else{
			if(appHasCondition(conditionType, null, srs2WellLog.condition, null)){
				removeCapCondition(conditionType, srs2WellLog.condition);
			}
		}
		
		arrReqdDocs_App.push(streambedAlter);
				
		if (AInfo["Diversion"] == "CHECKED"){
			arrReqdDocs_App.push(SWRCBAhuth);
		}else{
			if(appHasCondition(conditionType, null, SWRCBAhuth.condition, null)){
				removeCapCondition(conditionType, SWRCBAhuth.condition);
			}
		}		
		if (AInfo["Diversion Exception"] == "CHECKED"){
			arrReqdDocs_App.push(SWRCBExcept);
		}else{
			if(appHasCondition(conditionType, null, SWRCBExcept.condition, null)){
				removeCapCondition(conditionType, SWRCBExcept.condition);
			}
		}
	
		arrReqdDocs_App.push(waterQuality);
		
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
		arrReqdDocs_Own.push(governmentIssuedID);
		arrReqdDocs_Own.push(fingerprintApp);
		
	//these are now optional documents

		if (AInfo["Convicted of a Crime"] == "Yes"){
				arrReqdDocs_Own.push(evidenceOfDismissal);
				arrReqdDocs_Own.push(certificateOfRehabilitation);
				arrReqdDocs_Own.push(referenceLetters);
		}

		return arrReqdDocs_Own;
	}
}catch (err){
	logDebug("A JavaScript Error occurred:getReqdDocs: " + err.message);
	logDebug(err.stack);
}
}