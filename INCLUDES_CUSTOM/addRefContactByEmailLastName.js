function addRefContactByEmailLastName(vFirst, vLast, vEmail){
try{
	var userFirst = vFirst;
	var userLast = vLast.toUpperCase();
	var userEmail = ""+vEmail;
	logDebug("userEmail: " + userEmail);
	//Find PeopleModel object for user
	//var peopleResult = aa.people.getPeopleByFMLName(userFirst, userMiddle, userLast);
	var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
	qryPeople.setEmail(userEmail);
	var qryResult = aa.people.getPeopleByPeopleModel(qryPeople);
	if (!qryResult.getSuccess()){ 
		logDebug("WARNING: error searching for people : " + qryResult.getErrorMessage());
		return false;
	}else{
		var peopResult = qryResult.getOutput();
		if (peopResult.length > 0){
			for(p in peopResult){
				var thisPerson = peopResult[p];
				cSeqNbr = thisPerson.getContactSeqNumber();
				caBiz = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.ContactAddressBusiness").getOutput();
				conAddrList = caBiz.getContactAddressListBySingle(aa.getServiceProviderCode(), thisPerson.getContactSeqNumber(), thisPerson.getContactType(), "CONTACT", "A");
				//logDebug("Found " + conAddrList.size() + " addresses");		// List of ContactAddressModel
				
				var pplRes = aa.people.getPeople(cSeqNbr);
				if(pplRes.getSuccess()){
					var thisPpl = pplRes.getOutput();
					thisPpl.setContactAddressList(conAddrList);
					//for(x in thisPpl){
					//	if(typeof(thisPpl[x])!="function"){
					//		logDebug(x+ ": " + thisPpl[x]);
					//	}
					//}
					var thisLName = ""+ thisPpl.getLastName();
					var thisLName = ""+ thisPpl.lastName;
					if(matches(thisLName, null,"","undefined")){
						var thisLName = ""+thisPpl.getResLastName();
					}
					thisLName = thisLName.toUpperCase()
					logDebug("thisLName:" + thisLName);
					logDebug("userLast:" + userLast);
					if(thisLName==userLast){
						var contactAddResult = aa.people.createCapContactWithRefPeopleModel(capId, thisPpl);
						if (contactAddResult.getSuccess()){
							logDebug("Contact successfully added to CAP.");
							var capContactResult = aa.people.getCapContactByCapID(capId);
							if (capContactResult.getSuccess()){
								var Contacts = capContactResult.getOutput();
								var idx = Contacts.length;
								var contactNbr = Contacts[idx-1].getCapContactModel().getPeople().getContactSeqNumber();
								logDebug ("Contact Nbr = "+contactNbr);
								var newContact = Contacts[idx-1].getCapContactModel();
								var newerPeople = newContact.getPeople();	
								return contactNbr;
							}else{
								logDebug("Add Ref Contact error: Failed to get Contact Nbr: "+capContactResult.getErrorMessage());
								//return false;
							}
						}else{
							logDebug("Add Ref Contact error: Cannot add contact: " + contactAddResult.getErrorMessage());
							//return false;
						}
					}else{
						logDebug("Add Ref Contact error: No match on last name : " + thisLName);
						//return false;
					}
				}else{
					logDebug("Error retrieving contact: " + pplRes.getErrorMessage());
				}
			}
		}else{
			logDebug("No reference user found.");
			return false;
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: addRefContactByEmailLastName: " + err.message);
	logDebug(err.stack);
}}
