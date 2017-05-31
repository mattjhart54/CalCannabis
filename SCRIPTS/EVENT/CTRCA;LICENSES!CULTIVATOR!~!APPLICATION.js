// lwacht
// compare the documents uploaded to the documents required by the added conditions
// remove the condition for all uploaded documents
try{
	aa.sendMail(sysFromEmail, debugEmail, "", "Info Only: CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: "+ startDate, capId + "; " );
	var docsList = [];
	var allDocsLoaded = true;
	//docsList = getDocumentList();//Get all Documents on a Record
	var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
	var arrMissingDocs = [];
	for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
		var thisDocument = capDocResult.getOutput().get(docInx);
		//var thisDocument = docsList[dl];
		var docCategory = thisDocument.getDocCategory();
		removeCapCondition("License Required Documents", docCategory);
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: "+ startDate, capId + "; " + err.message+ "; "+ err.stack);
}
