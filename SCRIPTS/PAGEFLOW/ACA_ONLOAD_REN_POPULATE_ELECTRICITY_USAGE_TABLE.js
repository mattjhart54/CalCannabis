/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AFTER_REN_POPULATE_OWNERS_TABLE.js
| Event   : ACA_AfterButton Event
|
| Usage   : 
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
/------------------------------------------------------------------------------------------------------*/
var showMessage = true; // Set to true to see results in popup window
var showDebug = true; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var SCRIPT_VERSION  = 3; 
var useCustomScriptFile = true;  	// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, true));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,true));
}


eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));


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
var capId = cap.getCapID();
var AInfo = new Array(); 					// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
loadASITables4ACA_corrected();
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/



try {
	
	var expYear = "2023";
	var elecTable = [];
	var ggeiTable = [];
	var elecCapTable = [];
	var ggeiCapTable = [];
	var licCapId = getApplication(AInfo['License Number']);
	var b1ExpResultRec=aa.expiration.getLicensesByCapID(licCapId);
	if(b1ExpResultRec.getSuccess()){
		b1ExpResult=b1ExpResultRec.getOutput();
		var expDate = b1ExpResult.getExpDate();
		if(expDate){
			expYear = String(expDate.getYear()-1);
		}
	}
	
	
	licElecInfo = loadASITable("ELECTRICITY USAGE",licCapId);	
	if (licElecInfo) {  // table of records to process
		var cap = aa.env.getValue("CapModel");
		for (ii in licElecInfo) {
			elecRow = new Array();
			elecRow["Reporting Year"] =  "" + licElecInfo[ii]["Reporting Year"];
			elecRow["Usage Type"] =  "" + licElecInfo[ii]["Usage Type"];
			elecRow["Type of Off Grid Renewable Source"] =  "" + licElecInfo[ii]["Type of Off Grid Renewable Source"];
			elecRow["Type of Other Source"] = "" + String(licElecInfo[ii]["Type of Other Source"]);
			elecRow["Other Source description"] = "" +  String(licElecInfo[ii]["Other Source description"]);
			elecRow["Name of Utility Provider"] = "" + String(licElecInfo[ii]["Name of Utility Provider"]);
			elecRow["Total Electricity Supplied (kWh)"] =  "" + String(licElecInfo[ii]["Total Electricity Supplied (kWh)"]);
			elecRow["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"] = "" + String(licElecInfo[ii]["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"]);
			elecRow["GGEI (lbs CO2e/kWh)"] = "" + String(licElecInfo[ii]["GGEI (lbs CO2e/kWh)"]);
			elecTable.push(elecRow);
		}
	}	
	
	if (elecTable.length > 0){
		removeASITable("ELECTRICITY USAGE HISTORICAL", capId);
		asit = cap.getAppSpecificTableGroupModel();
		new_asit = addASITable4ACAPageFlowXX(asit,"ELECTRICITY USAGE HISTORICAL", elecTable,capId);
		var cap = aa.env.getValue("CapModel");
	}

	licGGEIInfo = loadASITable("AVERAGE WEIGHTED GGEI",licCapId);
	if (licGGEIInfo) {  // table of records to process	
		for (o in licGGEIInfo) {
			ggeiRow = new  Array();;
			ggeiRow["Reporting year"] = "" + licGGEIInfo[o]["Reporting year"];
			ggeiRow["Average Weighted GGEI"] = "" + licGGEIInfo[o]["Average Weighted GGEI"]
			ggeiTable.push(ggeiRow);
		}
	}		

	if (ggeiTable.length > 0){
		removeASITable("AVG WEIGHTED GGEI HISTORICAL", capId);
		asit = cap.getAppSpecificTableGroupModel();
		new_asit = addASITable4ACAPageFlowXX(asit,"AVG WEIGHTED GGEI HISTORICAL", ggeiTable,capId);
		var cap = aa.env.getValue("CapModel");
	}
	
	elecCapRow = new Array();
	elecCapRow["Reporting Year"] =  "" + expYear;
	elecCapRow["Usage Type"] = "";
	elecCapRow["Type of Off Grid Renewable Source"] = "";
	elecCapRow["Type of Other Source"] = "";
	elecCapRow["Other Source description"] = "";
	elecCapRow["Name of Utility Provider"] = "";
	elecCapRow["Total Electricity Supplied (kWh)"] = "";
	elecCapRow["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"] = "";
	elecCapRow["GGEI (lbs CO2e/kWh)"] = "";
	elecCapTable.push(elecCapRow);
	
	if (elecCapTable.length > 0 ){
		removeASITable("ELECTRICITY USAGE", capId);
		asit = cap.getAppSpecificTableGroupModel();
		new_asit = addASITable4ACAPageFlowXX(asit,"ELECTRICITY USAGE", elecCapTable,capId);
		var cap = aa.env.getValue("CapModel");
	}
	
	ggeiCapRow = new Array();
	ggeiCapRow["Reporting year"] = "" + expYear;
	ggeiCapRow["Average Weighted GGEI"] = "";
	ggeiCapTable.push(ggeiCapRow);
		
	if (ggeiCapTable.length > 0){
		removeASITable("AVERAGE WEIGHTED GGEI", capId);
		asit = cap.getAppSpecificTableGroupModel();
		new_asit = addASITable4ACAPageFlowXX(asit,"AVERAGE WEIGHTED GGEI", ggeiCapTable,capId);
		var cap = aa.env.getValue("CapModel");
	}
	

}catch (err){
	logDebug("A JavaScript Error occurred:ACA_ONLOAD_REN_POPULATE_ELECTRICITY_USAGE_TABLE: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_REN_POPULATE_ELECTRICITY_USAGE_TABLE: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

//
if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function getApplication(appNum) 
//
// returns the capId object of an application
//
	{
	var getCapResult = aa.cap.getCapID(appNum);
	if (getCapResult.getSuccess())
		return getCapResult.getOutput();
	else
		{ logDebug( "**ERROR: getting cap id (" + appNum + "): " + getCapResult.getErrorMessage()) }
	}

	
function loadASITable(e) {
    var t = capId;
    2 == arguments.length && (t = arguments[1]);
    for (var a = aa.appSpecificTableScript.getAppSpecificTableGroupModel(t).getOutput(), r = a.getTablesArray(), s = r.iterator(); s.hasNext(); ) {
        var n = s.next(),
        i = n.getTableName();
        if (i.equals(e)) {
            if (n.rowIndex.isEmpty())
                return logDebug("Couldn't load ASI Table " + e + " it is empty"), !1;
            for (var o = new Array, g = new Array, u = n.getTableField().iterator(), c = n.getColumns().iterator(), l = n.getAppSpecificTableModel().getReadonlyField().iterator(), p = 1; u.hasNext(); ) {
                if (!c.hasNext()) {
                    var c = n.getColumns().iterator();
                    g.push(o);
                    var o = new Array;
                    p++
                }
                var d = c.next(),
                f = u.next(),
                m = "N";
                l.hasNext() && (m = l.next());
                var C = new asiTableValObj(d.getColumnName(), f, m);
                o[d.getColumnName()] = C
            }
            g.push(o)
        }
    }
    return g
}
	
function asiTableValObj(columnName, fieldValue, readOnly) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;
	this.readOnly = readOnly;
	this.hasValue = Boolean(fieldValue != null & fieldValue != "");

	asiTableValObj.prototype.toString=function(){ return this.hasValue ? String(this.fieldValue) : String(""); }
};

function removeASITable(tableName) // optional capId
{
//  tableName is the name of the ASI table
//  tableValues is an associative array of values.  All elements MUST be strings.
var itemCap = capId
if (arguments.length > 1)
	itemCap = arguments[1]; // use cap ID specified in args

var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,itemCap,currentUserID)

if (!tssmResult.getSuccess())
	{ aa.print("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }
	else
logDebug("Successfully removed all rows from ASI Table: " + tableName);

}

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
function addASITable4ACAPageFlowXX(destinationTableGroupModel, tableName, tableValueArray) // optional capId
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

    while (tai.hasNext()) {
        var tsm = tai.next();  // com.accela.aa.aamain.appspectable.AppSpecificTableModel
        if (tsm.getTableName().equals(tableName)) { found = true; break; }
    }


    if (!found) { logDebug("cannot update asit for ACA, no matching table name"); return false; }

    var fld = aa.util.newArrayList();  // had to do this since it was coming up null.
    var fld_readonly = aa.util.newArrayList(); // had to do this since it was coming up null.
    var i = -1; // row index counter

    for (thisrow in tableValueArray) {


        var col = tsm.getColumns()
        var coli = col.iterator();

        while (coli.hasNext()) {
            var colname = coli.next();

            if (typeof (tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
            {
                var args = new Array(tableValueArray[thisrow][colname.getColumnName()].fieldValue, colname);
                var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
                fldToAdd.setRowIndex(i);
                fldToAdd.setFieldLabel(colname.getColumnName());
                fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
                fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
                fld.add(fldToAdd);
                fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);

            }
            else // we are passed a string
            {
                var args = new Array(tableValueArray[thisrow][colname.getColumnName()], colname);
                var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
                fldToAdd.setRowIndex(i);
                fldToAdd.setFieldLabel(colname.getColumnName());
                fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
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
function copyASITable4PageFlow(destinationTableGroupModel,tableName,tableValueArray) // optional capId
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
function addASITable4ACAPageFlow(destinationTableGroupModel, tableName, tableValueArray) // optional capId
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
	while (tai.hasNext()) {
		var tsm = tai.next(); // com.accela.aa.aamain.appspectable.AppSpecificTableModel
		if (tsm.getTableName().equals(tableName)) {
			found = true;
			break;
		}
	}

	if (!found) {
		logDebug("cannot update asit for ACA, no matching table name");
		return false;
	}

	var i = -1; // row index counter
	if (tsm.getTableFields() != null) {
		i = 0 - tsm.getTableFields().size()
	}

	for (thisrow in tableValueArray) {
		var fld = aa.util.newArrayList(); // had to do this since it was coming up null.
		var fld_readonly = aa.util.newArrayList(); // had to do this since it was coming up null.
		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();
			
			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}

			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()].fieldValue ? tableValueArray[thisrow][colname.getColumnName()].fieldValue : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				logDebug("args: " + args);
				logDebug("TESTING: " + tableValueArray[thisrow][colname.getColumnName()].fieldValue + " ITERATION: " + i);
				logDebug("TESTING2: " + aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField",args));
				logDebug("TESTING3: " + aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField",args).getOutput());
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
				fld.add(fldToAdd);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);

			} else // we are passed a string
			{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()] ? tableValueArray[thisrow][colname.getColumnName()] : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(false);
				fld.add(fldToAdd);
				fld_readonly.add("N");

			}
		}

		i--;

		if (tsm.getTableFields() == null) {
			tsm.setTableFields(fld);
		} else {
			tsm.getTableFields().addAll(fld);
		}

		if (tsm.getReadonlyField() == null) {
			tsm.setReadonlyField(fld_readonly); // set readonly field
		} else {
			tsm.getReadonlyField().addAll(fld_readonly);
		}
	}

	tssm = tsm;
	return destinationTableGroupModel;
}
