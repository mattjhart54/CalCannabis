function fixDate(dateObj) {
	// object without getClass assumes that this is an Accela Date object
	if (!thisDate.getClass) {
		return new Date(dateObj.getEpochMilliseconds());
	} else {
		logDebug("Date is not an Accela Date object");
		return dateObj;
	}
}