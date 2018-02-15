/*===========================================
Title: getACAlinkForEdit
Purpose: gets the ACA for editing records
Author: Lynda Wacht		
Functional Area : ACA
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Parameters:
	itemCap : capId: record to fetch
	module: module in which the license exists
	linkType: One of:
		1008: amendment url routing
		1005: resume an application
		1000: view record
		1006: renewal
		1009: pay fee due
		1010: pay fee due in renewal
============================================= */

function getACAlinkForEdit(itemCap, module, linkType){
try{
	if(!matches(linkType, "1008","1005","1000","1006","1009","1010")){
		logDebug("The link type must be one of: 1000, 1005, 1006, 1008, 1009, 1010");
		return false;
	}
	var sca = String(itemCap).split("-");
	if(sca.length != 3){
		logDebug("itemCap is not a capId");
		return false;
	}
	var acaBase = lookup("ACA_CONFIGS","ACA_SITE");
	acaBase = acaBase.replace("admin/", "");
	acaBase = acaBase.replace("Admin/", "");
	acaBase = acaBase.replace("login.aspx", "");
	logDebug("acaBase: " + acaBase);
	var acaEdit = "urlrouting.ashx?type=" + linkType + "&Module=" + module + "&capID1=" + sca[0] + "&capID2=" + sca[1] + "&capID3=" + sca[2] + "&agencyCode=" + servProvCode;
	var fullACAlink = acaBase + acaEdit;
	return fullACAlink;
}catch (err){
	logDebug("A JavaScript Error occurred: getACAlinkForEdit: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: getACAlinkForEdit:  " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack + br + currEnv);
}}
