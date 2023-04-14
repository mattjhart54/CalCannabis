/*Adding Attachments with 7417
try{
	if(documentUploadedFrom == "ACA"){
		cancel = true;		
		showMessage = true;
		comment("No attachments may be uploaded to the License Renewal record.");
	}
}catch(err){
	logDebug("An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/RENEWAL: No Documents: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in DUB:LICENSES/CULTIVATOR/LICENSE/RENEWAL: No Documents: "+ startDate, capId + br+ err.message+ br+ err.stack + br + "DOCUMENT ARRAY: " + documentModel);
}
*/