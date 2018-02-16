/*===========================================
Title: getACABaseUrl
Purpose: gets the ACA Url for the environment you are in
Author: Lynda Wacht		
Functional Area : ACA
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Parameters:	None
============================================= */

function getACABaseUrl(){
try{
	var acaBaseUrl = lookup("ACA_CONFIGS","ACA_SITE");
	acaBaseUrl = acaBaseUrl.replace("admin/", "");
	acaBaseUrl = acaBaseUrl.replace("Admin/", "");
	acaBaseUrl = acaBaseUrl.replace("login.aspx", "");
	logDebug("acaBase: " + acaBaseUrl);
	return acaBaseUrl;
}catch (err){
	logDebug("A JavaScript Error occurred: getACABaseUrl: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: getACABaseUrl:  " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack + br + currEnv);
}}