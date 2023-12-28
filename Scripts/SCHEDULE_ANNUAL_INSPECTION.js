var SetMemberArray = aa.env.getValue("SetMemberArray");
var SetId = aa.env.getValue("SetID");
var ScriptName = aa.env.getValue("ScriptName");
var capCount = 0;

logDebug("<<<<<<<<<<Start of Job>>>>>>>>>>>>>>");

mainProcess();

logDebug("<<<<<<<<<<End of Job>>>>>>>>>>>>>>");

function mainProcess() {

	for (var i = 0; i < SetMemberArray.length; i++) {

		var id = SetMemberArray[i];
		capId = aa.cap.getCapID(id.getID1(), id.getID2(), id.getID3()).getOutput();

		if (!capId) {
			logDebug("Could not get a Cap ID for " + id.getID1() + "-" + id.getID2() + "-" + id.getID3());
			continue;
		}
		altId = capId.getCustomID();

		capCount++;

		//get next inspection date
		var inspeDate = null;

		var inspResultObj = aa.inspection.getInspections(capId);
		if (inspResultObj.getSuccess()) {
			inspList = inspResultObj.getOutput();
			inspList.sort(compareInspDateDesc);
			inspeDate = inspList[0].getInspectionDate();
			inspeDate = aa.date.parseDate(addMonthsToDate(convertDate(inspeDate),11));
			scheduledDate = nextWorkingDay(inspeDate);
			scheduleInspection(capId, "Annual Inspection", scheduledDate);
		}else{
			logDebug("Failed to schedule an inspections for "+altId+"!!!!!!!!!");
			continue;
		}
		
	}

	// update set type and status
	setScriptResult = aa.set.getSetByPK(SetId);
	if (setScriptResult.getSuccess()) {
		setScript = setScriptResult.getOutput();
		setScript.setSetStatus("Completed");
		updSet = aa.set.updateSetHeader(setScript).getOutput();
	}

	logDebug("Total Records in set: " + SetMemberArray.length);
	logDebug("Total Records processed: " + capCount);

	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Update Set successful - Schedule Annual Inspection Script");

}

function nextWorkingDay(td) {
	if (!td)
		dDate = new Date();
	else
		dDate = convertDate(td);

	if (!aa.calendar.getNextWorkDay) {
		logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
	} else {
		var dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
	}

	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear(); ;
}

function scheduleInspection(capId, iType, DateToSched) {
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	var currentUserID = aa.env.getValue("CurrentUserID");
	if (currentUserID != null) {
		inspectorObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
	}

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(DateToSched), inspTime, iType, inspComm)

		if (schedRes.getSuccess())
			logDebug("Successfully scheduled inspection : " + iType + " for " + DateToSched);
		else
			logDebug("**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
}

function compareInspDateDesc(a, b) {
	if (a.getScheduledDate() == null)
		false;
	else if (b.getScheduledDate() == null)
		true;
	else
		return (a.getScheduledDate().getEpochMilliseconds() < b.getScheduledDate().getEpochMilliseconds());
}

function convertDate(thisDate) {

	if (typeof(thisDate) == "string") {
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
	}

	if (typeof(thisDate) == "object") {

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
		{
			return thisDate;
		}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime")) {
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
		}

		if (thisDate.getClass().toString().equals("class java.util.Date")) {
			return new Date(thisDate.getTime());
		}

		if (thisDate.getClass().toString().equals("class java.lang.String")) {
			return new Date(String(thisDate));
		}
	}

	if (typeof(thisDate) == "number") {
		return new Date(thisDate); // assume milliseconds
	}

	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

}


function addMonthsToDate(baseDate,pMonths)
{
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