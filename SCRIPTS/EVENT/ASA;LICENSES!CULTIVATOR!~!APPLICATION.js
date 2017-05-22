// lwacht
//compare the documents uploaded to the documents required in the "attachment" event
// if any documents are required, send an email.
/* lwacht : start : not using, but leaving for now
try{
	if(!publicUser){
		var docsList = [];
		var allDocsLoaded = true;
		//var docsList = aa.env.getValue("DocumentModelList"); //Get all Documents on a Record
		var docsList = getDocumentList();
		logDebug("docsList: " + docsList);
		reqDocs = getReqdDocs("Application");
		var tblRow = [];
		if(reqDocs.length>0){
			for (x in reqDocs){
				var docName = reqDocs[x];
				var tblRow = [];
				tblRow["Document Type"] = ""+docName; 
				tblRow["Document Description"]= ""+lookup("LIC_CC_ATTACHMENTS", docName); 
				var docFound=false; 
				if(docsList.length>0){
					for (dl in docsList){
						var thisDocument = docsList[dl];
						var docCategory = thisDocument.getDocCategory();
						if (docName.equals(docCategory)){
							docFound = true;
							tblRow["Uploaded"] = "CHECKED";
							tblRow["Status"] = "Under Review";
						}else{
							tblRow["Uploaded"] = "UNCHECKED";
							tblRow["Status"] = "Not Submitted";
						}
					}
				}else{
					tblRow["Uploaded"] = "UNCHECKED";
					tblRow["Status"] = "Not Submitted";
				}
				if(!docFound){
					addStdCondition("License Required Documents", docName);
				}
				addToASITable("ATTACHMENTS",tblRow);
			}
		}
	}
} catch(err){ 
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/ * /APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
}
lwacht : end
*/
//lwacht
// adding associated forms for owner records
try {
	if(publicUser){
		var capId = cap.getCapID();
		var recTypeAlias = "Owner Application";  // must be a valid record type alias
		var recordNum = 0;
		//loadASITables4ACA();
		loadASITables();
		for(row in OWNERS){
			recordNum++;
		}
		var afArray = [];  // array describing the associated form records

		for (var i = 0; i < recordNum; i++) {
			var af = {};  // empty object
			af.ID = String(i + 1);  // give it an id number
			af.Alias = recTypeAlias;  
			af.recordId = "";		// define a place to store the record ID when the record is created
			afArray.push(af); 		// add the record to our array
		}
		doAssocFormRecs1(null,afArray);
	}
}catch (err) {
	logDebug("A JavaScript Error occurred:ASA:LICENSES/CULTIVATOR/*/APPLICATION: associated forms: " + err.message);
	logDebug(err.stack);
}
