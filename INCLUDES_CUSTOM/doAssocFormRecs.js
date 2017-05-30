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
			//afData = JSON.stringify(afData);
			//afData = JSON.parse(JSON.stringify(afData));
			logDebug("afData: " + afData);
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
	//don't remove any records where the alias doesn't match the one requested
	for(i in newAfData){
		for(j in afData){
			if(newAfData[i].Alias!=afData[j].Alias){
				logDebug("Wrong alias, not removing "+  afData[j].recordId);
				delete afData[j];
			}
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
			logDebug("Attempting to create record : " + ctm);
			var result = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE CAP");
			if (result.getSuccess() && result.getOutput() != null) {
				var newCapId = result.getOutput();
				logDebug("Created new associated form record " + newCapId.getCustomID() + " for type " + r.Alias);
				aa.cap.createAssociatedFormsHierarchy(capId, newCapId);
				r.recordId = String(newCapId.getCustomID());
				// stuff can be copied in here, if needed.   I think it should be copied in after the CTRCA
			} else {
				logDebug("Error creating new associated form record for type: " + r.Alias + ": " + result.getErrorMessage());
			}
		} else {
			logDebug("Using existing associated form record: " + r.recordId + " for type: " + r.Alias);
		}
	}

		// save JSON data to field on parent page.

		if (formDataField) {
			editAppSpecific(formDataField, JSON.stringify(newAfData));
		}
		
	return newAfData;
		
} catch (err) {
	logDebug("A JavaScript Error occurred: doAssocFormRecs: " + err.message);
	logDebug(err.stack);
}}
