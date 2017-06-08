function doAssocFormRecs(formDataField, newAfData) {
// FormDataField contains information about the child records already created.  it is either null, or the label of a hidden textArea field on the parent record.
// if FormDataField is null, we will use the database to get info on thechild records that are already created.
// if FormDataField is not null, the field will be used to store JSON data about the records.

// newAfData is a JSON object that describes the records to create.  Structured like:
// [{"ID":"1","Alias":"Food License","recordId":"14TMP-11111"}];
//
try{
	updateAppStatus("Submitted","Updated via ASA:Licenses/Cultivator/*/Owner Application");
	logDebug("parentCapId: " + parentCapId);
	if(parentCapId){
		var childRecs = [];
		var allKidsComplete = true;
		var chArray = [];
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application", parentCapId);
		if(!matches(arrChild, null, "", "undefined")&& arrChild.length>0){
			for(ch in arrChild){
				thisChild = arrChild[ch];
				capChild = aa.cap.getCap(thisChild).getOutput();
				//logDebug("capChild.getCapStatus: " + capChild.getCapStatus());
				if(!matches(capChild.getCapStatus(), "Submitted")){
					allKidsComplete=false;
				}
				//logDebug("capChild.getCapModel().getAppTypeAlias(): " + capChild.getCapModel().getAppTypeAlias());
				//logDebug("capChild.getCapID().getCustomID(): " + capChild.getCapID().getCustomID());
				chArray.push({
					"ID" : ch,
					"Alias" : String(capChild.getCapModel().getAppTypeAlias()),
					"recordId" : String(capChild.getCapID().getCustomID())
				});
			}
		}
		var arrChild = getChildren("Licenses/Cultivator/*/Declaration", parentCapId);
		if(!matches(arrChild, null, "", "undefined")&& arrChild.length>0){
			for(ch in arrChild){
				thisChild = arrChild[ch];
				capChild = aa.cap.getCap(thisChild).getOutput();
				chArray.push({
					"ID" : ch,
					"Alias" : String(capChild.getCapModel().getAppTypeAlias()),
					"recordId" : String(capChild.getCapID().getCustomID())
				});
			}
		}
		if(chArray.length>0){
			editAppSpecific("childRecs", JSON.stringify(chArray));
		}
		if(allKidsComplete){
			var currCap = capId;
			capId = parentCapId;
			var recTypeAlias = "Declarations and Final Affidavit";  // must be a valid record type alias
			var recordNum = 1;
			var afArray = [];  // array describing the associated form records
			for (var i = 0; i < recordNum; i++) {
				var af = {};  // empty object
				af.ID = String(i + 1);  // give it an id number
				af.Alias = recTypeAlias;  
				af.recordId = "";		// define a place to store the record ID when the record is created
				afArray.push(af); 		// add the record to our array
			}
			var arrForms = (doAssocFormRecs("childRecs",afArray));
			capId = currCap;
			for (i in arrForms){
				thisForm =  arrForms[i];
				var desigRec =  thisForm["recordId"];
				var desigRecId = aa.cap.getCapID(desigRec).getOutput();
				var drpContact = getContactByType("Designated Responsible Party",parentCapId);
				if(drpContact){
					var drpFirst = drpContact.getFirstName();
					var drpLast =  drpContact.getLastName();
					var drpEmail = drpContact.getEmail();
					editAppName(drpFirst + " " + drpLast + " (" + drpEmail + ")", desigRecId);
					updateShortNotes(drpFirst + " " + drpLast + " (" + drpEmail + ")",desigRecId);
					copyContactsByType(parentCapId, desigRecId, "Designated Responsible Party");
					if(!matches(drpEmail,null,"","undefined")){
						emailParameters = aa.util.newHashtable();
						addParameter(emailParameters, "$$AltID$$", desigRecId);
						addParameter(emailParameters, "$$ProjectName$$", capName);
						addParameter(emailParameters, "$$ACAUrl$$", getACAUrl());
						sendNotification(sysEmail,drpEmail,"","LCA_DRP_DECLARATION_NOTIF",emailParameters,null,desigRecId);
					}
				}
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: doAssocFormRecs: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: doAssocFormRecs: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}}
