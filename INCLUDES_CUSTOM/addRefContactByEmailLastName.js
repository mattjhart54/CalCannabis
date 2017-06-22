function addRefContactByEmailLastName(vFirst, vLast, vEmail){
try{
	var userFirst = vFirst;
	var userLast = vLast;
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
				var pplRes = aa.people.getPeople(thisPerson.getContactSeqNumber());
				if(pplRes.getSuccess()){
					var thisPpl = pplRes.getOutput();
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
								var addressList = aa.address.getContactAddressListByCapContact(newContact).getOutput();
								if (addressList){
									for (add in addressList){
										var transactionAddress = false;
										contactAddressModel = addressList[add].getContactAddressModel();
										logDebug("addressList: " + contactAddressModel.getEntityType());
										//if (contactAddressModel.getEntityType() == "CAP_CONTACT"){
										if (contactAddressModel.getEntityType() == "CONTACT"){
											transactionAddress = true;
											contactAddressModel.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
										}
										// Commit if transaction contact address
										if(transactionAddress){
											var newPK = new com.accela.orm.model.address.ContactAddressPKModel();
											contactAddressModel.setContactAddressPK(newPK);
											aa.address.createCapContactAddress(capId, contactAddressModel);
										// Commit if reference contact address
										}else{
											// build model
											var Xref = aa.address.createXRefContactAddressModel().getOutput();
											Xref.setContactAddressModel(contactAddressModel);
											Xref.setAddressID(addressList[add].getAddressID());
											Xref.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
											Xref.setEntityType(contactAddressModel.getEntityType());
											Xref.setCapID(capId);
											// commit address
											aa.address.createXRefContactAddress(Xref.getXRefContactAddressModel());
										}
									}
								}
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
