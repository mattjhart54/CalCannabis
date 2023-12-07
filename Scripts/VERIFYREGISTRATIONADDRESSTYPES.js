/**
 * Description:
 * VerifyRegistrationAddressTypes.js is an EMSE Script that verifies the user is submitting
 * Mailing, Business, and Home address types during the registrationSubmitBefore event.
 *
 * Notes:
 *
 * Revision History:
 * 2023/04/21     JSHEAR Initial Version
 */

var publicUser = aa.env.getValue("PublicUserModel");
var showMessage = false;
var cancel = false;
var message =	"";	

if (publicUser != null) {
  if (publicUser.getPeoples() != null) {
    var userContacts = publicUser.getPeoples();
    var hasMailingAddress = false;
    var hasBusinessAddress = false;
    var hasPersonalAddress = false;

    for (var i = 0; i < userContacts.size(); i++) {
      var peopleModel = userContacts.get(i);

      if (peopleModel.getContactAddressList() != null) {
        var contactAddressList = peopleModel.getContactAddressList();

        for (var j = 0; j < contactAddressList.size(); j++) {
          var addressModel = contactAddressList.get(j);
          var addressType = addressModel.getAddressType();

          if (addressType == "Mailing") {
            hasMailingAddress = true;
          } else if (addressType == "Business") {
            hasBusinessAddress = true;
          } else if (addressType == "Home") {
            hasPersonalAddress = true;
          }
        }
      }
    }

    if (hasMailingAddress && hasBusinessAddress && hasPersonalAddress) {
      // All required address types are present, allow registration to be submitted
    } else {
      // At least one required address type is missing, prevent registration from being submitted'
		showMessage = true;
		cancel = true;
		comment("Registration cannot be submitted. Please provide all required address types (Mailing, Business, and Home)");
	}
  }
}

function logMessage(dstr)
	{
	message+=dstr + br;
	} 
 
function comment(cstr)
	{
	if (showMessage) logMessage(cstr);
	}

if (cancel) {
	aa.env.setValue("ErrorCode", "-2");
	if (showMessage)
		aa.env.setValue("ErrorMessage", message);
} else {
	aa.env.setValue("ErrorCode", "0");
	if (showMessage)
		aa.env.setValue("ErrorMessage", message);
}
