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
	}else{
		var peopResult = qryResult.getOutput();
		if (peopResult.length > 0){
			for(p in peopResult){
				var thisPerson = peopResult[p];
				var pplRes = aa.people.getPeople(thisPerson.getContactSeqNumber());
				if(pplRes.getSuccess()){
					var thisPpl = pplRes.getOutput();
					var thisLName = ""+thisPpl.getResLastName();
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
								return contactNbr;
							}else{
								logDebug("Add Ref Contact error: Failed to get Contact Nbr: "+capContactResult.getErrorMessage());
								return false;
							}
						}else{
							logDebug("Add Ref Contact error: Cannot add contact: " + contactAddResult.getErrorMessage());
							return false;
						}
					}else{
						logDebug("Add Ref Contact error: No match on email: " + vEmail);
						return false;
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
