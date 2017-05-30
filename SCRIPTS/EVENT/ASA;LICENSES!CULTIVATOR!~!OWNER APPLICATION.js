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
			var arrForms = (doAssocFormRecs("childRecs",afArray));
			capId = currCap;
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: ASA:Licenses/Cultivator/*/Owner Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "A JavaScript Error occurred: Licenses/Cultivation/*/Owner Application: " + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}

// lwacht
// if not ACAC, set altId based on application parent
try{
	if(!publicUser){
		if(parentCapId){
			nbrToTry = y+1;
			//because owners can be added and deleted, need a way to number the records
			//but only if they haven't been numbered before
			if(capId.getCustomID().substring(0,3)!="LCA"){
				var ownerGotNewAltId = false;
				var newIdErrMsg = "";
				for (i = 0; i <= 100; i++) {
					if(nbrToTry<10){
						var nbrOwner = "00" + nbrToTry;
					}else{
						if(nbrToTry<100){
							var nbrOwner = "0" + nbrToTry
						}
						var nbrOwner = ""+ nbrToTry;
					}
					var newAltId = parentCapId.getCustomID() + "-" + nbrOwner + "O";
					var updateResult = aa.cap.updateCapAltID(capId, newAltId);
					if (updateResult.getSuccess()) {
						logDebug("Updated owner record AltId to " + newAltId + ".");
						ownerGotNewAltId = true;
						break;
					}else {
						newIdErrMsg += updateResult.getErrorMessage() +"; ";
						nbrToTry++;
					}
				}
				if(!ownerGotNewAltId){
					logDebug("Error renaming owner record " + capId + ":  " + newIdErrMsg);
					aa.sendMail("noreply_accela@cdfa.ca.gov", debugEmail, "", "Error renaming owner record " + capId + ": " + startDate, newIdErrMsg);
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/OWNER APPLICATION: Required Documents: " + err.message);
	logDebug(err.stack);
}
