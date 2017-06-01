function addRefContactByNameEmail(vFirst, vMiddle, vLast, vEmail){
try{
	var userFirst = vFirst;
	var userMiddle = vMiddle;
	var userLast = vLast;
	//Find PeopleModel object for user
	var peopleResult = aa.people.getPeopleByFMLName(userFirst, userMiddle, userLast);
	if (peopleResult.getSuccess()){
		var peopleObj = peopleResult.getOutput();
		//logDebug("peopleObj is "+peopleObj.getClass());
		if (peopleObj==null){
			logDebug("No reference user found.");
			return false;
		}
		logDebug("No. of reference contacts found: "+peopleObj.length);
	}else{
		logDebug("Add Ref Contact error: Failed to get reference contact record: " + peopleResult.getErrorMessage());
		return false;
	}
	var cntCnt = -1;
	for(pp in peopleObj){
		logDebug("peopleObj[pp].getEmail(): " + peopleObj[pp].getEmail());
		logDebug("vEmail: " + vEmail);
		if(""+peopleObj[pp].getEmail()==""+vEmail){
			cntCnt = pp;
		}
	}
	if(cntCnt>-1){
		//Add the reference contact record to the current CAP
		var contactAddResult = aa.people.createCapContactWithRefPeopleModel(capId, peopleObj[0]);
		if (contactAddResult.getSuccess())
			{
			logDebug("Contact successfully added to CAP.");
			var capContactResult = aa.people.getCapContactByCapID(capId);
			if (capContactResult.getSuccess())
				{
				var Contacts = capContactResult.getOutput();
				var idx = Contacts.length;
				var contactNbr = Contacts[idx-1].getCapContactModel().getPeople().getContactSeqNumber();
				logDebug ("Contact Nbr = "+contactNbr);
				return contactNbr;
				}
			else
				{
				logDebug("Add Ref Contact error: Failed to get Contact Nbr: "+capContactResult.getErrorMessage());
				return false;
				}
			}
		else
			{
				logDebug("Add Ref Contact error: Cannot add contact: " + contactAddResult.getErrorMessage());
				return false;
			}
	}else{
		logDebug("Add Ref Contact error: No match on email: " + vEmail);
		return false;
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: addRefContactByNameEmail: " + err.message);
	logDebug(err.stack);
}}
