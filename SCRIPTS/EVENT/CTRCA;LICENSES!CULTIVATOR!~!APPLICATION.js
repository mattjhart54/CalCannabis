// lwacht
// compare the documents uploaded to the documents required in the "attachment" event
// if any documents are required, send an email.
/* lwacht : start : not using, but leaving for now
try{
	var docsList = [];
	var allDocsLoaded = true;
	//docsList = getDocumentList();//Get all Documents on a Record
   var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
	var arrMissingDocs = [];
	for (l in ATTACHMENTS){
		var reqDocument = ""+ATTACHMENTS[l]["Document Type"];
		//logDebug("reqDocument: " + reqDocument);
		docFound = false;
		if(capDocResult.getSuccess()) {
			if(capDocResult.getOutput().size() > 0) {
				//for (dl in docsList){
				for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
					var thisDocument = capDocResult.getOutput().get(docInx);
					//var thisDocument = docsList[dl];
					var docCategory = thisDocument.getDocCategory();
					//logDebug("---docCategory: " + docCategory);
					if (reqDocument.equals(docCategory)){
						docFound = true;
						ATTACHMENTS[l]["Uploaded"]=="CHECKED";
						ATTACHMENTS[l]["Status"]=="Under Review";
					}
				}
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
	addASITable("ATTACHMENTS", ATTACHMENTS);
	//if there are any missing documents, send an email
	if(!allDocsLoaded){
		var br = "<br>";
		var emailBody ="";
		for(x in arrMissingDocs){
			emailBody += " - " + arrMissingDocs[x] + br;
		}
		//logDebug("emailBody: " + emailBody);
		//aa.sendMail("lwacht@cdfa.ca.gov",debugEmail , "", "vote for pedro", "yay");
		emailContact("Application " + capIDString + " has been received", "Thank you for submitting your application.  Your application is missing required documents. These must be uploaded to your application before processing will begin." +br + emailBody + "Thank you");
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/ * /APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
}
lwacht : end
*/
