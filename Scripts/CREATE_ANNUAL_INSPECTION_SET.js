logDebug("<<<<<<<<<<<Start of Job>>>>>>>>>>>>>>");
mainProcess();
logDebug("<<<<<<<<<<<End of Job>>>>>>>>>>>>>>");

function mainProcess() {

	var fromDate = addMonthsToCurrentDate(-18);
	var toDate = addMonthsToCurrentDate(-11);  //this is for production
        //var toDate = addMonthsToCurrentDate(1); //this is for testing
	var capArray = new Array();
	var setPrefix = "ANNUAL_INSPECTION";
	var capCount = 0;
	var startDate = new Date();
	var setName = "";
	var serv_prov_code = aa.getServiceProviderCode();
	
	var aadba = aa.proxyInvoker.newInstance("com.accela.aa.datautil.AADBAccessor").getOutput();
	var aadba = aadba.getInstance();
	var rs = aadba.select("SELECT B1_ALT_ID FROM(SELECT ROW_NUMBER() OVER(PARTITION BY T.B1_ALT_ID ORDER BY T.REC_DATE DESC) RN, T.* FROM (SELECT B.B1_ALT_ID,G.G6_STATUS,G.REC_DATE FROM B1PERMIT B,G6ACTION G WHERE B.SERV_PROV_CODE = '"+serv_prov_code+"' AND B.B1_PER_ID1 = G.B1_PER_ID1 AND B.B1_PER_ID2 = g.B1_PER_ID2 AND B.B1_PER_ID3 = G.B1_PER_ID3 AND B1_PER_GROUP = 'Fire' AND B1_PER_TYPE = 'Inspection' AND B1_PER_SUB_TYPE = 'NA' AND B1_PER_CATEGORY= 'NA' AND G.G6_ACT_TYP = 'Annual Inspection' AND G.REC_DATE BETWEEN to_date('"+fromDate+"','yyyy-mm-dd hh24:mi:ss') AND to_date('"+toDate+"','yyyy-mm-dd hh24:mi:ss') AND G.REC_STATUS = 'A') T ) WHERE RN = 1 AND G6_STATUS = 'Passed'", null);	
	if (rs.size() > 0) {
		for (i = 0; i < rs.size(); i++) {
			var tempAltId = rs.get(i)[0];
			capArray.push(tempAltId);
		}
		logDebug("#####Found>>>>"+capArray.length+" records#####");
	}
	else {
		logDebug("###########No records found##########");
	}
	
	for (i = 0; i < capArray.length; i++) 
	{
		altId = capArray[i];
		var masterCap = aa.cap.getCapID(altId).getOutput();
		logDebug("capID>>>>>>>>"+masterCap);
		if (!masterCap) {
			logDebug("Could not get a Cap ID for " + altId);
			continue;
		}

		capCount++;
		// Create Set
		if (setPrefix != "" && capCount == 1) {
			var yy = startDate.getFullYear().toString();
			var mm = (startDate.getMonth() + 1).toString();
			if (mm.length < 2) mm = "0" + mm;
			var dd = startDate.getDate().toString();
			if (dd.length < 2) dd = "0" + dd;
			var hh = startDate.getHours().toString();
			if (hh.length < 2) hh = "0" + hh;
			var mi = startDate.getMinutes().toString();
			if (mi.length < 2) mi = "0" + mi;

			var setName = setPrefix + "_" + yy + mm + dd + hh + mi;
			var setType = "Annual Inspection";
			var setStatus = "Ready to Process";
			setDescription = setPrefix;
			var setCreateResult = aa.set.createSet(setName, setDescription);

			if (setCreateResult.getSuccess())
				logDebug("Set ID " + setName + " created for records processed by this batch job.");
			else
				logDebug("ERROR: Unable to create new Set ID " + setName + " created for CAPs processed by this batch job.");
		}

		var addMemberResult = aa.set.add(setName, masterCap);
		if (addMemberResult.getSuccess()) {
			addMember = addMemberResult.getOutput();
			logDebug(altId + ": Successfully added to the Set: " + setName);
		} else {
			logDebug("Unable not add record: " + altId + " to the Set: " + setName);
		}

	}

	// update set type and status
	setScriptResult = aa.set.getSetByPK(setName);

	if (setScriptResult.getSuccess()) {
		setScript = setScriptResult.getOutput();
		setScript.setRecordSetType(setType);
		setScript.setSetStatus(setStatus);
		logDebug(setScript.getSetStatus());
		updSet = aa.set.updateSetHeader(setScript).getOutput();
	}

	logDebug("Total Records qualified date range: " + capArray.length);
	logDebug("Total Records added to Set " + setName + ": " + capCount);
}

function addMonthsToCurrentDate(pMonths)
{
	baseDate = new Date();
	var day = baseDate.getDate();
	baseDate.setMonth(baseDate.getMonth() + pMonths);
	
	if (baseDate.getDate() < day)
	{
		baseDate.setDate(1);
		baseDate.setDate(baseDate.getDate() - 1);
	}
	
	var mm = (baseDate.getMonth() + 1).toString();
	if (mm.length < 2) mm = "0" + mm;
	var dd = baseDate.getDate().toString();
	if (dd.length < 2) dd = "0" + dd;
	var yy = baseDate.getFullYear().toString();
	
	var hh = baseDate.getHours().toString();
	if (hh.length < 2) hh = "0" + hh;
	var mi = baseDate.getMinutes().toString();
	if (mi.length < 2) mi = "0" + mi;
	var ss = baseDate.getSeconds().toString();
	if (ss.length < 2) ss = "0" + ss;
	
	return (yy + "-" + mm + "-" + dd + " "+ hh + ":" + mi + ":" + ss);
}
function logDebug(dstr) {
	aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
}