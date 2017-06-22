//lwacht
//function is missing from includes_accela_function, so adding it here
function editScheduledDate(issuedDate){ // option CapId
try{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess()){
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; 
		return false; 
	}
	var cdScriptObj = cdScriptObjResult.getOutput();
	if (!cdScriptObj){
		logDebug("**ERROR: No cap detail script object") ; 
		return false; 
	}
	cd = cdScriptObj.getCapDetailModel();
	var javascriptDate = new Date(issuedDate);
	var vIssuedDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());
	cd.setScheduledDate(vIssuedDate);
	cdWrite = aa.cap.editCapDetail(cd);
	if (cdWrite.getSuccess()){
		logDebug("Updated Scheduled Date to " + vIssuedDate) ; return true; }
	else{
		logDebug("**ERROR updating Scheduled Date: " + cdWrite.getErrorMessage()) ; 
		return false ; 
	}
} catch(err){
	logDebug("An error has occurred in editScheduledDate: " + err.message);
	logDebug(err.stack);
}}