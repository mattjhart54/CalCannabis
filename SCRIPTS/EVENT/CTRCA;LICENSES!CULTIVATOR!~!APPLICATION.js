//lwacht
//remove conditions after documents are uploaded
try{
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
	//aa.sendMail(sysFromEmail, debugEmail, "", "Info Only: ASA:LICENSES/CULTIVATOR/*/APPLICATION: Required Documents: "+ startDate, capId + br + "docCategory: " + docCategory);
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Remove Conditions: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/* /APPLICATION: Remove Conditions: "+ startDate, capId + br + err.message+ br+ err.stack);
}
*/