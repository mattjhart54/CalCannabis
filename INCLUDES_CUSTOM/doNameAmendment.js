function doNameAmendment(co,fn,ln,itemCap) {  // contactObj, name data
	
	if (!matches(fn,null,undefined,"")) co.people.setFirstName(fn);
	if (!matches(ln,null,undefined,"")) co.people.setLastName(ln);

	co.save();
	
	//update the reference contact
	var refContactNum = co.refSeqNumber;
	var contactModelResult = aa.people.getPeople(refContactNum);
	if (contactModelResult.getSuccess()) {
		var contactModel = contactModelResult.getOutput();

		contactModel.setFirstName(fn);
		contactModel.setLastName(ln);
		
		var refUpdateResult = aa.people.editPeople(contactModel);
		if (refUpdateResult.getSuccess()) {
			logDebug("Reference contact " + refContactNum + " updated successfully");
		} else {
			logDebug("Reference contact " + refContactNum + " update failed: " + refUpdateResult.getErrorType() + ":" + refUpdateResult.getErrorMessage());
		}
	} else {
		logDebug("Could not retrieve reference contact: " + contactModelResult.getErrorType() + ":" + contactModelResult.getErrorMessage());
	}
	//Update Public User
	/* var getPublicUserResult = aa.publicUser.getPublicUserByEmail(licCont.email);
	if (getPublicUserResult.getSuccess() && getPublicUserResult.getOutput()) {
		userModel = getPublicUserResult.getOutput();
		userModel.setFirstName(OWNERS[o]["First Name"]);
		userModel.setLastName(OWNERS[o]["Last Name"]);
		aa.publicUser.editPublicUser(userModel);
		logDebug("(contactObj) createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
	} else {
		logDebug("Could not retrieve public User: " + getPublicUserResult.getErrorType() + ":" + getPublicUserResult.getErrorMessage());
	}
	}*/	

}