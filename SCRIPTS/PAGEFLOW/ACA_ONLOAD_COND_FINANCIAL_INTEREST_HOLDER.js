/*------------------------------------------------------------------------------------------------------/
| Program : ACA_Before_Sample_V1.6.js
| Event   : ACA_Before
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
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
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = true; 
var showDebug = true;
var preExecute = "PreExecuteForBeforeEvents"
//var controlString = "";    
var documentOnly = false;                                                               
var disableTokens = false;                                                                                          
var useAppSpecificGroupName = false;                                 
var useTaskSpecificGroupName = false;                                            
var enableVariableBranching = false; 
var maxEntries = 99; // Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = true;
var startDate = new Date();
var startTime = startDate.getTime();
var message =   ""; 
var debug = "";
var br = "<BR>"; 
var feeSeqList = new Array(); 
var paymentPeriodList = new Array();

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
	useSA = true;     
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
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

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

function getScriptText(vScriptName){
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();      
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
		return emseScript.getScriptText() + "";  
	} catch(err) {
		return "";
	}
}

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()                                     
var publicUser = false ;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  
var capIDString = capId.getCustomID();                                                                 
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();                                                  
var appTypeArray = appTypeString.split("/");                                                      
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor                                               
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();              
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
}

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;                            
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);                                   
if (capDetailObjResult.getSuccess())
{
                capDetail = capDetailObjResult.getOutput();
                var houseCount = capDetail.getHouseCount();
                var feesInvoicedTotal = capDetail.getTotalFee();
                var balanceDue = capDetail.getBalance();
}

var AInfo = new Array();
//loadAppSpecific4ACA(AInfo);                                                                              
//loadTaskSpecific(AInfo);                                                                                          
//loadParcelAttributes(AInfo);                                                                                 
loadASITables4ACA_corrected();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);

/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute,true,0);    // run Pre-execution code

logGlobals(AInfo); 
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

try {

	//showDebug = 3;

var capModel = aa.env.getValue("CapModel");
var fromReviewPage = aa.env.getValue("fromReviewPage");


var componentNames = new Array("Contact 1","ASI Table","Parcel","Licensed Professional","Detail Information", 
"Owner", "Address", "Contact List", "Contact 2", "Contact 3","Valuation Calculator", 
"Licensed Professional List","Continuing Education","ASI","Assets","Additional Information",
"Education","Applicant","Examination","Attachment");

var componentAliasNames = new Array("Contact1","AppSpecTable","Parcel","License","DetailInfo", 
"Owner", "WorkLocation", "MultiContacts", "Contact2", "Contact3","ValuationCalculator", 
"MultiLicenses","ContinuingEducation","AppSpec","Assets","Description",
"Education","Applicant","Examination","Attachment");

	if(capModel != null)
	{
		if (typeof(FINANCIALINTERESTHOLDER) != "object"){
			clearPageSectionData("2","2");
			aaa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
		}		
	}
} catch (err) { logDebug(err)	}


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

/*------------------------------------------------------------------------------------------------------/
|  Custom Functions  (Start)
/------------------------------------------------------------------------------------------------------*/
function loadASITables4ACA_corrected() {

 	//
 	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	//
	// Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
	//
	//corrected issue introduced three years ago.

	var itemCap = capId;
	if (arguments.length == 1)
		{
		itemCap = arguments[0]; // use cap ID specified in args
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
		}
	else
		{
		var gm = cap.getAppSpecificTableGroupModel()
		}

	var ta = gm.getTablesMap();


	var tai = ta.values().iterator();

	while (tai.hasNext())
	  {
	  var tsm = tai.next();

	  if (tsm.rowIndex.isEmpty()) continue;  // empty table

	  var tempObject = new Array();
	  var tempArray = new Array();
	  var tn = tsm.getTableName();

	  tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');

	  if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
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
		//var tval = tsmfldi.next().getInputValue();
		var tval = tsmfldi.next();
		tempObject[tcol.getColumnName()] = tval;
		}
	  tempArray.push(tempObject);  // end of record
	  var copyStr = "" + tn + " = tempArray";
	  logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	  eval(copyStr);  // move to table name
	  }

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
/*------------------------------------------------------------------------------------------------------/
|  Custom Functions  (End) 
/------------------------------------------------------------------------------------------------------*/
