/*===========================================
Title: createPublicUserFromContact_Rev
Purpose: sometimes contact type flag is not set, so setting it to 'individual'
Author: Lynda Wacht		
Functional Area : Contacts
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : CDFA_CalCannabis
Parameters:
	optional: Contact Type, default Applicant
============================================== */

function createPublicUserFromContact_Rev(){  // optional: Contact Type, default Applicant
try{
    var contactType = "Applicant";
    var contact;
    var refContactNum;
    var userModel;
    if (arguments.length > 0) contactType = arguments[0]; // use contact type specified

    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				contact = Contacts[yy];
        }
    }
    
    if (!contact)
    { logDebug("Couldn't create public user for " + contactType + ", no such contact"); return false; }

    if (!contact.getEmail())
    { logDebug("Couldn't create public user for " + contactType + ", no email address"); return false; }

	//lwacht: issue with contact type flag, so populating it with 'individual' for our purposes
	if(!matches(contact.getPeople().getContactTypeFlag(), "individual", "organization")){
		contact.getPeople().setContactTypeFlag("individual");
	}
	if (contact.getPeople().getContactTypeFlag().equals("organization"))
	{ logDebug("Couldn't create public user for " + contactType + ", the contact is an organization"); return false; }
	
    // get the reference contact ID.   We will use to connect to the new public user
    refContactNum = contact.getCapContactModel().getRefContactNumber();

    // check to see if public user exists already based on email address
    var getUserResult = aa.publicUser.getPublicUserByEmail(contact.getEmail())
    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
        userModel = getUserResult.getOutput();
        logDebug("CreatePublicUserFromContact: Found an existing public user: " + userModel.getUserID());
	}

    if (!userModel) // create one
    	{
	    logDebug("CreatePublicUserFromContact: creating new user based on email address: " + contact.getEmail()); 
	    var publicUser = aa.publicUser.getPublicUserModel();
	    publicUser.setFirstName(contact.getFirstName());
	    publicUser.setLastName(contact.getLastName());
	    publicUser.setEmail(contact.getEmail());
	    publicUser.setUserID(contact.getEmail());
	    publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
	    publicUser.setAuditID("PublicUser");
	    publicUser.setAuditStatus("A");
	    publicUser.setCellPhone(contact.getCapContactModel().getPeople().getPhone2());

	    var result = aa.publicUser.createPublicUser(publicUser);
	    if (result.getSuccess()) {

		logDebug("Created public user " + contact.getEmail() + "  sucessfully.");
		var userSeqNum = result.getOutput();
		var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

		// create for agency
		aa.publicUser.createPublicUserForAgency(userModel);

		// activate for agency
		var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
			userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(servProvCode,userSeqNum,"ADMIN");

			// reset password
			var resetPasswordResult = aa.publicUser.resetPassword(contact.getEmail());
			if (resetPasswordResult.getSuccess()) {
				var resetPassword = resetPasswordResult.getOutput();
				userModel.setPassword(resetPassword);
				logDebug("Reset password for " + contact.getEmail() + "  sucessfully.");
			} else {
				logDebug("**ERROR: Reset password for  " + contact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
			}

		// send Activate email
		aa.publicUser.sendActivateEmail(userModel, true, true);

		// send another email
		aa.publicUser.sendPasswordEmail(userModel);
	    }
    	else {
    	    logDebug("**Warning creating public user " + contact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
    	}
    }

	//  Now that we have a public user let's connect to the reference contact		
	if (refContactNum)
		{
		logDebug("CreatePublicUserFromContact: Linking this public user with reference contact : " + refContactNum);
		aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refContactNum);
		}
		
	return userModel; // send back the new or existing public user
}catch (err) {
	logDebug("ERROR: A JavaScript Error occurred: createPublicUserFromContact_Rev: " + err.message);
	logDebug(err.stack);
}}
