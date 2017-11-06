/*===========================================
Title: getASITablesArray
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
function getASITablesArray() {
    //
    // Loads App Specific tables into their own array of arrays.  Creates global array objects
    //
    // Optional parameter, cap ID to load from
    //
    var returnArray = [];
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();

    while (tai.hasNext()) {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tableName = String(tsm.getTableName());
        var tn = String(tableName).replace(/[^a-zA-Z0-9]+/g, '');
        var numrows = 0;
        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

        if (!tsm.rowIndex.isEmpty()) {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;

            while (tsmfldi.hasNext())  // cycle through fields
            {
                if (!tsmcoli.hasNext())  // cycle through columns
                {
                    var tsmcoli = tsm.getColumns().iterator();
                    tempArray.push(tempObject);  // end of record
                    var tempObject = new Array();  // clear the temp obj
                    numrows++;
                }
                var tcol = tsmcoli.next();
                var tval = tsmfldi.next();

                var readOnly = 'N';
                if (readOnlyi.hasNext()) {
                    readOnly = readOnlyi.next();
                }

                var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
                tempObject[tcol.getColumnName()] = fieldInfo;
                //tempObject[tcol.getColumnName()] = tval;
            }

            tempArray.push(tempObject);  // end of record
        }

        var copyStr = "" + tn + " = tempArray";
        logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
        returnArray[tableName] = tempArray;
    }
    return returnArray;
}catch(err){
	logDebug("An error occurred in getASITablesArray: " + err.message);
	logDebug(err.stack);
}}