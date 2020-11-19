function loadASITablesBeforeTest() {

	//
	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	//
	//Sometimes "AppSpecificTableGroupModel" is a list
	var cap = aa.cap.getCap(capId).getOutput().getCapModel();
	var gm = cap.getAppSpecificTableGroupModel();
	//var gm = aa.env.getValue("AppSpecificTableGroupModel");

	var gmItem = gm;

	if (gm != null && typeof(gm).size != "undefined" && gm.size() > 0) {
		gmItem = gm.get(0);
	} else {
		gmItem = gm;
	}

	if (null != gmItem && gmItem != "") {
		var ta = gmItem.getTablesMap().values();
		var tai = ta.iterator();
		while (tai.hasNext()) {
			var tsm = tai.next();

			if (tsm.rowIndex.isEmpty())
				continue; // empty table

			var tempObject = new Array();
			var tempArray = new Array();
			var tn = tsm.getTableName();

			var numrows = 0;
			tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

			if (!isNaN(tn.substring(0, 1)))
				tn = "TBL" + tn // prepend with TBL if it starts with a number

					if (!tsm.rowIndex.isEmpty()) {
						var tsmfldi = tsm.getTableField().iterator();
						var tsmcoli = tsm.getColumns().iterator();

						var numrows = 1;
						while (tsmfldi.hasNext()) // cycle through fields
						{
							if (!tsmcoli.hasNext()) // cycle through columns
							{

								var tsmcoli = tsm.getColumns().iterator();
								tempArray.push(tempObject); // end of record
								var tempObject = new Array(); // clear the temp obj
								numrows++;
							}
							var tcol = tsmcoli.next();
							var tval = tsmfldi.next();
							var readOnly = 'N';
							var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
							tempObject[tcol.getColumnName()] = fieldInfo;

						}

						tempArray.push(tempObject); // end of record
					}

					var copyStr = "" + tn + " = tempArray";
			aa.print("ASI Table Array : " + tn + " (" + numrows + " Rows)");
			eval(copyStr); // move to table name
		}
	}
}