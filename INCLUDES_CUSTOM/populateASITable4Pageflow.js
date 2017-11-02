/*===========================================
Title: populateASITable4Pageflow
Purpose: populates ASIT for ACA
Author: Lynda Wacht		
Functional Area : ASIT
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Parameters:
	ASITables : array : ASIT array
============================================== */

function populateASITable4Pageflow(ASITables) {
try{
    //if (vRowCount == 0) {
    for(var t in ASITables){
        removeASITable(t);
        addASITable(t,ASITables[t])
    }

    var tmpCap = aa.cap.getCapViewBySingle(capId);
    cap.setAppSpecificTableGroupModel(tmpCap.getAppSpecificTableGroupModel());
    aa.env.setValue("CapModel", cap);
    //}
}catch(err){
	logDebug("An error occurred in populateASITable4Pageflow: " + err.message);
	logDebug(err.stack);
}}
