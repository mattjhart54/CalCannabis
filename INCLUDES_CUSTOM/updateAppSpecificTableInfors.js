/**
* update ASIT rows data. updateRowsMap format: Map<rowID, Map<columnName, columnValue>>
**/
function updateAppSpecificTableInfors(tableName, capIDModel, updateRowsMap/** Map<rowID, Map<columnName, columnValue>> **/)
{
	if (updateRowsMap == null || updateRowsMap.isEmpty())
	{
		return;
	}
	
	var asitTableScriptModel = aa.appSpecificTableScript.createTableScriptModel();
	var asitTableModel = asitTableScriptModel.getTabelModel();
	var rowList = asitTableModel.getRows();
	asitTableModel.setSubGroup(tableName);
	var rowIdArray = updateRowsMap.keySet().toArray();
	for (var i = 0; i < rowIdArray.length; i++)
	{
		var rowScriptModel = aa.appSpecificTableScript.createRowScriptModel();
		var rowModel = rowScriptModel.getRow();
		rowModel.setFields(updateRowsMap.get(rowIdArray[i]));
		rowModel.setId(rowIdArray[i]);
		rowList.add(rowModel);
	}
	return aa.appSpecificTableScript.updateAppSpecificTableInfors(capIDModel, asitTableModel);
}
