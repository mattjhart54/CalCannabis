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
emailText = "";

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_BATCH"));


function getScriptText(vScriptName) {
vScriptName = vScriptName.toUpperCase();
var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

function logDebug(edesc) {
	if (showDebug) {
		//aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
		aa.print("DEBUG : " + edesc);
		emailText+="DEBUG : " + edesc + " <br />"; }
	}

batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*------------------------------------------------------------------------------------------------------/
| Execute the mainprocess function and provide a status of the job that just ran.
/------------------------------------------------------------------------------------------------------*/


if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

	aa.sendMail("noreply@accela.com", "mtompkins@mytechsinc.com", "", batchJobName + " Results", emailText);
/*------------------------------------------------------------------------------------------------------/
| This function contains the core logic of the script
/------------------------------------------------------------------------------------------------------*/
function mainProcess() {
    var fvError = null;
    try {


    var vError = '';

    var sStmt1 = null;
    var rret = null;
	var retVal = null;
	var resArr = [];
    try {
        var conn = aa.db.getConnection();

		
		
	var servProd = aa.getServiceProviderCode();	
	var selectString = 	"SELECT REPLACE(XML,'JSHEAR', 'MHART') FROM RADHOC_REPORTS"
	//var selectString = "select * from information_schema.columns where table_name = 'BDOCUMENT'"
	var sStmt = conn.prepareStatement(selectString);
	var rSet = sStmt.executeQuery();
	
	sStmt.close();			

    } catch (vError) {
        aa.print("Runtime error occurred: " + vError);
    }
    closeDBQueryObject(rret, sStmt1, conn); 
    }
    catch (fvError) {
        aa.print("Runtime error occurred: " + fvError);
        return false;
		
    }
}

/*------------------------------------------------------------------------------------------------------/
| Execute the SQL
/------------------------------------------------------------------------------------------------------*/


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