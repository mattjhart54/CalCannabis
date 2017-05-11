//compare the documents uploaded to the documents required in the "attachment" event
// if any documents are required, send an email.
try{
	if(!publicUser){
		var docsList = [];
		var allDocsLoaded = true;
		var docsList = aa.env.getValue("DocumentModelList"); //Get all Documents on a Record
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
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
}
