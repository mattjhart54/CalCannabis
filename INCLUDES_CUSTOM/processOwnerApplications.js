/*===========================================
Title: processOwnerApplications
Purpose: adding associated forms for owner records then adding owners to those records
Author: Lynda Wacht		
Functional Area : Associated Forms
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis
Parameters:
	None
============================================== */

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
			logDebug("contFName: " + contFName);
			logDebug("contLName: " + contLName);
			logDebug("contEmail: " + contEmail);
			var ownerRecdExists = false;
			for(ow in tblOwners){
				var vFirst = tblOwners[ow]["First Name"];
				var vLast = tblOwners[ow]["Last Name"];
				var vEmail = tblOwners[ow]["Email Address"];
				var vStatus = tblOwners[ow]["Status"];
				logDebug("---first match: " + (""+vFirst==""+contFName));
				logDebug("---last match: " + (""+vLast==""+contLName));
				logDebug("---email match: " + (""+vEmail==""+contEmail));
				logDebug("---vFirst: " + vFirst);
				logDebug("---vLast: " + vLast);
				logDebug("---vEmail: " + vEmail);
				logDebug("---vStatus: " + vStatus)
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
				//lwacht: 180726: delete the record instead of re-using
				//var removeResult = aa.people.removeCapContact(capId, contSeq); 
				var capIDModel = aa.cap.getCapIDModel(capId.getID1(),capId.getID2(),capId.getID3()).getOutput();
				var removeResult = aa.cap.deletePartialCAP(capIDModel);
				if (removeResult.getSuccess()){
					logDebug("Owner app removed : " + contFName + " " + contLName + " from record " + this.capId.getCustomID());
				}else{
					logDebug("Error removing record : " + arrContacts[0]["lastName"] + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
				}
				//lwacht: 180726: end
			}
		//lwacht: 180726: record has no contact--remove it
		}else{
			var capIDModel = aa.cap.getCapIDModel(capId.getID1(),capId.getID2(),capId.getID3()).getOutput();
			var removeResult = aa.cap.deletePartialCAP(capIDModel);
			if (removeResult.getSuccess()){
				logDebug("Owner app removed : "  + contFName + " " + contLName +  " from record " + this.capId.getCustomID());
			}else{
				logDebug("Error removing record : " + arrContacts[0]["lastName"] + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
			}
		}
		//lwacht: 180726: end
		if(!hasOwnerContact){
			logDebug("At least one owner not found.  Attempting to add owner contact. ");
			var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
			//for(bb in qryPeople){
			//	if(typeof(qryPeople[bb])=="function"){
			//		logDebug(bb);
			//	}
			//}
			for(o in tblOwners){
				logDebug("owner status: " + tblOwners[o]["Status"]);
				logDebug("owner email: " + tblOwners[o]["Email Address"]);
				if(tblOwners[o]["Status"]!="Submitted"){
					//lwacht: 180726: record should not exist, so create first
					ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
					ctm.setGroup("Licenses");
					ctm.setType("Cultivator");
					ctm.setSubType("Medical");
					ctm.setCategory("Owner Application");
					logDebug("Attempting to create record : " + recTypeAlias); 
					var result = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE CAP"); 
					if (result.getSuccess() && result.getOutput() != null) { 
						var newCapId = result.getOutput(); 
						logDebug("Created new associated form record " + newCapId.getCustomID() + " for type " + recTypeAlias); 
						aa.cap.createAssociatedFormsHierarchy(currCapId, newCapId); 
						capId = newCapId;
					}
					//lwacht: 180726: end
					var nFirst = tblOwners[o]["First Name"];
					var nLast = tblOwners[o]["Last Name"];
					var nEmail = tblOwners[o]["Email Address"];
					editAppName(nFirst + " " + nLast + " (" + nEmail + ")");
					updateShortNotes(nFirst + " " + nLast + " (" + nEmail + ")");
					//logDebug("appName: " + nFirst + " " + nLast + " (" + nEmail + ")");
					var ownerSeqNum = addRefContactByEmailLastName(nFirst, nLast,nEmail);
					if(!ownerSeqNum){
						qryPeople.setServiceProviderCode(aa.getServiceProviderCode());
						qryPeople.setContactTypeFlag("Individual");
						qryPeople.setContactType("Individual");
						qryPeople.setFirstName(nFirst);
						qryPeople.setLastName(nLast);
						qryPeople.setEmail(nEmail);
						qryPeople.setAuditStatus("A");
						var resPpl = aa.people.createPeople(qryPeople);
						if(!resPpl.getSuccess()){
							logDebug("Error creating people: " + resPpl.getErrorMessage());
						}else{
							logDebug("Succesfully create ref contact, so adding to record");
							var ownerSeqNumAgain = addRefContactByEmailLastName(nFirst, nLast,nEmail);
							if(!ownerSeqNumAgain){
								logDebug("Error adding ref contact: "+ ownerSeqNumAgain);
							}
						}
					}
					editContactType("Individual", "Owner");
					errMsg += nEmail + br;
					var ownUser = createPublicUserFromContact_Rev("Owner");
					var ownPubUser = ownUser.auditID;
					//lwacht: 171124: make the owner the person who created the record so the applicant
					// cannot see their info;
					editCreatedBy(ownPubUser);
					tblOwners[o]["Status"]="Submitted";
					emailParameters = aa.util.newHashtable();
					var sysDate = aa.date.getCurrentDate();
					var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
					addParameter(emailParameters, "$$AltID$$", capId.getCustomID());
					addParameter(emailParameters, "$$ParentAltID$$", currCapId.getCustomID());
					addParameter(emailParameters, "$$fName$$",""+nFirst);
					addParameter(emailParameters, "$$lName$$",""+nLast);
					addParameter(emailParameters, "$$mmddyy$$", sysDateMMDDYYYY);
					var resCurUser = aa.person.getUser(publicUserID);	
					if(resCurUser.getSuccess()){
						var currUser = resCurUser.getOutput();
						var currUserEmail = ""+currUser.email;
						setContactsSyncFlag("Y");
					}//only send if not the current user 
					if(currUserEmail!=nEmail){
						sendNotification(sysEmail,nEmail,"","LCA_OWNER_APP_NOTIF",emailParameters,null,capId);
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
