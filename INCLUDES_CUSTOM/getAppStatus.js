function getAppStatus() {
	var itemCap = capId;
	if (arguments.length == 1) {
		itemCap = arguments[0]; // use cap ID specified in args
	}
	var appStatus = null;
	var capResult = aa.cap.getCap(itemCap);
	if (capResult.getSuccess()) {
		licCap = capResult.getOutput();
		if (licCap != null) {
			appStatus = "" + licCap.getCapStatus();
		}
	} else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;
}