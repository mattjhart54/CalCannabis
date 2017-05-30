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
				if(capChild.getCapStatus()!="Submitted"){
					logDebug("Not complete");
					allKidsComplete=false;
				}
				//var af = {};  // empty object
				//af.ID = ch;  // give it an id number
				//af.Alias = "Owner Application";  
				//af.recordId = thisChild.getCustomID();		// define a place to store the record ID when the record is created
				//chArray.push(af); 		// add the record to our array
				chArray.push({
					"ID" : i,
					"Alias" : String(capChild.getCapModel().getAppTypeAlias()),
					"recordId" : String(capChild.getCapID().getCustomID())
				});
			}
			var arrChild = getChildren("Licenses/Cultivator/*/Declaration", parentCapId);
			if(!matches(arrChild, null, "", "undefined")&& arrChild.length>0){
				var chArray = [];
				for(ch in arrChild){
					thisChild = arrChild[ch];
					capChild = aa.cap.getCap(thisChild).getOutput();
					chArray.push({
						"ID" : i,
						"Alias" : String(capChild.getCapModel().getAppTypeAlias()),
						"recordId" : String(capChild.getCapID().getCustomID())
					})
				}
			}
			editAppSpecific("childRecs", chArray);
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
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA:Licenses/Cultivator/*/Owner Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "A JavaScript Error occurred: Licenses/Cultivation/*/Owner Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}
