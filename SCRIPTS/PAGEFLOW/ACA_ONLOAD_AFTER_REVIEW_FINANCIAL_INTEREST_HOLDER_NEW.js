/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AFTER_COND_INTEREST_HOLDER_NEW.js
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
//loadASITables4ACA_corrected();
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

try {

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
		//if(fromReviewPage == "Y"){
			aa.env.setValue("ReturnData", "{'PageFlow': {'StepNumber': '2', 'PageNumber':'2'}}");
		//}

	}
} catch (err) {
	logDebug("A JavaScript Error occurred:ACA_AFTER_COND_INTEREST_HOLDER_NEW: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_AFTER_COND_INTEREST_HOLDER_NEW: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
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

/*------------------------------------------------------------------------------------------------------/
|  Custom Functions  (Start)
/------------------------------------------------------------------------------------------------------*/
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
