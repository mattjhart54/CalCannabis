/*===========================================
Title: createSet
Purpose: creates a set
Author: Lynda Wacht		
Functional Area : Sets
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis - story 4679
Parameters:
	prefix: Text: set name
	sType: Text: the set type on the set tab in the set
	sStatus: Text:  the set status on the set tab in the set
===========================================*/
function createSet(prefix,sType, sStatus){
// Create Set
try{
	if (prefix != ""){
		var yy = startDate.getFullYear().toString().substr(2,2);
		var mm = (startDate.getMonth() +1 ).toString(); //getMonth() returns (0 - 11)
		if (mm.length<2)
			mm = "0"+mm;
		var dd = startDate.getDate().toString();
		if (dd.length<2)
			dd = "0"+dd;
		var hh = startDate.getHours().toString();
		if (hh.length<2)
			hh = "0"+hh;
		var mi = startDate.getMinutes().toString();
		if (mi.length<2)
			mi = "0"+mi;
		//var setName = prefix.substr(0,5) + yy + mm + dd;
		var setName = prefix + "_" + yy + mm + dd;
		setDescription = prefix + " : " + mm + dd + yy;
		setResult = aa.set.getSetByPK(setName);
		setExist = false;
		setExist = setResult.getSuccess();
		if (!setExist) {
			var setCreateResult= aa.set.createSet(setName,prefix,"","Created via createSet function. ");
			if( setCreateResult.getSuccess() ){
				var setHeaderSetType = aa.set.getSetByPK(setName).getOutput();
				setHeaderSetType.setRecordSetType(sType);
				setHeaderSetType.setSetStatus(sStatus);
				updResult = aa.set.updateSetHeader(setHeaderSetType);
				logDebug("New Set ID "+setName+" created.");
				return setName;
			}else{
				logDebug("ERROR: Unable to create new Set ID "+setName+".");
				return false;
			}
		}else{
			logDebug("Set " + setName + " already exists and will be used for this script.");
			return setName;
		}
	}
}catch (err){
	logDebug("ERROR: createSet: " + err.message);
	logDebug("Stack: " + err.stack);
}}