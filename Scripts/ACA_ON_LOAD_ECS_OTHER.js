/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_OWNER_COND_DOCS.JS
| Event   : ACA Page Flow onload attachments component
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

try{
	asit = cap.getAppSpecificTableGroupModel();
			var emptyTable = new Array()
		new_asit = addASITable4ACAPageFlow(asit,"ATTACHMENTS", emptyTable);
	
		
	
	var eText = "Information: " + br;
	loadAppSpecific4ACA(AInfo);
	loadASITables();
	docsMissing = false;
	showList = true;
	addConditions = false;
	addTableRows = true;
	var conditionTable = [];
	dr = "";
	capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
	r = getReqdDocs("Owner");
	submittedDocList = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
	uploadedDocs = new Array();
	for (var i in submittedDocList ){
		uploadedDocs[submittedDocList[i].getDocCategory()] = true;
	}
	if (r.length > 0 && (showList || addTableRows)) {
		for (x in r) { 
			//going to add the condition, even if the document has been added, in case they want to change it
			if(uploadedDocs[r[x].document] == undefined) {
				showMessage = true; 
				if (!docsMissing)  {
					comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>copy:The following documents are required based on the information you have provided: </span><ol>"); 	
					docsMissing = true; 
				}
				conditionType = "License Required Documents";
				dr = r[x].condition;
				publicDisplayCond = null;
				if (dr) {
					ccr = aa.capCondition.getStandardConditions(conditionType, dr).getOutput();
					for(var i = 0; i<ccr.length; i++) 
						if(ccr[i].getConditionDesc().toUpperCase() == dr.toUpperCase()) 
							publicDisplayCond = ccr[i];
				}
				if (dr && ccr.length > 0 && showList && publicDisplayCond) {
					message += "<li><span>" + dr + "</span>: " + publicDisplayCond.getPublicDisplayMessage() + "</li>";
				}
				if (dr && ccr.length > 0 && addConditions && !appHasCondition(conditionType,null,dr,null)) {
					addStdCondition(conditionType,dr);
				}
				if (dr && ccr.length > 0 && addTableRows) {
					var tblRow = [];
					tblRow["Document Type"] = new asiTableValObj("Document Type",""+dr, "Y"); 
					tblRow["Document Description"]= new asiTableValObj("Document Description",""+lookup("LIC_CC_ATTACHMENTS", dr), "Y"); 
					tblRow["Uploaded"] = new asiTableValObj("Uploaded","UNCHECKED", "Y"); 
					tblRow["Status"] = new asiTableValObj("Status","Not Submitted", "Y"); ; 
					//tblRow["Document Type"] = ""+dr; 
					//tblRow["Document Description"]= ""+lookup("LIC_CC_ATTACHMENTS", dr); 
					//tblRow["Uploaded"] = "UNCHECKED"; 
					//tblRow["Status"] = "Not Submitted"; 
					conditionTable.push(tblRow);
					eText +=tblRow["Document Type"] + ": " + tblRow["Document Description"] + br;
					//logDebug("tblRow: " + tblRow["Document Type"]);
					//logDebug("tblRow: " + tblRow["Document Description"]);
					//logDebug("tblRow: " + tblRow["Uploaded"]);
					//logDebug("tblRow: " + tblRow["Status"]);
				}	
			}	
		}
		//if (dr && ccr.length > 0 && addTableRows) {
			comment("condition.length: " + conditionTable.length);
			comment("addTableRows: " + addTableRows);
			comment("asit model: " + asit.getGroupName() +  "class is " + asit.getClass());
			for(g in asit){comment(g);}
		if (conditionTable.length > 0 && addTableRows) {
			removeASITablelocal("ATTACHMENTS"); 
	//		var newASIT = copyASITable4PageFlow(asit,"ATTACHMENTS",conditionTable);
			//aa.sendMail(sysFromEmail, debugEmail, "", "INFO ONLY: ACA_ONLOAD_OWNER_COND_DOCS: Required Documents: " + startDate, "capId: " + capId + br +  eText);
		}
	}
	if (r.length > 0 && showList && docsMissing) {
		comment("</ol></div>");
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_OWNER_COND_DOCS: Main function: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ACA_ONLOAD_OWNER_COND_DOCS: Required Documents: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
}
	function removeASITablelocal(tableName) // optional capId
  	{
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements MUST be strings.
	comment("inRemoveASITable" + tableName);
		comment("itemCap" + itemCap);
		comment("cap: " + cap.getClass() + " " + cap);
		comment("capId" + capId.getClass() + " " + capId);
			comment("currentUserID" + currentUserID);
			for(y in capId) {comment(y);}
  	var itemCap = capId;
	comment("itemCap: " + itemCap);
	if (arguments.length > 1)
		itemCap = arguments[1]; // use cap ID specified in args

	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,capId,currentUserID);
	cap.setAppSpecificTableGroupModel(asit);
	

	if (!tssmResult.getSuccess())
		{ comment("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }
        else
	comment("Successfully removed all rows from ASI Table: " + tableName);

	}
// page flow custom code end
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



