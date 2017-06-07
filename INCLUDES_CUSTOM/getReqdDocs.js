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
		
	//application documents
    var businessFormation = {condition : "Business - Business Formation Documents", document : "Business - Business Formation Documents"};
    var businessBond = {condition : "Business - Evidence Surety Bond", document : "Business - Evidence Surety Bond"};
	var foriegnCorp = {condition : "Business - Foreign Corp. Certificate of Qualification", document : "Business - Foreign Corp. Certificate of Qualification"};
	var stateDocuments = {condition : "Business - CA Secretary of State Documents", document : "Business - CA Secretary of State Documents"};
	var soveriegnImmunity = {condition : "Business - Waiver of Sovereign Immunity", document : "Business - Waiver of Sovereign Immunity"};
	var localOrdinance = {condition : "VI - Copy of the Local Ordinance", document : "VI - Copy of the Local Ordinance"};
	var cannabisActivity = {condition : "VI - Evidence of Conducting Cannabis Activity", document : "VI - Evidence of Conducting Cannabis Activity"};
	var BOE = {condition : "VI - Registration with CA BOE", document : "VI - Registration with CA BOE"};
	var fullCompliance = {condition : "VI - Evidence of Full Local Compliance", document : "VI - Evidence of Full Local Compliance"};
	var occupyUse = {condition : "Premises - Legal Right to Occupy and Use", document : "Premises - Legal Right to Occupy and Use"};
	var ownership = {condition : "Premises - Property Ownership Documentation", document : "Premises - Property Ownership Documentation"};
	var operationDate = {condition : "Premises - Evidence of the Date Operations Began", document : "Premises - Evidence of the Date Operations Began"};
	var enviroStor = {condition : "Premises - EnviroStor Hazardous Materials Search", document : "Premises - EnviroStor Hazardous Materials Search"};
	var premiseDiagram = {condition : "Cultivation Plan - Premises Diagram", document : "Cultivation Plan - Premises Diagram"};
	var wastePlan = {condition : "Cultivation Plan - Waste Management Plan", document : "Cultivation Plan - Waste Management Plan"};
	var pestPlan = {condition : "Cultivation Plan - Pest Management Plan", document : "Cultivation Plan - Pest Management Plan"};
	var lightDiagram = {condition : "Cultivation Plan - Lighting Diagram", document : "Cultivation Plan - Lighting Diagram"};
	var streambedAlter = {condition : "Water - Streambed Alteration Document", document : "Water - Streambed Alteration Document"};
	var wellLog = {condition : "Water - Well Log", document : "Water - Well Log"};
	var SWRCBAhuth = {condition : "Water - SWRCB Diversion Authorization", document : "Water - SWRCB Diversion Authorization"};
	var SWRCBExcept = {condition : "Water - SWRCB Exception Document", document : "Water - SWRCB Exception Document"};
	var waterQuality = {condition : "Water - Water Quality Protection Permit", document : "Water - Water Quality Protection Permit"};
	var localAuth = {condition : "Local - Local Authorization", document : "Local - Local Authorization"};
	var planningPermit = {condition : "Local - Certified Planning Permit", document : "Local - Certified Planning Permit"};
	var goodStanding = {condition : "Local - Evidence of Good Standing", document : "Local - Evidence of Good Standing"};
	var CEQA = {condition : "Local - Evidence of CEQA Compliance", document : "Local - Evidence of CEQA Compliance"};
	var localComply = {condition : "Local - Certification of Local Compliance", document : "Local - Certification of Local Compliance"};
	
	//owner documents
    var governmentIssuedID = {condition : "Government Issued ID", document : "Government Issued ID"};
    var fingerprintApp = {condition : "Electronic Fingerprint Application", document : "Electronic Fingerprint Application"};
    var evidenceOfDismissal = {condition : "Evidence of Dismissal", document : "Evidence of Dismissal"};
    var certificateOfRehabilitation = {condition : "Certificate of Rehabilitation", document : "Certificate of Rehabilitation"};
    var referenceLetters = {condition : "Reference Letters", document : "Reference Letters"};
	var convictions = {condition : "History of Convictions", document : "History of Convictions"};
	var calResidency = {condition : "Evidence of California Residency", document : "Evidence of California Residency"};


	if(recdType == "Application"){
		arrReqdDocs_App = new Array();
		
	//these documents are always required
		arrReqdDocs_App.push(businessBond);
		arrReqdDocs_App.push(waterQuality);
		arrReqdDocs_App.push(enviroStor);
		arrReqdDocs_App.push(streambedAlter);	
		arrReqdDocs_App.push(localComply);
		arrReqdDocs_App.push(CEQA);
		
	//these are qualified documents
		var bsnsEntity = getAppSpecific("Business Entity Structure", itemCap);
		var foriegn = getAppSpecific("Foriegn Corporation", itemCap);
		var VI = getAppSpecific("Vertical Integration", itemCap);
		var SR2 = getAppSpecific("Small Retail Supplier 2", itemCap);
		var GWW = getAppSpecific("Small Retail Supplier 2", itemCap);
		var diversion = getAppSpecific("Diversion", itemCap);
		var diversionExcept = getAppSpecific("Diversion Exception", itemCap);
		var licType = getAppSpecific("License Type", itemCap);
		var localAuthority = getAppSpecific("Local Authority Type", itemCap);
		var legalPossession = getAppSpecific("Legal Possession", itemCap);
		var operDate = getAppSpecific("Date of Intitial Operation", itemCap);
		var priorityDate = "01/01/2016";
		
		if(operDate != null && operDate != "") {
			if(dateDiff(operDate,priorityDate) >= 0) {
				arrReqdDocs_App.push(operationDate);
			}
		}
		if (bsnsEntity != "Sole Proprietorship"){
			arrReqdDocs_App.push(businessFormation);
			arrReqdDocs_App.push(stateDocuments);
		}
		if (bsnsEntity == "Soveriegn Entity"){
			arrReqdDocs_App.push(soveriegnImmunity);
		}
		if (foriegn == "Yes"){
			arrReqdDocs_App.push(foriegnCorp);
		}
		if (VI == "CHECKED"){
			arrReqdDocs_App.push(localOrdinance);
			arrReqdDocs_App.push(cannabisActivity);
			arrReqdDocs_App.push(fullCompliance);
			arrReqdDocs_App.push(BOE);
		}
		
		if(legalPossession == "Own") {
			arrReqdDocs_App.push(ownership);
		}
		if(legalPossession == "Rent/Lease" || legalPossession == "Other") {
			arrReqdDocs_App.push(occupyUse);
		}
		
		if (SR2 == "CHECKED"){
			arrReqdDocs_App.push(wellLog);
		}
		if (GWW == "CHECKED"){
			arrReqdDocs_App.push(wellLog);
		}
		if (diversion == "CHECKED"){
			arrReqdDocs_App.push(SWRCBAhuth);
		}				
		if (diversionExcept == "CHECKED"){
			arrReqdDocs_App.push(SWRCBExcept);
		}
		if(matches(licType,"Specialty Cottage Indoor","Specialty Cottage Mixed-Light","Specialty Indoor","Specialty Mixed-Light","Small Indoor","Small Mixed-Light","Medium Indoor","Medium Mixed-Light")) {
			arrReqdDocs_App.push(premiseDiagram);
			arrReqdDocs_App.push(wastePlan);
			arrReqdDocs_App.push(pestPlan);
			arrReqdDocs_App.push(lightDiagram);
		}
		if(matches(licType,"Specialty Cottage Outdoor","Specialty Outdoor","Small Outdoor","Medium Outdoor","Nursery")) {
			arrReqdDocs_App.push(premiseDiagram);
			arrReqdDocs_App.push(wastePlan);
			arrReqdDocs_App.push(pestPlan);
		}
		if(licType =="Processor") {
			arrReqdDocs_App.push(premiseDiagram);
			arrReqdDocs_App.push(wastePlan);
		}
		if(localAuthority != "" && localAuthority != null) {
			arrReqdDocs_App.push(localAuth);
			arrReqdDocs_App.push(planningPermit);
			arrReqdDocs_App.push(goodStanding);
		}
		//for(d in arrReqdDocs_App)
		//	logDebug("Documents " + arrReqdDocs_App[d]);
		return arrReqdDocs_App;
	}
	if(recdType == "Owner"){
		arrReqdDocs_Own = new Array();
	//these documents are always required
		arrReqdDocs_Own.push(governmentIssuedID);
		arrReqdDocs_Own.push(fingerprintApp);
	//these are qualified documents
		if(appTypeArray[2] == "Adult Use") {
			arrReqdDocs_Own.push(calResidency);
		}
		var crime = getAppSpecific("Convicted of a Crime", itemCap);
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