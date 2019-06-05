
function copyContactsByType_rev(pFromCapId, pToCapId, pContactType,pContactEmail)
	{
	//Copies all contacts from pFromCapId to pToCapId
	//where type == pContactType and the contact does not have an end date (is active)
	if (arguments.length == 4) {
		var thisEmail = arguments[3];
		thisEmail = thisEmail.toUpperCase();
	}
	else
		var thisEmail = null;
	if (pToCapId==null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;
	
	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			if(Contacts[yy].getCapContactModel().getContactType() == pContactType && Contacts[yy].getCapContactModel().getEndDate() == null) {
				if(thisEmail == null) {
					var newContact = Contacts[yy].getCapContactModel();
					newContact.setCapID(vToCapId);
					aa.people.createCapContact(newContact);
					copied++;
					logDebug("Copied contact from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
				}
				else {
					if(thisEmail == Contacts[yy].getCapContactModel().getEmail().toUpperCase()) {
						var newContact = Contacts[yy].getCapContactModel();
						newContact.setCapID(vToCapId);
						aa.people.createCapContact(newContact);
						copied++;
						logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID() + " " + thisEmail);
					}
				}
			}
		}
	}
	else {
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage()); 
		return false; 
		}
	return copied;
	} 