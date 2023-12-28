//RegistrationSubmitAfter

/*------------------------------------------------------------------------------------------------------/
| Program : RegistrationSubmitAfter_custom.js
| Event   : RegistrationSubmitAfter
|
| Usage   : 
|
| Notes   :  
|			
|
/------------------------------------------------------------------------------------------------------*/

//-----------------------------------------------------------------------------------------------------------

var vEventName = "RegistrationSubmitAfter";
var controlString = null;
var documentOnly = false; 
var showDebug = 3;	
var showMessage = true;				
var br = "<BR>";
var message = "";
var debug = "";


//PublicUserModel only holds email for new registration.
var publicUserModel= aa.env.getValue("PublicUserModel");

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 9.0;
var useCustomScriptFile = true;  // if true, use Events->Custom Script and Master Scripts, else use Events->Scripts->INCLUDES_*
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

var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = true; // compatibility default
var doScripts = false;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) {
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE");
	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT");
	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
	var bvr3 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "USE_MASTER_INCLUDES");
	if (bvr3.getSuccess()) {if(bvr3.getOutput().getDescription() == "No") useCustomScriptFile = false}; 
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,useCustomScriptFile));
	// eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA,useCustomScriptFile));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
	// eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));  

if (documentOnly) {
	doStandardChoiceActions(controlString, false, 0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName);

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

try { 
    
    if(publicUserModel != null)
    {
        var puSeqNum = publicUserModel.getUserSeqNum(); 

        //Get contact associated to PU being created- will need this to disable after finding existing
        var puContactSM = aa.people.getUserAssociatedContact(puSeqNum);

        if ( !puContactSM.getSuccess())
        {
            logDebug("WARNING: Error searching for duplicate contacts : " + puContactSM.getErrorMessage());
        }
        else
        {
            //getting the ContractorPeopleModel data to be able to pull associated contact data
            var puContact = puContactSM.getOutput().toArray();

            for (pu in puContact)
            {
                var refConPU = puContact[pu];

                var refConSeqNum = refConPU.getContactSeqNumber();
                aa.print("----REF CON NUM OF PU BEING CREATED (this will be set to inactive if multiple are found)------" + refConSeqNum);
            }
        }

        existingContact = comparePeopleMatchCriteria1(refConPU);

        if (existingContact.length > 1)
        {
            //search found more than 1 matching contact, meaning contact already existed;  will deactivate newly created contact and associate existing with this PU
            for (ex in existingContact)
            {
                var refConLU = existingContact[ex];
                var refConLUSEQ = refConLU.getContactSeqNumber();
    
                aa.print("----------" + refConLUSEQ);
    
                if (refConLUSEQ == refConSeqNum)
                {
                    //this is the new contact created; need to deactivate
    
                    aa.print("-----DEACTIVATING NEW CONTACT-----" + refConLUSEQ);
    
                    var peopResult = aa.people.getPeople(refConLUSEQ);
    
                    if (peopResult.getSuccess()) 
                    {
                        var peop = peopResult.getOutput();
                        
                        peop.setAuditDate(new Date(aa.util.now()));
                        //peop.setAuditID(currentUserID);
                        peop.setAuditStatus("I");
                        peop.setEmail(peop.getEmail()+"TURNEDOFF");
    
                        var edtWrongCont = aa.people.editPeople(peop);
                        if (edtWrongCont.getSuccess()) 
                        {
                            aa.print("OUTPUT = " +edtWrongCont.getOutput());
                        }
                        else
                        {
                            aa.print("ERROR: " + edtWrongCont.getErrorMessage());
                        }
                    }
                }
                else
                {
                    //need to associate existing contact to newly created PU
    
                    logDebug("linkPublicUserToContact: Linking this public user with reference contact : " + refConLUSEQ);
    
                    var linkResult = aa.licenseScript.associateContactWithPublicUser(puSeqNum, refConLUSEQ);
                    if (linkResult.getSuccess()) 
                    {
                        logDebug("Successfully linked public user " + puSeqNum + " to contact " + refConLUSEQ);
                    } 
                    else 
                    {
                        logDebug("Failed to link contact to public user");
                    }
                }
            }
        }
    }
}
catch (err) 
{
	aa.print("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
}

function objectExplore(objExplore){

	aa.print("Object: " + objExplore.getClass());

	aa.print("Methods:")
	for (x in objExplore) {
		if (typeof(objExplore[x]) == "function") aa.print("   " + x);
	}

	aa.print("");
	aa.print("Properties:")
	for (x in objExplore) {
		if (typeof(objExplore[x]) != "function") aa.print("   " + x + " = " + objExplore[x]);
	}
}

function comparePeopleMatchCriteria1(ipPeop)
{
	var fvContType = 'Individual'; //ipPeop.getContactType();

	var fvCriteriaStdChoice = "INDIVIDUAL_CONTACT_MATCH_CRITERIA";
	// default to individual unless flag is Org
	if (fvContType == "Organization")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}
	if (lookup("REF_CONTACT_CREATION_RULES",fvContType) == "O")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}

	//Add agency specific logic here if needed
	var fvBizDomainSR = aa.bizDomain.getBizDomain(fvCriteriaStdChoice);
	if (!fvBizDomainSR || !fvBizDomainSR.getSuccess())
	{
		logDebug("Standard Choice '" + fvCriteriaStdChoice + "' not defined.");
		return null;
	}
	var fvBizDomain = fvBizDomainSR.getOutput();
	if (!fvBizDomain || fvBizDomain.size() == 0)
	{
			logDebug("No criteria defined in Standard Choice '" + fvCriteriaStdChoice + "'.");
			return null;
	}

    var fndPplSM = new Array();
    
	for(var fvCounter1 = 0; fvCounter1 < fvBizDomain.size(); fvCounter1++)
	{
		var fvCloseMatchCriteriaObj = fvBizDomain.get(fvCounter1);
		var fvCriteriaStr = fvCloseMatchCriteriaObj.getDispBizdomainValue();
		if (!fvCriteriaStr || fvCriteriaStr == "")
			continue;

        
		var fvPeop = aa.people.createPeopleModel().getOutput().getPeopleModel();
		//make sure we are retrieving only active contacts
        fvPeop.setAuditStatus("A");
		
		var fvCriteriaArr = fvCriteriaStr.split(";");
        var fvSkipThisCriteria = false;
		for (var fvCounter2 in fvCriteriaArr)
		{
		   var fvCriteriaFld = fvCriteriaArr[fvCounter2];
		   if (ipPeop[fvCriteriaFld] == null)
		   {
			   fvSkipThisCriteria = true;
			   aa.print("Value for " + fvCriteriaFld + " is null.");
			   break;
		   }
		   fvPeop[fvCriteriaFld] = ipPeop[fvCriteriaFld];
		   aa.print("Search for " + fvCriteriaFld + " " + fvPeop[fvCriteriaFld]);
		}
		if (fvSkipThisCriteria)
		{
			aa.print("WARNING: One or more Values for the Fields defined in this Criteria are null. Skipping this criteria.");
			continue;
		}

		var fvResult = aa.people.getPeopleByPeopleModel(fvPeop);
		if ( !fvResult.getSuccess())
		{
			logDebug("WARNING: Error searching for duplicate contacts : " + fvResult.getErrorMessage());
			continue;
		}

		var fvPeopResult = fvResult.getOutput();

        aa.print("Total people found: " + fvPeopResult.length);

		if (fvPeopResult.length == 0)
		{
			logDebug("Searched for REF contact, no matches found.");
			continue;;
		}
        
		if (fvPeopResult.length == 1) //only ref contact found is the one created by this registration
		{

			aa.print("Searched for a REF Contact, " + fvPeopResult.length + " no additional matches found! returning the first match : " + fvPeopResult[0].getContactSeqNumber());
			continue;
		}
        else
        {
            aa.print("Searched for a REF Contact, " + fvPeopResult.length + " multiple matches found!");

            for (var pCntr in fvPeopResult)
            {
                var refConPeople = fvPeopResult[pCntr];
                fndPplSM.push(refConPeople);
            }
        }
	}
	logDebug("No matches found. Returning Null.");
	return fndPplSM;
}