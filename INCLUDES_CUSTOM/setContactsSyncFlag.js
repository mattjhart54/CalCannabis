function setContactsSyncFlag(syncFlagValue) {
try {
	var itemCapId = capId;
	if (arguments.length > 1) {
		itemCapId = arguments[1];
	}
	var c = aa.people.getCapContactByCapID(itemCapId).getOutput();
	if (!c) 
		logDebug("No contact found.");
	for (var i in c) {
		var con = c[i];
		var cm = con.getCapContactModel();
		var contactType = con.getPeople().getContactType();
		if (cm) {
			cm.setSyncFlag(syncFlagValue);
			var r = aa.people.updateCapContactSyncFlag(cm);
			if (r.getSuccess()) {
				logDebug("Sync flag for contact " + contactType + " was updated.");
			}else{
				logDebug("**WARNING: Sync flag for contact " + contactType + " was not updated. " + r.getErrorMessage());
			}
		}
	}
}catch (err) {
	logDebug("A JavaScript Error occurred: setContactsSyncFlag: " + err.message);
	logDebug(err.stack);
}
}
