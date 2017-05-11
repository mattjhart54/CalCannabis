function getReqdDocs(recdType){
try{
	if(!matches(recdType, "Application", "Owner"){
		logDebug("Function is currently only set up for Application and Owner documentation.");
		return false;
	}
	//optional capId
	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args
	if(recdType == "Application"){
		arrReqdDocs_App = new Array();
		//application documents
		//these documents are always required
		arrReqdDocs_App.push("Evidence of Surety Bond");
		//these are qualified documents
		var bsnsFormationDoc = "Business Formation Document";
		
		//these drive the required documents
		var bsnsEntity = getAppSpecific("Business Entity Structure", itemCap);

		//matching the qualified docs with their qualifications
		if (bsnsEntity != "Sole Proprietorship"){
			arrReqdDocs_App.push(bsnsFormationDoc);
		}
		return arrReqdDocs_App;
	}
	if(recdType == "Owner"){
		arrReqdDocs_Own = new Array();
		//application documents
		//these documents are always required
		arrReqdDocs_Own.push("Government ID");
		arrReqdDocs_Own.push("Electronic Fingerprint Images");
		//these are qualified documents
		var bsnsFormationDoc = "Business Formation Document";
		
		//these drive the required documents
		var bsnsEntity = getAppSpecific("Business Entity Structure", itemCap);

		//matching the qualified docs with their qualifications
		if (bsnsEntity != "Sole Proprietorship"){
			arrReqdDocs_Own.push(bsnsFormationDoc);
		}
		return arrReqdDocs_Own;
	}
}catch (err){
	logDebug("A JavaScript Error occurred:getReqdDocs: " + err.message);
	logDebug(err.stack);
}}