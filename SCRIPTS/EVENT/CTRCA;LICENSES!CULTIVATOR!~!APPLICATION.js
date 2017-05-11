//compare the documents uploaded to the documents required in the "attachment" event
// if any documents are required, send an email.
try{
	var docsList = [];
	var allDocsLoaded = true;
	docsList = getDocumentList();//Get all Documents on a Record
	var arrReqdDocs = loadASITable("ATTACHMENTS");
	var arrMissingDocs = [];
	for (l in arrReqdDocs){
		var reqDocument = ""+arrReqdDocs[l]["Document Type"];
		docFound = false;
		for (dl in docsList){
			var thisDocument = docsList[dl];
			var docCategory = thisDocument.getDocCategory();
			if (reqDocument.equals(docCategory)){
				docFound = true;
				arrReqdDocs[l]["Uploaded"]=="CHECKED";
				arrReqdDocs[l]["Status"]=="Under Review";
			}
		}
		//if a document is not found, add a condition to the record
		if(!docFound){
			arrMissingDocs.push(reqDocument);
			allDocsLoaded = false;
			addStdCondition("License Required Documents", reqDocument);
		}
	}
	//update attachments table with which documents have been uploaded
	removeASITable("ATTACHMENTS");
	addASITable("ATTACHMENTS", arrReqdDocs);
	//if there are any missing documents, send an email
	if(!allDocsLoaded){
		var br = "<br>";
		var emailBody ="";
		for(x in arrMissingDocs){
			emailBody += " - " + arrMissingDocs[x] + br;
		}
		logDebug("emailBody: " + emailBody);
		//aa.sendMail("lwacht@cdfa.ca.gov",debugEmail , "", "vote for pedro", "yay");
		emailContact("Application " + capIDString + " has been received", "Thank you for submitting your application.  Your application is missing required documents. These must be uploaded to your application before processing will begin." +br + emailBody + "Thank you");
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
}

