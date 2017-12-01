/*===========================================
Title: convert2RealCAP
Purpose: Creates a real record from a temp record
Author: Lynda Wacht		
Functional Area : ACA
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis
Parameters:
	capModel: cap model 
		var capModel = aa.cap.getCapViewBySingle4ACA(capId);
============================================== */
function convert2RealCAP(capModel){
try{
	var originalCAPID = capModel.getCapID().getCustomID();
	var originalCAP = capModel;
	var capWithTemplateResult = aa.cap.getCapWithTemplateAttributes(capModel);
	var capWithTemplate = null;
	if (capWithTemplateResult.getSuccess()) 	{
		capWithTemplate = capWithTemplateResult.getOutput();
	}
	else {
		logDebug(capWithTemplateResult.getErrorMessage());
		return null;
	}
	
	// 2. Convert asi group.
	aa.cap.convertAppSpecificInfoGroups2appSpecificInfos4ACA(capModel);
	if (capModel.getAppSpecificTableGroupModel() != null) {
			aa.cap.convertAppSpecTableField2Value4ACA(capModel);
	}
	// 4. Triger event before convert to real CAP.
	aa.cap.runEMSEScriptBeforeCreateRealCap(capModel, null);
	// 5. Convert to real CAP.
	convertResult = aa.cap.createRegularCapModel4ACA(capModel, null, false, false);
	if (convertResult.getSuccess()) {
		capModel = convertResult.getOutput();
		logDebug("Commit OK: Convert partial CAP to real CAP successful: " + originalCAPID + " to " + capModel.getCapID().getCustomID());
	}
	else {
		logDebug(convertResult.getErrorMessage());
		return null;
	}
	// 6. Create template after convert to real CAP.
	aa.cap.createTemplateAttributes(capWithTemplate, capModel);
	// Triger event after convert to real CAP.
	aa.cap.runEMSEScriptAfterCreateRealCap(capModel, null);
	return capModel;
}catch(err){
	logDebug("An error occurred in convert2RealCAP: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in convert2RealCAP: Convert Assoc Forms: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}}