/*===========================================
Title: getRelatedRecdsDown
Purpose: Gets all great/grand/children records
Author: Lynda Wacht		
Functional Area : Related records
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis
Parameters:
	itemcap: capId: parent record for which to search
============================================== */
function getRelatedRecdsDown(itemCap) { 
try{
	//gets all great/grand/children/etc; removes duplicates
	var relArr = getChildren("*/*/*/*", itemCap);
	var allKids = new Array();
	var cnt=0;
	var i=0;
	var m=0;
	var rr=0;
	for (i in relArr){
		allKids[cnt]=relArr[i];
		cnt++;
	}
	while (allKids[m]){
		thisCapId =allKids[m];
		var hierArr = getChildren("*/*/*/*",thisCapId);
		for (x in hierArr){
			var childAlreadyThere=false;
			for (mm in allKids)
				if (allKids[mm]==hierArr[x]) childAlreadyThere=true;
			if (!childAlreadyThere) {
				allKids[cnt]=hierArr[x];
				cnt++;
			}
		}
		m++;
	}
	return allKids;
}catch (err) {
	logDebug("A JavaScript Error occurred: getRelatedRecdsDown: " + err.message);
	logDebug(err.stack);
}}