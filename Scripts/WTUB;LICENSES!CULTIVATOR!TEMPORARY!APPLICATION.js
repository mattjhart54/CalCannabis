//lwacht
//create the license record, update altid,  and copy DRP and Owner contacts to it
//note license record creation has to be in WTUB so the license record exists when the license report is created
try{
	if(wfStatus=="Temporary License Issued"){
		var licCapId = createLicense("Active", true);
		if(licCapId){
			var toDay = new Date();
			var jsToDay = toDay.getTime();
			var janOne = new Date("01/01/2018");
			var jsJanOne = janOne.getTime();
			if(jsToDay < janOne){
				var expDate = new Date("05/01/2018");
				editFirstIssuedDate(janOne);
				editAppSpecific("Valid From Date", "01/01/2018", licCapId);
				//lwacht 171219: updating file date for aca display
				var capMdl = aa.cap.getCap(licCapId).getOutput(); //returns CapScriptModel object
				var newJanOne = aa.date.parseDate("01/01/2018")
				var updFileDt = capMdl.setFileDate(newJanOne);
				var capModel = capMdl.getCapModel();
				setDateResult = aa.cap.editCapByPK(capModel);
				if (!setDateResult.getSuccess()) {
					logDebug("**WARNING: error setting file date : " + setDatesetDateResult.getErrorMessage());
				}
				//lwacht 171219: end
			}else{
				var expDate = dateAdd(null,120);
				editAppSpecific("Valid From Date", sysDateMMDDYYYY, licCapId);
			}
			setLicExpirationDate(licCapId,null,expDate,"Active");
			if(""+AInfo["App Type"]=="Temporary Adult-Use Cannabis Cultivation"){
				var newAltId = capIDString.replace("TCA", "TAL");
			}else{
				var newAltId = capIDString.replace("TCA", "TML");
			}
			var updAltId = aa.cap.updateCapAltID(licCapId,newAltId);
			if(!updAltId.getSuccess()){
				logDebug("Error updating Alt Id: " + newAltId + ":: " +updAltId.getErrorMessage());
			}else{
				logDebug("License record ID updated to : " + newAltId);
			}
			//wacht 171220 adding county to app name
			//mhart reoved county from app name
			//var newAppName = "Temporary Cultivator License - " + AInfo["License Type"];
			//lwacht 180104 Story 5104 start
			//var newAppName = "Temporary Cultivator License - " + AInfo["License Type"];
			var newAppName = AInfo["License Type"];
			//lwacht 180104 Story 5104 end
			//logDebug("workDescGet(capId): " + workDescGet(capId));
			//logDebug("getShortNotes(): " + getShortNotes());
			logDebug("newAppName: " + newAppName);
			editAppName(newAppName,licCapId);
			//lwacht 171220: uncommenting short notes update
// mhart 180326 User Story 5193 - add city to short notes that already displays county
			if(matches(AInfo["Premise City"], null, "")) {
				updateShortNotes(AInfo["Premise County"],licCapId);
			}
			else {
				updateShortNotes(AInfo["Premise City"] + " - " + AInfo["Premise County"],licCapId);
			}
// mhart 180326 User Story 5193 
			//lwacht 171220: end
			//lwacht 171214: uncommenting this line as the legal business name is required again
			//updateWorkDesc(workDescGet(capId),licCapId);
			updateWorkDesc(workDescGet(capId),licCapId);
			//lwacht 171214: end
			capContactResult = aa.people.getCapContactByCapID(licCapId);
			if (capContactResult.getSuccess()){
				Contacts = capContactResult.getOutput();
				for (yy in Contacts){
					var theContact = Contacts[yy].getCapContactModel();
					//lwacht 171214: using the drp 
					//if(theContact.getContactType() == "Business"){
					if(theContact.getContactType() == "DRP - Temporary License"){
					//lwacht 171214: end
						var peopleModel = theContact.getPeople();
						var editChannel =  peopleModel.setPreferredChannel(1);
						var editChannel =  peopleModel.setPreferredChannelString("Email");
						aa.people.editCapContactWithAttribute(theContact);
					}
				}
			}
		}else{
			logDebug("Error creating License record: " + licCapId);
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUB:LICENSES/CULTIVATOR/TEMPORARY/APPLICATION: Create License Record: " + err.message);
	logDebug(err.stack);
}

