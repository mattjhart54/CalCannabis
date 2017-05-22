/*------------------------------------------------------------------------------------------------------/
| Program : ACA_CREATE_ASSOC_ONWER_FORMS.js
| Event   : ACA_Onload
|
| Usage   : Display what documents are required
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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS","CALTREES",true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", "CALTREES",true));
}

eval(getScriptText("INCLUDES_CUSTOM"));

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
//var parentId = cap.getParentCapID();

// page flow custom code begin
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

try {
	var capId = cap.getCapID();
	var recordType = "Licenses/Cultivator/Medical/Owner Application";  // must be a valid record type alias
	var recordNum = 0;
	loadASITables4ACA();
	for(row in OWNERS){
		recordNum++;
	}
	var afArray = [];  // array describing the associated form records

	for (var i = 0; i < recordNum; i++) {
		var af = {};  // empty object
		af.ID = String(i + 1);  // give it an id number
		af.Alias = recordType;  
		af.recordId = "";		// define a place to store the record ID when the record is created
		afArray.push(af); 		// add the record to our array
	}

	doAssocFormRecs(null,afArray);

function doAssocFormRecs(formDataField, newAfData) {

	// FormDataField contains information about the child records already created.  it is either null, or the label of a hidden textArea field on the parent record.
	// if FormDataField is null, we will use the database to get info on thechild records that are already created.
	// if FormDataField is not null, the field will be used to store JSON data about the records.

	// newAfData is a JSON object that describes the records to create.  Structured like:
	// [{"ID":"1","Alias":"Food License","recordId":"14TMP-11111"}];
	//

	try {
		// get all record types
		var allRecordTypeMap = aa.util.newHashMap();
		var allRecordTypes = aa.cap.getCapTypeList(null).getOutput();
		if (allRecordTypes != null && allRecordTypes.length > 0) {
			for (var i = 0; i < allRecordTypes.length; i++) {
				var recordType = allRecordTypes[i].getCapType();
				var alias = recordType.getAlias();
				allRecordTypeMap.put(alias, recordType);
			}
		}
		// get an object representing all the existing child records in the database
		var childRecs = [];
		var capScriptModels = aa.cap.getChildByMasterID(capId).getOutput();
		if (capScriptModels) {
			for (var i = 0; i < capScriptModels.length; i++) {
				var capScriptModel = capScriptModels[i];
				if (capScriptModel) {
					var project = capScriptModel.getProjectModel();
					if (capScriptModel.getCapID() != null && project != null && project.getProject() != null && "AssoForm".equals(project.getProject().getRelationShip())) {
						var ct = capScriptModel.getCapModel().getCapType();
						childRecs.push({
							"ID" : i,
							"Alias" : String(capScriptModel.getCapModel().getAppTypeAlias()),
							"recordId" : String(capScriptModel.getCapID().getCustomID())
						});
						logDebug("adding : " + String(capScriptModel.getCapID().getCustomID()) + " to list of viable child records");
					}
				}
			}
		}
		if (!formDataField) { // use child records in database
			var afData = childRecs;
		} else { // use form field on record as the list of existing child records
			var afData = AInfo[formDataField];
			if (!afData || afData == "") {
				afData = [];
			} else {
				afData = JSON.parse(afData);
			}
			// filter this list against the existing child records, remove any that aren't really child records.
			afData = afData.filter(function (o) {
				bool = childRecs.map(function (e) {
					return e.recordId
				}).indexOf(o.recordId) >= 0;
				if (!bool)
					logDebug("Removing " + o.recordId + " from the list as it is not a viable child record");
				return bool;
			});

			// remove any child recs that aren't in the form data field.
			for (var i in childRecs) {
				if (afData.map(function (e) {
						return e.recordId
					}).indexOf(childRecs[i].recordId) == -1) {
					logDebug("removing " + childRecs[i].recordId + " from record association, not found in " + formDataField);
					aa.cap.removeAppHierarchy(capId, aa.cap.getCapID(childRecs[i].recordId).getOutput());
				}
			}
		}

		logDebug("Existing Record Form Data (after filtering out bad data) : " + JSON.stringify(afData));

		// Check the existing child records and re-use any of the same type.
		// This code only looks at the record type to be created, not an ID field.  
		//It's assumed that if we are using this code we probably aren't using an ASI table, 
		//so we're ignoring the ID field.

		for (var i in newAfData) {
			var n = newAfData[i];
			var z = afData.map(function (e) {
				return e.Alias;
			}).indexOf(n.Alias); // found a match
			if (z >= 0) {
				n.recordId = afData[z].recordId; // use this record
				logDebug(n.Alias + " will use existing viable child record id " + n.recordId);
				afData.splice(z, 1);
			} else {
				logDebug("no " + n.Alias + " record found in existing afData");
			}
		}
		// Delete everything thats left in AfData, we aren't using it.
		for (var i in afData) {
			logDebug("removing unused child record " + afData[i].recordId);
			aa.cap.removeAppHierarchy(capId, aa.cap.getCapID(afData[i].recordId).getOutput());
		}
		// create any records that don't already exist.
		for (var i in newAfData) {
			var r = newAfData[i];
			var ctm = allRecordTypeMap.get(r.Alias);
			if (!newAfData[i].recordId || newAfData[i].recordId == "") {
				logDebug("attempting to create record : " + ctm);
				var result = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE CAP");
				if (result.getSuccess() && result.getOutput() != null) {
					var newCapId = result.getOutput();
					logDebug("created new associated form record " + newCapId.getCustomID() + " for type " + r.Alias);
					aa.cap.createAssociatedFormsHierarchy(capId, newCapId);
					r.recordId = String(newCapId.getCustomID());
					// stuff can be copied in here, if needed.   I think it should be copied in after the CTRCA
				} else {
					logDebug("error creating new associated form record for type " + r.Alias + ", " + result.getErrorMessage());
				}
			} else {
				logDebug("using existing associated form record " + r.recordId + " for type " + r.Alias);
			}
		}

		// save JSON data to field on parent page.

		if (formDataField) {
			editAppSpecific(formDataField, JSON.stringify(newAfData));
		}
		
	return newAfData;
		
	} catch (err) {
		logDebug("runtime error : " + err.message);
		logDebug("runtime error : " + err.stack);
	}

}
