//lwacht
// if this is the last owner record to be submitted, create a temp affidavit record and email the DRP
try{
	updateAppStatus("Submitted","Updated via ASA:Licenses/Cultivator/*/Owner Application");
	logDebug("parentCapId: " + parentCapId);
	if(parentCapId){
		var childRecs = [];
		var allKidsComplete = true;
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application", parentCapId);
		if(!matches(arrChild, null, "", "undefined")&& arrChild.length>0){
			var chArray = [];
			for(ch in arrChild){
				thisChild = arrChild[ch];
				capChild = aa.cap.getCap(thisChild).getOutput();
				logDebug("capChild.getCapStatus: " + capChild.getCapStatus());
				if(!matches(capChild.getCapStatus(), "Pending", "Submitted")){
					logDebug("Not complete");
					allKidsComplete=false;
				}
				logDebug("capChild.getCapModel().getAppTypeAlias(): " + capChild.getCapModel().getAppTypeAlias());
				logDebug("capChild.getCapID().getCustomID(): " + capChild.getCapID().getCustomID());
				chArray.push({
					"ID" : ch,
					"Alias" : String(capChild.getCapModel().getAppTypeAlias()),
					"recordId" : String(capChild.getCapID().getCustomID())
				});
			}
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
			var arrForms = (doAssocFormRecs1("childRecs",afArray));
			capId = currCap;
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA:Licenses/Cultivator/*/Owner Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "A JavaScript Error occurred: Licenses/Cultivation/*/Owner Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}
