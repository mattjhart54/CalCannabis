/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AFTER_REN_POPULATE_FINANCIAL_HOLDERS_TABLE.js
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
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
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
	var multTable = new Array(); 

	financialInfo = loadASITable("FINANCIAL INTEREST HOLDER",licCapId);
	if (financialInfo){
		for (var ii in financialInfo) {
			row = new Array();
			row["Type of Interest Holder"] = financialInfo[ii]["Type of Interest Holder"];
			row["Legal First Name"] = financialInfo[ii]["Legal First Name"];
			row["Legal Last Name"] = financialInfo[ii]["Legal Last Name"];
			row["Email Address"] = financialInfo[ii]["Email Address"];
			row["Contact Phone Number"] = financialInfo[ii]["Contact Phone Number"];
			row["Type of Government ID"] = financialInfo[ii]["Type of Government ID"];
			row["Government ID Number"] = financialInfo[ii]["Government ID Number"];
			row["Legal Business Name"] = financialInfo[ii]["Legal Business Name"];
			row["Primary Contact Name"] = financialInfo[ii]["Primary Contact Name"];
			row["Primary Contact Phone Number"] = financialInfo[ii]["Primary Contact Phone Number"];
			row["Primary Contact Email Address"] = financialInfo[ii]["Primary Contact Email Address"];
			row["FEIN"] = financialInfo[ii]["FEIN"];
			multTable.push(row);
		
		}
	}else{
		aa.env.setValue("ReturnData", "{'PageFlow': {'StepNumber': '2', 'PageNumber':'3'}}");
	}
	
	if (multTable.length > 0){
		removeASITable("FINANCIAL INTEREST HOLDER");
		addASITable4ACAPageFlowXX(cap.getAppSpecificTableGroupModel(), "FINANCIAL INTEREST HOLDER", multTable);
		aa.env.setValue("CapModel",cap);
	}	
	

}catch (err){
	logDebug("A JavaScript Error occurred:ACA_AFTER_REN_POPULATE_FINANCIAL_HOLDERS_TABLE: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_AFTER_REN_POPULATE_FINANCIAL_HOLDERS_TABLE: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
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
function clearPageSectionData(stepIndex, pageIndex)
{
	var capID = capModel.getCapID();

	var pageComponents = getPageComponents(capID, stepIndex, pageIndex);
	
	if(pageComponents != null && pageComponents.length > 0)
	{
		for(var i= 0; i< pageComponents.length; i++)
		{			
			clearDataByComponentName(pageComponents[i].getComponentSeqNbr(), pageComponents[i].getComponentName());
		}
		
		aa.acaPageFlow.hideCapPage4ACA(capID, stepIndex, pageIndex);
	}
}

function clearDataByComponentName(componentSeqNbr, componentName)
{
	var componentAliasName = getComponentAliasName(componentName);
	if(componentAliasName != null)
	{
		var dailyComponentName = componentAliasName+"_"+componentSeqNbr;
		if(componentAliasName.indexOf("MultiLicenses")==0 || componentAliasName.indexOf("License") == 0)
		{
			clearLPData(dailyComponentName);
		}
		else if(componentAliasName.indexOf("MultiContacts")==0 || componentAliasName.indexOf("Contact1") == 0
				|| componentAliasName.indexOf("Contact2") == 0 || componentAliasName.indexOf("Contact3") == 0
				|| componentAliasName.indexOf("Applicant") == 0)
		{
			clearContactData(dailyComponentName);
		}
	}	
}

function clearParcelData(dailyComponentName)
{
		var parcel = capModel.getParcelModel();
		if(parcel.getComponentName() != null && parcel.getComponentName().indexOf(dailyComponentName)==0)
		{
			capModel.setParcelModel(null);
		}
}

function clearContactData(dailyComponentName)
{
		var contactList = capModel.getContactsGroup();
		if(contactList != null && contactList.size() > 0)
		{
			for(var i=contactList.size(); i > 0; i--)
			{
				var contactModel = contactList.get(i-1);
				if(contactModel.getComponentName() != null && contactModel.getComponentName().indexOf(dailyComponentName)==0)
				{
					contactList.remove(contactModel);
				}
			}
		}
}

function clearLPData(dailyComponentName)
{
		var lpList = capModel.getLicenseProfessionalList();
		if(lpList != null && lpList.size() > 0)
		{
			for(var i=lpList.size(); i > 0; i--)
			{
				var lpModel = lpList.get(i-1);
				if(lpModel.getComponentName() != null && lpModel.getComponentName().indexOf(dailyComponentName)==0)
				{
					lpList.remove(lpModel);
				}
			}
		}
		
		var licenseProfessionalModel = capModel.getLicenseProfessionalModel();
		if(licenseProfessionalModel != null)
		{
			if(licenseProfessionalModel.getComponentName() != null 
					&& licenseProfessionalModel.getComponentName().indexOf(dailyComponentName)==0)
			{
					capModel.setLicenseProfessionalModel(null);
			}
		}        
}

function getComponentAliasName(componentName)
{
	if(componentNames==null)
	{
		return null;
	}
	else
	{
		for(var i=0;i<componentNames.length;i++){
			if(componentNames[i]==componentName)
			{
				return componentAliasNames[i];
			}
		}
		return null;
	}
}

function getPageComponents(capID, stepIndex, pageIndex)
{
	var componentResult = aa.acaPageFlow.getPageComponents(capID, stepIndex, pageIndex);
	
	if(componentResult.getSuccess())
	{
		return componentResult.getOutput();
	}
	
	return null;	
}

function getFieldValue(fieldName, asiGroups)
{     
		if(asiGroups == null)
		{
			return null;
		}
		
    var iteGroups = asiGroups.iterator();
    while (iteGroups.hasNext())
    {
        var group = iteGroups.next();
        var fields = group.getFields();
        if (fields != null)
        {
            var iteFields = fields.iterator();
            while (iteFields.hasNext())
            {
                var field = iteFields.next();              
                if (fieldName == field.getCheckboxDesc())
                {
                    return field.getChecklistComment();
                }
            }
        }
    }   
    return null;    
}
/*------------------------------------------------------------------------------------------------------/
|  Custom Functions  (End) 
/------------------------------------------------------------------------------------------------------*/
