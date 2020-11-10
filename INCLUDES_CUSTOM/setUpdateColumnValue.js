function setUpdateColumnValue(updateRowsMap/** Map<rowID, Map<columnName, columnValue>> **/, rowID, columnName, columnValue)
{
	var updateFieldsMap = updateRowsMap.get(rowID);
	if (updateFieldsMap == null)
	{
		updateFieldsMap = aa.util.newHashMap();
		updateRowsMap.put(rowID, updateFieldsMap);
	}
	updateFieldsMap.put(columnName, columnValue);
}