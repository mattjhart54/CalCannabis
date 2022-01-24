/*------------------------------------------------------------------------------------------------------/
| Script to execute SQL via EMSE
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

/*------------------------------------------------------------------------------------------------------/
| VARIABLE DEFINITIONS
/------------------------------------------------------------------------------------------------------*/
var showDebug = "Y";
var timeExpired = false;
var debug = "";

/*------------------------------------------------------------------------------------------------------/
| Execute the mainprocess function and provide a status of the job that just ran.
/------------------------------------------------------------------------------------------------------*/

if (!timeExpired) var isSuccess = mainProcess();
aa.print(debug);

/*------------------------------------------------------------------------------------------------------/
| This function contains the core logic of the script
/------------------------------------------------------------------------------------------------------*/
function mainProcess() {
    var fvError = null;
    try {

        runSQL();
        aa.print("DONE");
        return true;
    }
    catch (fvError) {
        aa.print("Runtime error occurred: " + fvError);
        return false;
    }
}

/*------------------------------------------------------------------------------------------------------/
| Execute the SQL
/------------------------------------------------------------------------------------------------------*/
function runSQL() {
    var vError = '';

    var sStmt1 = null;
    var rret = null;
	var retVal = null;
    try {
        var conn = aa.db.getConnection();

        var usql =   "  DELETE FSHOPPING_CART_ITEM";

        sStmt1 = conn.prepareStatement(usql);
        rret = sStmt1.execute();  
		

    } catch (vError) {
        aa.print("Runtime error occurred: " + vError);
    }
    closeDBQueryObject(rret, sStmt1, conn); 
}

function closeDBQueryObject(rSet, sStmt, conn) {
    try {
        if (rSet) {
            rSet.close();
            rSet = null;
        }
    } catch (vError) {
        aa.print("Failed to close the database result set object." + vError);
    }
    try {
        if (sStmt) {
            sStmt.close();
            sStmt = null;
        }
    } catch (vError) {
        aa.print("Failed to close the database prepare statement object." + vError);
    }
    try {
        if (conn) {
            conn.close();
            conn = null;
        }
    } catch (vError) {
        aa.print("Failed to close the database connection." + vError);
    }
}