/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AFTER_APP_COND_DOCS.js
| Event   : ACA Page Flow attachments before event
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var SCRIPT_VERSION = 3;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, true));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null,true));
}

eval(getScriptText("INCLUDES_CUSTOM", null,true));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

var cap = aa.env.getValue("CapModel");

// page flow custom code begin

try {
	//lwacht: 180305: story 5293: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180305: story 5293: end
		var eText = "";
		var condResult = aa.capCondition.getCapConditions(capId,"License Required Documents");
		if(condResult.getSuccess()){
			var arrCond = condResult.getOutput();
			var docsList = [];
			var allDocsLoaded = true;
			//docsList = getDocumentList();//Get all Documents on a Record
			var capDocResult = aa.document.getDocumentListByEntity(capId,"TMP_CAP");
			for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
				var thisDocument = capDocResult.getOutput().get(docInx);
				var documentModel = null;
				var conditionNumber = 0;
				conditionNumber = thisDocument.getConditionNumber();
				//if(conditionNumber != null && conditionNumber != 0){
				if(!matches(conditionNumber, null, 0)){
					var condMatch = false;
					for(y in arrCond){
						logDebug("conditionNumber: " + conditionNumber);
						eText+= br + ("conditionNumber: " + conditionNumber);
						logDebug("arrCond[y].getConditionNumber(): " + arrCond[y].getConditionNumber());
						eText+= br + ("arrCond[y].getConditionNumber(): " + arrCond[y].getConditionNumber());
						if(conditionNumber==arrCond[y].getConditionNumber()){
							condMatch = true;
							var capCondition =arrCond[y];
							try{
								var conditionName = capCondition.getConditionType();
								var conditionGroup = capCondition.getConditionGroup();
								var conditionDesc = capCondition.getConditionDescription();
								thisDocument.setDocCategory(conditionDesc);
								//documentModel.setDocDepartment(conditionGroup);
								thisDocument.setDocGroup("CALCANNABIS APPLICANT");
								logDebug("Condition Name - " + conditionName);
								logDebug("Condition Group - " + conditionGroup);
								logDebug("Condition Description - " + conditionDesc);
								eText+= br + ("Condition Name - " + conditionName);
								eText+= br + ("Condition Group - " + conditionGroup);
								eText+= br + ("Condition Description - " + conditionDesc);
								var updateDocumentResult = aa.document.updateDocument(thisDocument);
								if(updateDocumentResult.getSuccess()){
									logDebug("Update document model successfully - " + 	thisDocument.getDocName());
									eText+= br + ("Update document model successfully - " + 	thisDocument.getDocName());
								}else{
									logDebug("Update document model failed - " + thisDocument.getDocName());
									eText+= br + ("Update document model failed - " + thisDocument.getDocName());
								}
							}catch(err){
								logDebug("Error retrieving Cap Condition detail: " + err.message);
								eText+= br + ("Error retrieving Cap Condition detail: " + err.message);
							}
						}
					}
					if(!condMatch){
						logDebug("Condition not found for document " + thisDocument);
						eText+= br + ("Condition not found for document " + thisDocument);
					}
				}else{
					logDebug("No condition number - " + thisDocument.getDocName());
					eText+= br + ("No condition number - " + thisDocument.getDocName());
				}
			}
		}
		//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: ACA_AFTER_APP_COND_DOCS: " + startDate, "capId: " + capId + ": " + br + "eText: " + eText);
	}

} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_AFTER_APP_COND_DOCS: Main function: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_AFTER_APP_COND_DOCS: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack);
}

function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
}
// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}



