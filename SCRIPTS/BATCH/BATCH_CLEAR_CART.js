/*------------------------------------------------------------------------------------------------------/
| Script to execute SQL via EMSE
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

/*------------------------------------------------------------------------------------------------------/
| VARIABLE DEFINITIONS
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var errLog = "";
var debugText = "";
var showDebug = "Y";	
var showMessage = false;
var message = "";
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

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
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var emailAddress = getParam("emailAddress");			// email to send report
var sysFromEmail = getParam("sysFromEmail");

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;


batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0,0,0,0);
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
try {
	mainProcess();
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
	if (emailAddress.length) {
		aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);
		if(errLog != "") {
			aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Errors", errLog);
		}
	}
} catch (err) {
	logDebug("ERROR: BATCH_DEFERRAL_UNPAID: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}
/*------------------------------------------------------------------------------------------------------/
| This function contains the core logic of the script
/------------------------------------------------------------------------------------------------------*/
function mainProcess() {


    var vError = '';

    try {
	// Identify Records in Shopping Cart
    var conn = aa.db.getConnection();	
	var servProd = aa.getServiceProviderCode();	
	var selectString = "select DISTINCT B1_PER_ID1, B1_PER_ID2, B1_PER_ID3 from FSHOPPING_CART_ITEM WHERE SERV_PROV_CODE='CALCANNABIS'";
	var sStmt = conn.prepareStatement(selectString);
	var rSet = sStmt.executeQuery();
	while (rSet.next()) {
		var capIdModel = aa.cap.getCapID(rSet.getString("B1_PER_ID1"),rSet.getString("B1_PER_ID2"),rSet.getString("B1_PER_ID3")).getOutput();
        if (capIdModel) { 
            var itemCap = aa.cap.getCapBasicInfo(capIdModel).getOutput(); 
            if (itemCap) {
                var itemCapId = itemCap.getCapID();
				var altId = itemCapId.getCustomID();			
			}
		}else{
			var altId = null;
		}
	logDebug("-------Found Shopping Cart Item for Record: " + altId + "*******");
	}
	sStmt.close();			

    } catch (vError) {
        aa.print("Runtime error occurred: " + vError);
    }
    closeDBQueryObject(rSet, sStmt, conn); 
	
	//CLEAR SHOPPING CART
	try {
        var conn = aa.db.getConnection();

        var usql =   "  DELETE FSHOPPING_CART_ITEM";

        var sStmt1 = conn.prepareStatement(usql);
        var rret = sStmt1.execute();  
		logDebug("Successfully Cleared Shopping Cart");
		

    } catch (vError) {
        aa.print("Runtime error occurred: " + vError);
    }
    closeDBQueryObject(rret, sStmt1, conn); 
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