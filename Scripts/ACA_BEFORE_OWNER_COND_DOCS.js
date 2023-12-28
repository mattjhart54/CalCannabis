/*------------------------------------------------------------------------------------------------------/
| Program : ACA_APPLICATION_DOC_BEFORE.js
| Event   : ACA Page Flow attachments before event
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
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var SCRIPT_VERSION  = 3; 
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

eval(getScriptText("INCLUDES_CUSTOM",null,true));


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
	//lwacht: 180306: story 5304: don't allow script to run against completed records
	var capIdStatusClass = getCapIdStatusClass(capId);
	if(!matches(capIdStatusClass, "COMPLETE")){
	//lwacht: 180306: story 5304: end
		loadAppSpecific4ACA(AInfo);
		loadASITables();
		docsMissing = false;
		showList = true;
		addConditions = false;
		addTableRows = false;
		var tblRow = [];
		var conditionTable = [];
		capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
		r = getReqdDocs("Owner");
		submittedDocList = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
		uploadedDocs = new Array();
		dr = "";
		for (var i in submittedDocList ){
			uploadedDocs[submittedDocList[i].getDocCategory()] = true;
		}

		if (r.length > 0 && showList) {
			for (x in r) {
				if(uploadedDocs[r[x].document] == undefined) {
					showMessage = true; 
					if (!docsMissing)  {
						comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>The following documents are required based on the information you have provided: </span><ol>"); 	
						docsMissing = true; 
						showList = true;
					}
					conditionType = "License Required Documents";
					dr = r[x].condition;
					publicDisplayCond = null;
					if (dr) {
						ccr = aa.capCondition.getStandardConditions(conditionType, dr).getOutput();
						for(var i = 0;i<ccr.length;
						i++) if(ccr[i].getConditionDesc().toUpperCase() == dr.toUpperCase()) publicDisplayCond = ccr[i];
					}
					if (dr && ccr.length > 0 && showList && publicDisplayCond) {
						message += "<li><span>" + dr + "</span>: " + publicDisplayCond.getPublicDisplayMessage() + "</li>";
					}
					if (dr && ccr.length > 0 && addConditions && !appHasCondition(conditionType,null,dr,null)) {
						addStdCondition(conditionType,dr);
					}
					if (dr && ccr.length > 0 && addTableRows) {
						tblRow["Document Type"] = new asiTableValObj("Document Type",""+dr, "Y"); 
						tblRow["Document Description"]= new asiTableValObj("Document Description",""+lookup("LIC_CC_DOCUMENTS", dr), "Y"); 
						tblRow["Uploaded"] = new asiTableValObj("Uploaded","UNCHECKED", "Y"); 
						tblRow["Status"] = new asiTableValObj("Status","Not Submitted", "Y"); ; 
						conditionTable.push(tblRow);
					}	
				}	
			}
			if (dr && ccr.length > 0 && addTableRows) {
				removeASITable("ATTACHMENTS"); 
				asit = cap.getAppSpecificTableGroupModel();
				addASITable4ACAPageFlow(asit,"ATTACHMENTS",conditionTable);
			}
		}

		if (r.length > 0 && showList && docsMissing) {
			//cancel = true;
			comment("</ol></div>");
		}
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_BEFORE_COND_DOCS: Main function: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_BEFORE_COND_DOCS: Main function: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}

function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
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



