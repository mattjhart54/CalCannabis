/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AFTER_CRR_POPULATE_ALL_PREMISES.js
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
var cancel = true;
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, true));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null,true));
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
	
	var licCapId = getApplication(AInfo['License Number']);
	if(licCapId){
		
		var currCap = capId; 
		capId = licCapId;
		PInfo = new Array;
		loadAppSpecific(PInfo);
		capId = currCap;

		
		//Add Lic custom field values to record
		editAppSpecific4ACA("License Issued Type", PInfo["License Issued Type"]);
		editAppSpecific4ACA("Premise Address", PInfo["Premise Address"]);
		editAppSpecific4ACA("Premise City",PInfo["Premise City"]);
		editAppSpecific4ACA("Premise State",PInfo["Premise State"]);
		editAppSpecific4ACA("Premise Zip",PInfo["Premise Zip"]);
		editAppSpecific4ACA("Premise County",PInfo["Premise County"]);
		editAppSpecific4ACA("APN",PInfo["APN"]);
		editAppSpecific4ACA("Tribal Land",PInfo["Tribal Land"]);
		editAppSpecific4ACA("Tribal Land Information",PInfo["Tribal Land Information"]);
		editAppSpecific4ACA("Grid",PInfo["Grid"]);
		editAppSpecific4ACA("Solar",PInfo["Solar"]);
		editAppSpecific4ACA("Generator",PInfo["Generator"]);
		editAppSpecific4ACA("Generator Under 50 HP",PInfo["Generator Under 50 HP"]);
		editAppSpecific4ACA("Other",PInfo["Other"]);
		editAppSpecific4ACA("Other Source Description",PInfo["Other Source Description"]);
		
		//Create ALL Premises Tables
		var ownTable = new Array(); 
		var premTable = new Array();
		var recArray = new Array();
		
		recArray.push(AInfo['License Number']);
		
		if (typeof(LICENSERECORDSFORCONVERSION) == "object") {
			if(LICENSERECORDSFORCONVERSION.length > 0){
				for (x in LICENSERECORDSFORCONVERSION){
					recArray.push(LICENSERECORDSFORCONVERSION[x]["License Record ID"]);
				}
			}
		}
		
		if(recArray.length > 0){
			for (xx in recArray){
				premRow = new Array();
				recCapId = getApplication(recArray[xx]);
				premRow['License Record ID'] = "" + String(recArray[xx]);
				premRow['Premises Address']= "" + getAppSpecific("Premise Address",recCapId);
				premRow['Premises City'] = "" + getAppSpecific("Premise City",recCapId);
				premRow['Premises State'] = "" + getAppSpecific("Premise State",recCapId);
				premRow['Premises Zip'] = "" + getAppSpecific("Premise Zip",recCapId);
				premRow['Premises County'] = "" + getAppSpecific("Premise County",recCapId);
				premRow['APN'] = "" + getAppSpecific("APN",recCapId);
				premTable.push(premRow);
			}
		}		
	
		if (premTable != undefined || premTable.length > 0){
			removeASITable("ALL PREMISES ADDRESSES");
			addASITable4ACAPageFlowXX(cap.getAppSpecificTableGroupModel(), "ALL PREMISES ADDRESSES", premTable);
			aa.env.setValue("CapModel",cap);
		}

		removeASITable("PREMISES ADDRESSES",capId);
		removeASITable("SOURCE OF WATER SUPPLY");
		aa.env.setValue("CapModel",cap);

		
		copyASITables4ACA(licCapId,capId,"APN SPATIAL INFORMATION","LAKE AND STREAMBED ALTERATION","WATER RIGHTS","RETAIL WATER SUPPLIER","GROUNDWATER WELL","RAINWATER CATCHMENT","SMALL RETAIL WATER SUPPLIERS","ELECTRICITY USAGE","AVERAGE WEIGHTED GGEI","OWNERS","CANNABIS FINANCIAL INTEREST","TARGET RECORDS");

	}

}catch (err){
	logDebug("A JavaScript Error occurred:ACA_AFTER_CRR_POPULATE_OWNERS_TABLE: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: AACA_AFTER_CRR_POPULATE_ALL_PREMISES: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
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
            if (n.ownRowIndex.isEmpty())
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
  	var i = -1; // ownRow index counter
  
         	for (thisownRow in tableValueArray)
  		{
  
 
  		var col = tsm.getColumns()
  		var coli = col.iterator();
  
  		while (coli.hasNext())
  			{
  			var colname = coli.next();
  			
			if (typeof(tableValueArray[thisownRow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
				{
				var args = new Array(tableValueArray[thisownRow][colname.getColumnName()].fieldValue,colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField",args).getOutput();
				fldToAdd.setownRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g,"\+"));
				fldToAdd.setReadOnly(tableValueArray[thisownRow][colname.getColumnName()].readOnly.equals("Y"));
				fld.add(fldToAdd);
				fld_readonly.add(tableValueArray[thisownRow][colname.getColumnName()].readOnly);
				
				}
			else // we are passed a string
				{
				var args = new Array(tableValueArray[thisownRow][colname.getColumnName()],colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField",args).getOutput();
				fldToAdd.setownRowIndex(i);
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
                //fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
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