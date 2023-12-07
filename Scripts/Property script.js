
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_Property_Diagram Update
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
|
|  
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var errLog = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 7 * 60;
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
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

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

var emailAddress = "mhart@trustvip.com";
var sysFromEmail = "calcannabislicensing@cdfa.ca.gov";
var useAppSpecificGroupName = false;
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

var PROPERTY = [
  {
    "License_Number": "CCL20-0000003",
    "Application_Number": "LCA20-0000003",
   "APN": "Yes",
    "APN located in correct city/county?": "Yes",
    "Property boundaries w/dimensions?": "Yes",
    "Premises boundaries w/dimensions?": "No",
    "Entrance and Exit to the property and premises?": "No",
    "Entrance and Exit to the Premises?": "No",
    "Does diagram clearly define and label premises from property?": "Yes",
    "Other Licenses and Land Uses Identified Clearly?": "No",
    "All roads labeled?": "Yes",
    "All water crossings labeled?": "No",
    "All water sources identified and labeled for beneficial use?": "No",
    "Location and coordinates of all sources of water used?": "No",
    "Location, coordinates, type, and capacity of each storage unit?": "No",
    "Water Distribution Lines?": "Yes",
    "Does the diagram refrain from highlighting?": "No",
    "Is the diagram to scale?": "Yes",
    "Property_Review_Status": "Incomplete",
    "Premises_is_Contiguous?": "Yes"
  },
  {
    "License_Number": "CCL19-0000088",
   "APN": "Yes",
    "APN located in correct city/county?": "Yes",
    "Property boundaries w/dimensions?": "Yes",
    "Premises boundaries w/dimensions?": "No",
    "Entrance and Exit to the property and premises?": "No",
    "Entrance and Exit to the Premises?": "No",
    "Does diagram clearly define and label premises from property?": "Yes",
    "Other Licenses and Land Uses Identified Clearly?": "",
    "All roads labeled?": "Yes",
    "All water crossings labeled?": "No",
    "All water sources identified and labeled for beneficial use?": "No",
    "Location and coordinates of all sources of water used?": "No",
    "Location, coordinates, type, and capacity of each storage unit?": "No",
    "Water Distribution Lines?": "Yes",
    "Does the diagram refrain from highlighting?": "No",
    "Is the diagram to scale?": "Yes",
    "Property_Review_Status": "Incomplete",
    "Premises_is_Contiguous?": ""
  },
  {
    "License_Number": "CCL18-0000007",
    "Application_Number": "LCA18-0000007",
    "APN": "Yes",
    "APN located in correct city/county?": "Yes",
    "Property boundaries w/dimensions?": "Yes",
    "Premises boundaries w/dimensions?": "No",
    "Entrance and Exit to the property and premises?": "No",
    "Entrance and Exit to the Premises?": "No",
    "Does diagram clearly define and label premises from property?": "Yes",
    "Other Licenses and Land Uses Identified Clearly?": "",
    "All roads labeled?": "Yes",
    "All water crossings labeled?": "No",
    "All water sources identified and labeled for beneficial use?": "No",
    "Location and coordinates of all sources of water used?": "No",
    "Location, coordinates, type, and capacity of each storage unit?": "No",
    "Water Distribution Lines?": "Yes",
    "Does the diagram refrain from highlighting?": "No",
    "Is the diagram to scale?": "Yes",
    "Property_Review_Status": "Incomplete",
    "Premises_is_Contiguous?": ""
  }
]
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

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
	logDebug("ERROR: BATCH_PROPERTY Update: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{ 
	var recCnt = 0;
	var rejCnt = 0;
	for (i in PROPERTY) {
		if(!matches(PROPERTY[i]["License_Number"],null,"",undefined)) {
			capId =aa.cap.getCapID(PROPERTY[i]["License_Number"]).getOutput();
			if (!capId) {
				logDebug("PROPERTY row for " + PROPERTY[i]["License_Number"] + " not processed as License record not found");
				rejCnt++;
				continue;
			}
		}
		else {
			capId =aa.cap.getCapID(PROPERTY[i]["Application_Number"]).getOutput();
			if (!capId) {
				logDebug("PROPERTY row for " + PROPERTY[i]["Application_Number"] + " not processed as Application record not found");
				rejCnt++;
				continue;
			}
		}
		recCnt++;
	//	logDebug("processing record " + PROPERTY[i]["License_Number"]);
		editAppSpecific("Property Diagram Review Status",PROPERTY[i]["Property_Review_Status"]);
		editAppSpecific("APN-PD",PROPERTY[i]["APN"]);
		editAppSpecific("APN located in correct city/county?",PROPERTY[i]["APN located in correct city/county?"]);
		editAppSpecific("Property boundaries w/dimensions?",PROPERTY[i]["Property boundaries w/dimensions?"]);
		editAppSpecific("Premises boundaries w/dimensions?",PROPERTY[i]["Premises boundaries w/dimensions?"]);
		editAppSpecific("Entrances and Exits to the property?",PROPERTY[i]["Entrance and Exit to the property and premises?"]);
		editAppSpecific("Entrances and Exits to the Premises?",PROPERTY[i]["Entrance and Exit to the Premises?"]);
		editAppSpecific("Other Licenses and Land Uses Identified Clearly?",PROPERTY[i]["Other Licenses and Land Uses Identified Clearly?"]);
		editAppSpecific("Does diagram clearly define and label premises from property?",PROPERTY[i]["Does diagram clearly define and label premises from property?"]);
		editAppSpecific("All roads labeled?",PROPERTY[i]["All roads labeled?"]);
		editAppSpecific("All water crossings labeled?",PROPERTY[i]["All water crossings labeled?"]);
		editAppSpecific("All water sources identified and labeled for beneficial use?",PROPERTY[i]["All water sources identified and labeled for beneficial use?"]);
		editAppSpecific("Location and coordinates of all sources of water used?",PROPERTY[i]["Location and coordinates of all sources of water used?"]);
		editAppSpecific("Location, coordinates, type, and capacity of each storage unit?",PROPERTY[i]["Location, coordinates, type, and capacity of each storage unit?"]);
		editAppSpecific("Water Distribution Lines?",PROPERTY[i]["Water Distribution Lines?"]);
		editAppSpecific("Does the diagram contain highlighting?",PROPERTY[i]["Does the diagram refrain from highlighting?"]);
		editAppSpecific("Is the diagram to scale?",PROPERTY[i]["Is the diagram to scale?"]);
		editAppSpecific("Premises is Contiguous?",PROPERTY[i]["Premises_is_Contiguous?"]);
		editAppSpecific("APN",PROPERTY[i]["APN"]);
	}
	logDebug("Total Records Processed : " + PROPERTY.length);
	logDebug("Total Records Rejected: " + rejCnt);
	logDebug("Total Records Converted: " + recCnt);
}catch (err){
	logDebug("ERROR: BATCH_TMP_EXPIRATION: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}	
	
		
	
		
