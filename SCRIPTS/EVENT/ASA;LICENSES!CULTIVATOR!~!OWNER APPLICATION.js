//lwacht
// if this is the last owner record to be submitted, create a temp affidavit record and email the DRP
try{
	logDebug("parentCapId: " + parentCapId);
	if(parentCapId){
		var allKidsComplete = true;
		var arrChild = getChildren("Licenses/Cultivator/*/Owner Application", parentCapId);
		if(!matches(arrChild, null, "", "undefined")&& arrChild.length>0){
			for(ch in arrChild){
				thisChild = arrChild[ch];
				capChild = aa.cap.getCap(capId).getOutput();
				logDebug("capChild.getCapStatus: " + capChild.getCapStatus());
				if(capChild.getCapStatus()!="Pending"){
					allKidsComplete=false;
				}
			}
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
			var arrForms = (doAssocFormRecs(AInfo["childRecs"],afArray));
			capId = currCap;
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: Licenses/Cultivation/*/Owner Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "A JavaScript Error occurred: Licenses/Cultivation/*/Owner Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}
