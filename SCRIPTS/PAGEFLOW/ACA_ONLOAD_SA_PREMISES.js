/*
| Program : ACA_ONLOAD_SA_PREMISES.js
| Event   : ACA Page Flow onload ASI Components
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/-----------------------------------------
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var SCRIPT_VERSION = 3;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, true));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null,true));
}

eval(getScriptText("INCLUDES_CUSTOM", null,true));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

var cap = aa.env.getValue("CapModel");


// page flow custom code begin
try {
//	Only allow DRP to process an SA record
	
	var resCurUser = aa.people.getPublicUserByUserName(publicUserID);
	if(resCurUser.getSuccess()){
		var contactFnd = false;
		var currUser = resCurUser.getOutput();
		var currEmail = currUser.email;
		var currUserID = currUser.fullName;
		var priContact = getContactObj(parentCapId,"Designated Responsible Party");
		if(priContact){
			var conEmail = priContact.capContact.email;
			if(!matches(conEmail,"",null,"undefined")){
				if(conEmail.toUpperCase() == currEmail.toUpperCase()){
					contactFnd = true;
				}
			}
		}
		if(!contactFnd){
			cancel = true;
			showMessage = true;
			logMessage("  Warning: Only the Designated Responsible party can submit a science amendment.");
		}
	}else{
		logDebug("An error occurred retrieving the current user: " + resCurUser.getErrorMessage());
		aa.sendMail(sysFromEmail, debugEmail, "", "An error occurred retrieving the current user: ACA_ONLOAD_SA_PREMISE: " + startDate, "capId: " + capId + br + resCurUser.getErrorMessage() + br + currEnv);
	}
}catch (err){
	logDebug("A JavaScript Error occurred:ACA_ONLOAD_SA_PREMISE: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_SA_PREMISE: Validate DRP " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}
try{
	var capId = cap.getCapID();
	var AInfo = [];
	loadAppSpecific4ACA(AInfo);
	logDebug("APN " + AInfo["APN"]);
	if(matches(AInfo["APN"] ,null,"",undefined)) {
//		var licNbr = AInfo["License Number"];
//		licCapId = aa.cap.getCapID(licNbr).getOutput();
		licCapId = parentCapId;
		if(licCapId){
			var currCap = capId; 
			capId = licCapId;
			logDebug("licCapId: " + licCapId);
			PInfo = new Array;
			loadAppSpecific(PInfo);
			capId = currCap;
			editAppSpecific4ACA("License Number", parentCapId.getCustomID());
			var priContact = getContactObj(parentCapId,"Designated Responsible Party");
			if(priContact){
				editAppSpecific4ACA("DRP First Name",priContact.capContact.firstName);
				editAppSpecific4ACA("DRP Last Name",priContact.capContact.lastName);
				editAppSpecific4ACA("DRP Email Address",priContact.capContact.email);
				//Story 6577 SA - Resolve ACA Save and Resume Later contact issue - Adding DRP
				priContact.people.setContactSeqNumber(null); // reset in order to avoid capContactNotFoundException on submittal
				priContact.people.setContactType("Designated Responsible Party");	
				cap.setApplicantModel(priContact.capContact);
				aa.env.setValue("CapModel",cap);
			}
			b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
			if (b1ExpResult.getSuccess()) {
				this.b1Exp = b1ExpResult.getOutput();
				expDate = this.b1Exp.getExpDate();	
				if(expDate) {
					tmpExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
					editAppSpecific4ACA("License Expiration Date", tmpExpDate);
				}
			}
			editAppSpecific4ACA("License Issued Type", PInfo["License Issued Type"]);
			editAppSpecific4ACA("Premise Address", PInfo["Premise Address"]);
			editAppSpecific4ACA("Premise City",PInfo["Premise City"]);
			editAppSpecific4ACA("Premise State",PInfo["Premise State"]);
			editAppSpecific4ACA("Premise Zip",PInfo["Premise Zip"]);
			editAppSpecific4ACA("Premise County",PInfo["Premise County"]);
			editAppSpecific4ACA("APN",PInfo["APN"]);
			editAppSpecific4ACA("Grid",PInfo["Grid"]);
			editAppSpecific4ACA("Grid Update",PInfo["Grid"]);
			editAppSpecific4ACA("Solar",PInfo["Solar"]);
			editAppSpecific4ACA("Solar Update",PInfo["Solar"]);
			editAppSpecific4ACA("Generator",PInfo["Generator"]);
			editAppSpecific4ACA("Generator Update",PInfo["Generator"]);
			editAppSpecific4ACA("Generator Under 50 HP",PInfo["Generator Under 50 HP"]);
			editAppSpecific4ACA("G50 Update",PInfo["Generator Under 50 HP"]);
			editAppSpecific4ACA("Other",PInfo["Other"]);
			editAppSpecific4ACA("Other Update",PInfo["Other"]);
			editAppSpecific4ACA("Other Source Description",PInfo["Other Source Description"]);
			copyASITables4ACA(licCapId,capId,"PREMISES ADDRESSES","SOURCE OF WATER SUPPLY","DEFICIENCIES","DENIAL REASONS","OWNERS","CANNABIS FINANCIAL INTEREST");
			removeASITable("PERMIT INFO");
			var premAddrTable = loadASITable("PREMISES ADDRESSES",licCapId);
			if (typeof(premAddrTable) == "object"){
				if(premAddrTable.length > 0){
					premTable = new Array();
					for(ii in premAddrTable){
						var premAddrRow = premAddrTable[ii];
						premRow = new Array();
						premRow["APN"] = new asiTableValObj("APN",premAddrRow["APN"],"N");
						premRow["Premises Address"] = new asiTableValObj("Premises Address",premAddrRow["Premises Address"],"N");
						premRow["Premises City"] = new asiTableValObj("Premises City",premAddrRow["Premises City"],"N");
						premRow["Premises State"] = new asiTableValObj("Premises State",premAddrRow["Premises State"],"N");
						premRow["Premises Zip"] = new asiTableValObj("Premises Zip",premAddrRow["Premises Zip"],"N");
						premRow["Premises County"] = new asiTableValObj("Premises County",premAddrRow["Premises County"],"N");
						premRow["Type of Possession"] = new asiTableValObj("Type of Possession",premAddrRow["Type of Possession"],"N");
						premRow["Owner Address"] = new asiTableValObj("Owner Address",premAddrRow["Type of Possession"],"N");
						premRow["Owner Phone"] = new asiTableValObj("Owner Phone",premAddrRow["Owner Phone"],"N");
						premRow["Status"] = new asiTableValObj("Status","No Change","N");
						premTable.push(premRow);
					}
					removeASITable("PREMISES ADDRESSES"); 
					asit = cap.getAppSpecificTableGroupModel();
					new_asit = copyASITable4PageFlowLocal(asit,"PREMISES ADDRESSES", premTable,capId);
				}
			}
			var sourceWaterSupply = loadASITable("SOURCE OF WATER SUPPLY",licCapId);
			if (typeof(sourceWaterSupply) == "object"){
				if(sourceWaterSupply.length > 0){
					var multTable = new Array(); 
					for(xx in sourceWaterSupply){
						var wtrSrcRow = sourceWaterSupply[xx];
						row = new Array();
						row["Type of Water Supply"] = new asiTableValObj("Type of Water Supply",wtrSrcRow["Type of Water Supply"],"N");
						row["Name of Supplier"] = new asiTableValObj("Name of Supplier",wtrSrcRow["Name of Supplier"],"N");
						row["Geographical Location Coordinates"] = new asiTableValObj("Geographical Location Coordinates",wtrSrcRow["Geographical Location Coordinates"],"N");
						row["Groundwater Well Geographic Location Coordinates"] = new asiTableValObj("Groundwater Well Geographic Location Coordinates",wtrSrcRow["Groundwater Well Geographic Location Coordinates"],"N");
						row["Authorized Place of Use"] = new asiTableValObj("Authorized Place of Use",wtrSrcRow["Authorized Place of Use"],"N");
						row["Maximum Amount of Water Delivered"] = new asiTableValObj("Maximum Amount of Water Delivered",wtrSrcRow["Maximum Amount of Water Delivered"],"N");
						row["Total Square Footage"] = new asiTableValObj("Total Square Footage",wtrSrcRow["Total Square Footage"],"N");
						row["Total Storage Capacity"] = new asiTableValObj("Total Storage Capacity",wtrSrcRow["Total Storage Capacity"],"N");
						row["Description"] = new asiTableValObj("Description",wtrSrcRow["Description"],"N");
						row["Diversion Number"] = new asiTableValObj("Diversion Number",wtrSrcRow["Diversion Number"],"N");
						row["Water Source"] = new asiTableValObj("Water Source",wtrSrcRow["Water Source"],"N");
						row["Status"] = new asiTableValObj("Status","No Change","N");
						multTable.push(row);
					}
					removeASITable("SOURCE OF WATER SUPPLY"); 
					asit = cap.getAppSpecificTableGroupModel();
					new_asit = copyASITable4PageFlowLocal(asit,"SOURCE OF WATER SUPPLY", premTable,capId);
				}
			}				
		}
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_SA_PREMISES: Load Data: " + err.message + br + err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_SA_PREMISES: Load Date: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
}

// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

	
function copyASITable4PageFlowLocal(destinationTableGroupModel,tableName,tableValueArray) // optional capId
    	{
  	//  tableName is the name of the ASI table
  	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
  	// 
  	
    	var itemCap = capId
  	if (arguments.length > 3)
  		itemCap = arguments[3]; // use cap ID specified in args
  
  	var ta = destinationTableGroupModel.getTablesMap().values();
  	var tai = ta.iterator();
  	
  	var found = false;
  	
  	while (tai.hasNext())
  		  {
  		  var tsm = tai.next();  // com.accela.aa.aamain.appspectable.AppSpecificTableModel
  		  if (tsm.getTableName().equals(tableName)) { found = true; break; }
  	        }


  	if (!found) { logDebug("cannot update asit for ACA, no matching table name"); return false; }
  	
	var fld = aa.util.newArrayList();  // had to do this since it was coming up null.
        var fld_readonly = aa.util.newArrayList(); // had to do this since it was coming up null.
  	var i = -1; // row index counter
  
         	for (thisrow in tableValueArray)
  		{
  
 
  		var col = tsm.getColumns()
  		var coli = col.iterator();
  
  		while (coli.hasNext())
  			{
  			var colname = coli.next();
  			
			if (typeof(tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
				{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()].fieldValue,colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField",args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g,"\+"));
				fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
				fld.add(fldToAdd);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				
				}
			else // we are passed a string
				{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()],colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField",args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g,"\+"));
				fldToAdd.setReadOnly(false);
				fld.add(fldToAdd);
				fld_readonly.add("N");

				}
  			}
  
  		i--;
  		
  		tsm.setTableFields(fld);
  		tsm.setReadonlyField(fld_readonly); // set readonly field
  		}
  
  
                tssm = tsm;
                
                return destinationTableGroupModel;
                
      }