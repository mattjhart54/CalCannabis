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
    var businessOrganizationStructure = {condition : "CA Secretary of State Documents", document : "CA Secretary of State Documents"};
    var businessFormationDocument     = {condition : "Business Formation Documents", document : "Business Formation Documents"};
	//owner documents
    var governmentIssuedID = {condition : "Government Issued ID", document : "Government Issued ID"};
    var electronicFingerprintApplication = {condition : "Electronic Fingerprint Application", document : "Electronic Fingerprint Application"};
    var evidenceOfDismissal = {condition : "Evidence of Dismissal", document : "Evidence of Dismissal"};
    var certificateoFRehabilitation = {condition : "Certificate of Rehabilitation", document : "Certificate of Rehabilitation"};
    var referenceLetters = {condition : "Reference Letters", document : "Reference Letters"};

	if(recdType == "Application"){
		arrReqdDocs_App = new Array();
		//these documents are always required
		arrReqdDocs_App.push(businessOrganizationStructure);
		//these are qualified documents
		var bsnsEntity = getAppSpecific("Business Entity Structure", itemCap);
		var discipAction = getAppSpecific("Disciplinary Action", itemCap);

		//matching the qualified docs with their qualifications
		if (bsnsEntity != "Sole Proprietorship"){
			arrReqdDocs_App.push(businessFormationDocument);
		}
		return arrReqdDocs_App;
	}
	if(recdType == "Owner"){
		arrReqdDocs_Own = new Array();
		//these documents are always required
		arrReqdDocs_Own.push(governmentIssuedID);
		//these are qualified documents
		var bsnsFormationDoc = "Business Formation Document";
		
		//matching the qualified docs with their qualifications
		if (discipAction == "Yes"){
			arrReqdDocs_Own.push(evidenceOfDismissal);
			arrReqdDocs_Own.push(certificateoFRehabilitation);
			arrReqdDocs_Own.push(referenceLetters);
		}
		return arrReqdDocs_Own;
	}
}catch (err){
	logDebug("A JavaScript Error occurred:getReqdDocs: " + err.message);
	logDebug(err.stack);
}}