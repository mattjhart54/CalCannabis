//lwacht
// adding associated forms for owner records then adding owners to those records
function processOwnerApplications(){
try {
	var errMsg = "";
	var recTypeAlias = "Owner Application";  // must be a valid record type alias
	var recordNum = 0;
	var currCapId = capId;
	//shouldn't need to load tables
	//loadASITables4ACA();
	var tblOwners = loadASITable("OWNERS");
	for(row in tblOwners){
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
		//var tblOwners = OWNERS;
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
				var vStatus = tblOwners[ow]["Status"];
				//logDebug("---first match: " + (""+vFirst==""+contFName));
				//logDebug("---last match: " + (""+vLast==""+contLName));
				//logDebug("---email match: " + (""+vEmail==""+contEmail));
				//logDebug("---vFirst: " + vFirst);
				//logDebug("---vLast: " + vLast);
				//logDebug("---vEmail: " + vEmail);
				if(""+contFName==""+vFirst && ""+contLName==""+vLast && ""+contEmail==""+vEmail && vStatus!="Submitted"){
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
					var ownerSeqNum = addRefContactByEmailLastName(vFirst, vLast,vEmail);
					if(!ownerSeqNum){
						qryPeople.setServiceProviderCode(aa.getServiceProviderCode());
						qryPeople.setContactTypeFlag("Individual");
						qryPeople.setContactType("Individual");
						qryPeople.setFirstName(vFirst);
						qryPeople.setLastName(vLast);
						qryPeople.setEmail(vEmail);
						qryPeople.setAuditStatus("A");
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
					editContactType("Individual", "Owner");
					errMsg += vEmail + br;
					var ownUser = createPublicUserFromContact("Owner");
					tblOwners[o]["Status"]="Submitted";
					emailParameters = aa.util.newHashtable();
					addParameter(emailParameters, "$$AltID$$", capId.getCustomID());
					addParameter(emailParameters, "$$fName$$",vFirst);
					addParameter(emailParameters, "$$lName$$",vLast);
					addParameter(emailParameters, "$$ACAUrl$$", getACAUrl());
					var resCurUser = aa.person.getUser(publicUserID);	
					if(resCurUser.getSuccess()){
						var currUser = resCurUser.getOutput();
						var currUserEmail = ""+currUser.email;
						setContactsSyncFlag("Y");
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
	logDebug("ERROR: A JavaScript Error occurred: processOwnerApplications: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "**ERROR: A JavaScript Error occurred: processOwnerApplications: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + errMsg);
}	
}
