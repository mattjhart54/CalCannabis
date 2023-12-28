/*------------------------------------------------------------------------------------------------------/
| Program: Batch Expiration.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 11/01/08 JHS
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 15 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0


eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

 


function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
	return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = "Y";

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
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var currentUserID = "ADMIN";
var useAppSpecificGroupName = false;
var servProvCode = aa.getServiceProviderCode();
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;


var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();


/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


function mainProcess()
	{
	var capModel = aa.cap.getCapModel().getOutput();
	var count =0;
	var waterMatch =0;
	var waterMismatch =0;
	var premMatch =0;
	var premMisMatch =0;
	var recordArray = [];
	var premRecordArray = [];
	//Get the Permits from the system 
	var emptyGISArray=new Array();
	capTypeModel = capModel.getCapType();
	capTypeModel.setGroup("Licenses");
	capTypeModel.setType("Cultivator");
	capTypeModel.setSubType("Amendment");
	capTypeModel.setCategory("Science");
	capModel.setCapType(capTypeModel);

	
	var typeResult = aa.cap.getCapListByCollection(capModel, null, null, null, null, null, emptyGISArray);
	if (typeResult.getSuccess())
	{
		vCapList = typeResult.getOutput();
	}
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + typeResult.getErrorType() + ":" + typeResult.getErrorMessage());
	}


	for (x in vCapList) {
		//var capId = vCapList[x].getCapID();
		capId = aa.cap.getCapID(vCapList[x].getCapID().getID1(),vCapList[x].getCapID().getID2(),vCapList[x].getCapID().getID3()).getOutput();
		var altID = capId.getCustomID();
		cap = aa.cap.getCap(capId).getOutput();	
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		pIds = getParents("Licenses/Cultivator/License/License");
		if(!matches(pIds,null,'',undefined)) {
			parentCapId = pIds[0];
			parentAltId = parentCapId.getCustomID();
			if (!matches(capStatus,"Amendment Rejected","Amendment Approved","Transition Amendment Approved")){
				loadASITables();
				count++
				var parTblDef = loadASITable("SOURCE OF WATER SUPPLY", parentCapId);
				if(typeof(SOURCEOFWATERSUPPLY) == "object" && typeof(parTblDef) == "object"){
					if(parTblDef.length != SOURCEOFWATERSUPPLY.length){
						logDebug(parentAltId + " License Water Source Table " + parTblDef.length);
						logDebug(altID + " Amendment Water Source table " + SOURCEOFWATERSUPPLY.length);
						continue;
					}else{
						for(i=0; i < parTblDef.length; i++){

								if (String(parTblDef[i]["Type of Water Supply"]).equals(String(SOURCEOFWATERSUPPLY[i]["Type of Water Supply"])) &&
									String(parTblDef[i]["Name of Supplier"]).equals(String(SOURCEOFWATERSUPPLY[i]["Name of Supplier"])) &&
									String(parTblDef[i]["Geographical Location Coordinates"]).equals(String(SOURCEOFWATERSUPPLY[i]["Geographical Location Coordinates"])) &&
									String(parTblDef[i]["Authorized Place of Use"]).equals(String(SOURCEOFWATERSUPPLY[i]["Authorized Place of Use"])) &&
									String(parTblDef[i]["Maximum Amount of Water Delivered"]).equals(String(SOURCEOFWATERSUPPLY[i]["Maximum Amount of Water Delivered"]))&&
									String(parTblDef[i]["Total Square Footage"]).equals(String(SOURCEOFWATERSUPPLY[i]["Total Square Footage"]))&&
									String(parTblDef[i]["Total Storage Capacity"]).equals(String(SOURCEOFWATERSUPPLY[i]["Total Storage Capacity"])) &&
									String(parTblDef[i]["Description"]).equals(String(SOURCEOFWATERSUPPLY[i]["Description"])) &&
									String(parTblDef[i]["Diversion Number"]).equals(String(SOURCEOFWATERSUPPLY[i]["Diversion Number"])) &&
									String(parTblDef[i]["Water Source"]).equals(String(SOURCEOFWATERSUPPLY[i]["Water Source"]))){
										waterMatch++;
								}else{
									logDebug(altID + ": " + [i] + ": " + String(SOURCEOFWATERSUPPLY[i]["Type of Water Supply"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Name of Supplier"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Geographical Location Coordinates"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Authorized Place of Use"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Maximum Amount of Water Delivered"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Total Square Footage"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Total Storage Capacity"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Description"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Diversion Number"]) + ": " + String(SOURCEOFWATERSUPPLY[i]["Water Source"]) + ": " + parentAltId + ": " + String(parTblDef[i]["Type of Water Supply"]) + ": " + String(parTblDef[i]["Name of Supplier"]) + ": " + String(parTblDef[i]["Geographical Location Coordinates"]) + ": " + String(parTblDef[i]["Authorized Place of Use"]) + ": " + String(parTblDef[i]["Maximum Amount of Water Delivered"]) + ": " + String(parTblDef[i]["Total Square Footage"]) + ": " + String(parTblDef[i]["Total Storage Capacity"]) + ": " + String(parTblDef[i]["Description"]) + ": " + String(parTblDef[i]["Diversion Number"]) + ": " + String(parTblDef[i]["Water Source"]) + "; ");
									waterMismatch++;
									recordArray.push(altID);
								}
							}
						}
					}			
					
					var premAddrDef = loadASITable("PREMISES ADDRESSES", parentCapId);
					if(typeof(PREMISESADDRESSES) == "object" && typeof(premAddrDef) == "object"){
						if(premAddrDef.length != PREMISESADDRESSES.length){
							logDebug(parentAltId + " License Premise Address Table " + premAddrDef.length);
							logDebug(altID + " Amendment Premise Address table " + PREMISESADDRESSES.length);
							continue;
						}else{
							for(xx=0; xx < premAddrDef.length; xx++){
									if (String(premAddrDef[xx]["APN"]).equals(String(PREMISESADDRESSES[xx]["APN"])) &&
									String(premAddrDef[xx]["Premises Address"]).equals(String(PREMISESADDRESSES[xx]["Premises Address"])) &&
									String(premAddrDef[xx]["Premises City"]).equals(String(PREMISESADDRESSES[xx]["Premises City"])) &&
									String(premAddrDef[xx]["Premises State"]).equals(String(PREMISESADDRESSES[xx]["Premises State"])) &&
									String(premAddrDef[xx]["Premises Zip"]).equals(String(PREMISESADDRESSES[xx]["Premises Zip"])) &&
									String(premAddrDef[xx]["Premises County"]).equals(String(PREMISESADDRESSES[xx]["Premises County"])) &&
									String(premAddrDef[xx]["Type of Possession"]).equals(String(PREMISESADDRESSES[xx]["Type of Possession"])) &&
									String(premAddrDef[xx]["Owner Address"]).equals(String(PREMISESADDRESSES[xx]["Owner Address"])) &&
									String(premAddrDef[xx]["Owner Phone"]).equals(String(PREMISESADDRESSES[xx]["Owner Phone"]))){
										premMatch++;
								}else{
									premMisMatch++;
									logDebug(altID + ": " + [xx] + ": " + String(PREMISESADDRESSES[xx]["Premises Address"])+ ": " + String(PREMISESADDRESSES[xx]["Premises City"]) + ": " + String(PREMISESADDRESSES[xx]["Premises State"]) + ": " + String(PREMISESADDRESSES[xx]["Premises Zip"]) + ": " + String(PREMISESADDRESSES[xx]["Premises County"]) + ": " + String(PREMISESADDRESSES[xx]["Type of Possession"]) + ": " + String(PREMISESADDRESSES[xx]["Type of Possession"]) + ": " + String(PREMISESADDRESSES[xx]["Owner Address"]) + ": " + String(PREMISESADDRESSES[xx]["Owner Phone"]) + ": " + parentAltId + ": " + String(premAddrDef[xx]["Premises Address"])+ ": " + String(premAddrDef[xx]["Premises City"]) + ": " +
									String(premAddrDef[xx]["Premises State"]) + ": " + String(premAddrDef[xx]["Premises Zip"]) + ": " + String(premAddrDef[xx]["Premises County"]) +": " + String(premAddrDef[xx]["Type of Possession"]) + ": " + String(premAddrDef[xx]["Type of Possession"]) + ": " + String(premAddrDef[xx]["Owner Address"]) + ": " + String(premAddrDef[xx]["Owner Phone"]) + "; ");
									premRecordArray.push(altID);
								}
							}					
						}			
					}
				}
			}
		}
		logDebug("Number of Qualified Records: " + count);
		logDebug("Number of Water Source Mismatches: " + waterMismatch);
		logDebug("Number of Water Source Matches: " + waterMatch);
		logDebug("Number of Prem Address Matches: " + premMatch);
		logDebug("Number of Prem Address Mismatches: " + premMisMatch);
		logDebug("Water Source Records: " + recordArray);
		logDebug("Premises Records: " + premRecordArray);
	}