function copySingleASITable(tableName, sourceCapId, targetCapId) {
	logDebug("Copying table " + tableName + " from " + sourceCapId + " to " + targetCapId);
	var tblSource = loadASITable(tableName, sourceCapId);
	if (tblSource) {
		removeASITable(tableName, targetCapId);
		copyASITable(sourceCapId, targetCapId, tableName);
	} else {
		logDebug("**WARNING: Table " + tableName + " not found on " + sourceCapId);
	}
}