function fixDate(dateObj) {
	// date object with getClass assumes that this is an Accela Date object
	if (dateObj.getClass) {
		return new Date(dateObj.getEpochMilliseconds());
	} else {
		logDebug("Date is not an Accela Date object");
		return dateObj;
	}
}