/*===========================================
Title: loadASITables4ACAasArray
Purpose: loads ASIT as an array for ACA
Author: Lynda Wacht		
Functional Area : ASIT
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Parameters:
	capId (Optional): capId: To remove fees from a 
		record that isn't the current one
============================================== */

function loadASITables4ACAasArray() {
try{
    //
    // Loads App Specific tables into their own array of arrays.  Creates global array objects
    //
    // Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
    //
    var returnArray = [];
    var itemCap = capId;
    if (arguments.length == 1) {
        itemCap = arguments[0]; // use cap ID specified in args
        var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    } else {
        var gm = cap.getAppSpecificTableGroupModel()
    }
    var ta = gm.getTablesMap();
    var tai = ta.values().iterator();
    while (tai.hasNext()) {
        var tsm = tai.next();
        if (tsm.rowIndex.isEmpty())
            continue; // empty table
        var tempObject = new Array();
        var tempArray = new Array();
        var tableName = String(tsm.getTableName());
        var tn = String(tableName).replace(/[^a-zA-Z0-9]+/g, '');
        if (!isNaN(tn.substring(0, 1)))
            tn = "TBL" + tn // prepend with TBL if it starts with a number
        var tsmfldi = tsm.getTableField().iterator();
        var tsmcoli = tsm.getColumns().iterator();
        var numrows = 1;
        while (tsmfldi.hasNext()) // cycle through fields
        {
            if (!tsmcoli.hasNext()) // cycle through columns
            {
                var tsmcoli = tsm.getColumns().iterator();
                tempArray.push(tempObject); // end of record
                var tempObject = new Array(); // clear the temp obj
                numrows++;
            }
            var tcol = tsmcoli.next();
            var tval = tsmfldi.next();

            //var tval = tnxt.getInputValue();
            tempObject[tcol.getColumnName()] = tval;
        }
        tempArray.push(tempObject); // end of record
        var copyStr = "" + tn + " = tempArray";
        //	  logDebug(copyStr);
        //    logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
        eval(copyStr); // move to table name
        returnArray[tableName] = tempArray;
    }
    return returnArray;
}catch(err){
	logDebug("An error occurred in loadASITables4ACAasArray: " + err.message);
	logDebug(err.stack);
}}
