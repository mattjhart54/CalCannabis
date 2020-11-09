function addASITValueToRecord(subGroupName, tableValuesArray, capID)
{
	//  subGroupName is the name of the ASI table
	//  tableValuesArray is an associative array of values.  All elements must be either a string or asiTableVal object
	capID = capID

	var appSpecTableScript = aa.appSpecificTableScript.getAppSpecificTableModel(capID, subGroupName)
	if (!appSpecTableScript.getSuccess())
	{
		logDebug("**WARNING: error retrieving app specific table " + subGroupName + " " + appSpecTableScript.getErrorMessage());
		return false
	}
	
	appSpecTableScript = appSpecTableScript.getOutput();
	var appSpecTableScriptModel = appSpecTableScript.getAppSpecificTableModel();
	var tableField = appSpecTableScriptModel.getTableField();
	var tableColumns = appSpecTableScriptModel.getColumns();
	var fieldReadOnly = appSpecTableScriptModel.getReadonlyField(); //get ReadOnly property
	var columnInterator = tableColumns.iterator();
	while (columnInterator.hasNext())
	{
		var columnName = columnInterator.next();
		
		if (typeof(tableValuesArray[columnName.getColumnName()]) == "object")
		{
			tableField.add(tableValuesArray[columnName.getColumnName()].fieldValue);
			fieldReadOnly.add(tableValuesArray[columnName.getColumnName()].readOnly);
		} else // we are passed a string
		{
			tableField.add(tableValuesArray[columnName.getColumnName()]);
			fieldReadOnly.add(null);
		}
	}
	
	appSpecTableScriptModel.setTableField(tableField);
	appSpecTableScriptModel.setReadonlyField(fieldReadOnly); // set readonly field
	addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(appSpecTableScriptModel, capID, "BATCHUSER");
	if (!addResult.getSuccess())
	{
		logDebug("**WARNING: error adding record to ASI Table:  " + subGroupName + " " + addResult.getErrorMessage());
		return false
	} else
	{
		logDebug("Successfully added record to ASI Table: " + subGroupName);
		return true;
	}
}