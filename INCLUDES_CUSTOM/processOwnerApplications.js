//lwacht
// adding associated forms for owner records then adding owners to those records
function processOwnerApplications(){
try {
	var recTypeAlias = "Owner Application";  // must be a valid record type alias
	var recordNum = 0;
	var currCapId = capId;
	//loadASITables4ACA();
	loadASITables();
	for(row in OWNERS){
		recordNum++;
	}
	logDebug("recordNum: " + recordNum);
	var afArray = [];  // array describing the associated form records

	for (var i = 0; i < recordNum; i++) {
		var af = {};  // empty object
		af.ID = String(i + 1);  // give it an id number
		af.Alias = recTypeAlias;  
		af.recordId = "";		// define a place to store the record ID when the record is created
		afArray.push(af); 		// add the record to our array
	}
	var arrForms = (doAssocFormRecs(null,afArray));
	for (y in arrForms){
		thisForm =  arrForms[y];
		var childRecId =  thisForm["recordId"];
		capId = aa.cap.getCapID(childRecId).getOutput();
		logDebug("capId: "+ capId.getCustomID());
		var arrContacts = getContactArray(capId);
		//if there are contacts, compare them to the current owners table.
		//if they're there, leave it.  if they're not remove them and add an owner
		var hasOwnerContact = false;
		var tblOwners = OWNERS;
		if(arrContacts.length>0 && arrContacts!=null){ 
			var contSeq = arrContacts[0]["contactSeqNumber"]; //should only be one
			var contFName = arrContacts[0]["firstName"]; //should only be one
			var contLName = arrContacts[0]["lastName"]; //should only be one
			var contEmail = arrContacts[0]["email"]; //should only be one
			//logDebug("contFName: " + contFName);
			//logDebug("contLName: " + contLName);
			//logDebug("contEmail: " + contEmail);
			var ownerRecdExists = false;
			for(ow in tblOwners){
				var vFirst = tblOwners[ow]["First Name"];
				var vLast = tblOwners[ow]["Last Name"];
				var vEmail = tblOwners[ow]["Email Address"];
				//logDebug("---first match: " + (""+vFirst==""+contFName));
				//logDebug("---last match: " + (""+vLast==""+contLName));
				//logDebug("---email match: " + (""+vEmail==""+contEmail));
				//logDebug("---vFirst: " + vFirst);
				//logDebug("---vLast: " + vLast);
				//logDebug("---vEmail: " + vEmail);
				if(""+contFName==""+vFirst && ""+contLName==""+vLast && ""+contEmail==""+vEmail){
					tblOwners[ow]["Status"]="Submitted";
					//removeASITable("OWNERS");
					//addASITable("OWNERS",tblOwners);
					ownerRecdExists = true;
					hasOwnerContact = true;
					logDebug("Found matching owner row: " + vFirst + " " + vLast);
				}
			}
			if(!ownerRecdExists){
				var removeResult = aa.people.removeCapContact(capId, contSeq); 
				if (removeResult.getSuccess()){
					logDebug("Contact removed : " + this + " from record " + this.capId.getCustomID());
				}else{
					logDebug("Error removing contact : " + arrContacts[0]["lastName"] + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
				}
			}
		}
		if(!hasOwnerContact){
			logDebug("Owner not found.  Attempting to add owner contact. ");
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
			//for(bb in qryPeople){
			//	if(typeof(qryPeople[bb])=="function"){
			//		logDebug(bb);
			//	}
			//}
			for(o in tblOwners){
				//logDebug("owner status: " + tblOwners[o]["Status"]);
				if(tblOwners[o]["Status"]!="Submitted"){
					var vFirst = tblOwners[o]["First Name"];
					var vLast = tblOwners[o]["Last Name"];
					var vEmail = tblOwners[o]["Email Address"];
					editAppName(vFirst + " " + vLast + " (" + vEmail + ")");
					updateShortNotes(vFirst + " " + vLast + " (" + vEmail + ")");
					//logDebug("appName: " + vFirst + " " + vLast + " (" + vEmail + ")");
					//adding this logic to addRefContactByEmailLastName function
					/*
					tblOwners[o]["Status"]="Submitted";
					var vMiddle = null;
					qryPeople.setServiceProviderCode(aa.getServiceProviderCode()) ; 
					qryPeople.setEmail(vEmail);
					qryPeople.setContactTypeFlag("Individual");
					qryPeople.setContactType("Owner");
					var resQryPpl = aa.people.getPeopleByPeopleModel(qryPeople);
					if(resQryPpl.getSuccess()){
						refQryPpl = resQryPpl.getOutput();
						//for (ref in refQryPpl){
						//	if(typeof(refQryPpl[ref])!="function"){
						//		logDebug(ref+": " + refQryPpl[ref]);
						//	}
						//}
						logDebug("Found reference contact matching email, so adding to new owner record: " + vFirst + " " + vLast);
							logDebug("Error adding ref contact: "+ ownerSeqNum);
						}
						emailParameters = aa.util.newHashtable();
						addParameter(emailParameters, "$$AltID$$", capId);
						addParameter(emailParameters, "$$ProjectName$$", capName);
						addParameter(emailParameters, "$$ACAUrl$$", getACAUrl());
						var resCurUser = aa.person.getUser(publicUserID);	
						if(resCurUser.getSuccess()){
							var currUser = resCurUser.getOutput();
							var currUserEmail = ""+currUser.email;
						}
						if(currUserEmail!=vEmail){
							sendNotification(sysEmail,vEmail,"","LCA_OWNER_APP_NOTIF",emailParameters,null,capId);
						}
					}else{
					*/
					var ownerSeqNum = addRefContactByEmailLastName(vFirst, vLast,vEmail);
					if(!ownerSeqNum){
						qryPeople.setFirstName(vFirst);
						qryPeople.setLastName(vLast);
						qryPeople.setEmail(vEmail);
						var resPpl = aa.people.createPeople(qryPeople);
						if(!resPpl.getSuccess()){
							logDebug("Error creating people: " + resPpl.getErrorMessage());
						}else{
							logDebug("Succesfully create ref contact, so adding to record");
							var ownerSeqNumAgain = addRefContactByEmailLastName(vFirst, vLast,vEmail);
							if(!ownerSeqNumAgain){
								logDebug("Error adding ref contact: "+ ownerSeqNumAgain);
							}
						}
					}
					emailParameters = aa.util.newHashtable();
					addParameter(emailParameters, "$$AltID$$", capId);
					addParameter(emailParameters, "$$ProjectName$$", capName);
					addParameter(emailParameters, "$$ACAUrl$$", getACAUrl());
					var resCurUser = aa.person.getUser(publicUserID);	
					if(resCurUser.getSuccess()){
						var currUser = resCurUser.getOutput();
						var currUserEmail = ""+currUser.email;
					}
					if(currUserEmail!=vEmail){
						sendNotification(sysEmail,vEmail,"","LCA_OWNER_APP_NOTIF",emailParameters,null,capId);
					}
					break;
				}
			}
		}
	}
	capId = currCapId;
}catch (err) {
	logDebug("A JavaScript Error occurred:ASA:LICENSES/CULTIVATOR/*/APPLICATION: processOwnerApplications: " + err.message);
	logDebug(err.stack);
}}
