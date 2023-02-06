/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_ACCELA_FUNCTIONS.js
| Event   : N/A
|
| Usage   : Accela Inc. Developed Master Script Functions.  This file should not be modified.  For custom
			includes make additions and overrides to the INCLUDES_CUSTOM script file.
|
| Notes   : For Application Submit Before see INCLUDES_ACCELA_FUNCTIONS_ASB
|
/------------------------------------------------------------------------------------------------------*/

var INCLUDE_VERSION = "3.1.28";

/*------------------------------------------------------------------------------------------------------/
| <===========Begin Standard Include Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function activateTask(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess) {
				aa.workflow.adjustTask(capId, stepnumber, processID, "Y", "N", null, null)
			} else {
				aa.workflow.adjustTask(capId, stepnumber, "Y", "N", null, null)
			}
			logMessage("Activating Workflow Task: " + wfstr);
			logDebug("Activating Workflow Task: " + wfstr);
		}
	}
}
 
 
function activeLicense(capid)
{
	if (capid == null || aa.util.instanceOfString(capid))
		{
		return false;
	}
	//1. Set status to "Active", and update expired date.
	var result = aa.expiration.activeLicensesByCapID(capid);
	if (result.getSuccess())
		{
		return true;
	} else
		{
		aa.print("ERROR: Failed to activate License with CAP(" + capid + "): " + result.getErrorMessage());
	}
	return false;
}
 
 
function activeTasksCheck() {

	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getActiveFlag().equals("Y"))
			return true;
	}

	return false;
}
 
 

function addAddressCondition(addNum, cType,cStatus,cDesc,cComment,cImpact)
//if addNum is null, condition is added to all addresses on CAP
	{
	if (!addNum)
		{
		var capAddResult = aa.address.getAddressByCapId(capId);
		if (capAddResult.getSuccess())
			{
			var Adds = capAddResult.getOutput();
			for (zz in Adds)
				{
				
				if (Adds[zz].getRefAddressId())
					{
					var addAddCondResult = aa.addressCondition.addAddressCondition(Adds[zz].getRefAddressId(), cType, cDesc, cComment, null, null, cImpact, cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj);

						if (addAddCondResult.getSuccess())
							{
							logDebug("Successfully added condition to reference Address " + Adds[zz].getRefAddressId() + "  (" + cImpact + ") " + cDesc);
							}
						else
							{
							logDebug( "**ERROR: adding condition to reference Address " + Adds[zz].getRefAddressId() + "  (" + cImpact + "): " + addAddCondResult.getErrorMessage());
							}
					}
				}
			}
		}
	else
		{
			var addAddCondResult = aa.addressCondition.addAddressCondition(addNum, cType, cDesc, cComment, null, null, cImpact, cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj);
			
	
		        if (addAddCondResult.getSuccess())
		        	{
				logDebug("Successfully added condition to Address " + addNum + "  (" + cImpact + ") " + cDesc);
				}
			else
				{
				logDebug( "**ERROR: adding condition to Address " + addNum + "  (" + cImpact + "): " + addAddCondResult.getErrorMessage());
				}
		}
	}


 
 
function addAddressDistrict(addrNum, districtValue)
//if addrNum is null, district is is added to all addresses on the Record
	{
	if (!addrNum)
		{
		var capAddrResult = aa.address.getAddressByCapId(capId);
		if (capAddrResult.getSuccess())
			{
			var addrs = capAddrResult.getOutput();
			for (var zz in addrs)
				{
				apdResult = aa.address.addAddressDistrictForDaily(capId.getID1(),capId.getID2(),capId.getID3(),addrs[zz].getAddressId(),districtValue);
				
				if (!apdResult.getSuccess())
					{ logDebug("**ERROR Adding District " + districtValue + " to address #" + addrs[zz].getAddressId() + " : " + apdResult.getErrorMessage()) ; return false ; }
				else
					logDebug("Successfully added district " + districtValue + " to address #" + addrs[zz].getAddressId());

				}
			}
		}
	else
		{
		apdResult = aa.address.addAddressDistrictForDaily(capId.getID1(),capId.getID2(),capId.getID3(),addrNum,districtValue);

		if (!apdResult.getSuccess())
			{ logDebug("**ERROR Adding District " + districtValue + " to address #" + addrNum + " : " + apdResult.getErrorMessage()) ; return false ; }
		else
			logDebug("Successfully added district " + districtValue + " to address #" + addrNum);
		}
	}
 
 

function addAddressStdCondition(addNum,cType,cDesc)
	{

	var foundCondition = false;
	
	cStatus = "Applied";
	if (arguments.length > 3)
		cStatus = arguments[3]; // use condition status in args
		
	if (!aa.capCondition.getStandardConditions)
		{
		logDebug("addAddressStdCondition function is not available in this version of Accela Automation.");
		}
        else
		{
		standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
		for(i = 0; i<standardConditions.length;i++)
			if(standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
			{
			standardCondition = standardConditions[i]; // add the last one found
			
			foundCondition = true;
		
			if (!addNum) // add to all reference address on the current capId
				{
				var capAddResult = aa.address.getAddressByCapId(capId);
				if (capAddResult.getSuccess())
					{
					var Adds = capAddResult.getOutput();
					for (zz in Adds)
						{

						if (Adds[zz].getRefAddressId())
							{
							var addAddCondResult = aa.addressCondition.addAddressCondition(Adds[zz].getRefAddressId(),standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), null,null, standardCondition.getImpactCode(),cStatus,sysDate, null, sysDate, null, systemUserObj, systemUserObj)
			
							if (addAddCondResult.getSuccess())
									{
									logDebug("Successfully added condition to reference Address " + Adds[zz].getRefAddressId() + " " + cDesc);
									}
								else
									{
									logDebug( "**ERROR: adding condition to reference Address " + Adds[zz].getRefAddressId() + " " + addAddCondResult.getErrorMessage());
									}
							}
						}
					}
				}
			else
				{
				var addAddCondResult = aa.addressCondition.addAddressCondition(addNum,standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), null,null, standardCondition.getImpactCode(),cStatus,sysDate, null, sysDate, null, systemUserObj, systemUserObj)

					if (addAddCondResult.getSuccess())
						{
						logDebug("Successfully added condition to Address " + addNum + " " + cDesc);
						}
					else
						{
						logDebug( "**ERROR: adding condition to Address " + addNum + " " + addAddCondResult.getErrorMessage());
						}
				}
			}
		}
		
	if (!foundCondition) logDebug( "**WARNING: couldn't find standard condition for " + cType + " / " + cDesc);
	}

 
 
 function addAdHocTask(adHocProcess, adHocTask, adHocNote)
{
//adHocProcess must be same as one defined in R1SERVER_CONSTANT
//adHocTask must be same as Task Name defined in AdHoc Process
//adHocNote can be variable
//Optional 4 parameters = Assigned to User ID must match an AA user
//Optional 5 parameters = CapID
	var thisCap = capId;
	var thisUser = currentUserID;
	if(arguments.length > 3)
		thisUser = arguments[3]
	if(arguments.length > 4)
		thisCap = arguments[4];
	var userObj = aa.person.getUser(thisUser);
	if (!userObj.getSuccess())
	{
		logDebug("Could not find user to assign to");
		return false;
	}
	var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem()
	taskObj.setProcessCode(adHocProcess);
	taskObj.setTaskDescription(adHocTask);
	taskObj.setDispositionNote(adHocNote);
	taskObj.setProcessID(0);
	taskObj.setAssignmentDate(aa.util.now());
	taskObj.setDueDate(aa.util.now());
	taskObj.setAssignedUser(userObj.getOutput());
	wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
	wf.createAdHocTaskItem(taskObj);
	return true;
}

 
 
function addAllFees(fsched,fperiod,fqty,finvoice) // Adds all fees for a given fee schedule
	{
	var arrFees = aa.finance.getFeeItemList(null,fsched,null).getOutput();
	for (xx in arrFees)
		{
		var feeCod = arrFees[xx].getFeeCod();
		var assessFeeResult = aa.finance.createFeeItem(capId,fsched,feeCod,fperiod,fqty);
		if (assessFeeResult.getSuccess())
			{
			var feeSeq = assessFeeResult.getOutput();
			logMessage("Added Fee " + feeCod + ", Qty " + fqty);
			logDebug("The assessed fee Sequence Number " + feeSeq);
			if (finvoice == "Y")
			{
				feeSeqList.push(feeSeq);
				paymentPeriodList.push(fperiod);
				}
			}
		else
			{
			logDebug( "**ERROR: assessing fee (" + feeCod + "): " + assessFeeResult.getErrorMessage());
			}
		} // for xx
	} // function

 
 
function addAppCondition(cType, cStatus, cDesc, cComment, cImpact, conditionOfApproval) {
	var addCapCondResult;
	if (arguments.length > 5) {
		addCapCondResult = aa.capCondition.addCapCondition(capId, cType, cDesc, cComment, sysDate, null, sysDate, null, null, cImpact, systemUserObj, systemUserObj, cStatus, currentUserID, "A", conditionOfApproval);
	} else {
		addCapCondResult = aa.capCondition.addCapCondition(capId, cType, cDesc, cComment, sysDate, null, sysDate, null, null, cImpact, systemUserObj, systemUserObj, cStatus, currentUserID, "A");
	}

	if (addCapCondResult.getSuccess()) {
		logDebug("Successfully added condition (" + cImpact + ") " + cDesc);
		logDebug("Successfully added condition (" + cImpact + ") " + cDesc);
	} else {
		logDebug("**ERROR: adding condition (" + cImpact + "): " + addCapCondResult.getErrorMessage());
	}
}
 
 
function addASITable(tableName, tableValueArray) // optional capId
{
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
	var itemCap = capId
		if (arguments.length > 2)
			itemCap = arguments[2]; // use cap ID specified in args

		var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

		if (!tssmResult.getSuccess()) {
			logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
			return false
		}

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var fld_readonly = tsm.getReadonlyField(); // get Readonly field

	for (thisrow in tableValueArray) {

		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();

			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}
			
			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				//fld_readonly.add(null);
			} else // we are passed a string
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
				fld_readonly.add(null);
			}
		}

		tsm.setTableField(fld);

		tsm.setReadonlyField(fld_readonly);

	}

	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

	if (!addResult.getSuccess()) {
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
		return false
	} else
		logDebug("Successfully added record to ASI Table: " + tableName);

}
 
 

function addASITable4ACAPageFlow(destinationTableGroupModel, tableName, tableValueArray) // optional capId
{
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
	//

	var itemCap = capId
		if (arguments.length > 3)
			itemCap = arguments[3]; // use cap ID specified in args

		var ta = destinationTableGroupModel.getTablesMap().values();
	var tai = ta.iterator();

	var found = false;
	while (tai.hasNext()) {
		var tsm = tai.next(); // com.accela.aa.aamain.appspectable.AppSpecificTableModel
		if (tsm.getTableName().equals(tableName)) {
			found = true;
			break;
		}
	}

	if (!found) {
		logDebug("cannot update asit for ACA, no matching table name");
		return false;
	}

	var i = -1; // row index counter
	if (tsm.getTableFields() != null) {
		i = 0 - tsm.getTableFields().size()
	}

	for (thisrow in tableValueArray) {
		var fld = aa.util.newArrayList(); // had to do this since it was coming up null.
		var fld_readonly = aa.util.newArrayList(); // had to do this since it was coming up null.
		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();
			
			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}

			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()].fieldValue ? tableValueArray[thisrow][colname.getColumnName()].fieldValue : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
				fld.add(fldToAdd);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);

			} else // we are passed a string
			{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()] ? tableValueArray[thisrow][colname.getColumnName()] : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(false);
				fld.add(fldToAdd);
				fld_readonly.add("N");

			}
		}

		i--;

		if (tsm.getTableFields() == null) {
			tsm.setTableFields(fld);
		} else {
			tsm.getTableFields().addAll(fld);
		}

		if (tsm.getReadonlyField() == null) {
			tsm.setReadonlyField(fld_readonly); // set readonly field
		} else {
			tsm.getReadonlyField().addAll(fld_readonly);
		}
	}

	tssm = tsm;
	return destinationTableGroupModel;
}
 
 

function addContactStdCondition(contSeqNum,cType,cDesc)
	{

	var foundCondition = false;
	var javascriptDate = new Date()
	var javautilDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());

	
	cStatus = "Applied";
	if (arguments.length > 3)
		cStatus = arguments[3]; // use condition status in args
		
	if (!aa.capCondition.getStandardConditions)
		{
		logDebug("addAddressStdCondition function is not available in this version of Accela Automation.");
		}
        else
		{
		standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
		for(i = 0; i<standardConditions.length;i++)
			if(standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
			{
			standardCondition = standardConditions[i]; // add the last one found
			
			foundCondition = true;
		
			if (!contSeqNum) // add to all reference address on the current capId
				{
				var capContactResult = aa.people.getCapContactByCapID(capId);
				if (capContactResult.getSuccess())
					{
					var Contacts = capContactResult.getOutput();
					for (var contactIdx in Contacts)
						{
						var contactNbr = Contacts[contactIdx].getCapContactModel().getPeople().getRefContactNumber();
						if (contactNbr)
							{
							var newCondition = aa.commonCondition.getNewCommonConditionModel().getOutput();
							newCondition.setServiceProviderCode(aa.getServiceProviderCode());
							newCondition.setEntityType("CONTACT");
							newCondition.setEntityID(contactNbr);
							newCondition.setConditionDescription(standardCondition.getConditionDesc());
							newCondition.setConditionGroup(standardCondition.getConditionGroup());
							newCondition.setConditionType(standardCondition.getConditionType());
							newCondition.setConditionComment(standardCondition.getConditionComment());
							newCondition.setImpactCode(standardCondition.getImpactCode());
							newCondition.setConditionStatus(cStatus)
							newCondition.setAuditStatus("A");
							newCondition.setIssuedByUser(systemUserObj);
							newCondition.setIssuedDate(javautilDate);
							newCondition.setEffectDate(javautilDate);
							newCondition.setAuditID(currentUserID);
							var addContactConditionResult = aa.commonCondition.addCommonCondition(newCondition);
							
							if (addContactConditionResult.getSuccess())
								{
								logDebug("Successfully added reference contact (" + contactNbr + ") condition: " + cDesc);
								}
							else
								{
								logDebug( "**ERROR: adding reference contact (" + contactNbr + ") condition: " + addContactConditionResult.getErrorMessage());
								}
							}
						}
					}
				}
			else
				{
				var newCondition = aa.commonCondition.getNewCommonConditionModel().getOutput();
				newCondition.setServiceProviderCode(aa.getServiceProviderCode());
				newCondition.setEntityType("CONTACT");
				newCondition.setEntityID(contSeqNum);
				newCondition.setConditionDescription(standardCondition.getConditionDesc());
				newCondition.setConditionGroup(standardCondition.getConditionGroup());
				newCondition.setConditionType(standardCondition.getConditionType());
				newCondition.setConditionComment(standardCondition.getConditionComment());
				newCondition.setImpactCode(standardCondition.getImpactCode());
				newCondition.setConditionStatus(cStatus)
				newCondition.setAuditStatus("A");
				
				newCondition.setIssuedByUser(systemUserObj);
				newCondition.setIssuedDate(javautilDate);
				newCondition.setEffectDate(javautilDate);
				
				newCondition.setAuditID(currentUserID);
				var addContactConditionResult = aa.commonCondition.addCommonCondition(newCondition);

				if (addContactConditionResult.getSuccess())
					{
					logDebug("Successfully added reference contact (" + contSeqNum + ") condition: " + cDesc);
					}
				else
					{
					logDebug( "**ERROR: adding reference contact (" + contSeqNum + ") condition: " + addContactConditionResult.getErrorMessage());
					}
				}
			}
		}
	if (!foundCondition) logDebug( "**WARNING: couldn't find standard condition for " + cType + " / " + cDesc);
	}
 
 
function addCustomFee(feeSched, feeCode, feeDescr, feeAm, feeAcc, feePeriod) {
    var feeCap = capId;
    if(feePeriod == null){
    	feePeriod="FINAL"
    }

    var newFeeResult = aa.finance.createFeeItem(feeCap, feeSched, feeCode, feePeriod, feeAm);
	if (newFeeResult.getSuccess()) {
	    var feeSeq = newFeeResult.getOutput();
	    var newFee = aa.finance.getFeeItemByPK(feeCap, feeSeq).getOutput().getF4FeeItem();
	         newFee.setFeeDescription(feeDescr);
	    if (feeAcc) newFee.setAccCodeL1(feeAcc);
	
	    var feeObj = aa.finance.editFeeItem(newFee);
	    if(feeObj.getSuccess()){
	    	logDebug("Added Custom Fee " + feeDescr);
	    }
	    else{
	    	logDebug("Error Adding Fee " + feeObj.getErrorMessage())
	    }
	}
	else{
		logDebug("Error Adding Fee " + newFeeResult.getErrorMessage());
	}
}
 
 
function addFee(fcode, fsched, fperiod, fqty, finvoice) // Adds a single fee, optional argument: fCap
{
	// Updated Script will return feeSeq number or null if error encountered (SR5112)
	var feeCap = capId;
	var feeCapMessage = "";
	var feeSeq_L = new Array(); // invoicing fee for CAP in args
	var paymentPeriod_L = new Array(); // invoicing pay periods for CAP in args
	var feeSeq = null;
	if (arguments.length > 5) {
		feeCap = arguments[5]; // use cap ID specified in args
		feeCapMessage = " to specified CAP";
	}

	assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
	if (assessFeeResult.getSuccess()) {
		feeSeq = assessFeeResult.getOutput();
		logMessage("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
		logDebug("The assessed fee Sequence Number " + feeSeq + feeCapMessage);

		if (finvoice == "Y" && arguments.length == 5) // use current CAP
		{
			feeSeqList.push(feeSeq);
			paymentPeriodList.push(fperiod);
		}
		if (finvoice == "Y" && arguments.length > 5) // use CAP in args
		{
			feeSeq_L.push(feeSeq);
			paymentPeriod_L.push(fperiod);
			var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
			if (invoiceResult_L.getSuccess())
				logMessage("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			else
				logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
		}
		updateFeeItemInvoiceFlag(feeSeq, finvoice);
	} else {
		logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
		feeSeq = null;
	}

	return feeSeq;

}
 
 

function addFeeByDate(feeCap, fdate,fcode, fsched, fperiod, fqty, finvoice) // Adds a single fee, optional argument: fCap
{
	// Updated Script will return feeSeq number or null if error encountered (SR5112)
	
	var feeSeq_L = new Array(); // invoicing fee for CAP in args
	var paymentPeriod_L = new Array(); // invoicing pay periods for CAP in args
	var feeSeq = null;
	var feeCapMessage = " to " + feeCap.getCustomID();

	var f = aa.proxyInvoker.newInstance("com.accela.aa.finance.fee.RefFeeBusiness").getOutput();
	if (!f) { logDebug("could not instantiate RefFeeBusiness to determine fee version, exiting addFeeByDate");
	return false;
	}
	
	var vDate = convertDate(fdate);
	
	if (!vDate) { logDebug("could not convert date parameter to javascript date, exiting addFeeByDate");
	return false;
	}
	
	var v = f.getDefaultVersionBySchedule(aa.getServiceProviderCode(),fsched,vDate,"ADMIN");

	if (!v) { logDebug("could not determine default version for fee schedule " + fsched + ", exiting addFeeByDate");
	return false;
	}
	
	assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, v, fcode, fperiod, fqty);
	if (assessFeeResult.getSuccess()) {
		feeSeq = assessFeeResult.getOutput();
		logDebug("Successfully added Fee:" + fcode + ", Qty:" + fqty + " Version:" + v + " Sched: " + fsched + " based on date " + vDate + " " + feeCapMessage + ".  The assessed fee Sequence Number " + feeSeq + feeCapMessage);

		if (finvoice == "Y" && arguments.length == 5) // use current CAP
		{	
			feeSeqList.push(feeSeq);
			paymentPeriodList.push(fperiod);
		}
		if (finvoice == "Y" && arguments.length > 5) // use CAP in args
		{
			feeSeq_L.push(feeSeq);
			paymentPeriod_L.push(fperiod);
			var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
			if (invoiceResult_L.getSuccess())
				logMessage("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			else
				logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
		}
		updateFeeItemInvoiceFlag(feeSeq, finvoice);
	} else {
		logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
		feeSeq = null;
	}

	return feeSeq;

}
 
 

function addFeeWithExtraData(fcode, fsched, fperiod, fqty, finvoice, feeCap, feeComment, UDF1, UDF2) {
    var feeCapMessage = "";
    var feeSeq_L = new Array(); 			// invoicing fee for CAP in args
    var paymentPeriod_L = new Array(); 		// invoicing pay periods for CAP in args

    assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
    if (assessFeeResult.getSuccess()) {
        feeSeq = assessFeeResult.getOutput();
        logMessage("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
        logDebug("The assessed fee Sequence Number " + feeSeq + feeCapMessage);

        fsm = aa.finance.getFeeItemByPK(feeCap, feeSeq).getOutput().getF4FeeItem();

        if (feeComment) fsm.setFeeNotes(feeComment);
        if (UDF1) fsm.setUdf1(UDF1);
        if (UDF2) fsm.setUdf2(UDF2);

        aa.finance.editFeeItem(fsm)


        if (finvoice == "Y" && arguments.length == 5) // use current CAP
        {
            feeSeqList.push(feeSeq);
            paymentPeriodList.push(fperiod);
        }
        if (finvoice == "Y" && arguments.length > 5) // use CAP in args
        {
            feeSeq_L.push(feeSeq);
            paymentPeriod_L.push(fperiod);
            var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
            if (invoiceResult_L.getSuccess())
                logMessage("Invoicing assessed fee items is successful.");
            else
                logDebug("**ERROR: Invoicing the fee items assessed was not successful.  Reason: " + invoiceResult.getErrorMessage());
        }
    }
    else {
        logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
        return null;
    }

    return feeSeq;

}
 
 

function addFeeWithExtraDataByDate(feeCap, fdate, fcode, fsched, fperiod, fqty, finvoice, feeCap, feeComment, UDF1, UDF2) {
	// Updated Script will return feeSeq number or null if error encountered (SR5112)
	
	var feeSeq_L = new Array(); // invoicing fee for CAP in args
	var paymentPeriod_L = new Array(); // invoicing pay periods for CAP in args
	var feeSeq = null;
	var feeCapMessage = " to " + feeCap.getCustomID();

	var f = aa.proxyInvoker.newInstance("com.accela.aa.finance.fee.RefFeeBusiness").getOutput();
	if (!f) { logDebug("could not instantiate RefFeeBusiness to determine fee version, exiting addFeeByDate");
	return false;
	}
	
	var vDate = convertDate(fdate);
	
	if (!vDate) { logDebug("could not convert date parameter to javascript date, exiting addFeeByDate");
	return false;
	}
	
	var v = f.getDefaultVersionBySchedule(aa.getServiceProviderCode(),fsched,vDate,"ADMIN");

	if (!v) { logDebug("could not determine default version for fee schedule " + fsched + ", exiting addFeeByDate");
	return false;
	}
	
    assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
    if (assessFeeResult.getSuccess()) {
        feeSeq = assessFeeResult.getOutput();
		logDebug("Successfully added Fee:" + fcode + ", Qty:" + fqty + " Version:" + v + " Sched: " + fsched + " based on date " + vDate + " " + feeCapMessage + ".  The assessed fee Sequence Number " + feeSeq + feeCapMessage);

        fsm = aa.finance.getFeeItemByPK(feeCap, feeSeq).getOutput().getF4FeeItem();

        if (feeComment) fsm.setFeeNotes(feeComment);
        if (UDF1) fsm.setUdf1(UDF1);
        if (UDF2) fsm.setUdf2(UDF2);

        aa.finance.editFeeItem(fsm)


        if (finvoice == "Y" && arguments.length == 5) // use current CAP
        {
            feeSeqList.push(feeSeq);
            paymentPeriodList.push(fperiod);
        }
        if (finvoice == "Y" && arguments.length > 5) // use CAP in args
        {
            feeSeq_L.push(feeSeq);
            paymentPeriod_L.push(fperiod);
            var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
            if (invoiceResult_L.getSuccess())
                logMessage("Invoicing assessed fee items is successful.");
            else
                logDebug("**ERROR: Invoicing the fee items assessed was not successful.  Reason: " + invoiceResult.getErrorMessage());
        }
    }
    else {
        logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
        return null;
    }

    return feeSeq;

}
 
 
function addGuideSheet(itemCapId,inspectionId,guideSheetName) {
	
	var rgsm = null;
	var r = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.RGuideSheetBusiness").getOutput();
	if (r) {
		rgsm = r.getRGuideSheet(aa.getServiceProviderCode(), guideSheetName);
	}
	
	var g = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
	
	if (rgsm) {
		var gsSequence = g.createGGuideSheet(itemCapId,rgsm,inspectionId,"ADMIN");
		return gsSequence;
		}
	}
		
 
 
function addLicenseCondition(cType,cStatus,cDesc,cComment,cImpact)
	{
	// Optional 6th argument is license number, otherwise add to all CAEs on CAP
	refLicArr = new Array();
	if (arguments.length == 6) // License Number provided
		{
		refLicArr.push(getRefLicenseProf(arguments[5]));
		}
	else // adding to cap lic profs
		{
		var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
		if (capLicenseResult.getSuccess())
			{ var refLicArr = capLicenseResult.getOutput();  }
		else
			{ logDebug("**ERROR: getting lic profs from Cap: " + capLicenseResult.getErrorMessage()); return false; }
		}

	for (var refLic in refLicArr)
		{
		if (arguments.length == 6) // use sequence number
			licSeq = refLicArr[refLic].getLicSeqNbr();
		else
			licSeq = refLicArr[refLic].getLicenseProfessionalModel().getLicSeqNbr();

		if (licSeq >= 0)
			{
			var addCAEResult = aa.caeCondition.addCAECondition(licSeq, cType, cDesc, cComment, null, null, cImpact, cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj)

			if (addCAEResult.getSuccess())
				{
				logDebug("Successfully added licensed professional (" + licSeq + ") condition (" + cImpact + ") " + cDesc);
				}
			else
				{
				logDebug( "**ERROR: adding licensed professional (" + licSeq + ") condition (" + cImpact + "): " + addCAEResult.getErrorMessage());
				}
			}
		else
			logDebug("No reference link to license : " + refLicArr[refLic].getLicenseNbr());
		}
	}
 
 

function addLicenseStdCondition(licSeqNum,cType,cDesc)
	{

	var foundCondition = false;
	
	cStatus = "Applied";
	if (arguments.length > 3)
		cStatus = arguments[3]; // use condition status in args
		
	if (!aa.capCondition.getStandardConditions)
		{
		logDebug("addLicenseStdCondition function is not available in this version of Accela Automation.");
		}
        else
		{
		standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
		for(i = 0; i<standardConditions.length;i++)
			if(standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
			{
			standardCondition = standardConditions[i]; // add the last one found
			
			foundCondition = true;
		
			if (!licSeqNum) // add to all reference licenses on the current capId
				{
				var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
				if (capLicenseResult.getSuccess())
					{ var refLicArr = capLicenseResult.getOutput();  }
				else
					{ logDebug("**ERROR: getting lic profs from Cap: " + capLicenseResult.getErrorMessage()); return false; }

				for (var refLic in refLicArr)
					if (refLicArr[refLic].getLicenseProfessionalModel().getLicSeqNbr())
						{
						licSeq = refLicArr[refLic].getLicenseProfessionalModel().getLicSeqNbr();
						var addCAEResult = aa.caeCondition.addCAECondition(licSeq, standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), null, null, standardCondition.getImpactCode(), cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj);

						if (addCAEResult.getSuccess())
							{
							logDebug("Successfully added licensed professional (" + licSeq + ") condition: " + cDesc);
							}
						else
							{
							logDebug( "**ERROR: adding licensed professional (" + licSeq + ") condition: " + addCAEResult.getErrorMessage());
							}
						}
				}
			else
				{
				var addCAEResult = aa.caeCondition.addCAECondition(licSeqNum, standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), null, null, standardCondition.getImpactCode(), cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj);
				
				if (addCAEResult.getSuccess())
					{
					logDebug("Successfully added licensed professional (" + licSeqNum + ") condition: " + cDesc);
					}
					else
					{
					logDebug( "**ERROR: adding licensed professional (" + licSeqNum + ") condition: " + addCAEResult.getErrorMessage());
					}
				}	
			}
		}
	if (!foundCondition) logDebug( "**WARNING: couldn't find standard condition for " + cType + " / " + cDesc);
	}

 
 
function addLookup(stdChoice,stdValue,stdDesc) 
	{
	//check if stdChoice and stdValue already exist; if they do, don't add
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	if (bizDomScriptResult.getSuccess())
		{
		logDebug("Standard Choices Item "+stdChoice+" and Value "+stdValue+" already exist.  Lookup is not added or updated.");
		return false;
		}

	//Proceed to add
	var strControl;
	
	if (stdChoice != null && stdChoice.length && stdValue != null && stdValue.length && stdDesc != null && stdDesc.length)
		{
		var bizDomScriptResult = aa.bizDomain.createBizDomain(stdChoice, stdValue, "A", stdDesc)

		if (bizDomScriptResult.getSuccess())

			//check if new Std Choice actually created



			logDebug("Successfully created Std Choice(" + stdChoice + "," + stdValue + ") = " + stdDesc);
		else
			logDebug("**ERROR creating Std Choice " + bizDomScriptResult.getErrorMessage());
		}
	else
		logDebug("Could not create std choice, one or more null values");
	}

 
 
 function addParameter(pamaremeters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		pamaremeters.put(key, value);
	}
}
 
 
function addParcelAndOwnerFromRefAddress(refAddress) // optional capID
{

	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args

		// first add the primary parcel
		//
		var primaryParcelResult = aa.parcel.getPrimaryParcelByRefAddressID(refAddress, "Y");
	if (primaryParcelResult.getSuccess())
		var primaryParcel = primaryParcelResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get primary parcel for ref Address " + refAddress + " , " + primaryParcelResult.getErrorMessage());
		return false;
	}

	var capParModel = aa.parcel.warpCapIdParcelModel2CapParcelModel(itemCap, primaryParcel).getOutput()

		var createPMResult = aa.parcel.createCapParcel(capParModel);
	if (createPMResult.getSuccess())
		logDebug("created CAP Parcel");
	else {
		logDebug("**WARNING: Failed to create the cap Parcel " + createPMResult.getErrorMessage());
	}

	// Now the owners
	//

	var parcelListResult = aa.parcel.getParcelDailyByCapID(itemCap, null);
	if (parcelListResult.getSuccess())
		var parcelList = parcelListResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get Parcel List " + parcelListResult.getErrorMessage());
		return false;
	}

	for (var thisP in parcelList) {
		var ownerListResult = aa.owner.getOwnersByParcel(parcelList[thisP]);
		if (ownerListResult.getSuccess())
			var ownerList = ownerListResult.getOutput();
		else {
			logDebug("**ERROR: Failed to get Owner List " + ownerListResult.getErrorMessage());
			return false;
		}

		for (var thisO in ownerList) {
			ownerList[thisO].setCapID(itemCap);
			createOResult = aa.owner.createCapOwnerWithAPOAttribute(ownerList[thisO]);

			if (createOResult.getSuccess())
				logDebug("Created CAP Owner");
			else {
				logDebug("**WARNING: Failed to create CAP Owner " + createOResult.getErrorMessage());
			}
		}
	}
}
 
 
function addParcelCondition(parcelNum, cType,cStatus,cDesc,cComment,cImpact)
//if parcelNum is null, condition is added to all parcels on CAP
	{
	if (!parcelNum)
		{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				logDebug("Adding Condition to parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var addParcelCondResult = aa.parcelCondition.addParcelCondition(Parcels[zz].getParcelNumber(), cType, cDesc, cComment, null, null, cImpact, cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj); 
					if (addParcelCondResult.getSuccess())
					        	{
						logMessage("Successfully added condition to Parcel " + Parcels[zz].getParcelNumber() + "  (" + cImpact + ") " + cDesc);
						logDebug("Successfully added condition to Parcel " + Parcels[zz].getParcelNumber() + "  (" + cImpact + ") " + cDesc);
						}
					else
						{
						logDebug( "**ERROR: adding condition to Parcel " + Parcels[zz].getParcelNumber() + "  (" + cImpact + "): " + addParcelCondResult.getErrorMessage());
						}
				}
			}
		}
	else
		{
			var addParcelCondResult = aa.parcelCondition.addParcelCondition(parcelNum, cType, cDesc, cComment, null, null, cImpact, cStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj); 
	
		        if (addParcelCondResult.getSuccess())
		        	{
				logMessage("Successfully added condition to Parcel " + parcelNum + "  (" + cImpact + ") " + cDesc);
				logDebug("Successfully added condition to Parcel " + parcelNum + "  (" + cImpact + ") " + cDesc);
				}
			else
				{
			logDebug( "**ERROR: adding condition to Parcel " + parcelNum + "  (" + cImpact + "): " + addParcelCondResult.getErrorMessage());
				}
		}
	}

 
 
function addParcelDistrict(parcelNum, districtValue)
//if parcelNum is null, district is is added to all parcels on CAP
	{
	if (!parcelNum)
		{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				apdResult = aa.parcel.addParceDistrictForDaily(capId.getID1(),capId.getID2(),capId.getID3(),Parcels[zz].getParcelNumber(),districtValue);
				
				if (!apdResult.getSuccess())
					{ logDebug("**ERROR Adding District " + districtValue + " to parcel #" + Parcels[zz].getParcelNumber() + " : " + apdResult.getErrorMessage()) ; return false ; }
				else
					logDebug("Successfully added district " + districtValue + " to parcel #" + Parcels[zz].getParcelNumber());

				}
			}
		}
	else
		{
		apdResult = aa.parcel.addParceDistrictForDaily(capId.getID1(),capId.getID2(),capId.getID3(),parcelNum,districtValue);

		if (!apdResult.getSuccess())
			{ logDebug("**ERROR Adding District " + districtValue + " to parcel #" + parcelNum + " : " + apdResult.getErrorMessage()) ; return false ; }
		else
			logDebug("Successfully added district " + districtValue + " to parcel #" + parcelNum);
		}
	}

 
 
function addParent(parentAppNum)
//
// adds the current application to the parent
//
	{
	if (typeof(parentAppNum) != "object")  // is this one an object or string?
		{
		var getCapResult = aa.cap.getCapID(parentAppNum);
		if (getCapResult.getSuccess())
			{
			var parentId = getCapResult.getOutput();
			}
		else
			{ logDebug( "**ERROR: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage());
				return false;}
		}
	else
		{
		parentId = parentAppNum;
		}

	var linkResult = aa.cap.createAppHierarchy(parentId, capId);
	if (linkResult.getSuccess())
		logDebug("Successfully linked to Parent Application : " + parentAppNum);
	else
		logDebug( "**ERROR: linking to parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());

	}

 
 

function addPublicUserLPsToRecord(itemCapId,publicUser)

	{
	var publicUserModelResult = aa.publicUser.getPublicUserByPUser(publicUser);

	if (!publicUserModelResult.getSuccess() || !publicUserModelResult.getOutput())  {
		logDebug("**WARNING** couldn't find public user " + publicUser + " " + publicUserModelResult.getErrorMessage()); return false; }

	var userSeqNum = publicUserModelResult.getOutput().getUserSeqNum();

	var associatedLPResult = aa.licenseScript.getRefLicProfByOnlineUser(userSeqNum);

	if (!associatedLPResult.getSuccess() || !associatedLPResult.getOutput())  {
		logDebug("**WARNING** no associated LPs to publuc user " + publicUser + " " + associatedLPResult.getErrorMessage()); return false; }

	var associatedLPs = associatedLPResult.getOutput();

	for (var x in associatedLPs)
		{
		var lp = associatedLPs[x];
		var attachResult = aa.licenseScript.associateLpWithCap(capId,lp)

		if (!attachResult.getSuccess())  {
			logDebug("**WARNING** failed to associate LP " + lp.getStateLicense + " to Record " + attachResult.getErrorMessage()); }
		else
			logDebug("Associated LP " + lp.getStateLicense() + " to Record " + itemCapId.getCustomID())
		}


	}




 
 
function addrAddCondition(pAddrNum, pType, pStatus, pDesc, pComment, pImpact, pAllowDup)
	{
	//if pAddrNum is null, condition is added to all addresses on CAP
	//06SSP-00223
	//
	if (pAllowDup=="Y")
		var noDup = false;
	else
		var noDup = true;
		
	var condAdded = false;
		
	if (!pAddrNum) //no address num, add condition to all addresses on CAP
		{
		var capAddrResult = aa.address.getAddressByCapId(capId);
		if (capAddrResult.getSuccess())
			{
			var addCondResult;
			var addCondResult2;
			var getCondResult;
			var condArray;
			var addresses = capAddrResult.getOutput();
			
			addCondLoop:  //loop identifier
			for (zz in addresses)
				{
				var addrRefId = addresses[zz].getRefAddressId();
				if (addrRefId==null)
					{
					logDebug("No reference address ID found for Address "+zz);
					continue;
					}
					
				if (noDup) //Check if this address has duplicate condition
					{
					var cType;
					var cStatus;
					var cDesc;
					var cImpact;
					
					getCondResult = aa.addressCondition.getAddressConditions(addrRefId);
					condArray = getCondResult.getOutput();
					if (condArray.length>0)
						{
						for (bb in condArray)
							{
							cType = condArray[bb].getConditionType();
							cStatus = condArray[bb].getConditionStatus();
							cDesc = condArray[bb].getConditionDescription();
							cImpact = condArray[bb].getImpactCode();
							if (cType==null)
								cType = " ";
							if (cStatus==null)
								cStatus = " ";
							if (cDesc==null)
								cDesc = " ";
							if (cImpact==null)
								cImpact = " ";
							if ( (pType==null || pType.toUpperCase()==cType.toUpperCase()) && (pStatus==null || pStatus.toUpperCase()==cStatus.toUpperCase()) && (pDesc==null || pDesc.toUpperCase()==cDesc.toUpperCase()) && (pImpact==null || pImpact.toUpperCase()==cImpact.toUpperCase()) )
								{
								logMessage("Condition already exists: New condition not added to Address ID "+addrRefId);
								logDebug("Condition already exists: New condition not added to Address ID "+addrRefId);
								continue addCondLoop; //continue to next address without adding condition
								}
							}
						}
					}
					
				logDebug("Adding Condition to address " + zz + " = " + addrRefId);
				addCondResult = aa.addressCondition.addAddressCondition(addrRefId, pType, pDesc, pComment, null, null, pImpact, pStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj); 
				if (addCondResult.getSuccess())
					{
					logMessage("Successfully added condition to Address ID " + addrRefId + "  (" + pImpact + ") " + pDesc);
					logDebug("Successfully added condition to Address ID " + addrRefId + "  (" + pImpact + ") " + pDesc);
					condAdded=true;
					}
				else
					{
					logDebug( "**ERROR: adding condition to Address " + addrRefId + "  (" + pImpact + "): " + addCondResult.getErrorMessage());
					}
				}
			}
		}
	else //add condition to specified address only
		{
		if (noDup) //Check if this address has duplicate condition
			{
			var cType;
			var cStatus;
			var cDesc;
			var cImpact;
			
			getCondResult = aa.addressCondition.getAddressConditions(pAddrNum);
			condArray = getCondResult.getOutput();
			if (condArray.length>0)
				{
				for (bb in condArray)
					{
					cType = condArray[bb].getConditionType();
					cStatus = condArray[bb].getConditionStatus();
					cDesc = condArray[bb].getConditionDescription();
					cImpact = condArray[bb].getImpactCode();
					if (cType==null)
						cType = " ";
					if (cStatus==null)
						cStatus = " ";
					if (cDesc==null)
						cDesc = " ";
					if (cImpact==null)
						cImpact = " ";
					if ( (pType==null || pType.toUpperCase()==cType.toUpperCase()) && (pStatus==null || pStatus.toUpperCase()==cStatus.toUpperCase()) && (pDesc==null || pDesc.toUpperCase()==cDesc.toUpperCase()) && (pImpact==null || pImpact.toUpperCase()==cImpact.toUpperCase()) )
						{
						logMessage("Condition already exists: New condition not added to Address ID "+pAddrNum);
						logDebug("Condition already exists: New condition not added to Address ID "+pAddrNum);
						return false;
						}
					}
				}
			}
		var addCondResult = aa.addressCondition.addAddressCondition(pAddrNum, pType, pDesc, pComment, null, null, pImpact, pStatus, sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj); 
	  if (addCondResult.getSuccess())
		  {
			logMessage("Successfully added condition to Address ID " + pAddrNum + "  (" + pImpact + ") " + pDesc);
			logDebug("Successfully added condition to Address ID " + pAddrNum + "  (" + pImpact + ") " + pDesc);
			condAdded=true;
			}
		else
			{
			logDebug( "**ERROR: adding condition to Address " + pAddrNum + "  (" + pImpact + "): " + addCondResult.getErrorMessage());
			}
		}
	return condAdded;
	}

 
 

function addReferenceContactByName(vFirst, vMiddle, vLast)
{
	var userFirst = vFirst;
	var userMiddle = vMiddle;
	var userLast = vLast;

	//Find PeopleModel object for user
	var peopleResult = aa.people.getPeopleByFMLName(userFirst, userMiddle, userLast);
	if (peopleResult.getSuccess())
		{
		var peopleObj = peopleResult.getOutput();
		//logDebug("peopleObj is "+peopleObj.getClass());
		if (peopleObj==null)
			{
			logDebug("No reference user found.");
			return false;
			}
		logDebug("No. of reference contacts found: "+peopleObj.length);
		}
	else
		{
			logDebug("**ERROR: Failed to get reference contact record: " + peopleResult.getErrorMessage());
			return false;
		}

	//Add the reference contact record to the current CAP
	var contactAddResult = aa.people.createCapContactWithRefPeopleModel(capId, peopleObj[0]);
	if (contactAddResult.getSuccess())
		{
		logDebug("Contact successfully added to CAP.");
		var capContactResult = aa.people.getCapContactByCapID(capId);
		if (capContactResult.getSuccess())
			{
			var Contacts = capContactResult.getOutput();
			var idx = Contacts.length;
			var contactNbr = Contacts[idx-1].getCapContactModel().getPeople().getContactSeqNumber();
			logDebug ("Contact Nbr = "+contactNbr);
			return contactNbr;
			}
		else
			{
			logDebug("**ERROR: Failed to get Contact Nbr: "+capContactResult.getErrorMessage());
			return false;
			}
		}
	else
		{
			logDebug("**ERROR: Cannot add contact: " + contactAddResult.getErrorMessage());
			return false;
		}
}
 
 
function addressExistsOnCap() {
	// Optional parameter, cap ID to load from
	//

	var itemCap = capId;
	if (arguments.length == 1)
		itemCap = arguments[0]; // use cap ID specified in args

	var fcapAddressObj = null;
	var capAddResult = aa.address.getAddressByCapId(itemCap);
	if (capAddResult.getSuccess())
		var fcapAddressObj = capAddResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get Address object: " + capAddResult.getErrorType() + ":" + capAddResult.getErrorMessage());
		return false;
	}

	for (i in fcapAddressObj) {
		return true;
	}

	return false;
}
 
 
function addStdCondition(cType, cDesc) // optional cap ID
{

	var itemCap = capId;
	if (arguments.length == 3) {
		itemCap = arguments[2]; // use cap ID specified in args
	}
	if (!aa.capCondition.getStandardConditions) {
		logDebug("addStdCondition function is not available in this version of Accela Automation.");
	} else {
		standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
		for (i = 0; i < standardConditions.length; i++)
			// deactivate strict match for indy
			//if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
			{
				standardCondition = standardConditions[i];

				var addCapCondResult = aa.capCondition.addCapCondition(itemCap, standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), sysDate, null, sysDate, null, null, standardCondition.getImpactCode(), systemUserObj, systemUserObj, "Applied", currentUserID, "A", null, standardCondition.getDisplayConditionNotice(), standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), standardCondition.getLongDescripton(), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), null, null, standardCondition.getConditionNbr(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee(), standardCondition.getPriority(), standardCondition.getConditionOfApproval());

				if (addCapCondResult.getSuccess()) {
					logDebug("Successfully added condition (" + standardCondition.getConditionDesc() + ")");
				} else {
					logDebug("**ERROR: adding condition (" + standardCondition.getConditionDesc() + "): " + addCapCondResult.getErrorMessage());
				}
			}
	}
}
 
 
function addTask(sourceTaskName, newTaskName, insertTaskType) {

	// insertTaskType needs to be "N" or "P" for "Next" or "Parallel"

	var itemCap = capId;
	if (arguments.length > 3)
		itemCap = arguments[3]; // use cap ID specified in args


	if (!insertTaskType.toUpperCase().equals("P") && !insertTaskType.toUpperCase().equals("N")) {
		logDebug("WARNING: Insert Task Type must be P or N");
		return false;
	}

	var sTask;
	var tTask;

	//get the task by the task path
	var taskResult1 = aa.workflow.getTask(itemCap, sourceTaskName);
	if (taskResult1.getSuccess()) {
		tTask = taskResult1.getOutput();
	} else {
		logDebug("WARNING: Failed to get task! Path = " + sourceTaskName + ";" + taskResult1.getErrorMessage());
		return false;
	}

	//change the task name
	tTask.setTaskDescription(newTaskName);

	var taskResult = aa.workflow.insertTask(tTask, insertTaskType);
	if (taskResult.getSuccess()) {
		var processId = tTask.getProcessID();
		var stepNum = tTask.getStepNumber();
		var taskResult1 = aa.workflow.getTask(itemCap, stepNum, processId);

		if (taskResult1.getSuccess()) {
			tTask = taskResult1.getOutput();
			logDebug("add task successful : inserted task name = " + tTask.getTaskDescription() + "; Process name = " + tTask.getProcessCode());
		} else {
			logDebug("WARNING: Failed to get task! Path = " + taskPath + ";" + taskResult1.getErrorMessage());
			return false;
		}

	} else {
		logDebug("WARNING: Failed to add task! Path = " + taskPath + ";" + taskResult.getErrorMessage());
		return false;
	}

	return tTask; // returns task item
} 
 

function addTimeAccountingRecord(taskUser, taGroup, taType, dateLogged, hoursSpent, itemCap, billableBool) {

    if (!aa.timeAccounting.getTimeTypeByTimeTypeName) {
		logDebug("addTimeAccountingRecordToWorkflow function required AA 7.1SP3 or higher."); return false }

    userRight = aa.userright.getUserRight(appTypeArray[0], taskUser).getOutput();

    TimeAccountingResult = aa.timeAccounting.getTimeLogModel();

    if (TimeAccountingResult.getSuccess());
    TimeAccounting = TimeAccountingResult.getOutput();

    var billable = "N";  if (billableBool) billable = "Y";

    TimeAccounting.setAccessModel("N");
    TimeAccounting.setBillable(billable);
    TimeAccounting.setCreatedBy(taskUser);
    TimeAccounting.setCreatedDate(aa.date.getCurrentDate());
    TimeAccounting.setDateLogged(aa.date.parseDate(dateLogged));
    TimeAccounting.setEndTime(null);
    TimeAccounting.setEntryCost(0.0);
    TimeAccounting.setEntryPct(0.0);
    TimeAccounting.setEntryRate(0.0);
    TimeAccounting.setLastChangeDate(aa.date.getCurrentDate());
    TimeAccounting.setLastChangeUser(taskUser);
    TimeAccounting.setMaterials(null);
    TimeAccounting.setMaterialsCost(0.0);
    TimeAccounting.setMilageTotal(0.0);
    TimeAccounting.setMileageEnd(0.0);
    TimeAccounting.setMileageStart(0.0);
    TimeAccounting.setNotation(null);
    if (itemCap)
        TimeAccounting.setReference(itemCap);
    else
        TimeAccounting.setReference("N/A");

    TimeAccounting.setStartTime(null);
    TimeAccounting.setTotalMinutes(60 * hoursSpent);

    var timeElapsedString = "";
    if (hoursSpent.indexOf(".") != -1) {
        var vMinutes = "";
        vMinutes = hoursSpent.substr(hoursSpent.indexOf(".")) * 60;
        vMinutes = vMinutes.toString();
        if (vMinutes.length == 1) vMinutes = "0" + vMinutes;

        timeElapsedString = dateLogged + " " + hoursSpent.substr(0, hoursSpent.indexOf(".")) + ":" + vMinutes + ":00";
    }
    else
    { timeElapsedString = dateLogged + " " + hoursSpent + ":00:00"; }

	var taTypeResult = aa.timeAccounting.getTimeTypeByTimeTypeName(taType);
    if (!taTypeResult.getSuccess() || !taTypeResult.getOutput()) {
            	logDebug("**WARNING: error retrieving Timeaccounting type : " + taType + " : " + taTypeResult.getErrorMessage()); return false;   }
            	

    var taGroupResult = aa.timeAccounting.getTimeGroupByTimeGroupName(taGroup);
    if (!taGroupResult.getSuccess() || !taGroupResult.getOutput()) {
            	logDebug("**WARNING: error retrieving Timeaccounting group : " + taGroup + " : " + taGroupResult.getErrorMessage()); return false;   }

	
    TimeAccounting.setTimeElapsed(aa.date.parseDate(timeElapsedString));
	TimeAccounting.setTimeGroupSeq(taGroupResult.getOutput().getTimeGroupSeq());
    TimeAccounting.setTimeTypeSeq(taTypeResult.getOutput().getTimeTypeSeq());
	TimeAccounting.setUserGroupSeqNbr(userRight.getGroupSeqNumber()); //Required -- User Group Number from user rights
    TimeAccounting.setVehicleId(null);

    addResult = aa.timeAccounting.addTimeLogModel(TimeAccounting);

    if (addResult.getSuccess()) {
        logDebug("Successfully added Time Accounting Record.");
    }
    else {
        logDebug("**ERROR: adding Time Accounting Record: " + addResult.getErrorMessage());
    }
}
 
 

function addTimeAccountingRecordToWorkflow(taskUser, taGroup, taType, dateLogged, hoursSpent, itemCap, taskName, processName, billableBool)
    {
    
    if (!aa.timeAccounting.getTimeTypeByTimeTypeName) {
		logDebug("addTimeAccountingRecordToWorkflow function required AA 7.1SP3 or higher."); return false }

    userRight = aa.userright.getUserRight(appTypeArray[0], taskUser).getOutput();

    TimeAccountingResult = aa.timeAccounting.getTimeLogModel();

    if (TimeAccountingResult.getSuccess());
    TimeAccounting = TimeAccountingResult.getOutput();

    var billable = "N";  if (billableBool) billable = "Y";
    
    TimeAccounting.setAccessModel("N");
    TimeAccounting.setBillable(billable);
    TimeAccounting.setCreatedBy(taskUser);
    TimeAccounting.setCreatedDate(aa.date.getCurrentDate());
    TimeAccounting.setDateLogged(aa.date.parseDate(dateLogged));
    TimeAccounting.setEndTime(null);
    TimeAccounting.setEntryCost(0.0);
    TimeAccounting.setEntryPct(0.0);
    TimeAccounting.setEntryRate(0.0);
    TimeAccounting.setLastChangeDate(aa.date.getCurrentDate());
    TimeAccounting.setLastChangeUser(currentUserID);
    TimeAccounting.setMaterials(null);
    TimeAccounting.setMaterialsCost(0.0);
    TimeAccounting.setMilageTotal(0.0);
    TimeAccounting.setMileageEnd(0.0);
    TimeAccounting.setMileageStart(0.0);
    TimeAccounting.setNotation(null);
    TimeAccounting.setReference(itemCap);
    TimeAccounting.setStartTime(null);
    TimeAccounting.setTotalMinutes(60 * hoursSpent);

    var timeElapsedString = "";
    if (hoursSpent.indexOf(".") != -1) {
        var vMinutes = "";
        vMinutes = hoursSpent.substr(hoursSpent.indexOf(".")) * 60;
        vMinutes = vMinutes.toString();
        if (vMinutes.length == 1) vMinutes = "0" + vMinutes;

        timeElapsedString = dateLogged + " " + hoursSpent.substr(0, hoursSpent.indexOf(".")) + ":" + vMinutes + ":00";
    }
    else
    { timeElapsedString = dateLogged + " " + hoursSpent + ":00:00"; }
    
    
    var taTypeResult = aa.timeAccounting.getTimeTypeByTimeTypeName(taType);
    if (!taTypeResult.getSuccess() || !taTypeResult.getOutput()) {
            	logDebug("**WARNING: error retrieving Timeaccounting type : " + taType + " : " + taTypeResult.getErrorMessage()); return false;   }
            	

    var taGroupResult = aa.timeAccounting.getTimeGroupByTimeGroupName(taGroup);
    if (!taGroupResult.getSuccess() || !taGroupResult.getOutput()) {
            	logDebug("**WARNING: error retrieving Timeaccounting group : " + taGroup + " : " + taGroupResult.getErrorMessage()); return false;   }

    TimeAccounting.setTimeElapsed(aa.date.parseDate(timeElapsedString));
    TimeAccounting.setTimeGroupSeq(taGroupResult.getOutput().getTimeGroupSeq());
    TimeAccounting.setTimeTypeSeq(taTypeResult.getOutput().getTimeTypeSeq());
    
    TimeAccounting.setUserGroupSeqNbr(userRight.getGroupSeqNumber()); //Required -- User Group Number from user rights
    TimeAccounting.setVehicleId(null);

    // find the task
    
    var capTasks = loadTasks(itemCap);
    var TimeLogModel = null;
    
    for (var thisTaskName in capTasks)
    	if (thisTaskName.equals(taskName) && (!processName || capTasks[thisTaskName].process.equals(processName)))
    		{
    		TimeLogModel = TimeAccounting.getTimeLogModel();
    		TimeLogModel.setEntityId(capTasks[thisTaskName].step + ":" + capTasks[thisTaskName].processID);		
		TimeLogModel.setEntityType("WORKFLOW");
    		TimeLogModel.setCapIDModel(itemCap);
    		}		

    if (TimeLogModel)
	{
	addResult = aa.timeAccounting.addTimeLogModel(TimeAccounting);
	if (addResult.getSuccess()) 
		{
        	logDebug("Successfully added Time Accounting Record to task: " + taskName);
    		}
    	else 	
    		{
        	logDebug("**WARNING: error adding Time Accounting Record to task: " + addResult.getErrorMessage());
    		}
    	}
    else
    	{
    	    logDebug("**WARNING: error adding Time Accounting Record: task " + taskName + ", process " + processName + " not found.");
    	}
} 
 

  function addToASITable(tableName,tableValues) // optional capId
  	{
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
  	itemCap = capId
	if (arguments.length > 2)
		itemCap = arguments[2]; // use cap ID specified in args

	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)

	if (!tssmResult.getSuccess())
		{ logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var col = tsm.getColumns();
	var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
	var coli = col.iterator();

	while (coli.hasNext())
		{
		colname = coli.next();

		if (!tableValues[colname.getColumnName()]) {
			logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
			tableValues[colname.getColumnName()] = "";
			}
		
		if (typeof(tableValues[colname.getColumnName()].fieldValue) != "undefined")
			{
			fld.add(tableValues[colname.getColumnName()].fieldValue);
			fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
			}
		else // we are passed a string
			{
			fld.add(tableValues[colname.getColumnName()]);
			fld_readonly.add(null);
			}
		}

	tsm.setTableField(fld);
	tsm.setReadonlyField(fld_readonly); // set readonly field

	addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
	if (!addResult .getSuccess())
		{ logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
	else
		logDebug("Successfully added record to ASI Table: " + tableName);
	}

 
 
function allTasksComplete(stask) // optional tasks to ignore... for Sacramento
	{
	var ignoreArray = new Array();
	for (var i=1; i<arguments.length;i++) 
		ignoreArray.push(arguments[i])

	// returns true if any of the subtasks are active
	var taskResult = aa.workflow.getTasks(capId);
	if (taskResult.getSuccess())
		{ taskArr = taskResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting tasks : " + taskResult.getErrorMessage()); return false }
		
	for (xx in taskArr)
		if (taskArr[xx].getProcessCode().equals(stask) && taskArr[xx].getActiveFlag().equals("Y") && !exists(taskArr[xx].getTaskDescription(),ignoreArray))
			return false;
	return true;
	}

 
 
function appHasCondition(pType,pStatus,pDesc,pImpact)
	{
	// Checks to see if conditions have been added to CAP
	// 06SSP-00223
	//
	if (pType==null)
		var condResult = aa.capCondition.getCapConditions(capId);
	else
		var condResult = aa.capCondition.getCapConditions(capId,pType);
		
	if (condResult.getSuccess())
		var capConds = condResult.getOutput();
	else
		{ 
		logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		return false;
		}
	
	var cStatus;
	var cDesc;
	var cImpact;
	
	for (cc in capConds)
		{
		var thisCond = capConds[cc];
		var cStatus = thisCond.getConditionStatus();
		var cDesc = thisCond.getConditionDescription();
		var cImpact = thisCond.getImpactCode();
		var cType = thisCond.getConditionType();
		if (cStatus==null)
			cStatus = " ";
		if (cDesc==null)
			cDesc = " ";
		if (cImpact==null)
			cImpact = " ";
		//Look for matching condition
		
		if ( (pStatus==null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc==null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact==null || pImpact.toUpperCase().equals(cImpact.toUpperCase())))
			return true; //matching condition found
		}
	return false; //no matching condition found
	} //function
	
 
 


function applyPayments() {
	var payResult = aa.finance.getPaymentByCapID(capId, null)

		if (!payResult.getSuccess()) {
			logDebug("**ERROR: error retrieving payments " + payResult.getErrorMessage());
			return false
		}

		var payments = payResult.getOutput();

	for (var paynum in payments) {
		var payment = payments[paynum];

		var payBalance = payment.getAmountNotAllocated();
		var payStatus = payment.getPaymentStatus();

		if (payBalance <= 0)
			continue; // nothing to allocate

		if (payStatus != "Paid")
			continue; // not in paid status

		var feeResult = aa.finance.getFeeItemByCapID(capId);

		if (!feeResult.getSuccess()) {
			logDebug("**ERROR: error retrieving fee items " + feeResult.getErrorMessage());
			return false
		}

		var feeArray = feeResult.getOutput();

		for (var feeNumber in feeArray) {

			var feeItem = feeArray[feeNumber];
			var amtPaid = 0;
			var pfResult = aa.finance.getPaymentFeeItems(capId, null);

			if (feeItem.getFeeitemStatus() != "INVOICED")
				continue; // only apply to invoiced fees

			if (!pfResult.getSuccess()) {
				logDebug("**ERROR: error retrieving fee payment items items " + pfResult.getErrorMessage());
				return false
			}

			var pfObj = pfResult.getOutput();

			for (ij in pfObj)
				if (feeItem.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
					amtPaid += pfObj[ij].getFeeAllocation()

					var feeBalance = feeItem.getFee() - amtPaid;

			if (feeBalance <= 0)
				continue; // this fee has no balance

			var fseqlist = new Array();
			var finvlist = new Array();
			var fpaylist = new Array();

			var invoiceResult = aa.finance.getFeeItemInvoiceByFeeNbr(capId, feeItem.getFeeSeqNbr(), null);

			if (!invoiceResult.getSuccess()) {
				logDebug("**ERROR: error retrieving invoice items " + invoiceResult.getErrorMessage());
				return false
			}

			var invoiceItem = invoiceResult.getOutput();

			// Should return only one invoice number per fee item

			if (invoiceItem.length != 1) {
				logDebug("**WARNING: fee item " + feeItem.getFeeSeqNbr() + " returned " + invoiceItem.length + " invoice matches")
			} else {
				fseqlist.push(feeItem.getFeeSeqNbr());
				finvlist.push(invoiceItem[0].getInvoiceNbr());

				if (feeBalance > payBalance)
					fpaylist.push(payBalance);
				else
					fpaylist.push(feeBalance);

				applyResult = aa.finance.applyPayment(capId, payment, fseqlist, finvlist, fpaylist, "NA", "NA", "0");

				if (applyResult.getSuccess()) {
					payBalance = payBalance - fpaylist[0];
					logDebug("Applied $" + fpaylist[0] + " to fee code " + feeItem.getFeeCod() + ".  Payment Balance: $" + payBalance);
				} else {
					logDebug("**ERROR: error applying payment " + applyResult.getErrorMessage());
					return false
				}
			}

			if (payBalance <= 0)
				break;
		}
	}
}
 
 
function appMatch(ats) // optional capId or CapID string
	{
	var matchArray = appTypeArray //default to current app
	if (arguments.length == 2) 
		{
		matchCapParm = arguments[1]
		if (typeof(matchCapParm) == "string")
			matchCapId = aa.cap.getCapID(matchCapParm).getOutput();   // Cap ID to check
		else
			matchCapId = matchCapParm;
		if (!matchCapId)
			{
			logDebug("**WARNING: CapId passed to appMatch was not valid: " + arguments[1]);
			return false
			}
		matchCap = aa.cap.getCap(matchCapId).getOutput();
		matchArray = matchCap.getCapType().toString().split("/");
		}
		
	var isMatch = true;
	var ata = ats.split("/");
	if (ata.length != 4)
		logDebug("**ERROR in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
	else
		for (xx in ata)
			if (!ata[xx].equals(matchArray[xx]) && !ata[xx].equals("*"))
				isMatch = false;
	return isMatch;
	}	


 
 
function appNameIsUnique(gaGroup,gaType,gaName)
//
// returns true if gaName application name has not been used in CAPs of gaGroup and gaType
// Bypasses current CAP
	{
	var getCapResult = aa.cap.getByAppType(gaGroup,gaType);
	if (getCapResult.getSuccess())
		var apsArray = getCapResult.getOutput();
	else
		{ logDebug( "**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()) ; return null }
		
	for (aps in apsArray)
		{
		var myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
		if (myCap.getSpecialText())
			if (myCap.getSpecialText().toUpperCase().equals(gaName.toUpperCase()) && !capIDString.equals(apsArray[aps].getCapID().getCustomID()))
				return false;
		}
	return true;
	}

 
 

function asiTableValObj(columnName, fieldValue, readOnly) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;
	this.readOnly = readOnly;
	this.hasValue = Boolean(fieldValue != null & fieldValue != "");

	asiTableValObj.prototype.toString=function(){ return this.hasValue ? String(this.fieldValue) : String(""); }
}; 
 

function assignCap(assignId) // option CapId
	{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	iNameResult  = aa.person.getUser(assignId);

	if (!iNameResult.getSuccess())
		{ logDebug("**ERROR retrieving  user model " + assignId + " : " + iNameResult.getErrorMessage()) ; return false ; }

	iName = iNameResult.getOutput();

	cd.setAsgnDept(iName.getDeptOfUser());
	cd.setAsgnStaff(assignId);

	cdWrite = aa.cap.editCapDetail(cd)

	if (cdWrite.getSuccess())
		{ logDebug("Assigned CAP to " + assignId) }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	}

 
 
function assignInspection(iNumber, iName) {
	// optional capId
	// updates the inspection and assigns to a new user
	// requires the inspection id and the user name
	// V2 8/3/2011.  If user name not found, looks for the department instead
	//

	var itemCap = capId
		if (arguments.length > 2)
			itemCap = arguments[2]; // use cap ID specified in args

		iObjResult = aa.inspection.getInspection(itemCap, iNumber);
	if (!iObjResult.getSuccess()) {
		logDebug("**WARNING retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage());
		return false;
	}

	iObj = iObjResult.getOutput();

	iInspector = aa.person.getUser(iName).getOutput();

	if (!iInspector) // must be a department name?
	{
		var dpt = aa.people.getDepartmentList(null).getOutput();
		for (var thisdpt in dpt) {
			var m = dpt[thisdpt]
				if (iName.equals(m.getDeptName())) {
					iNameResult = aa.person.getUser(null, null, null, null, m.getAgencyCode(), m.getBureauCode(), m.getDivisionCode(), m.getSectionCode(), m.getGroupCode(), m.getOfficeCode());

					if (!iNameResult.getSuccess()) {
						logDebug("**WARNING retrieving department user model " + iName + " : " + iNameResult.getErrorMessage());
						return false;
					}

					iInspector = iNameResult.getOutput();
				}
		}
	}

	if (!iInspector) {
		logDebug("**WARNING could not find inspector or department: " + iName + ", no assignment was made");
		return false;
	}

	logDebug("assigning inspection " + iNumber + " to " + iName);

	iObj.setInspector(iInspector);

	if (iObj.getScheduledDate() == null) {
		iObj.setScheduledDate(sysDate);
	}

	aa.inspection.editInspection(iObj)
}
 
 
function assignTask(wfstr,username) // optional process name
	{
	// Assigns the task to a user.  No audit.
	//
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) 
		{
		processName = arguments[2]; // subprocess
		useProcess = true;
		}
		
	var taskUserResult = aa.person.getUser(username);
	if (taskUserResult.getSuccess())
		taskUserObj = taskUserResult.getOutput();  //  User Object
	else
		{ logMessage("**ERROR: Failed to get user object: " + taskUserResult.getErrorMessage()); return false; }
		
	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
   		var fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			fTask.setAssignedUser(taskUserObj);
			var taskItem = fTask.getTaskItem();
			var adjustResult = aa.workflow.assignTask(taskItem);
			
			logMessage("Assigned Workflow Task: " + wfstr + " to " + username);
			logDebug("Assigned Workflow Task: " + wfstr + " to " + username);
			}			
		}
	}

 
 
function associateRefContactAddressToRecordContact(itemCap,cSeqNumber,rConAddrModel) {

	if (itemCap && cSeqNumber && rConAddrModel) {
		var xRefContactAddress = aa.address.createXRefContactAddressModel().getOutput();
		xRefContactAddress.setCapID(itemCap);
		xRefContactAddress.setAddressID(rConAddrModel.getAddressID());
		// Set the daily contact id to xRefContactAddress model
		xRefContactAddress.setEntityID(aa.util.parseLong(cSeqNumber));
		xRefContactAddress.setEntityType(rConAddrModel.getEntityType());
		// Create
		var xrefResult = aa.address.createXRefContactAddress(xRefContactAddress.getXRefContactAddressModel());

		if (xrefResult.getSuccess) {
			logDebug("Successfully assocaited reference contact address to cap contact: " + cSeqNumber);
			return true;
		} else {
			logDebug("Failed to associate reference contact address to cap: " + xrefResult.getErrorMessage());
			return false;
		}

	} else {
		logDebug("Could not associate reference contact address no address model, capId or cap contact sequence number");
		return false;		
	}

} 
 
function autoAssignInspection(iNumber)
	{
	// updates the inspection and assigns to a new user
	// requires the inspection id
	//

	iObjResult = aa.inspection.getInspection(capId,iNumber);
	if (!iObjResult.getSuccess())
		{ logDebug("**ERROR retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage()) ; return false ; }
	
	iObj = iObjResult.getOutput();


	inspTypeResult = aa.inspection.getInspectionType(iObj.getInspection().getInspectionGroup(), iObj.getInspectionType())

	if (!inspTypeResult.getSuccess())
		{ logDebug("**ERROR retrieving inspection Type " + inspTypeResult.getErrorMessage()) ; return false ; }
	
	inspTypeArr = inspTypeResult.getOutput();

        if (inspTypeArr == null || inspTypeArr.length == 0)
		{ logDebug("**ERROR no inspection type found") ; return false ; }

	inspType = inspTypeArr[0]; // assume first

	inspSeq = inspType.getSequenceNumber();

	inspSchedDate = iObj.getScheduledDate().getYear() + "-" + iObj.getScheduledDate().getMonth() + "-" + iObj.getScheduledDate().getDayOfMonth()

 	logDebug(inspSchedDate)

	iout =  aa.inspection.autoAssignInspector(capId.getID1(),capId.getID2(),capId.getID3(), inspSeq, inspSchedDate)

	if (!iout.getSuccess())
		{ logDebug("**ERROR retrieving auto assign inspector " + iout.getErrorMessage()) ; return false ; }

	inspectorArr = iout.getOutput();

	if (inspectorArr == null || inspectorArr.length == 0)
		{ logDebug("**WARNING no auto-assign inspector found") ; return false ; }
	
	inspectorObj = inspectorArr[0];  // assume first
	
	iObj.setInspector(inspectorObj);

	assignResult = aa.inspection.editInspection(iObj)

	if (!assignResult.getSuccess())
		{ logDebug("**ERROR re-assigning inspection " + assignResult.getErrorMessage()) ; return false ; }
	else
		logDebug("Successfully reassigned inspection " + iObj.getInspectionType() + " to user " + inspectorObj.getUserID());

	}
 
 
function branch(stdChoice)
	{
	doStandardChoiceActions(stdChoice,true,0);
	}

 
 
function branchTask(wfstr,wfstat,wfcomment,wfnote) // optional process name
	{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 5) 
		{
		processName = arguments[4]; // subprocess
		useProcess = true;
		}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	if (!wfstat) wfstat = "NA";
	
	for (i in wfObj)
		{
   		var fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess)
				aa.workflow.handleDisposition(capId,stepnumber,processID,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"B");
			else
				aa.workflow.handleDisposition(capId,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"B");
			
			logMessage("Closing Workflow Task: " + wfstr + " with status " + wfstat + ", Branching...");
			logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat + ", Branching...");
			}			
		}
	}

 
 
function callWebService(wsSubScript, wsScriptParameters)
	{

		aa.env.setValue("wsScriptParameters",wsScriptParameters);
		aa.env.setValue("wsScriptDebug","");
		aa.env.setValue("wsScriptMessage","");
		
		var sSubDebug = "";
		var sSubMessage = "";
		
		logDebug("Executing Web Service wsSubScript: " + wsSubScript);
		aa.runScriptInNewTransaction(wsSubScript);
		sSubDebug = aa.env.getValue("wsScriptDebug");
		sSubMessage = aa.env.getValue("wsScriptMessage");
		if (sSubDebug != "")
		{
			//Logging
			logDebug("Debug from wsSubScript: " + wsSubScript);
			logDebug(sSubDebug);
		}
		if (sSubMessage != "")
		{
			//Logging
			logDebug("Message from wsSubScript: " + wsSubScript);
			logDebug(sSubMessage);
		}
		
	} 
 
function capHasExpiredLicProf(pDateType, pLicType, pCapId)
	{
	//Checks if any licensed professional of specified type (optional) on CAP has expired,  Expiration date type specified by pDateType.
	//If any have expired, displays message and returns true.  If expiration date is on or before current date, it is expired.
	//If any date is blank, script assumes that date has not expired.
	//Uses functions: refLicProfGetDate, jsDateToMMDDYYYY(), matches()
	//SR5054B
	
	//Validate parameters
	var vDateType;
	if ( pDateType==null || pDateType=="" )
		{
		logDebug ("Invalid expiration type parameter");
		return false;
		}
	else
		{
		vDateType = pDateType.toUpperCase();
		if ( !matches(vDateType, "EXPIRE","INSURANCE","BUSINESS") )
			{
			logDebug ("Invalid expiration type parameter");
			return false;
			}
		}
	var vCapId = pCapId;
	if ( pCapId==null || pCapId=="" ) //If no capid parameter, use current cap
		vCapId = capId;
	
	//get Licensed Profs on CAP
	var licProfResult = aa.licenseScript.getLicenseProf(capId);
	if (!licProfResult.getSuccess())
		{
		logDebug("Error getting CAP's license professional: " +licProfResult.getErrorMessage());
		return false;
		}
	var vToday = new Date();
	var vExpired = false;
	var licProfList = licProfResult.getOutput();
	if (licProfList)
		{
		for (i in licProfList)
			{
			if ( pLicType==null || pLicType=="" || pLicType.equals(licProfList[i].getLicenseType()) )
				{
				var licNum = licProfList[i].getLicenseNbr();
				
				//Check if has expired
				var vResult = refLicProfGetDate(licNum, vDateType);

				if (vResult < vToday)
					{
					vExpired = true;
					logMessage("WARNING: Licence # "+licNum+" expired on "+jsDateToMMDDYYYY(vResult));
					logDebug("Licence # "+licNum+" expired on "+jsDateToMMDDYYYY(vResult));
					}			
				}
			}
		}
	else
		{
		logDebug("No licensed professionals found on CAP");
		return false;
		}
	return vExpired;
	} 
 
function capIdsFilterByFileDate(pCapIdArray, pStartDate, pEndDate)
	{
	//Filters CAP's in pCapIdArray by file date, and returns only CAP's whose file date falls within pStartDate and pEndDate, as a capId Array
	//Parameter pCapIdArray must be array of capId's (CapIDModel objects)
	//07SSP-00034/SP5015
	
	if (pCapIdArray.length==0 || pCapIdArray[0]==undefined)
		{
		logDebug("Invalid 1st parameter");
		return false;
		}

	var filteredArray = new Array();
	var startDate = new Date(pStartDate);
	var endDate = new Date(pEndDate);
	var relcap;
	var fileDate;
	
	logDebug("Filtering CAP array by file date between "+pStartDate+" and "+pEndDate);
	for (y in pCapIdArray)
		{
		relcap = aa.cap.getCap(pCapIdArray[y]).getOutput(); //returns CapScriptModel object
		fileDate = convertDate(relcap.getFileDate()); //returns javascript date
		//logDebug("CAP: "+pCapIdArray[y]+", File Date: "+fileDate);
		if (fileDate >= startDate && fileDate <= endDate)
			filteredArray.push(pCapIdArray[y]); //add cap to array
		}
	
	return filteredArray;
	} 
 
function capIdsGetByAddr() {
	//Gets CAPs with the same address as the current CAP, as capId (CapIDModel) object array (array includes current capId)
	//07SSP-00034/SP5015
	//

	//Get address(es) on current CAP
	var addrResult = aa.address.getAddressByCapId(capId);
	if (!addrResult.getSuccess()) {
		logDebug("**ERROR: getting CAP addresses: " + addrResult.getErrorMessage());
		return false;
	}

	var addrArray = new Array();
	var addrArray = addrResult.getOutput();
	if (addrArray.length == 0 || addrArray == undefined) {
		logDebug("The current CAP has no address.  Unable to get CAPs with the same address.")
		return false;
	}

	//use 1st address for comparison
	var streetName = addrArray[0].getStreetName();
	var hseNum = addrArray[0].getHouseNumberStart();
	var streetSuffix = addrArray[0].getStreetSuffix();
	var zip = addrArray[0].getZip();
	var streetDir = addrArray[0].getStreetDirection();

	if (streetDir == "")
		streetDir = null;
	if (streetSuffix == "")
		streetSuffix = null;
	if (zip == "")
		zip = null;

	if (hseNum && !isNaN(hseNum)) {
		hseNum = parseInt(hseNum);
	} else {
		hseNum = null;
	}

	// get caps with same address
	var capAddResult = aa.cap.getCapListByDetailAddress(streetName, hseNum, streetSuffix, zip, streetDir, null);
	if (capAddResult.getSuccess())
		var capArray = capAddResult.getOutput();
	else {
		logDebug("**ERROR: getting similar addresses: " + capAddResult.getErrorMessage());
		return false;
	}

	var capIdArray = new Array();
	//convert CapIDScriptModel objects to CapIDModel objects
	for (i in capArray)
		capIdArray.push(capArray[i].getCapID());

	if (capIdArray)
		return (capIdArray);
	else
		return false;
} 
 
function capIdsGetByParcel(pParcelNum)
	{
	//Gets CAPs that have parcel pParcelNum, as capId (CapIDModel object)  array (array includes current capId)
	//if parameter pParcelNum is null, uses 1st parcel on current CAP
	//07SSP-00034/SP5015
	//
	if (pParcelNum != null)
		var parcelNum = pParcelNum;
	else
		{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (!capParcelResult.getSuccess())
			{
			logDebug("**ERROR: Failed to get parcels: " + capParcelResult.getErrorMessage()); 
			return false; 
			}
			
		var Parcels = capParcelResult.getOutput().toArray();
		if (Parcels[0]==undefined)
			{
			logDebug("Current CAP has no parcel");
			return false;
			}
		var parcelNum = Parcels[0].getParcelNumber();
		}
		
	capParcelResult = aa.cap.getCapListByParcelID(parcelNum, aa.util.newQueryFormat());
	
	if (!capParcelResult.getSuccess())
		{
		logDebug("**ERROR: Failed to get parcels: " + capParcelResult.getErrorMessage()); 
		return false; 
		}
	
	var capParArray = capParcelResult.getOutput();
	var capIdParArray = new Array();
	//convert CapIDScriptModel objects to CapIDModel objects
	for (i in capParArray)
		capIdParArray.push(capParArray[i].getCapID());
		
	if (capIdParArray)
		return capIdParArray;
	else
		return false;
	}
		
	 
 
function capSet(desiredSetId)
    {
    this.refresh = function()
        {

        var theSet = aa.set.getSetByPK(this.id).getOutput();
		this.status = theSet.getSetStatus();
        this.setId = theSet.getSetID();
        this.name = theSet.getSetTitle();
        this.comment = theSet.getSetComment();
		this.model = theSet.getSetHeaderModel();
		this.statusComment = theSet.getSetStatusComment();

        var memberResult = aa.set.getCAPSetMembersByPK(this.id);

        if (!memberResult.getSuccess()) { logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage()); }
        else
            {
            this.members = memberResult.getOutput().toArray();
            this.size = this.members.length;
            if (this.members.length > 0) this.empty = false;
            logDebug("capSet: loaded set " + this.id + " of status " + this.status + " with " + this.size + " records");
            }
        }
        
    this.add = function(addCapId) 
        {
        var setMemberStatus;
        if (arguments.length == 2)  setMemberStatus = arguments[1]; 
            
        var addResult = aa.set.add(this.id,addCapId);
		
		if (setMemberStatus) this.updateMemberStatus(addCapId,setMemberStatus);
		
        }
    
	this.updateMemberStatus = function(addCapId,setMemberStatus) {
	
		// Update a SetMember Status for a Record in SetMember List.

        var setUpdateScript = aa.set.getSetDetailsScriptModel().getOutput();
        setUpdateScript.setSetID(this.id);          //Set ID
        setUpdateScript.setID1(addCapId.getID1());
        setUpdateScript.setID2(addCapId.getID2());
        setUpdateScript.setID3(addCapId.getID3());
        setUpdateScript.setSetMemberStatus(setMemberStatus); 
        setUpdateScript.setSetMemberStatusDate(aa.date.getCurrentDate());  
        setUpdateScript.setServiceProviderCode(aa.getServiceProviderCode());

        var addResult = aa.set.updateSetMemberStatus(setUpdateScript);
        
        if (!addResult.getSuccess()) 
            { 
            logDebug("**WARNING** error adding record to set " + this.id + " : " + addResult.getErrorMessage() );
            }
        else 
            { 
            logDebug("capSet: updated record " + addCapId + " to status " + setMemberStatus);
            }
	}			
	
	
    this.remove = function(removeCapId) 
        {
        var removeResult = aa.set.removeSetHeadersListByCap(this.id,removeCapId)
        if (!removeResult.getSuccess()) 
            { 
            logDebug("**WARNING** error removing record from set " + this.id + " : " + removeResult.getErrorMessage() );
            }
        else 
            { 
            logDebug("capSet: removed record " + removeCapId + " from set " + this.id);
            }
        }
    
    this.update = function() 
        {
		var sh = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.SetBusiness").getOutput();
		this.model.setSetStatus(this.status)
        this.model.setSetID(this.setId);
        this.model.setSetTitle(this.name);
		this.model.setSetComment(this.comment);
		this.model.setSetStatusComment(this.statusComment);
		this.model.setRecordSetType(this.type);
		
		logDebug("capSet: updating set header information");
		try {
			updateResult = sh.updateSetBySetID(this.model);
			}
		catch(err) {
            logDebug("**WARNING** error updating set header failed " + err.message);
            }

        }
    
    this.id = desiredSetId;
    this.name = desiredSetId;
    this.type = null;
	this.comment = null;
    
	if (arguments.length > 1 && arguments[1]) this.name = arguments[1];
	if (arguments.length > 2 && arguments[2]) this.type = arguments[2];
    if (arguments.length > 3 && arguments[3]) this.comment = arguments[3];
    
    this.size = 0;
    this.empty = true;
    this.members = new Array();
    this.status = "";
	this.statusComment = "";
	this.model = null;
	
    var theSetResult = aa.set.getSetByPK(this.id);
    
    if (theSetResult.getSuccess())
        {
        this.refresh();
        }
        
    else  // add the set
        {
        theSetResult = aa.set.createSet(this.id,this.name,this.type,this.comment);
        if (!theSetResult.getSuccess()) 
            {
            logDebug("**WARNING** error creating set " + this.id + " : " + theSetResult.getErrorMessage);
            }
        else
            {
            logDebug("capSet: Created new set " + this.id + " of type " + this.type); 
            this.refresh();
            }
        }
    }
 
 
function checkCapForLicensedProfessionalType( licProfType )
{
	var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
	
	if( capLicenseResult.getSuccess() )
	{ 
		var capLicenseArr = capLicenseResult.getOutput();
		
		if (!capLicenseArr)
			{ logDebug("WARNING: no license professional available on the application:"); return false; }
		
		for( licProf in capLicenseArr )
		{
			if( licProfType.equals(capLicenseArr[licProf].getLicenseType()) )
			{
				aa.print( "Found License Professional with Type= " + licProfType );
				return true; //Found Licensed Prof of specified type
			}
		}
		
		return false;
	}
	else
		{ aa.print("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }
} 
 
function checkInspectionResult(insp2Check,insp2Result)
	{
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		var inspList = inspResultObj.getOutput();
		for (xx in inspList)
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && String(insp2Result).equals(inspList[xx].getInspectionStatus()))
				return true;
		}
	return false;
	}

 
 
function checkRequiredASIFields() {

	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(capId);

	var asiObjs = appSpecInfoResult.getOutput();

	var fieldsComplete = true;

	for (var i in asiObjs) {
		if (asiObjs[i].getRequiredFlag() == "Y") {
			if (matches(asiObjs[i].checklistComment,null,undefined,"")) {
				fieldsComplete = false;
			}
		}
	}
	return fieldsComplete;
} 
 
function childGetByCapType(pCapType, pParentCapId) 
	{
	// Returns capId object of first child of pParentCapId whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip
	// 06SSP-00219.C61201
  //
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (getCapResult.getSuccess())
		{
		var childArray = getCapResult.getOutput();
		if (childArray.length)
			{
			var childCapId;
			var capTypeStr = "";
			var childTypeArray;
			var isMatch;
			for (xx in childArray)
				{
				childCapId = childArray[xx].getCapID();
				if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
					continue;
				
				capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
				childTypeArray = capTypeStr.split("/");
				isMatch = true;
				for (yy in childTypeArray) //looking for matching cap type
					{
					if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
						{
						isMatch = false;
						break;
						}
					}
				if (isMatch)
					return childCapId;
				}
			}
		else
			logDebug( "**WARNING: childGetByCapType function found no children");	
			
		return false;
		}
	else
		logDebug( "**WARNING: childGetByCapType function found no children: " + getCapResult.getErrorMessage());
	}
	
 
 
function closeCap(userId) // option CapId
{
	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args

		var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
		return false;
	}

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return false;
	}

	cd = cdScriptObj.getCapDetailModel();

	iNameResult = aa.person.getUser(userId);

	if (!iNameResult.getSuccess()) {
		logDebug("**ERROR retrieving  user model " + userId + " : " + iNameResult.getErrorMessage());
		return false;
	}

	iName = iNameResult.getOutput();

	cd.setClosedDept(iName.getDeptOfUser());
	cd.setClosedBy(userId);
	cdScriptObj.setClosedDate(sysDate);

	cdWrite = aa.cap.editCapDetail(cd)

		if (cdWrite.getSuccess()) {
			logDebug("Set CAP *Closed by Staff* to " + userId) + "\nSet CAP *Closed by Dept* " + iName.getDeptOfUser() + "\nSet CAP *Closed Date* " + sysDate.toString();
		} else {
			logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage());
			return false;
		}
} 
 
function closeSubWorkflow(thisProcessID,wfStat) // optional capId
	{
	var itemCap = capId;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args


	var isCompleted = true;

	var workflowResult = aa.workflow.getTasks(itemCap);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else
		{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	for (i in wfObj)
		{
		var fTaskSM = wfObj[i];
		if (fTaskSM.getProcessID() == thisProcessID && fTaskSM.getCompleteFlag() != "Y")
			{
			logDebug("closeSubWorkflow: found an incomplete task processID #" + thisProcessID + " , Step# " + fTaskSM.getStepNumber(),3);
			isCompleted = false
			}
		}

	if (!isCompleted) return false;


	// get the parent task

	var relationArray = aa.workflow.getProcessRelationByCapID(itemCap,null).getOutput()

	var relRecord = null;

	for (thisRel in relationArray)
		if (relationArray[thisRel].getProcessID() == thisProcessID)
			relRecord = relationArray[thisRel];

	if (!relRecord)
		{
		logDebug("closeSubWorkflow: did not find a process relation, exiting",3);
		return false;
		}

	logDebug("executing handleDisposition:" + relRecord.getStepNumber() + "," + relRecord.getParentProcessID() + "," + wfStat,3);

	var handleResult = aa.workflow.handleDisposition(itemCap,relRecord.getStepNumber(),relRecord.getParentProcessID(),wfStat,sysDate,"Closed via script","Closed via script",systemUserObj ,"Y");

	if (!handleResult.getSuccess())
		logDebug("**WARNING: closing parent task: " + handleResult.getErrorMessage());
	else
		logDebug("Closed parent task");
	}
 
 
function closeTask(wfstr,wfstat,wfcomment,wfnote) // optional process name
	{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 5) 
		{
		processName = arguments[4]; // subprocess
		useProcess = true;
		}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	if (!wfstat) wfstat = "NA";
	
	for (i in wfObj)
		{
   		var fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess)
				aa.workflow.handleDisposition(capId,stepnumber,processID,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"Y");
			else
				aa.workflow.handleDisposition(capId,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"Y");
			
			logMessage("Closing Workflow Task: " + wfstr + " with status " + wfstat);
			logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat);
			}			
		}
	}

 
 
function comment(cstr)
	{
	if (showDebug) logDebug(cstr);
	if (showMessage) logMessage(cstr);
	}
	
 
 
function comparePeopleGeneric(peop)
	{

	// this function will be passed as a parameter to the createRefContactsFromCapContactsAndLink function.
	//
	// takes a single peopleModel as a parameter, and will return the sequence number of the first G6Contact result
	//
	// returns null if there are no matches
	//
	// current search method is by email only.  In order to use attributes enhancement 09ACC-05048 must be implemented
	//

	peop.setAuditDate(null)
	peop.setAuditID(null)
	peop.setAuditStatus(null)
	peop.setBirthDate(null)
	peop.setBusName2(null)
	peop.setBusinessName(null)
	peop.setComment(null)
	peop.setCompactAddress(null)
	peop.setContactSeqNumber(null)
	peop.setContactType(null)
	peop.setContactTypeFlag(null)
	peop.setCountry(null)
	peop.setCountryCode(null)
	// peop.setEmail(null)       just as a test we are using email
	peop.setEndBirthDate(null)
	peop.setFax(null)
	peop.setFaxCountryCode(null)
	peop.setFein(null)
	peop.setFirstName(null)
	peop.setFlag(null)
	peop.setFullName(null)
	peop.setGender(null)
	peop.setHoldCode(null)
	peop.setHoldDescription(null)
	peop.setId(null)
	peop.setIvrPinNumber(null)
	peop.setIvrUserNumber(null)
	peop.setLastName(null)
	peop.setMaskedSsn(null)
	peop.setMiddleName(null)
	peop.setNamesuffix(null)
	peop.setPhone1(null)
	peop.setPhone1CountryCode(null)
	peop.setPhone2(null)
	peop.setPhone2CountryCode(null)
	peop.setPhone3(null)
	peop.setPhone3CountryCode(null)
	peop.setPostOfficeBox(null)
	peop.setPreferredChannel(null)
	peop.setPreferredChannelString(null)
	peop.setRate1(null)
	peop.setRelation(null)
	peop.setSalutation(null)
	peop.setServiceProviderCode(null)
	peop.setSocialSecurityNumber(null)
	peop.setTitle(null)
	peop.setTradeName(null)

	var r = aa.people.getPeopleByPeopleModel(peop);

    if (!r.getSuccess())
			{ logDebug("WARNING: error searching for people : " + r.getErrorMessage()); return false; }

	var peopResult = r.getOutput();

	if (peopResult.length == 0)
		{
		logDebug("Searched for REF contact, no matches found, returing null");
		return null;
		}

	if (peopResult.length > 0)
		{
		logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber() );
		return peopResult[0].getContactSeqNumber()
		}

} 
 

function comparePeopleStandard(peop)
	{

	/* 
	
		this function will be passed as a parameter to the createRefContactsFromCapContactsAndLink function.
		takes a single peopleModel as a parameter, and will return the sequence number of the first G6Contact result
		returns null if there are no matches
	
		Best Practice Template Version uses the following algorithm:
		
		1.  Match on SSN/FEIN if either exist
		2.  else, match on Email Address if it exists
		3.  else, match on First, Middle, Last Name combined with birthdate if all exist
		
		This function can use attributes if desired
	*/
	

	if (peop.getSocialSecurityNumber() || peop.getFein())
		{
		var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
		
		logDebug("we have a SSN " + peop.getSocialSecurityNumber() + " or FEIN, checking on that");
		qryPeople.setSocialSecurityNumber(peop.getSocialSecurityNumber());
		qryPeople.setFein(peop.getFein());
		
		var r = aa.people.getPeopleByPeopleModel(qryPeople);
		
		if (!r.getSuccess())  { logDebug("WARNING: error searching for people : " + r.getErrorMessage()); return false; }

		var peopResult = r.getOutput();
		
		if (peopResult.length > 0)
			{
			logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber() );
			return peopResult[0].getContactSeqNumber();
			}
		}
		
	if (peop.getEmail())
		{
		var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
		
		qryPeople.setServiceProviderCode(aa.getServiceProviderCode());	
	
		logDebug("we have an email, checking on that");
		qryPeople.setEmail(peop.getEmail());

		var r = aa.people.getPeopleByPeopleModel(qryPeople);

		if (!r.getSuccess())  { logDebug("WARNING: error searching for people : " + r.getErrorMessage()); return false; }

		var peopResult = r.getOutput();

		if (peopResult.length > 0)
			{
			logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber() );
			return peopResult[0].getContactSeqNumber();
			}
		}

	if (peop.getBirthDate() && peop.getLastName() && peop.getFirstName())
		{
		var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();		
		logDebug("we have a name and birthdate, checking on that");
		qryPeople.setBirthDate(peop.getBirthDate());
		qryPeople.setLastName(peop.getLastName());
		qryPeople.setFirstName(peop.getFirstName());
		qryPeople.setMiddleName(peop.getMiddleName());

		var r = aa.people.getPeopleByPeopleModel(qryPeople);

		if (!r.getSuccess())  { logDebug("WARNING: error searching for people : " + r.getErrorMessage()); return false; }

		var peopResult = r.getOutput();

		if (peopResult.length > 0)
			{
			logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber() );
			return peopResult[0].getContactSeqNumber();
			}
		}
		
	logDebug("ComparePeople did not find a match");
		return false;
	}
 
 
function completeCAP(userId) // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ 	logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
			return false; }
	
	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ 	logDebug("**ERROR: No cap detail script object") ;
			return false; }
		
	cd = cdScriptObj.getCapDetailModel();
	
	iNameResult  = aa.person.getUser(userId);

	if (!iNameResult.getSuccess())
		{ 	logDebug("**ERROR retrieving  user model " + userId + " : " + iNameResult.getErrorMessage()) ;
			return false ; }
	
	iName = iNameResult.getOutput();

	cd.setCompleteDept(iName.getDeptOfUser());
	cd.setCompleteStaff(userId);
	cdScriptObj.setCompleteDate(sysDate);
		
	cdWrite = aa.cap.editCapDetail(cd)
	
	if (cdWrite.getSuccess())
	{ 	
		logDebug("Set CAP *Completed by Staff* to " + userId) + "\nSet CAP *Completed by Dept* " + iName.getDeptOfUser() + "\nSet CAP *Completed Date* " + sysDate.toString(); 
	}
	else
	{ 	
		logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ;
		return false ; 
	}
} 
 
function contactAddFromUser(pUserId)
	{
	// Retrieves user's reference Contact record and adds to CAP
	// Returns contact seq nbr or false if contact not added
	// 06SSP-00186
	//
	if (arguments.length==1) //use parameter user
		{
		var personResult = aa.person.getUser(pUserId);
		if (personResult.getSuccess())
			{
			var personObj = personResult.getOutput();
			//logDebug("personObj class: "+personObj.getClass());
			if (personObj==null) // no user found
				{
				logDebug("**ERROR: Failed to get User");
				return false;
				}
			}
		else
  	  { 
			logDebug("**ERROR: Failed to get User: " + personResult.getErrorMessage()); 
			return false; 
			}
		}
	else //use current user
		var personObj = systemUserObj;
		
	var userFirst = personObj.getFirstName();
	var userMiddle = personObj.getMiddleName();
	var userLast = personObj.getLastName();
	
	//Find PeopleModel object for user 
	var peopleResult = aa.people.getPeopleByFMLName(userFirst, userMiddle, userLast);
	if (peopleResult.getSuccess())
		{
		var peopleObj = peopleResult.getOutput();
		//logDebug("peopleObj is "+peopleObj.getClass());
		if (peopleObj==null)
			{
			logDebug("No reference user found.");
			return false;
			}
		logDebug("No. of reference contacts found: "+peopleObj.length);
		}
	else
		{ 
			logDebug("**ERROR: Failed to get reference contact record: " + peopleResult.getErrorMessage()); 
			return false; 
		}
	
	//Add the reference contact record to the current CAP 
	var contactAddResult = aa.people.createCapContactWithRefPeopleModel(capId, peopleObj[0]);
	if (contactAddResult.getSuccess())
		{
		logDebug("Contact successfully added to CAP.");
		var capContactResult = aa.people.getCapContactByCapID(capId);
		if (capContactResult.getSuccess())
			{
			var Contacts = capContactResult.getOutput();
			var idx = Contacts.length;
			var contactNbr = Contacts[idx-1].getCapContactModel().getPeople().getContactSeqNumber();
			logDebug ("Contact Nbr = "+contactNbr);
			return contactNbr;
			}
		else
			{
			logDebug("**ERROR: Failed to get Contact Nbr: "+capContactResult.getErrorMessage());
			return false;
			}
		}
	else
		{ 
			logDebug("**ERROR: Cannot add contact: " + contactAddResult.getErrorMessage()); 
			return false; 
		}	
	} 
	
 
 
function contactObj(ccsm)  {

    this.people = null;         // for access to the underlying data
    this.capContact = null;     // for access to the underlying data
    this.capContactScript = null;   // for access to the underlying data
    this.capId = null;
    this.type = null;
    this.seqNumber = null;
    this.refSeqNumber = null;
    this.asiObj = null;
    this.asi = new Array();    // associative array of attributes
    this.primary = null;
    this.relation = null;
    this.addresses = null;  // array of addresses
    this.validAttrs = false;
        
    this.capContactScript = ccsm;
    if (ccsm)  {
        if (ccsm.getCapContactModel == undefined) {  // page flow
            this.people = this.capContactScript.getPeople();
            this.refSeqNumber = this.capContactScript.getRefContactNumber();
            }
        else {
            this.capContact = ccsm.getCapContactModel();
            this.people = this.capContact.getPeople();
            this.refSeqNumber = this.capContact.getRefContactNumber();
            if (this.people.getAttributes() != null) {
                this.asiObj = this.people.getAttributes().toArray();
                if (this.asiObj != null) {
                    for (var xx1 in this.asiObj) this.asi[this.asiObj[xx1].attributeName] = this.asiObj[xx1];
                    this.validAttrs = true; 
                }   
            }
        }  

        //this.primary = this.capContact.getPrimaryFlag().equals("Y");
        this.relation = this.people.relation;
        this.seqNumber = this.people.contactSeqNumber;
        this.type = this.people.getContactType();
        this.capId = this.capContactScript.getCapID();
        var contactAddressrs = aa.address.getContactAddressListByCapContact(this.capContact);
        if (contactAddressrs.getSuccess()) {
            this.addresses = contactAddressrs.getOutput();
            var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
            this.people.setContactAddressList(contactAddressModelArr);
            }
        else {
            pmcal = this.people.getContactAddressList();
            if (pmcal) {
                this.addresses = pmcal.toArray();
            }
        }
    }       
        this.toString = function() { return this.capId + " : " + this.type + " " + this.people.getLastName() + "," + this.people.getFirstName() + " (id:" + this.seqNumber + "/" + this.refSeqNumber + ") #ofAddr=" + this.addresses.length + " primary=" + this.primary;  }
        
        this.getEmailTemplateParams = function (params) {
            addParameter(params, "$$LastName$$", this.people.getLastName());
            addParameter(params, "$$FirstName$$", this.people.getFirstName());
            addParameter(params, "$$MiddleName$$", this.people.getMiddleName());
            addParameter(params, "$$BusinesName$$", this.people.getBusinessName());
            addParameter(params, "$$ContactSeqNumber$$", this.seqNumber);
            addParameter(params, "$$ContactType$$", this.type);
            addParameter(params, "$$Relation$$", this.relation);
            addParameter(params, "$$Phone1$$", this.people.getPhone1());
            addParameter(params, "$$Phone2$$", this.people.getPhone2());
            addParameter(params, "$$Email$$", this.people.getEmail());
            addParameter(params, "$$AddressLine1$$", this.people.getCompactAddress().getAddressLine1());
            addParameter(params, "$$AddressLine2$$", this.people.getCompactAddress().getAddressLine2());
            addParameter(params, "$$City$$", this.people.getCompactAddress().getCity());
            addParameter(params, "$$State$$", this.people.getCompactAddress().getState());
            addParameter(params, "$$Zip$$", this.people.getCompactAddress().getZip());
            addParameter(params, "$$Fax$$", this.people.getFax());
            addParameter(params, "$$Country$$", this.people.getCompactAddress().getCountry());
            addParameter(params, "$$FullName$$", this.people.getFullName());
            return params;
            }
        
        this.replace = function(targetCapId) { // send to another record, optional new contact type
        
            var newType = this.type;
            if (arguments.length == 2) newType = arguments[1];
            //2. Get people with target CAPID.
            var targetPeoples = getContactObjs(targetCapId,[String(newType)]);
            //3. Check to see which people is matched in both source and target.
            for (var loopk in targetPeoples)  {
                var targetContact = targetPeoples[loopk];
                if (this.equals(targetPeoples[loopk])) {
                    targetContact.people.setContactType(newType);
                    aa.people.copyCapContactModel(this.capContact, targetContact.capContact);
                    targetContact.people.setContactAddressList(this.people.getContactAddressList());
                    overwriteResult = aa.people.editCapContactWithAttribute(targetContact.capContact);
                    if (overwriteResult.getSuccess())
                        logDebug("overwrite contact " + targetContact + " with " + this);
                    else
                        logDebug("error overwriting contact : " + this + " : " + overwriteResult.getErrorMessage());
                    return true;
                    }
                }

                var tmpCapId = this.capContact.getCapID();
                var tmpType = this.type;
                this.people.setContactType(newType);
                this.capContact.setCapID(targetCapId);
                createResult = aa.people.createCapContactWithAttribute(this.capContact);
                if (createResult.getSuccess())
                    logDebug("(contactObj) contact created : " + this);
                else
                    logDebug("(contactObj) error creating contact : " + this + " : " + createResult.getErrorMessage());
                this.capContact.setCapID(tmpCapId);
                this.type = tmpType;
                return true;
        }

        this.equals = function(t) {
            if (t == null) return false;
            if (!String(this.people.type).equals(String(t.people.type))) { return false; }
            if (!String(this.people.getFirstName()).equals(String(t.people.getFirstName()))) { return false; }
            if (!String(this.people.getLastName()).equals(String(t.people.getLastName()))) { return false; }
            if (!String(this.people.getFullName()).equals(String(t.people.getFullName()))) { return false; }
            if (!String(this.people.getBusinessName()).equals(String(t.people.getBusinessName()))) { return false; }
            return  true;
        }
        
        this.saveBase = function() {
            // set the values we store outside of the models.
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            saveResult = aa.people.editCapContact(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) base contact saved : " + this);
            else
                logDebug("(contactObj) error saving base contact : " + this + " : " + saveResult.getErrorMessage());
            }               
        
        this.save = function() {
            // set the values we store outside of the models
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            this.capContact.setPeople(this.people);
            saveResult = aa.people.editCapContactWithAttribute(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) contact saved : " + this);
            else
                logDebug("(contactObj) error saving contact : " + this + " : " + saveResult.getErrorMessage());
            }

        //get method for Attributes
        this.getAttribute = function (vAttributeName){
            var retVal = null;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null)
                    retVal = tmpVal.getAttributeValue();
            }
            return retVal;
        }
        
        //Set method for Attributes
        this.setAttribute = function(vAttributeName,vAttributeValue){
            var retVal = false;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null){
                    tmpVal.setAttributeValue(vAttributeValue);
                    retVal = true;
                }
            }
            return retVal;
        }

        this.remove = function() {
            var removeResult = aa.people.removeCapContact(this.capId, this.seqNumber)
            if (removeResult.getSuccess())
                logDebug("(contactObj) contact removed : " + this + " from record " + this.capId.getCustomID());
            else
                logDebug("(contactObj) error removing contact : " + this + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
            }

        this.isSingleAddressPerType = function() {
            if (this.addresses.length > 1) 
                {
                
                var addrTypeCount = new Array();
                for (y in this.addresses) 
                    {
                    thisAddr = this.addresses[y];
                    addrTypeCount[thisAddr.addressType] = 0;
                    }

                for (yy in this.addresses) 
                    {
                    thisAddr = this.addresses[yy];
                    addrTypeCount[thisAddr.addressType] += 1;
                    }

                for (z in addrTypeCount) 
                    {
                    if (addrTypeCount[z] > 1) 
                        return false;
                    }
                }
            else
                {
                return true;    
                }

            return true;

            }

        this.getAddressTypeCounts = function() { //returns an associative array of how many adddresses are attached.
           
            var addrTypeCount = new Array();
            
            for (y in this.addresses) 
                {
                thisAddr = this.addresses[y];
                addrTypeCount[thisAddr.addressType] = 0;
                }

            for (yy in this.addresses) 
                {
                thisAddr = this.addresses[yy];
                addrTypeCount[thisAddr.addressType] += 1;
                }

            return addrTypeCount;

            }

        this.createPublicUser = function() {

            if (!this.capContact.getEmail())
            { logDebug("(contactObj) Couldn't create public user for : " + this +  ", no email address"); return false; }

            if (String(this.people.getContactTypeFlag()).equals("organization"))
            { logDebug("(contactObj) Couldn't create public user for " + this + ", the contact is an organization"); return false; }
            
            // check to see if public user exists already based on email address
            var getUserResult = aa.publicUser.getPublicUserByEmail(this.capContact.getEmail())
            if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                userModel = getUserResult.getOutput();
                logDebug("(contactObj) createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
            }

            if (!userModel) // create one
                {
                logDebug("(contactObj) CreatePublicUserFromContact: creating new user based on email address: " + this.capContact.getEmail()); 
                var publicUser = aa.publicUser.getPublicUserModel();
                publicUser.setFirstName(this.capContact.getFirstName());
                publicUser.setLastName(this.capContact.getLastName());
                publicUser.setEmail(this.capContact.getEmail());
                publicUser.setUserID(this.capContact.getEmail());
                publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
                publicUser.setAuditID("PublicUser");
                publicUser.setAuditStatus("A");
                publicUser.setCellPhone(this.people.getPhone2());

                var result = aa.publicUser.createPublicUser(publicUser);
                if (result.getSuccess()) {

                logDebug("(contactObj) Created public user " + this.capContact.getEmail() + "  sucessfully.");
                var userSeqNum = result.getOutput();
                var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

                // create for agency
                aa.publicUser.createPublicUserForAgency(userModel);

                // activate for agency
                var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
                userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(aa.getServiceProviderCode(),userSeqNum,"ADMIN");

                // reset password
                var resetPasswordResult = aa.publicUser.resetPassword(this.capContact.getEmail());
                if (resetPasswordResult.getSuccess()) {
                    var resetPassword = resetPasswordResult.getOutput();
                    userModel.setPassword(resetPassword);
                    logDebug("(contactObj) Reset password for " + this.capContact.getEmail() + "  sucessfully.");
                } else {
                    logDebug("(contactObj **WARNING: Reset password for  " + this.capContact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
                }

                // send Activate email
                aa.publicUser.sendActivateEmail(userModel, true, true);

                // send another email
                aa.publicUser.sendPasswordEmail(userModel);
                }
                else {
                    logDebug("(contactObj) **WARNIJNG creating public user " + this.capContact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
                }
            }

        //  Now that we have a public user let's connect to the reference contact       
            
        if (this.refSeqNumber)
            {
            logDebug("(contactObj) CreatePublicUserFromContact: Linking this public user with reference contact : " + this.refSeqNumber);
            aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), this.refSeqNumber);
            }
            

        return userModel; // send back the new or existing public user
        }

        this.getCaps = function() { // option record type filter

        
            if (this.refSeqNumber) {
                aa.print("ref seq : " + this.refSeqNumber);
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput(); 
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ; 
                pm.setContactSeqNumber(this.refSeqNumber); 

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();
                
                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        resultArray.push(thisCapId)
                        }
                    }
            }
            
        return resultArray;
        }

        this.getRelatedContactObjs = function() { // option record type filter
        
            if (this.refSeqNumber) {
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput(); 
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ; 
                pm.setContactSeqNumber(this.refSeqNumber); 

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();
                
                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        var ccsm = aa.people.getCapContactByPK(thisCapId, cList[j].getPeople().contactSeqNumber).getOutput();
                        var newContactObj = new contactObj(ccsm);
                        resultArray.push(newContactObj)
                        }
                    }
            }
            
        return resultArray;
        }
        
        
        
        this.createRefLicProf = function(licNum,rlpType,addressType,licenseState) {
            
            // optional 3rd parameter serv_prov_code
            var updating = false;
            var serv_prov_code_4_lp = aa.getServiceProviderCode();
            if (arguments.length == 5) {
                serv_prov_code_4_lp = arguments[4];
                aa.setDelegateAgencyCode(serv_prov_code_4_lp);
                }
            
            // addressType = one of the contact address types, or null to pull from the standard contact fields.
            var newLic = getRefLicenseProf(licNum);

            if (newLic) {
                updating = true;
                logDebug("(contactObj) Updating existing Ref Lic Prof : " + licNum);
                }
            else {
                var newLic = aa.licenseScript.createLicenseScriptModel();
                }

            peop = this.people;
            cont = this.capContact;
            if (cont.getFirstName() != null) newLic.setContactFirstName(cont.getFirstName());
            if (peop.getMiddleName() != null) newLic.setContactMiddleName(peop.getMiddleName()); // use people for this
            if (cont.getLastName() != null) if (peop.getNamesuffix() != null) newLic.setContactLastName(cont.getLastName() + " " + peop.getNamesuffix()); else newLic.setContactLastName(cont.getLastName());
            if (peop.getBusinessName() != null) newLic.setBusinessName(peop.getBusinessName());
            if (peop.getPhone1() != null) newLic.setPhone1(peop.getPhone1());
            if (peop.getPhone2() != null) newLic.setPhone2(peop.getPhone2());
            if (peop.getEmail() != null) newLic.setEMailAddress(peop.getEmail());
            if (peop.getFax() != null) newLic.setFax(peop.getFax());
            newLic.setAgencyCode(serv_prov_code_4_lp);
            newLic.setAuditDate(sysDate);
            newLic.setAuditID(currentUserID);
            newLic.setAuditStatus("A");
            newLic.setLicenseType(rlpType);
            newLic.setStateLicense(licNum);
            newLic.setLicState(licenseState);
            //setting this field for a future enhancement to filter license types by the licensing board field. (this will be populated with agency names)
            var agencyLong = lookup("CONTACT_ACROSS_AGENCIES",servProvCode);
            if (!matches(agencyLong,undefined,null,"")) newLic.setLicenseBoard(agencyLong); else newLic.setLicenseBoard("");
 
            var addr = null;

            if (addressType) {
                for (var i in this.addresses) {
                    cAddr = this.addresses[i];
                    if (addressType.equals(cAddr.getAddressType())) {
                        addr = cAddr;
                    }
                }
            }
            
            if (!addr) addr = peop.getCompactAddress();   //  only used on non-multiple addresses or if we can't find the right multi-address
            
            if (addr.getAddressLine1() != null) newLic.setAddress1(addr.getAddressLine1());
            if (addr.getAddressLine2() != null) newLic.setAddress2(addr.getAddressLine2());
            if (addr.getAddressLine3() != null) newLic.getLicenseModel().setTitle(addr.getAddressLine3());
            if (addr.getCity() != null) newLic.setCity(addr.getCity());
            if (addr.getState() != null) newLic.setState(addr.getState());
            if (addr.getZip() != null) newLic.setZip(addr.getZip());
            if (addr.getCountryCode() != null) newLic.getLicenseModel().setCountryCode(addr.getCountryCode());
            
            if (updating)
                myResult = aa.licenseScript.editRefLicenseProf(newLic);
            else
                myResult = aa.licenseScript.createRefLicenseProf(newLic);

            if (arguments.length == 5) {
                aa.resetDelegateAgencyCode();
            }
                
            if (myResult.getSuccess())
                {
                logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " From Contact " + this);
                return true;
                }
            else
                {
                logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
                return false;
                }
        }
        
        this.getAKA = function() {
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            if (this.refSeqNumber) {
                return aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber)).toArray();
                }
            else {
                logDebug("contactObj: Cannot get AKA names for a non-reference contact");
                return false;
                }
            }
            
        this.addAKA = function(firstName,middleName,lastName,fullName,startDate,endDate) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot add AKA name for non-reference contact");
                return false;
                }
                
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var args = new Array();
            var akaModel = aa.proxyInvoker.newInstance("com.accela.orm.model.contact.PeopleAKAModel",args).getOutput();
            var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel",args).getOutput();

            var a = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));
            akaModel.setServiceProviderCode(aa.getServiceProviderCode());
            akaModel.setContactNumber(parseInt(this.refSeqNumber));
            akaModel.setFirstName(firstName);
            akaModel.setMiddleName(middleName);
            akaModel.setLastName(lastName);
            akaModel.setFullName(fullName);
            akaModel.setStartDate(startDate);
            akaModel.setEndDate(endDate);
            auditModel.setAuditDate(new Date());
            auditModel.setAuditStatus("A");
            auditModel.setAuditID("ADMIN");
            akaModel.setAuditModel(auditModel);
            a.add(akaModel);

            aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, a);
            }

        this.removeAKA = function(firstName,middleName,lastName) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot remove AKA name for non-reference contact");
                return false;
                }
            
            var removed = false;
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var l = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));
            
            var i = l.iterator();
            while (i.hasNext()) {
                var thisAKA = i.next();
                if ((!thisAKA.getFirstName() || thisAKA.getFirstName().equals(firstName)) && (!thisAKA.getMiddleName() || thisAKA.getMiddleName().equals(middleName)) && (!thisAKA.getLastName() || thisAKA.getLastName().equals(lastName))) {
                    i.remove();
                    logDebug("contactObj: removed AKA Name : " + firstName + " " + middleName + " " + lastName);
                    removed = true;
                    }
                }   
                    
            if (removed)
                aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, l);
            }

        this.hasPublicUser = function() { 
            if (this.refSeqNumber == null) return false;
            var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(this.refSeqNumber));
            
            if (s_publicUserResult.getSuccess()) {
                var fpublicUsers = s_publicUserResult.getOutput();
                if (fpublicUsers == null || fpublicUsers.size() == 0) {
                    logDebug("The contact("+this.refSeqNumber+") is not associated with any public user.");
                    return false;
                } else {
                    logDebug("The contact("+this.refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                    return true;
                }
            } else { logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage()); return false; }
        }

        this.linkToPublicUser = function(pUserId) { 
           
            if (pUserId != null) {
                var pSeqNumber = pUserId.replace('PUBLICUSER','');
                
                var s_publicUserResult = aa.publicUser.getPublicUser(aa.util.parseLong(pSeqNumber));

                if (s_publicUserResult.getSuccess()) {
                    var linkResult = aa.licenseScript.associateContactWithPublicUser(pSeqNumber, this.refSeqNumber);

                    if (linkResult.getSuccess()) {
                        logDebug("Successfully linked public user " + pSeqNumber + " to contact " + this.refSeqNumber);
                    } else {
                        logDebug("Failed to link contact to public user");
                        return false;
                    }
                } else {
                    logDebug("Could not find a public user with the seq number: " + pSeqNumber);
                    return false;
                }


            } else {
                logDebug("No public user id provided");
                return false;
            }
        }

        this.sendCreateAndLinkNotification = function() {
            //for the scenario in AA where a paper application has been submitted
            var toEmail = this.people.getEmail();

            if (toEmail) {
                var params = aa.util.newHashtable();
                getACARecordParam4Notification(params,acaUrl);
                addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
                addParameter(params,"$$altID$$",capIDString);
                var notificationName;

                if (this.people.getContactTypeFlag() == "individual") {
                    notificationName = this.people.getFirstName() + " " + this.people.getLastName();
                } else {
                    notificationName = this.people.getBusinessName();
                }

                if (notificationName)
                    addParameter(params,"$$notificationName$$",notificationName);
                if (this.refSeqNumber) {
                    var v = new verhoeff();
                    var pinCode = v.compute(String(this.refSeqNumber));
                    addParameter(params,"$$pinCode$$",pinCode);

                    sendNotification(sysFromEmail,toEmail,"","PUBLICUSER CREATE AND LINK",params,null);                    
                }

                               
            }

        }

        this.getRelatedRefContacts = function() { //Optional relationship types array 
            
            var relTypes;
            if (arguments.length > 0) relTypes = arguments[0];
            
            var relConsArray = new Array();

            if (matches(this.refSeqNumber,null,undefined,"")) return relConsArray;

            //check as the source
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setContactSeqNumber(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);


            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getEntityID1());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }

            //check as the target
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setEntityID1(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);

            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getContactSeqNumber());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }           

            return relConsArray;
        }
    } 
 
function contactSetPrimary(pContactNbr)
	{
	// Makes contact the Primary Contact
	// 06SSP-00186
	//
	if (pContactNbr==null)
		{
		logDebug("**ERROR: ContactNbr parameter is null");
		return false;
		}
	else
		{
		var capContactResult = aa.people.getCapContactByPK(capId, pContactNbr);
		if (capContactResult.getSuccess())
			{
			var contact = capContactResult.getOutput();
			//logDebug("contact class is "+contact.getClass());
			var peopleObj=contact.getCapContactModel().getPeople();
			peopleObj.setFlag("Y");
			contact.getCapContactModel().setPeople(peopleObj);
			var editResult = aa.people.editCapContact(contact.getCapContactModel());
			if (editResult.getSuccess())
				{
				logDebug("Contact successfully set to Primary");
				return true;
				}
			else
				{
				logDebug("**ERROR: Could not set contact to Primary: "+editResult.getErrorMessage());
				return false;
				}
			}
		else
			{
			logDebug("**ERROR: Can't get contact: "+capContactResult.getErrorMessage());
			return false;
			}
		}
	}
	
 
 
function contactSetRelation(pContactNbr, pRelation)
	{
	// Edits Contact Relationship for specified Contact
	//06SSP-00186
	//
	if (pContactNbr==null)
		{
		logDebug("ContactNbr parameter is null");
		return false;
		}
	else
		{
		var capContactResult = aa.people.getCapContactByPK(capId, pContactNbr);
		if (capContactResult.getSuccess())
			{
			var contact = capContactResult.getOutput();
			//logDebug("contact class is "+contact.getClass());
			var peopleObj=contact.getCapContactModel().getPeople();
			peopleObj.setRelation(pRelation);
			contact.getCapContactModel().setPeople(peopleObj);
			var editResult = aa.people.editCapContact(contact.getCapContactModel());
			if (editResult.getSuccess())
				{
				logDebug("Contact relationship successfully changed to "+pRelation);
				return true;
				}
			else
				{
				logDebug("**ERROR: Could not change contact relationship: "+editResult.getErrorMessage());
				return false;
				}
			}
		else
			{
			logDebug("**ERROR: Can't get contact: "+capContactResult.getErrorMessage());
			return false;
			}
		}
	}

 
 
 function convertContactAddressModelArr(contactAddressScriptModelArr)

{

	var contactAddressModelArr = null;

	if(contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0)

	{

		contactAddressModelArr = aa.util.newArrayList();

		for(loopk in contactAddressScriptModelArr)

		{

			contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());

		}

	}	

	return contactAddressModelArr;

}



 
 

function convertDate(thisDate)
	{

	if (typeof(thisDate) == "string")
		{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
		}

	if (typeof(thisDate)== "object")
		{

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
			{
			return thisDate;
			}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}
			
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}			

		if (thisDate.getClass().toString().equals("class java.util.Date"))
			{
			return new Date(thisDate.getTime());
			}

		if (thisDate.getClass().toString().equals("class java.lang.String"))
			{
			return new Date(String(thisDate));
			}
		}

	if (typeof(thisDate) == "number")
		{
		return new Date(thisDate);  // assume milliseconds
		}

	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

	}
 
 
function convertStringToPhone(theString) {
	var n = "22233344455566677778889999";

	var compString = String(theString.toUpperCase());
	var retString = "";

	for (var x = 0; x < compString.length; x++) {
		if (compString[x] >= "A" && compString[x] <= "Z") {
			retString += n[compString.charCodeAt(x) - 65]
		} else {
			retString += compString[x];
		}
	}
	return retString;
}
 
 
function copyAddresses(pFromCapId, pToCapId)
	{
	//Copies all property addresses from pFromCapId to pToCapId
	//If pToCapId is null, copies to current CAP
	//07SSP-00037/SP5017
	//
	if (pToCapId==null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;

	//check if target CAP has primary address
	var priAddrExists = false;
	var capAddressResult = aa.address.getAddressByCapId(vToCapId);
	if (capAddressResult.getSuccess())
		{
		Address = capAddressResult.getOutput();
		for (yy in Address)
			{
			if ("Y"==Address[yy].getPrimaryFlag())
				{
				priAddrExists = true;
				logDebug("Target CAP has primary address");
				break;
				}
			}
		}
	else
		{
		logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
		return false;
		}

	//get addresses from originating CAP
	var capAddressResult = aa.address.getAddressWithAttributeByCapId(pFromCapId);
	var copied = 0;
	if (capAddressResult.getSuccess())
		{
		Address = capAddressResult.getOutput();
		for (yy in Address)
			{
			newAddress = Address[yy];
			newAddress.setCapID(vToCapId);
			if (priAddrExists)
				newAddress.setPrimaryFlag("N"); //prevent target CAP from having more than 1 primary address
			aa.address.createAddressWithAPOAttribute(vToCapId, newAddress);
			logDebug("Copied address from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
			copied++;
			}
		}
	else
		{
		logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
		return false;
		}
	return copied;
	}


 
 
function copyAppSpecific(newCap) // copy all App Specific info into new Cap, 1 optional parameter for ignoreArr
{
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 1) 
	{
		ignoreArr = arguments[1];
		limitCopy = true;
	}
	
	for (asi in AInfo){
		//Check list
		if(limitCopy){
			var ignore=false;
		  	for(var i = 0; i < ignoreArr.length; i++)
		  		if(ignoreArr[i] == asi){
		  			ignore=true;
		  			break;
		  		}
		  	if(ignore)
		  		continue;
		}
		editAppSpecific(asi,AInfo[asi],newCap);
	}
}

 
 
function copyAppSpecific4ACA(capFrom) { // copy all App Specific info into new Cap
var i= capFrom.getAppSpecificInfoGroups().iterator();

    while (i.hasNext())
    {
         var group = i.next();
         var fields = group.getFields();
         if (fields != null)
            {
            var iteFields = fields.iterator();
            while (iteFields.hasNext())
            {
                 var field = iteFields.next();

                    if (useAppSpecificGroupName)
                            editAppSpecific4ACA(field.getCheckboxType() + "." + field.getCheckboxDesc(),field.getChecklistComment());
                    else
                            editAppSpecific4ACA(field.getCheckboxDesc(),field.getChecklistComment());
           }
        }
    }
}
 
 
function copyASIFields(sourceCapId,targetCapId)  // optional groups to ignore
	{
	var ignoreArray = new Array();
	for (var i=2; i<arguments.length;i++)
		ignoreArray.push(arguments[i])

	var targetCap = aa.cap.getCap(targetCapId).getOutput();
	var targetCapType = targetCap.getCapType();
	var targetCapTypeString = targetCapType.toString();
	var targetCapTypeArray = targetCapTypeString.split("/");

	var sourceASIResult = aa.appSpecificInfo.getByCapID(sourceCapId)

	if (sourceASIResult.getSuccess())
		{ var sourceASI = sourceASIResult.getOutput(); }
	else
		{ aa.print( "**ERROR: getting source ASI: " + sourceASIResult.getErrorMessage()); return false }

	for (ASICount in sourceASI)
		  {
		  thisASI = sourceASI[ASICount];

		  if (!exists(thisASI.getCheckboxType(),ignoreArray))
		       {
		       thisASI.setPermitID1(targetCapId.getID1())
		       thisASI.setPermitID2(targetCapId.getID2())
		       thisASI.setPermitID3(targetCapId.getID3())
		       thisASI.setPerType(targetCapTypeArray[1])
		       thisASI.setPerSubType(targetCapTypeArray[2])
		       aa.cap.createCheckbox(thisASI)
		       }
  		  }
	}

 
 
function copyASITables(pFromCapId, pToCapId) {
	// Function dependencies on addASITable()
	// par3 is optional 0 based string array of table to ignore
	var itemCap = pFromCapId;

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
		var tai = ta.iterator();
	var tableArr = new Array();
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		ignoreArr = arguments[2];
		limitCopy = true;
	}
	while (tai.hasNext()) {
		var tsm = tai.next();

		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName() + "";
		var numrows = 0;

		//Check list
		if (limitCopy) {
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++)
				if (ignoreArr[i] == tn) {
					ignore = true;
					break;
				}
			if (ignore)
				continue;
		}
		if (!tsm.rowIndex.isEmpty()) {
			var tsmfldi = tsm.getTableField().iterator();
			var tsmcoli = tsm.getColumns().iterator();
			var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
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
				if (readOnlyi.hasNext()) {
					readOnly = readOnlyi.next();
				}

				var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
				tempObject[tcol.getColumnName()] = fieldInfo;
				//tempObject[tcol.getColumnName()] = tval;
			}

			tempArray.push(tempObject); // end of record
		}

		addASITable(tn, tempArray, pToCapId);
		logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	}
} 
 
function copyCalcVal(fromcap,newcap)
	{
	// 8/8/2008 JHS  creatBCalcValuatn method began using the script model after 6.4  updated this function
	if (!newcap)
		{ logMessage("**WARNING: copyCalcVal was passed a null new cap ID"); return false; }

	var valResult = aa.finance.getCalculatedValuation(fromcap,null);
	if (valResult.getSuccess())
		var valArray = valResult.getOutput();
	else
		{ logMessage("**ERROR: Failed to get calc val array: " + valResult.getErrorMessage()); return false; }

	for (thisCV in valArray)
		{
		var bcv = valArray[thisCV];
		bcv.setCapID(newcap);
		createResult = aa.finance.createBCalcValuatn(bcv);
		if (!createResult.getSuccess())
			{ logMessage("**ERROR: Creating new calc valuatn on target cap ID: " + createResult.getErrorMessage()); return false; }
		}
	}
 
 
function copyConditions(fromCapId) // optional toCapID
{

	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args

	var getFromCondResult = aa.capCondition.getCapConditions(fromCapId);
	if (getFromCondResult.getSuccess())
		var condA = getFromCondResult.getOutput();
	else {
		logDebug("**ERROR: getting cap conditions: " + getFromCondResult.getErrorMessage());
		return false
	}

	for (cc in condA) {
		var thisC = condA[cc];

		var addCapCondResult = aa.capCondition.addCapCondition(itemCap, thisC.getConditionType(), thisC.getConditionDescription(), thisC.getConditionComment(), thisC.getEffectDate(), thisC.getExpireDate(), sysDate, thisC.getRefNumber1(), thisC.getRefNumber2(), thisC.getImpactCode(), thisC.getIssuedByUser(), thisC.getStatusByUser(), thisC.getConditionStatus(), currentUserID, String("A"), null, thisC.getDisplayConditionNotice(), thisC.getIncludeInConditionName(), thisC.getIncludeInShortDescription(), thisC.getInheritable(), thisC.getLongDescripton(), thisC.getPublicDisplayMessage(), thisC.getResolutionAction(), null, null, thisC.getReferenceConditionNumber(), thisC.getConditionGroup(), thisC.getDisplayNoticeOnACA(), thisC.getDisplayNoticeOnACAFee(), thisC.getPriority(), thisC.getConditionOfApproval());
		if (addCapCondResult.getSuccess())
			logDebug("Successfully added condition (" + thisC.getImpactCode() + ") " + thisC.getConditionDescription());
		else
			logDebug("**ERROR: adding condition (" + cImpact + "): " + addCapCondResult.getErrorMessage());
	}
} 
 
function copyConditionsFromParcel(parcelIdString)
		{
		var getFromCondResult = aa.parcelCondition.getParcelConditions(parcelIdString)
		if (getFromCondResult.getSuccess())
			var condA = getFromCondResult.getOutput();
		else
			{ logDebug( "**WARNING: getting parcel conditions: " + getFromCondResult.getErrorMessage()) ; return false}
			
		for (cc in condA)
			{
			var thisC = condA[cc];
			
			if (!appHasCondition(thisC.getConditionType(),null,thisC.getConditionDescription(),thisC.getImpactCode()))
				{
				var addCapCondResult = aa.capCondition.addCapCondition(capId, thisC.getConditionType(), thisC.getConditionDescription(), thisC.getConditionComment(), thisC.getEffectDate(), thisC.getExpireDate(), sysDate, thisC.getRefNumber1(),thisC.getRefNumber2(), thisC.getImpactCode(), thisC.getIssuedByUser(), thisC.getStatusByUser(), thisC.getConditionStatus(), currentUserID, "A")
				if (addCapCondResult.getSuccess())
					logDebug("Successfully added condition (" +  thisC.getImpactCode() + ") " +  thisC.getConditionDescription());
				else
					logDebug( "**ERROR: adding condition (" + thisC.getImpactCode() + "): " + addCapCondResult.getErrorMessage());
				}
			else
				logDebug( "**WARNING: adding condition (" + thisC.getImpactCode() + "): condition already exists");
				
			}
		}
 
 
function copyContacts(pFromCapId, pToCapId) {
	//Copies all contacts from pFromCapId to pToCapId
	//07SSP-00037/SP5017
	//
	if (pToCapId == null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;

	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			var newContact = Contacts[yy].getCapContactModel();

			// Retrieve contact address list and set to related contact
			var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
			if (contactAddressrs.getSuccess()) {
				var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
				newContact.getPeople().setContactAddressList(contactAddressModelArr);
			}
			newContact.setCapID(vToCapId);

			// Create cap contact, contact address and contact template
			aa.people.createCapContactWithAttribute(newContact);
			copied++;
			logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
		}
	} else {
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return copied;
}

function convertContactAddressModelArr(contactAddressScriptModelArr) {
	var contactAddressModelArr = null;
	if (contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0) {
		contactAddressModelArr = aa.util.newArrayList();
		for (loopk in contactAddressScriptModelArr) {
			contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
		}
	}
	return contactAddressModelArr;
} 
 
function copyContactsByType(pFromCapId, pToCapId, pContactType)
	{
	//Copies all contacts from pFromCapId to pToCapId
	//where type == pContactType
	if (pToCapId==null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;
	
	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
			{
			if(Contacts[yy].getCapContactModel().getContactType() == pContactType)
			    {
			    var newContact = Contacts[yy].getCapContactModel();
			    newContact.setCapID(vToCapId);
			    aa.people.createCapContact(newContact);
			    copied++;
			    logDebug("Copied contact from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
			    }
		
			}
		}
	else
		{
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage()); 
		return false; 
		}
	return copied;
	} 
 
 function copyEducation(srcCapId, targetCapId)

{

    if(srcCapId != null && targetCapId != null)

    {

        aa.education.copyEducationList(srcCapId, targetCapId);

    }

}
 
 
function copyFees(sourceCapId,targetCapId)
	{

	var feeSeqArray = new Array();
	var invoiceNbrArray = new Array();
	var feeAllocationArray = new Array();

	var feeA = loadFees(sourceCapId)

	for (x in feeA)
		{
		thisFee = feeA[x];
		
		logMessage("We have a fee " + thisFee.code + " status : " + thisFee.status);
		
		if (thisFee.status == "INVOICED")
			{
			addFee(thisFee.code,thisFee.sched,thisFee.period,thisFee.unit,"Y",targetCapId)

			var feeSeqArray = new Array();
			var paymentPeriodArray = new Array();

			feeSeqArray.push(thisFee.sequence);
			paymentPeriodArray.push(thisFee.period);
			var invoiceResult_L = aa.finance.createInvoice(sourceCapId, feeSeqArray, paymentPeriodArray);

			if (!invoiceResult_L.getSuccess())
				aa.print("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
			}


		if (thisFee.status == "NEW")
			{
			addFee(thisFee.code,thisFee.sched,thisFee.period,thisFee.unit,"N",targetCapId)
			}

		}

	}
 
 

function copyLicensedProf(sCapId, tCapId)
{
	//Function will copy all licensed professionals from source CapID to target CapID

	var licProf = aa.licenseProfessional.getLicensedProfessionalsByCapID(sCapId).getOutput();
	if (licProf != null)
		for(x in licProf)
		{
			licProf[x].setCapID(tCapId);
			aa.licenseProfessional.createLicensedProfessional(licProf[x]);
			logDebug("Copied " + licProf[x].getLicenseNbr());
		}
	else
		logDebug("No licensed professional on source");
}
 
 

//Function will copy all owners from source CAP (sCapID) to target CAP (tCapId)
function copyOwner(sCapID, tCapID)
{
	var ownrReq = aa.owner.getOwnerByCapId(sCapID);
	if(ownrReq.getSuccess())
	{
		var ownrObj = ownrReq.getOutput();
		for (xx in ownrObj)
		{
			ownrObj[xx].setCapID(tCapID);
			aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
			logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName())
		}
	}
	else
		logDebug("Error Copying Owner : " + ownrObj.getErrorType() + " : " + ownrObj.getErrorMessage());
}
 
 

function GetOwnersByParcel()
{
//get parcel(s) by capid
var parcels = aa.parcel.getParcelDailyByCapID(capId,null);

if(parcels.getSuccess())
{
	 parcels = parcels.getOutput();
	 if(parcels == null || parcels.length == 0) 
	 {
	   	aa.print("There is no any parcel for the cap.");
	 }
	 else
	 {
	    //get owner(s) by parcel(s)
	    for (var i =0; i< parcels.length; i++)
	    {
				var parcelOwnersResult = aa.owner.getOwnersByParcel(parcels[i]);
				var parcelNbr = parcels[i].getParcelNumber();
				var parcelUID = parcels[i].getParcelModel().getUID();
				if (parcelOwnersResult.getSuccess())
				{
						var actuallyParcelNumber = parcelNbr != null?parcelNbr:parcelUID;
						//aa.print("Successfully get owner(s) by Parcel "+actuallyParcelNumber+". Detail as follow:");
						var ownerArr = parcelOwnersResult.getOutput();
						//aa.print("Size :" + ownerArr.length);
						for (j = 0; j < ownerArr.length; j++)
						{
							ownerArr[j].setCapID(capId);
							aa.owner.createCapOwnerWithAPOAttribute(ownerArr[j]);
						}		
				}
				else
				{
						aa.print("ERROR: Failed to get owner(s) by Parcel(s): " + parcelOwnersResult.getErrorMessage());
				}
	    }
	 }

} 
} 
 
function copyParcelGisObjects() 
	{
	var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
	if (capParcelResult.getSuccess())
		{
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels)
			{
			var ParcelValidatedNumber = Parcels[zz].getParcelNumber();
			logDebug("Looking at parcel " + ParcelValidatedNumber);
			var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
			if (gisObjResult.getSuccess()) 	
				var fGisObj = gisObjResult.getOutput();
			else
				{ logDebug("**WARNING: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

			for (a1 in fGisObj) // for each GIS object on the Cap
				{
				var gisTypeScriptModel = fGisObj[a1];
                                var gisObjArray = gisTypeScriptModel.getGISObjects()
                                for (b1 in gisObjArray)
                                	{
  					var gisObjScriptModel = gisObjArray[b1];
  					var gisObjModel = gisObjScriptModel.getGisObjectModel() ;

					var retval = aa.gis.addCapGISObject(capId,gisObjModel.getServiceID(),gisObjModel.getLayerId(),gisObjModel.getGisId());

					if (retval.getSuccess())
						{ logDebug("Successfully added Cap GIS object: " + gisObjModel.getGisId())}
					else
						{ logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()) ; return false }	
					}
				}
			}
		}	
	else
		{ logDebug("**ERROR: Getting Parcels from Cap.  Reason is: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()) ; return false }
	}

 
 
function copyParcels(pFromCapId, pToCapId)
	{
	//Copies all parcels from pFromCapId to pToCapId
	//If pToCapId is null, copies to current CAP
	//07SSP-00037/SP5017
	//
	if (pToCapId==null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;
				
	var capParcelResult = aa.parcel.getParcelandAttribute(pFromCapId,null);
	var copied = 0;
	if (capParcelResult.getSuccess())
		{
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels)
			{
			var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
			newCapParcel.setParcelModel(Parcels[zz]);
			newCapParcel.setCapIDModel(vToCapId);
			newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
			newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
			aa.parcel.createCapParcel(newCapParcel);
			logDebug("Copied parcel "+Parcels[zz].getParcelNumber()+" from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
			copied++;
			}
		}
	else
		{
		logMessage("**ERROR: Failed to get parcels: " + capParcelResult.getErrorMessage()); 
		return false; 
		}
	return copied;
	} 
 
function copySchedInspections(pFromCapId, pToCapId)
	{
	//Copies all scheduled inspections from pFromCapId to pToCapId
	//If pToCapId is null, copies to current CAP
	//07SSP-00037/SP5017
	//
	if (pToCapId==null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;
		
	var inspResultObj = aa.inspection.getInspections(pFromCapId);
	
	if (!inspResultObj.getSuccess())
		{
		logMessage("**ERROR: Failed to get inspections: " + inspResultObj.getErrorMessage()); 
		return false;
		}
		
	var inspCount = 0;
	var schedRes;
	var inspector;
	var inspDate;
	var inspTime;
	var inspType;
	var inspComment;	
	
	var inspList = inspResultObj.getOutput();
	for (xx in inspList)
		{
		if ("Insp Scheduled"==inspList[xx].getDocumentDescription())
			{
			inspector = inspList[xx].getInspector();
			inspDate = inspList[xx].getScheduledDate();
			inspTime = inspList[xx].getScheduledTime();
			inspType = inspList[xx].getInspectionType();
			inspComment = inspList[xx].getInspectionComments();
			schedRes = aa.inspection.scheduleInspection(vToCapId, inspector, inspDate, inspTime, inspType, inspComment);
			if (schedRes.getSuccess())
				{
				logDebug("Copied scheduled inspection from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
				inspCount++;
				}
			else
				logDebug( "**ERROR: copying scheduling inspection (" + inspType + "): " + schedRes.getErrorMessage());
			}
		}
	return inspCount;	
	}


 
 
function countActiveTasks(processName) {
	// counts the number of active tasks on a given process
	var numOpen = 0;

	var countResult = aa.workflow.getTaskCount(capId, processName, "Y");
	if (countResult.getSuccess())
		numOpen = countResult.getOutput().intValue();
	else {
		logMessage("**ERROR: Failed to get task count: " + s_capResult.getErrorMessage());
		return false;
	}

	return numOpen;
}
 
 
function countIdenticalInspections()
	{
	var cntResult = 0;
	var oldDateStr = "01/01/1900";  // inspections older than this date count as 1
	if (arguments.length > 0) oldDateStr = arguments[0]; // Option to override olddate in the parameter
	oldDate = new Date("oldDateStr");
	
	var oldInspectionFound = false;
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();
		for (xx in inspList)
			{
			if (String(inspType).equals(inspList[xx].getInspectionType()) && String(inspResult).equals(inspList[xx].getInspectionStatus()))
				{
				if (convertDate(inspList[xx].getInspectionStatusDate()) < oldDate)
					{
					if (!oldInspectionFound) { cntResult++ ; oldInspectionFound = true }
					}
				else
					{
					cntResult++
					}
				}
			}
		}	
	logDebug("countIdenticalInspections(" + inspType + "," + inspResult + ", " + oldDateStr +  ") Returns " + cntResult);
	return cntResult;
	}	
	 
 
function createCap(pCapType, pAppName) 
	{
	// creates a new application and returns the capID object
	// 07SSP-00037/SP5017
	//
	var aCapType = pCapType.split("/");
	if (aCapType.length != 4)
		{
		logDebug("**ERROR in createCap.  The following Application Type String is incorrectly formatted: " + pCapType);
		return ("INVALID PARAMETER");
		}
	
	var appCreateResult = aa.cap.createApp(aCapType[0],aCapType[1],aCapType[2],aCapType[3],pAppName);
	logDebug("Creating cap " + pCapType);
	
	if (!appCreateResult.getSuccess())
		{
		logDebug( "**ERROR: creating CAP " + appCreateResult.getErrorMessage());
		return false;
		}

	var newId = appCreateResult.getOutput();
	logDebug("CAP of type " + pCapType + " created successfully ");
	var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
	
	return newId;
	}

 
 
function createCapComment(vComment) //optional CapId, optional vDispOnInsp
{
	var vCapId = capId;
	var vDispOnInsp = "N";
	if (arguments.length >= 2 && typeof(arguments[1]) != "undefined" && arguments[1] != null && arguments[1] != "") {
		vCapId = arguments[1];
	}
	if (arguments.length >= 3 && typeof(arguments[2]) != "undefined" && arguments[2] != null && arguments[2] != "") {
		vDispOnInsp = arguments[2];
	}
	var comDate = aa.date.getCurrentDate();
	var capCommentScriptModel = aa.cap.createCapCommentScriptModel();
	capCommentScriptModel.setCapIDModel(vCapId);
	capCommentScriptModel.setCommentType("APP LEVEL COMMENT");
	capCommentScriptModel.setSynopsis("");
	capCommentScriptModel.setText(vComment);
	capCommentScriptModel.setAuditUser(currentUserID);
	capCommentScriptModel.setAuditStatus("A");
	capCommentScriptModel.setAuditDate(comDate);
	var capCommentModel = capCommentScriptModel.getCapCommentModel();
	capCommentModel.setDisplayOnInsp(vDispOnInsp);
	aa.cap.createCapComment(capCommentModel);
	logDebug("Comment Added");
} 
 
function createChild(grp,typ,stype,cat,desc) // optional parent capId
{
	//
	// creates the new application and returns the capID object
	//

	var itemCap = capId
	if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args
	
	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess())
		{
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(itemCap, newId); 
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");

		// Copy Parcels

		var capParcelResult = aa.parcel.getParcelandAttribute(itemCap,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(Parcels[zz]);
				newCapParcel.setCapIDModel(newId);
				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
				aa.parcel.createCapParcel(newCapParcel);
				}
			}

		// Copy Contacts
		capContactResult = aa.people.getCapContactByCapID(itemCap);
		if (capContactResult.getSuccess())
			{
			Contacts = capContactResult.getOutput();
			for (yy in Contacts)
				{
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(newId);
				aa.people.createCapContact(newContact);
				logDebug("added contact");
				}
			}	

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(itemCap);
		if (capAddressResult.getSuccess())
			{
			Address = capAddressResult.getOutput();
			for (yy in Address)
				{
				newAddress = Address[yy];
				newAddress.setCapID(newId);
				aa.address.createAddress(newAddress);
				logDebug("added address");
				}
			}
		
		return newId;
		}
	else
		{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}
}

 
 
 function createLicense(initStatus,copyASI) {

	//initStatus - record status to set the license to initially

	//copyASI - copy ASI from Application to License? (true/false)



	var newLic = null;

	var newLicId = null;

	var newLicIdString = null;

	var newLicenseType = appTypeArray[2];



	//create the license record

	newLicId = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], "License",null);



	//field repurposed to represent the current term effective date

	editScheduledDate(sysDateMMDDYYYY,newLicId);

	//field repurposed to represent the original effective date

	editFirstIssuedDate(sysDateMMDDYYYY,newLicId);



	newLicIdString = newLicId.getCustomID();

	updateAppStatus(initStatus,"",newLicId);



	//copy all ASI

	if(copyASI) {

		copyAppSpecific(newLicId);

	}



	return newLicId;	

}



 
 
 function createParent(grp,typ,stype,cat,desc) 

//

// creates the new application and returns the capID object

// updated by JHS 10/23/12 to use copyContacts that handles addresses

//

	{

	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);

	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);

	if (appCreateResult.getSuccess())

		{

		var newId = appCreateResult.getOutput();

		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

		

		// create Detail Record

		capModel = aa.cap.newCapScriptModel().getOutput();

		capDetailModel = capModel.getCapModel().getCapDetailModel();

		capDetailModel.setCapID(newId);

		aa.cap.createCapDetail(capDetailModel);



		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object

		var result = aa.cap.createAppHierarchy(newId, capId); 

		if (result.getSuccess())

			logDebug("Parent application successfully linked");

		else

			logDebug("Could not link applications");



		// Copy Parcels



		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);

		if (capParcelResult.getSuccess())

			{

			var Parcels = capParcelResult.getOutput().toArray();

			for (zz in Parcels)

				{

				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());

				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();

				newCapParcel.setParcelModel(Parcels[zz]);

				newCapParcel.setCapIDModel(newId);

				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());

				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());

				aa.parcel.createCapParcel(newCapParcel);

				}

			}



		// Copy Contacts

		

		copyContacts(capId,newId);

		

		// Copy Addresses

		capAddressResult = aa.address.getAddressByCapId(capId);

		if (capAddressResult.getSuccess())

			{

			Address = capAddressResult.getOutput();

			for (yy in Address)

				{

				newAddress = Address[yy];

				newAddress.setCapID(newId);

				aa.address.createAddress(newAddress);

				logDebug("added address");

				}

			}

		

		return newId;

		}

	else

		{

		logDebug( "**ERROR: adding parent App: " + appCreateResult.getErrorMessage());

		}

	}







 
 

function createPendingInspection(iGroup,iType) // optional Cap ID
	{
	var itemCap = capId;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

	var itmResult = aa.inspection.getInspectionType(iGroup,iType)
	
	if (!itmResult.getSuccess())
		{
		logDebug("**WARNING error retrieving inspection types: " + itmResult.getErrorMessage);
		return false;
		}

	var itmArray = itmResult.getOutput();
	
	if (!itmArray)
		{
		logDebug("**WARNING could not find any matches for inspection group " + iGroup + " and type " + iType);
		return false;
		}

	var itmSeq = null;
	
	for (thisItm in itmArray)
		{
		var it = itmArray[thisItm];
		if (it.getGroupCode().toUpperCase().equals(iGroup.toUpperCase()) && it.getType().toUpperCase().equals(iType.toUpperCase()))
			itmSeq = it.getSequenceNumber();
		}

	if (!itmSeq)
		{
		logDebug("**WARNING could not find an exact match for inspection group " + iGroup + " and type " + iType);
		return false;
		}
		
	var inspModel = aa.inspection.getInspectionScriptModel().getOutput().getInspection();
	
	var activityModel = inspModel.getActivity();
	activityModel.setInspSequenceNumber(itmSeq);
	activityModel.setCapIDModel(itemCap);

	pendingResult = aa.inspection.pendingInspection(inspModel)

	if (pendingResult.getSuccess())
		{
		logDebug("Successfully created pending inspection group " + iGroup + " and type " + iType);
		return true;
		}
	else
		{
		logDebug("**WARNING could not create pending inspection group " + iGroup + " and type " + iType + " Message: " + pendingResult.getErrorMessage());
		return false;
		}
	
}
	
	

 
 

function createPendingInspFromReqd() // optional Cap ID
	{
	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args


	var inspListResult = aa.inspection.getInspectionListForSchedule(itemCap.getID1(),itemCap.getID2(),itemCap.getID3());
	
	if (!inspListResult.getSuccess())
		{
		logDebug("**WARNING error retrieving inspections: " + inspListResult.getErrorMessage());
		return false;
		}
		
	var inspList = inspListResult.getOutput();
	
	for (var i in inspList)
		{
		var thisInsp = inspList[i];
		if (thisInsp.getRequiredInspection().equals("Y"))
			{
			createPendingInspection(thisInsp.getGroupCode(),thisInsp.getType(),itemCap);
			}
		}
	}
 
 

function createPublicUserFromContact()   // optional: Contact Type, default Applicant
{
    var contactType = "Applicant";
    var contact;
    var refContactNum;
    var userModel;
    if (arguments.length > 0) contactType = arguments[0]; // use contact type specified

    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				contact = Contacts[yy];
        }
    }
    
    if (!contact)
    { logDebug("Couldn't create public user for " + contactType + ", no such contact"); return false; }

    if (!contact.getEmail())
    { logDebug("Couldn't create public user for " + contactType + ", no email address"); return false; }

	if (contact.getPeople().getContactTypeFlag().equals("organization"))
	{ logDebug("Couldn't create public user for " + contactType + ", the contact is an organization"); return false; }
	
    // get the reference contact ID.   We will use to connect to the new public user
    refContactNum = contact.getCapContactModel().getRefContactNumber();

    // check to see if public user exists already based on email address
    var getUserResult = aa.publicUser.getPublicUserByEmail(contact.getEmail())
    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
        userModel = getUserResult.getOutput();
        logDebug("CreatePublicUserFromContact: Found an existing public user: " + userModel.getUserID());
	}

    if (!userModel) // create one
    	{
	    logDebug("CreatePublicUserFromContact: creating new user based on email address: " + contact.getEmail()); 
	    var publicUser = aa.publicUser.getPublicUserModel();
	    publicUser.setFirstName(contact.getFirstName());
	    publicUser.setLastName(contact.getLastName());
	    publicUser.setEmail(contact.getEmail());
	    publicUser.setUserID(contact.getEmail());
	    publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
	    publicUser.setAuditID("PublicUser");
	    publicUser.setAuditStatus("A");
	    publicUser.setCellPhone(contact.getCapContactModel().getPeople().getPhone2());

	    var result = aa.publicUser.createPublicUser(publicUser);
	    if (result.getSuccess()) {

		logDebug("Created public user " + contact.getEmail() + "  sucessfully.");
		var userSeqNum = result.getOutput();
		var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

		// create for agency
		aa.publicUser.createPublicUserForAgency(userModel);

		// activate for agency
		var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
			userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(servProvCode,userSeqNum,"ADMIN");

			// reset password
			var resetPasswordResult = aa.publicUser.resetPassword(contact.getEmail());
			if (resetPasswordResult.getSuccess()) {
				var resetPassword = resetPasswordResult.getOutput();
				userModel.setPassword(resetPassword);
				logDebug("Reset password for " + contact.getEmail() + "  sucessfully.");
			} else {
				logDebug("**ERROR: Reset password for  " + contact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
			}

		// send Activate email
		aa.publicUser.sendActivateEmail(userModel, true, true);

		// send another email
		aa.publicUser.sendPasswordEmail(userModel);
	    }
    	else {
    	    logDebug("**Warning creating public user " + contact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
    	}
    }

//  Now that we have a public user let's connect to the reference contact		
	
if (refContactNum)
	{
	logDebug("CreatePublicUserFromContact: Linking this public user with reference contact : " + refContactNum);
	aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refContactNum);
	}
	

return userModel; // send back the new or existing public user
}
 
 
function createRecord(grp,typ,stype,cat,desc) 
//
// creates the new application and returns the capID object
//
	{
	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess())
		{
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object

		// Copy Parcels

		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(Parcels[zz]);
				newCapParcel.setCapIDModel(newId);
				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
				aa.parcel.createCapParcel(newCapParcel);
				}
			}

		// Copy Contacts
		capContactResult = aa.people.getCapContactByCapID(capId);
		if (capContactResult.getSuccess())
			{
			Contacts = capContactResult.getOutput();
			for (yy in Contacts)
				{
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(newId);
				aa.people.createCapContact(newContact);
				logDebug("added contact");
				}
			}	

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(capId);
		if (capAddressResult.getSuccess())
			{
			Address = capAddressResult.getOutput();
			for (yy in Address)
				{
				newAddress = Address[yy];
				newAddress.setCapID(newId);
				aa.address.createAddress(newAddress);
				logDebug("added address");
				}
			}
		
		return newId;
		}
	else
		{
		logDebug( "**ERROR: adding parent App: " + appCreateResult.getErrorMessage());
		}
	}

 
 
function createRefContactAddressFromAddress(rSeqNbr,nAddrModel,addrType) {
						
	if (nAddrModel && rSeqNbr) {
		var contactAddressScriptModel = aa.address.createContactAddressModel().getOutput();
		contactAddressScriptModel.setServiceProviderCode(servProvCode);
		contactAddressScriptModel.setAuditStatus("A");
		contactAddressScriptModel.setAuditID(currentUserID);
		var contactAddressModel = contactAddressScriptModel.getContactAddressModel();
		contactAddressModel.setEntityID(parseInt(rSeqNbr));
		contactAddressModel.setEntityType("CONTACT");
		contactAddressModel.setAddressType(addrType);
		contactAddressModel.setAddressLine1(nAddrModel.getAddressLine1());
	   	contactAddressModel.setAddressLine2(nAddrModel.getAddressLine2());
	   	contactAddressModel.setAddressLine3(nAddrModel.getCounty());
	   	contactAddressModel.setHouseNumberStart(nAddrModel.getHouseNumberStart());
	   	contactAddressModel.setHouseNumberEnd(nAddrModel.getHouseNumberEnd());
	   	// contactAddressModel.setStreetDirection("ZF");
	   	// contactAddressModel.setStreetPrefix("Pre");
	   	contactAddressModel.setStreetName(nAddrModel.getStreetName());
	   	// contactAddressModel.setStreetSuffix("Suf");
	   	// contactAddressModel.setStreetSuffixDirection("SufD");
	   	contactAddressModel.setCity(nAddrModel.getCity());
	   	contactAddressModel.setState(nAddrModel.getState());
	   	contactAddressModel.setZip(nAddrModel.getZip());
	   	//contactAddressModel.setCountry(nAddrModel.getCountry());
	   	// contactAddressModel.setFax("0982-4343-343");
	   	//var startDate = aa.util.parseDate("09/12/2012");
	  	//var endDate =  conversionDate("09/12/2013");
	   	//contactAddressModel.setEffectiveDate(startDate);

		var contactAddressModel = contactAddressScriptModel.getContactAddressModel();
		var returnModel = aa.address.createContactAddress(contactAddressModel);

		if(returnModel.getSuccess()) {
		 	logDebug("Create Contact Address Successfully: " + returnModel.getOutput().getAddressID());
		 	return returnModel.getOutput();
	  	}
	  	else {
			logDebug("Create Contact Address Failed:" + returnModel.getErrorMessage());
			return false;
	  	}
	} else {
		logDebug("Could not create reference contact address no address model or reference contact sequence number");
		return false;
	}						
} 
 

function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists)
	{

	// contactTypeArray is either null (all), or an array or contact types to process
	//
	// ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
	//
	// replaceCapContact not implemented yet
	//
	// overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
	//
	// refContactExists is a function for REF contact comparisons.
	//
	// Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES".
	// This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will
	// be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
	// choice determines the default action of all contact types.   Other types can be configured separately.
	// Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization),
	// "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).

	var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";


	var ingoreArray = new Array();
	if (arguments.length > 1) ignoreArray = arguments[1];

	var defaultContactFlag = lookup(standardChoiceForBusinessRules,"Default");

	var c = aa.people.getCapContactByCapID(pCapId).getOutput()
	var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets

	for (var i in c)
	   {
	   var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
	   var con = c[i];

	   var p = con.getPeople();

	   var contactFlagForType = lookup(standardChoiceForBusinessRules,p.getContactType());

	   if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
	   	{
	   	if (contactTypeArray && !exists(p.getContactType(),contactTypeArray))
			continue;  // not in the contact type list.  Move along.
		}

	   if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
	   	{
	   	ruleForRefContactType = defaultContactFlag;
	   	}

	   if (contactFlagForType) // explicit contact type is indicated
	   	{
	   	ruleForRefContactType = contactFlagForType;
	   	}

	   if (ruleForRefContactType.equals("D"))
	   	continue;

	   var refContactType = "";

	   switch(ruleForRefContactType)
	   	{
		   case "U":
		     refContactType = p.getContactType();
		     break;
		   case "I":
		     refContactType = "Individual";
		     break;
		   case "O":
		     refContactType = "Organization";
		     break;
		   case "F":
		     if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
		     	refContactType = "Organization";
		     else
		     	refContactType = "Individual";
		     break;
		}

	   var refContactNum = con.getCapContactModel().getRefContactNumber();

	   if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
	   	{
	   	if (overwriteRefContact)
	   		{
	   		p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
	   		p.setContactType(refContactType);

	   						var a = p.getAttributes();

							if (a)
								{
								var ai = a.iterator();
								while (ai.hasNext())
									{
									var xx = ai.next();
									xx.setContactNo(refContactNum);
									}
					}

	   		var r = aa.people.editPeopleWithAttribute(p,p.getAttributes());

			if (!r.getSuccess())
				logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
			else
				logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
			}

	   	if (replaceCapContact)
	   		{
				// To Be Implemented later.   Is there a use case?
			}

	   	}
	   	else  // user entered the contact freehand.   Let's create or link to ref contact.
	   	{
			var ccmSeq = p.getContactSeqNumber();

			var existingContact = refContactExists(p);  // Call the custom function to see if the REF contact exists

			var p = cCopy[i].getPeople();  // get a fresh version, had to mangle the first for the search

			if (existingContact)  // we found a match with our custom function.  Use this one.
				{
					refPeopleId = existingContact;
				}
			else  // did not find a match, let's create one
				{

				var a = p.getAttributes();

				if (a)
					{
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext())
						{
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(),ignoreAttributeArray))
							ai.remove();
						}
					}

				p.setContactType(refContactType);
				var r = aa.people.createPeopleWithAttribute(p,a);

				if (!r.getSuccess())
					{logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				var refPeopleId = p.getContactSeqNumber();

				logDebug("Successfully created reference contact #" + refPeopleId);

				// Need to link to an existing public user.

			    var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
			    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
			        var userModel = getUserResult.getOutput();
			        logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());

					if (refPeopleId)	{
						logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
						aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
						}
					}
				}

			//
			// now that we have the reference Id, we can link back to reference
			//

		    var ccm = aa.people.getCapContactByPK(pCapId,ccmSeq).getOutput().getCapContactModel();

		    ccm.setRefContactNumber(refPeopleId);
		    r = aa.people.editCapContact(ccm);

		    if (!r.getSuccess())
				{ logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
			else
				{ logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);}


	    }  // end if user hand entered contact
	}  // end for each CAP contact
} 
 
 
 function createRefLicProf(rlpId,rlpType,pContactType)
	{
	// 
	//Creates/updates a reference licensed prof from a Contact
	//06SSP-00074, modified for 06SSP-00238
	
	var addrTypeToCopy = null;
	if (arguments.length == 4) addrTypeToCopy = arguments[3]; // optional 4th parameter, address type of multi-address to use

	var updating = false;

	conArr = getPeople(capId);

	if (!conArr.length)
		{
		logDebug ("**WARNING: No contact available");
		return false;
		}


	var newLic = getRefLicenseProf(rlpId)

	if (newLic)
		{
		updating = true;
		logDebug("Updating existing Ref Lic Prof : " + rlpId);
		}
	else
		var newLic = aa.licenseScript.createLicenseScriptModel();

	//get contact record
	if (pContactType==null)
		var cont = conArr[0]; //if no contact type specified, use first contact
	else
		{
		var contFound = false;
		for (yy in conArr)
			{
			if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
				{
				cont = conArr[yy];
				contFound = true;
				break;
				}
			}
		if (!contFound)
			{
			logDebug ("**WARNING: No Contact found of type: "+pContactType);
			return false;
			}
		}

	peop = cont.getPeople();
	var addr = null;
	
	if (addrTypeToCopy) {
		var pmcal = peop.getContactAddressList();
		if (pmcal) {
			pmcal = pmcal.toArray();
			for (var thisPm in pmcal) {
				if (addrTypeToCopy.equals(pmcal[thisPm].getAddressType())) {
					addr = pmcal[thisPm];
				}
			}
		}
	}
	
	if (!addr) addr = peop.getCompactAddress();   //  only used on non-multiple addresses or if we can't find the right multi-address

	newLic.setContactFirstName(cont.getFirstName());
	//newLic.setContactMiddleName(cont.getMiddleName());  //method not available
	newLic.setContactLastName(cont.getLastName());
	newLic.setBusinessName(peop.getBusinessName());
	newLic.setAddress1(addr.getAddressLine1());
	newLic.setAddress2(addr.getAddressLine2());
	newLic.setAddress3(addr.getAddressLine3());
	newLic.setCity(addr.getCity());
	newLic.setState(addr.getState());
	newLic.setZip(addr.getZip());
	newLic.setPhone1(peop.getPhone1());
	newLic.setPhone2(peop.getPhone2());
	newLic.setEMailAddress(peop.getEmail());
	newLic.setFax(peop.getFax());

	newLic.setAgencyCode(aa.getServiceProviderCode());
	newLic.setAuditDate(sysDate);
	newLic.setAuditID(currentUserID);
	newLic.setAuditStatus("A");

	if (AInfo["Insurance Co"]) 		newLic.setInsuranceCo(AInfo["Insurance Co"]);
	if (AInfo["Insurance Amount"]) 		newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
	if (AInfo["Insurance Exp Date"]) 	newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
	if (AInfo["Policy #"]) 			newLic.setPolicy(AInfo["Policy #"]);

	if (AInfo["Business License #"]) 	newLic.setBusinessLicense(AInfo["Business License #"]);
	if (AInfo["Business License Exp Date"]) newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

	newLic.setLicenseType(rlpType);
	newLic.setLicState(addr.getState());
	newLic.setStateLicense(rlpId);

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess())
		{
		logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		return true;
		}
	else
		{
		logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		return false;
		}
	}

 
 

function createRefLicProfFromLicProf()
	{
	//
	// Get the lic prof from the app
	//
	capLicenseResult = aa.licenseScript.getLicenseProf(capId);
	if (capLicenseResult.getSuccess())
		{ capLicenseArr = capLicenseResult.getOutput();  }
	else
		{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }

	if (!capLicenseArr.length)
		{ logDebug("WARNING: no license professional available on the application:"); return false; }

	licProfScriptModel = capLicenseArr[0];
	rlpId = licProfScriptModel.getLicenseNbr();
	//
	// Now see if a reference version exists
	//
	var updating = false;

	var newLic = getRefLicenseProf(rlpId)

	if (newLic)
		{
		updating = true;
		logDebug("Updating existing Ref Lic Prof : " + rlpId);
		}
	else
		var newLic = aa.licenseScript.createLicenseScriptModel();

	//
	// Now add / update the ref lic prof
	//
	newLic.setStateLicense(rlpId);
	newLic.setAddress1(licProfScriptModel.getAddress1());
	newLic.setAddress2(licProfScriptModel.getAddress2());
	newLic.setAddress3(licProfScriptModel.getAddress3());
	newLic.setAgencyCode(licProfScriptModel.getAgencyCode());
	newLic.setAuditDate(licProfScriptModel.getAuditDate());
	newLic.setAuditID(licProfScriptModel.getAuditID());
	newLic.setAuditStatus(licProfScriptModel.getAuditStatus());
	newLic.setBusinessLicense(licProfScriptModel.getBusinessLicense());
	newLic.setBusinessName(licProfScriptModel.getBusinessName());
	newLic.setCity(licProfScriptModel.getCity());
	newLic.setCityCode(licProfScriptModel.getCityCode());
	newLic.setContactFirstName(licProfScriptModel.getContactFirstName());
	newLic.setContactLastName(licProfScriptModel.getContactLastName());
	newLic.setContactMiddleName(licProfScriptModel.getContactMiddleName());
	newLic.setContryCode(licProfScriptModel.getCountryCode());
	newLic.setCountry(licProfScriptModel.getCountry());
	newLic.setEinSs(licProfScriptModel.getEinSs());
	newLic.setEMailAddress(licProfScriptModel.getEmail());
	newLic.setFax(licProfScriptModel.getFax());
	newLic.setLicenseType(licProfScriptModel.getLicenseType());
	newLic.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
	newLic.setPhone1(licProfScriptModel.getPhone1());
	newLic.setPhone2(licProfScriptModel.getPhone2());
	newLic.setSelfIns(licProfScriptModel.getSelfIns());
	newLic.setState(licProfScriptModel.getState());
	newLic.setLicState(licProfScriptModel.getState());
	newLic.setSuffixName(licProfScriptModel.getSuffixName());
	newLic.setWcExempt(licProfScriptModel.getWorkCompExempt());
	newLic.setZip(licProfScriptModel.getZip());

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess())
		{
		logDebug("Successfully added/updated License ID : " + rlpId)
		return rlpId;
		}
	else
		{ logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage()); }
	}

 
 
 function createRefLP4Lookup(newLicIdString,newLicenseType,conType,conAddrType) {

	//All parameters are required

	//newLicIdString - license altID

	//newLicenseType - Ref LP license type

	//conType - Contact type to use for the reference LP

	//conAddrType - Contact address type to use for the reference LP



	createRefLicProf(newLicIdString,newLicenseType,conType,conAddrType);



	newLic = getRefLicenseProf(newLicIdString);

	if (newLic) {

		//manually set any values on the reference LP

		newLic.setAuditStatus("A");

		aa.licenseScript.editRefLicenseProf(newLic);

		logDebug("Reference LP successfully created");

	} else {

		logDebug("Reference LP not created");

	}



}
 
 
function dateAdd(td, amt)
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{

	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td)
		dDate = new Date();
	else
		dDate = convertDate(td);

	var i = 0;
	if (useWorking)
		if (!aa.calendar.getNextWorkDay) {
			logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt)) {
				dDate.setDate(dDate.getDate() + parseInt((amt > 0 ? 1 : -1), 10));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
			}
		} else {
			while (i < Math.abs(amt)) {
				if (amt > 0) {
					dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
					i++;
				} else {
					dDate = new Date(aa.calendar.getPreviousWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
					i++;

				}
			}
		}
	else
		dDate.setDate(dDate.getDate() + parseInt(amt, 10));

	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
} 
 
function dateAddMonths(pDate, pMonths)
	{
	// Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
	// If pDate is null, uses current date
	// pMonths can be positive (to add) or negative (to subtract) integer
	// If pDate is on the last day of the month, the new date will also be end of month.
	// If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, in which case the new date will be on the last day of the month
	//
	if (!pDate)
		baseDate = new Date();
	else
		baseDate = convertDate(pDate);

	var day = baseDate.getDate();
	baseDate.setMonth(baseDate.getMonth() + pMonths);
	if (baseDate.getDate() < day)
		{
		baseDate.setDate(1);
		baseDate.setDate(baseDate.getDate() - 1);
		}
	return ((baseDate.getMonth() + 1) + "/" + baseDate.getDate() + "/" + baseDate.getFullYear());
	}

 
 
	

function dateDiff(date1, date2) {

    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

 
 
function dateFormatted(pMonth, pDay, pYear, pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
{
	var mth = "";
	var day = "";
	var ret = "";
	if (pMonth > 9)
		mth = pMonth.toString();
	else
		mth = "0" + pMonth.toString();

	if (pDay > 9)
		day = pDay.toString();
	else
		day = "0" + pDay.toString();

	if (pFormat == "YYYY-MM-DD")
		ret = pYear.toString() + "-" + mth + "-" + day;
	else
		ret = "" + mth + "/" + day + "/" + pYear.toString();

	return ret;
} 
 
function dateNextOccur (pMonth, pDay, pDate)
	//optional 4th param pOddEven:
	//'ODD' specifies that return date must be next odd year, 'EVEN' means return date is next even year.
	//allows wfDate variable to be used as pDate parameter
	{
	var vDate = new String(pDate);
	if (vDate.length==10 && vDate.indexOf("-")==4 && vDate.indexOf("-",7)==7) //is format YYYY-MM-DD
		var vBaseDate = new Date(vDate.substr(5,2)+"/"+vDate.substr(8,2)+"/"+vDate.substr(0,4));
	else
		var vBaseDate = new Date(vDate);

	var vCurrentYr = vBaseDate.getFullYear().toString();
	var vTestDate = new Date(pMonth+"/"+pDay+"/"+vCurrentYr);
	var vUseOddEven = false;
	var vOddEven;
	var vReturnDate = vTestDate;
	if (arguments.length>3) //optional 4th parameter is used
		{
		var vOddEven = arguments[3].toUpperCase(); //return odd or even year
		vUseOddEven = true;
		}
		
	if (vTestDate > vBaseDate)
		vReturnDate = vTestDate;
	else
		{	
		vTestDate.setFullYear(vTestDate.getFullYear()+1);
		vReturnDate = vTestDate;
		}
 		
	if (vUseOddEven) // use next ODD or EVEN year
		{
		if (vOddEven=="ODD" && vReturnDate.getFullYear()%2==0) //vReturnDate is EVEN year
			vReturnDate.setFullYear(vReturnDate.getFullYear()+1);

		if (vOddEven=="EVEN" && vReturnDate.getFullYear()%2)    //vReturnDate is ODD year
			vReturnDate.setFullYear(vReturnDate.getFullYear()+1);
		}

	return (vReturnDate.getMonth()+1) + "/" + vReturnDate.getDate() + "/" + vReturnDate.getFullYear();  
	}

 
 
 function deactivateActiveTasks(processName) {



	var workflowResult = aa.workflow.getTasks(capId);

 	if (workflowResult.getSuccess())

  	 	wfObj = workflowResult.getOutput();

  	else

  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	

	for (i in wfObj)

		{

   		fTask = wfObj[i];

		if (fTask.getProcessCode().equals(processName))

			if (fTask.getActiveFlag().equals("Y"))

				deactivateTask(fTask.getTaskDescription());

		}



}



 
 
function deactivateTask(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			var completeFlag = fTask.getCompleteFlag();

			if (useProcess) {
				aa.workflow.adjustTask(capId, stepnumber, processID, "N", completeFlag, null, null);
			} else {
				aa.workflow.adjustTask(capId, stepnumber, "N", completeFlag, null, null);
			}

			logDebug("deactivating Workflow Task: " + wfstr);
		}
	}
}
 
 
 function decode64(input) {

     var keyStr = "ABCDEFGHIJKLMNOP" +

               "QRSTUVWXYZabcdef" +

               "ghijklmnopqrstuv" +

               "wxyz0123456789+/" +

               "=";



     var output = "";

     var chr1, chr2, chr3 = "";

     var enc1, enc2, enc3, enc4 = "";

     var i = 0;



     // remove all characters that are not A-Z, a-z, 0-9, +, /, or =

     var base64test = /[^A-Za-z0-9\+\/\=]/g;

     if (base64test.exec(input)) {

        alert("There were invalid base64 characters in the input text.\n" +

              "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +

              "Expect errors in decoding.");

     }

     input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");



     do {

        enc1 = keyStr.indexOf(input.charAt(i++));

        enc2 = keyStr.indexOf(input.charAt(i++));

        enc3 = keyStr.indexOf(input.charAt(i++));

        enc4 = keyStr.indexOf(input.charAt(i++));



        chr1 = (enc1 << 2) | (enc2 >> 4);

        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);

        chr3 = ((enc3 & 3) << 6) | enc4;



        output = output + String.fromCharCode(chr1);



        if (enc3 != 64) {

           output = output + String.fromCharCode(chr2);

        }

        if (enc4 != 64) {

           output = output + String.fromCharCode(chr3);

        }



        chr1 = chr2 = chr3 = "";

        enc1 = enc2 = enc3 = enc4 = "";



     } while (i < input.length);



     return unescape(output);

  }

 
 



function deleteLicensedProfessional(lsm)  {


	// takes a licenseScriptModel and deletes it, along with public user associations
	
	var lic = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.LicenseBusiness").getOutput();
	var clb = aa.proxyInvoker.newInstance("com.accela.pa.people.license.ContractorLicenseBusiness").getOutput();

	if (lsm)
	   {
	   lm = lsm.getLicenseModel();

	   pubusers = aa.publicUser.getPublicUserListByLicenseSeqNBR(licenseNumber).getOutput().toArray();

	   for (p1 in pubusers)
		{
		pu = pubusers[p1].getUserSeqNum();
		clb.deleteContractorLicense(pu, lsm.getLicenseType(),lsm.getAgencyCode(),licenseNumber);
		logDebug("deleted association to public user: " + pubusers[p1].getUserID());
		}

	   lic.removeLicenseByPK(lm);
	   logDebug(licenseNumber + "has been deleted");
	   }
	}
 
 
function deleteTask(targetCapId,deleteTaskName)
{
	//
	// Get the target Task
	//
	var workflowResult = aa.workflow.getTaskItems(targetCapId, deleteTaskName, null, null, null, null);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	var tTask = null;

	for (i in wfObj)
		{
   		var fTask = wfObj[i];
  		if (fTask.getTaskDescription().toUpperCase().equals(deleteTaskName.toUpperCase()))
  			{
			var tTask = wfObj[i];
			}

		}

	if (!tTask)
  	  	{ logDebug("**WARNING: Task not found: " + deleteTaskName); return false; }


	logDebug("Removing task " + tTask.getTaskDescription());
	var result = aa.workflow.removeTask(tTask)

	if (!result.getSuccess())
		{ logDebug("error " + result.getErrorMessage()); return false; }

}
 
 
function describe(obj) {
	var ret = "";
	for (var i in obj)
		if (typeof(obj[i]) == "function")
			ret += "method:" + i + "\n";
		else
			ret += "property:" + i + " = " + obj[i] + "\n";
	return ret;
}
 
 

function docWrite(dstr,header,indent)
	{
	var istr = "";
	for (i = 0 ; i < indent ; i++)
		istr+="|  ";
	if (header && dstr)
		aa.print(istr + "------------------------------------------------");
	if (dstr) aa.print(istr + dstr);
	if (header)
		aa.print(istr + "------------------------------------------------");
	}


 
 
function doScriptActions() {

	if (typeof(appTypeArray) == "object") {
			include(prefix + ":" + appTypeArray[0] + "/*/*/*");
			include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
			include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
			include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");
			include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);
			include(prefix + ":" + appTypeArray[0] + "/*/*/" + appTypeArray[3]);
			include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);
			include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
			}
	}
	 
 
 function doStandardChoiceActions(stdChoiceEntry, doExecution, docIndent) {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    var lastEvalTrue = false;
    stopBranch = false;  // must be global scope

    logDebug("Executing : " + stdChoiceEntry + ", Elapsed Time: " + ((thisTime - startTime) / 1000) + " Seconds")

    var pairObjArray = getScriptAction(stdChoiceEntry);
    if (!doExecution) docWrite(stdChoiceEntry, true, docIndent);
    for (xx in pairObjArray) {
        doObj = pairObjArray[xx];
        if (doExecution) {
            if (doObj.enabled) {

                if (stopBranch)
                    {
                    stopBranch = false;
                    break;
                    }

                logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Criteria : " + doObj.cri, 2)

        try
            {

                    if (eval(token(doObj.cri)) || (lastEvalTrue && doObj.continuation)) {
                        logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Action : " + doObj.act, 2)
    
                        eval(token(doObj.act));
                        lastEvalTrue = true;
                         }  
                    else {
                        if (doObj.elseact) {
                            logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Else : " + doObj.elseact, 2)
                            eval(token(doObj.elseact));
                        }
                        lastEvalTrue = false;
            }
        }
        catch(err)
            {
            showDebug = 3;
            logDebug("**ERROR An error occured in the following standard choice " + stdChoiceEntry + "#" + doObj.ID + "  Error:  " + err.message);
            }
                }
        }
        else // just document
        {
            docWrite("|  ", false, docIndent);
            var disableString = "";
            if (!doObj.enabled) disableString = "<DISABLED>";

            if (doObj.elseact)
                docWrite("|  " + doObj.ID + " " + disableString + " " + doObj.cri + " ^ " + doObj.act + " ^ " + doObj.elseact, false, docIndent);
            else
                docWrite("|  " + doObj.ID + " " + disableString + " " + doObj.cri + " ^ " + doObj.act, false, docIndent);

            for (yy in doObj.branch) {
                doStandardChoiceActions(doObj.branch[yy], false, docIndent + 1);
            }
        }
    } // next sAction
    if (!doExecution) docWrite(null, true, docIndent);
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    logDebug("Finished: " + stdChoiceEntry + ", Elapsed Time: " + ((thisTime - startTime) / 1000) + " Seconds")
}
 
 
function editAppName(newname)
	{
	// 4/30/08 - DQ - Corrected Error where option parameter was ignored
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	capResult = aa.cap.getCap(itemCap)

	if (!capResult.getSuccess())
		{logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()) ; return false }

	capModel = capResult.getOutput().getCapModel()

	capModel.setSpecialText(newname)

	setNameResult = aa.cap.editCapByPK(capModel)

	if (!setNameResult.getSuccess())
		{ logDebug("**WARNING: error setting cap name : " + setNameResult.getErrorMessage()) ; return false }


	return true;
	}

 
 
function editAppSpecific(itemName,itemValue)  // optional: itemCap
{
	var itemCap = capId;
	var itemGroup = null;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
   	
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		itemGroup = itemName.substr(0,itemName.indexOf("."));
		itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	
   	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);

	if (appSpecInfoResult.getSuccess())
	 {
	 	if(arguments.length < 3) //If no capId passed update the ASI Array
	 		AInfo[itemName] = itemValue; 
	} 	
	else
		{ logDebug( "WARNING: " + itemName + " was not updated."); }
}

 
 
 function editAppSpecific4ACA(itemName, itemValue) {



    var i = cap.getAppSpecificInfoGroups().iterator();



    while (i.hasNext()) {

        var group = i.next();

        var fields = group.getFields();

        if (fields != null) {

            var iteFields = fields.iterator();

            while (iteFields.hasNext()) {

                var field = iteFields.next();

                if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." + 



field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {

                    field.setChecklistComment(itemValue);

                }

            }

        }

    }

}

 
 
function editBuildingCount(numBuild) // option CapId
	{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	cd.setBuildingCount(parseFloat(numBuild));

	cdWrite = aa.cap.editCapDetail(cd)

	if (cdWrite.getSuccess())
		{ logDebug("Updated building count to " + numBuild); return true; }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	} 
 
 function editCapConditionStatus(pType,pDesc,pStatus,pStatusType) {

	// updates a condition with the pType and pDesc

	// to pStatus and pStatusType, returns true if updates, false if not

	// will not update if status is already pStatus && pStatusType

	// all parameters are required except for pType



	if (pType==null)

		var condResult = aa.capCondition.getCapConditions(capId);

	else

		var condResult = aa.capCondition.getCapConditions(capId,pType);

		

	if (condResult.getSuccess())

		var capConds = condResult.getOutput();

	else

		{ 

		logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());

		logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());

		return false;

		}





	for (cc in capConds) {

		var thisCond = capConds[cc];

		var cStatus = thisCond.getConditionStatus();

		var cStatusType = thisCond.getConditionStatusType();

		var cDesc = thisCond.getConditionDescription();

		var cImpact = thisCond.getImpactCode();

		logDebug(cStatus + ": " + cStatusType);







		

		if (cDesc.toUpperCase() == pDesc.toUpperCase()) {

			if (!pStatus.toUpperCase().equals(cStatus.toUpperCase())) {

				thisCond.setConditionStatus(pStatus);

				thisCond.setConditionStatusType(pStatusType);

				thisCond.setImpactCode("");

				aa.capCondition.editCapCondition(thisCond);

				return true; // condition has been found and updated

			} else {

				logDebug("ERROR: condition found but already in the status of pStatus and pStatusType");

				return false; // condition found but already in the status of pStatus and pStatusType

			}

		}

	}

	

	logDebug("ERROR: no matching condition found");

	return false; //no matching condition found



}



function days_between(date1, date2) {



    // The number of milliseconds in one day

    var ONE_DAY = 1000 * 60 * 60 * 24



    // Convert both dates to milliseconds

    var date1_ms = date1.getTime()

    var date2_ms = date2.getTime()



    // Calculate the difference in milliseconds

    var difference_ms = Math.abs(date1_ms - date2_ms)



    // Convert back to days and return

    return Math.round(difference_ms/ONE_DAY)



}



 
 

function editCapContactAttribute(contactSeq,pAttributeName,pNewAttributeValue)
	{

    	var itemCap = capId;
  	if (arguments.length > 3)
  		itemCap = arguments[3]; // use cap ID specified in args
 

	var oldValue = null;
	
	var ca = aa.people.getCapContactByCapID(itemCap).getOutput();

	for (var i in ca)
		{
		var attrfound = false;
		var p = ca[i].getCapContactModel().getPeople();
		
		if (p.getContactSeqNumber() != contactSeq) 
			continue;
		
		var peopAttrArray = p.getAttributes().toArray();

		for (var j in peopAttrArray)
			{
			if ( pAttributeName.equals(peopAttrArray[j].getAttributeName()))
				{
				oldValue = peopAttrArray[j].getAttributeValue();
				peopAttrArray[j].setAttributeValue(pNewAttributeValue);
				attrfound = true;
				break;
				}
			}

		if (attrfound)
			{
			logDebug("Updated Cap Contact: " + contactSeq + ", attribute: " + pAttributeName + " from: " + oldValue + " to: " + pNewAttributeValue);
			ca[i].getCapContactModel().setPeople(p);
			var editResult = aa.people.editCapContactWithAttribute(ca[i].getCapContactModel());

		}
	}
	
}
 
 
function editChannelReported(channel) // option CapId
	{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }
	
	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }
		
	cd = cdScriptObj.getCapDetailModel();
	
	cd.setReportedChannel(channel);
		
	cdWrite = aa.cap.editCapDetail(cd)
	
	if (cdWrite.getSuccess())
		{ logDebug("Updated channel reported to " + channel) }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	} 
 
function editConstTypeCode(constTypeCode) // option CapId
{
	var itemCap = capId;
	if (arguments.length > 1) {
		itemCap = arguments[1]; // use cap ID specified in args
	}
	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);

	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
		return false;
	}
	var cdScriptObj = cdScriptObjResult.getOutput();
	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return false;
	}
	cd = cdScriptObj.getCapDetailModel();
	cd.setConstTypeCode(constTypeCode);
	cdWrite = aa.cap.editCapDetail(cd);
	if (cdWrite.getSuccess()) {
		logDebug("Updated Construction Type Code to " + constTypeCode);
		return true;
	} else {
		logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage());
		return false;
	}
}
 
 
 function editContactType(existingType,newType)

//Function will change contact types from exsistingType to newType, 

//optional paramter capID

{

    var updateCap = capId

    if (arguments.length==3)

        updateCap=arguments[2]



    capContactResult = aa.people.getCapContactByCapID(updateCap);

    if (capContactResult.getSuccess())

        {

        Contacts = capContactResult.getOutput();

        for (yy in Contacts)

            {

            var theContact = Contacts[yy].getCapContactModel();

            if(theContact.getContactType() == existingType)

                {

                theContact.setContactType(newType);

                var peopleModel = theContact.getPeople();

                var contactAddressrs = aa.address.getContactAddressListByCapContact(theContact);

                if (contactAddressrs.getSuccess())

                {

                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());

                    peopleModel.setContactAddressList(contactAddressModelArr);    

                }

                aa.people.editCapContactWithAttribute(theContact);

                //logDebug("Contact for " + theContact.getFullName() + " Updated to " + newType);

                }

            }

        }

    }



 
 
function editCreatedBy(nCreatedBy) {
	// 4/30/08 - DQ - Corrected Error where option parameter was ignored
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var capResult = aa.cap.getCap(itemCap)

	if (!capResult.getSuccess())
		{logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()) ; return false }

	var capE = capResult.getOutput();
	var capEModel = capE.getCapModel()

	capEModel.setCreatedBy(nCreatedBy)

	setCreatedByResult = aa.cap.editCapByPK(capEModel);

	if (!setCreatedByResult.getSuccess())
		{ logDebug("**WARNING: error setting cap created by : " + setCreatedByResult.getErrorMessage()) ; return false }

	return true;
} 
 
function editEstimatedJobValue(jobValue) // option CapId
{
	var itemCap = capId;
	if (arguments.length > 1) {
		itemCap = arguments[1]; // use cap ID specified in args
	}
	var bValScriptObjResult = aa.cap.getBValuatn4AddtInfo(itemCap);
	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!bValScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + bValScriptObjResult.getErrorMessage());
		return false;
	}
	var bValScriptObj = bValScriptObjResult.getOutput();
	if (!bValScriptObj) {
		logDebug("**ERROR: No valuation detail script object");
		return false;
	}
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
		return false;
	}
	var cdScriptObj = cdScriptObjResult.getOutput();
	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return false;
	}
	bValScriptObj.setEstimatedValue(parseFloat(jobValue));
	var vedtResults = aa.cap.editAddtInfo(cdScriptObj, bValScriptObj);
	if (!vedtResults.getSuccess()) {
		logDebug("**Error updating the job value in additional information" + edtResults.getErrorMessage());
	}
	if (vedtResults !== null && vedtResults.getSuccess() === true) {
		logDebug("Updated the estimated job value to " + jobValue);
	}
}
 
 
 function editFirstIssuedDate(issuedDate) { // option CapId

    var itemCap = capId



    if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args



    var cdScriptObjResult = aa.cap.getCapDetail(itemCap);



    if (!cdScriptObjResult.getSuccess()) { 

        logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

    

    var cdScriptObj = cdScriptObjResult.getOutput();



    if (!cdScriptObj) { 

        logDebug("**ERROR: No cap detail script object") ; return false; }



    cd = cdScriptObj.getCapDetailModel();



    var javascriptDate = new Date(issuedDate);



    var vIssuedDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());



    cd.setFirstIssuedDate(vIssuedDate);



    cdWrite = aa.cap.editCapDetail(cd);



    if (cdWrite.getSuccess()) { 

        logDebug("updated first issued date to " + vIssuedDate) ; return true; }

    else { 

        logDebug("**ERROR updating first issued date: " + cdWrite.getErrorMessage()) ; return false ; }



}
 
 
function editHouseCount(numHouse) // option CapId
	{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }
	
	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }
		
	cd = cdScriptObj.getCapDetailModel();
	
	cd.setHouseCount(parseFloat(numHouse));
		
	cdWrite = aa.cap.editCapDetail(cd)
	
	if (cdWrite.getSuccess())
		{ logDebug("Updated house count to " + numHouse); return true; }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	} 
 

function editInspectionRequiredFlag(inspType,reqFlag)
	{
	var itemCap = capId
	if (arguments.length > 2) itemCap = arguments[2]; // use cap ID specified in args


	var result = aa.inspection.getInspMilestoneByCapID(itemCap);

	if(!result.getSuccess())
		{ logDebug("**ERROR retrieving inspection milestones: "  + result.getErrorMessage()) ; return false ; }

	inspMilestones= result.getOutput();

	if (!inspMilestones)
		{ logDebug("No Inspection Milestones found") ; return false ; }

	for (thisM in inspMilestones)
		{
		var obj= inspMilestones[thisM];
		if (inspType.equals(obj.getInspType()))
			{
			if (reqFlag) obj.setInspRequired("Y");
			else obj.setInspRequired("N");

			result = aa.inspection.updateInspectionMilestone(inspMilestones);
			if(result.getSuccess())
				logDebug("inspection milestone updated sucessfully.");
			else
				logDebug("**ERROR: could not update inpsection milestone " +result.getErrorMessage());
			}
		}
	}
 
 

function editLookup(stdChoice,stdValue,stdDesc) 
	{
	//check if stdChoice and stdValue already exist; if they do, update;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	if (bizDomScriptResult.getSuccess())
		{
		bds = bizDomScriptResult.getOutput();
		}
	else
		{
		logDebug("Std Choice(" + stdChoice + "," + stdValue + ") does not exist to edit, adding...");
		addLookup(stdChoice,stdValue,stdDesc);
		return false;
		}
	var bd = bds.getBizDomain()
		
	bd.setDescription(stdDesc);
	var editResult = aa.bizDomain.editBizDomain(bd)
	
	if (editResult.getSuccess())
		logDebug("Successfully edited Std Choice(" + stdChoice + "," + stdValue + ") = " + stdDesc);
	else
		logDebug("**ERROR editing Std Choice " + editResult.getErrorMessage());
	}

 
 
function editPriority(priority) // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	cd.setPriority(priority);

	cdWrite = aa.cap.editCapDetail(cd)

	if (cdWrite.getSuccess())
		{ logDebug("updated priority to " + priority) ; return true; }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
} 
 

function editRefLicProfAttribute(pLicNum,pAttributeName,pNewAttributeValue)
	{

	var attrfound = false;
	var oldValue = null;

	licObj = getRefLicenseProf(pLicNum)

	if (!licObj)
		{ logDebug("**WARNING Licensed Professional : " + pLicNum + " not found") ; return false }

	licSeqNum = licObj.getLicSeqNbr();
	attributeType = licObj.getLicenseType();

	if (licSeqNum==null || attributeType=="" || attributeType==null)
		{ logDebug("**WARNING Licensed Professional Sequence Number or Attribute Type missing") ; return false }

	var peopAttrResult = aa.people.getPeopleAttributeByPeople(licSeqNum, attributeType);

	if (!peopAttrResult.getSuccess())
		{ logDebug("**WARNING retrieving reference license professional attribute: " + peopAttrResult.getErrorMessage()); return false }

	var peopAttrArray = peopAttrResult.getOutput();

	for (i in peopAttrArray)
		{
		if ( pAttributeName.equals(peopAttrArray[i].getAttributeName()))
			{
			oldValue = peopAttrArray[i].getAttributeValue()
			attrfound = true;
			break;
			}
		}

	if (attrfound)
		{
		logDebug("Updated Ref Lic Prof: " + pLicNum + ", attribute: " + pAttributeName + " from: " + oldValue + " to: " + pNewAttributeValue)
		peopAttrArray[i].setAttributeValue(pNewAttributeValue);
		aa.people.editPeopleAttribute(peopAttrArray[i].getPeopleAttributeModel());
		}
	else
		{
		logDebug("**WARNING attribute: " + pAttributeName + " not found for Ref Lic Prof: "+ pLicNum)
		/* make a new one with the last model.  Not optimal but it should work
		newPAM = peopAttrArray[i].getPeopleAttributeModel();
		newPAM.setAttributeName(pAttributeName);
		newPAM.setAttributeValue(pNewAttributeValue);
		newPAM.setAttributeValueDataType("Number");
		aa.people.createPeopleAttribute(newPAM);
		*/
		}
	} 
 
function editReportedChannel(reportedChannel) // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	cd.setReportedChannel(reportedChannel);

	cdWrite = aa.cap.editCapDetail(cd);

	if (cdWrite.getSuccess())
		{ logDebug("updated reported channel to " + reportedChannel) ; return true; }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
} 
 
function editFirstIssuedDate(issuedDate) // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	var javascriptDate = new Date(issuedDate);
	var vIssuedDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());

	cd.setFirstIssuedDate(vIssuedDate);

	cdWrite = aa.cap.editCapDetail(cd);

	if (cdWrite.getSuccess())
		{ logDebug("updated first issued date to " + vIssuedDate) ; return true; }
	else
		{ logDebug("**ERROR updating first issued date: " + cdWrite.getErrorMessage()) ; return false ; }
} 
 

function editTaskACAVisibility(wfstr,visibleTask,visibleComment,restrictRole) // optional process name
	{
	// restrictRole is string of five binary digits
	// representing, 0: all aca users, 1: creator, 2:LP, 3:Contact, 4:Owner
	// example: 01011 = creator, contact, owner have access
	// example: 11111 = everybody
	// example: 00001 = only the owner
	var useProcess = false;
	var processName = "";
	if (arguments.length == 4) 
		{
		processName = arguments[3]; // subprocess
		useProcess = true;
		}

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
   		fTask = wfObj[i];
  		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			var fTaskModel = wfObj[i].getTaskItem();
			fTaskModel.setIsRestrictView4ACA(visibleComment ? "Y" : "N");
			fTaskModel.setDisplayInACA(visibleTask ? "Y" : "N");
			fTaskModel.setRestrictRole(restrictRole + "00000");
			//var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);  // doesn't work?   WHY?!?
			var tResult = aa.workflow.editTask(fTaskModel,currentUserID);  // works but adds an audit history.
			if (tResult.getSuccess())
				logDebug("Set Workflow visible flags: " + visibleTask + " , " + visibleComment);
		  	else
	  	  		{ logMessage("**ERROR: Failed to update task, comment visible flags on workflow task: " + tResult.getErrorMessage()); return false; }
			}			
		}
	} 
 
function editTaskComment(wfstr,wfcomment) // optional process name
	{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) 
		{
		processName = arguments[2]; // subprocess
		useProcess = true;
		}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
   		fTask = wfObj[i];
  		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
			{
			wfObj[i].setDispositionComment(wfcomment);
			var fTaskModel = wfObj[i].getTaskItem();
			var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);
			if (tResult.getSuccess())
				logDebug("Set Workflow: " + wfstr + " comment " + wfcomment);
		  	else
	  	  		{ logMessage("**ERROR: Failed to update comment on workflow task: " + tResult.getErrorMessage()); return false; }
			}			
		}
	}

 
 
function editTaskDueDate(wfstr, wfdate) // optional process name.  if wfstr == "*", set for all tasks
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}

	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(capId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			wfObj[i].setDueDate(aa.date.parseDate(wfdate));
			var fTaskModel = wfObj[i].getTaskItem();
			var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);
			if (tResult.getSuccess())
				logDebug("Set Workflow Task: " + fTask.getTaskDescription() + " due Date " + wfdate);
			else {
				logMessage("**ERROR: Failed to update due date on workflow: " + tResult.getErrorMessage());
				return false;
			}
		}
	}
}
 
 
function editTaskSpecific(wfName,itemName,itemValue)  // optional: itemCap
	{
	var updated = false;
	var i=0;
	itemCap = capId;
	if (arguments.length == 4) itemCap = arguments[3]; // use cap ID specified in args
	//
 	// Get the workflows
 	//
	var workflowResult = aa.workflow.getTaskItems(itemCap, wfName, null, null, null, null);
 	if (workflowResult.getSuccess())
 		wfObj = workflowResult.getOutput();
 	else
 		{ logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

 	//
 	// Loop through workflow tasks
 	//
 	for (i in wfObj)
 		{
 		fTask = wfObj[i];
 		stepnumber = fTask.getStepNumber();
 		processID = fTask.getProcessID();
 		if (wfName.equals(fTask.getTaskDescription())) // Found the right Workflow Task
 			{
  		TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap,processID,stepnumber,itemName);
 			if (TSIResult.getSuccess())
 				{
	 			var TSI = TSIResult.getOutput();
				if (TSI != null)
					{
					var TSIArray = new Array();
					TSInfoModel = TSI.getTaskSpecificInfoModel();
					TSInfoModel.setChecklistComment(itemValue);
					TSIArray.push(TSInfoModel);
					TSIUResult = aa.taskSpecificInfo.editTaskSpecInfos(TSIArray);
					if (TSIUResult.getSuccess())
						{
						logDebug("Successfully updated TSI Task=" + wfName + " Item=" + itemName + " Value=" + itemValue);
						AInfo[itemName] = itemValue;  // Update array used by this script
						}
					else
						{ logDebug("**ERROR: Failed to Update Task Specific Info : " + TSIUResult.getErrorMessage()); return false; }
					}
				else
					logDebug("No task specific info field called "+itemName+" found for task "+wfName);
	 			}
	 		else
	 			{
	 			logDebug("**ERROR: Failed to get Task Specific Info objects: " + TSIResult.getErrorMessage());
	 			return false;
	 			}
	 		}  // found workflow task
		} // each task
	}

 
 
function email(pToEmail, pFromEmail, pSubject, pText) 
	{
	//Sends email to specified address
	//06SSP-00221
	//
	aa.sendMail(pFromEmail, pToEmail, "", pSubject, pText);
	logDebug("Email sent to "+pToEmail);
	return true;
	}

 
 
function emailContact(mSubj,mText)   // optional: Contact Type, default Applicant
	{
	var replyTo = "noreply@accela.com";
	var contactType = "Applicant"
	var emailAddress = "";

	if (arguments.length == 3) contactType = arguments[2]; // use contact type specified

	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
			if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				if (Contacts[yy].getEmail() != null)
					emailAddress = "" + Contacts[yy].getEmail();
		}

	if (emailAddress.indexOf("@") > 0)
		{
		aa.sendMail(replyTo, emailAddress, "", mSubj, mText);
		logDebug("Successfully sent email to " + contactType);
		}
	else
		logDebug("Couldn't send email to " + contactType + ", no valid email address");
	} 
 
 function encode64(input) {

     var keyStr = "ABCDEFGHIJKLMNOP" +

               "QRSTUVWXYZabcdef" +

               "ghijklmnopqrstuv" +

               "wxyz0123456789+/" +

               "=";



     input = escape(input);

     var output = "";

     var chr1, chr2, chr3 = "";

     var enc1, enc2, enc3, enc4 = "";

     var i = 0;



     do {

        chr1 = input.charCodeAt(i++);

        chr2 = input.charCodeAt(i++);

        chr3 = input.charCodeAt(i++);



        enc1 = chr1 >> 2;

        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);

        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);

        enc4 = chr3 & 63;



        if (isNaN(chr2)) {

           enc3 = enc4 = 64;

        } else if (isNaN(chr3)) {

           enc4 = 64;

        }



        output = output +

           keyStr.charAt(enc1) +

           keyStr.charAt(enc2) +

           keyStr.charAt(enc3) +

           keyStr.charAt(enc4);

        chr1 = chr2 = chr3 = "";

        enc1 = enc2 = enc3 = enc4 = "";

     } while (i < input.length);



     return output;

  }



 
 
function endBranch() {
	// stop execution of the current std choice
	stopBranch = true;
	} 
 
function executeASITable(tableArray)
	{
	// Executes an ASI table as if it were script commands
	// No capability for else or continuation statements
	// Assumes that there are at least three columns named "Enabled", "Criteria", "Action"
	// Will replace tokens in the controls
	
	//var thisDate = new Date();
	//var thisTime = thisDate.getTime();
	//logDebug("Executing ASI Table, Elapsed Time: "  + ((thisTime - startTime) / 1000) + " Seconds")

	for (xx in tableArray)
		{
 
		var doTableObj = tableArray[xx]; 
		var myCriteria = doTableObj["Criteria"]; aa.print("cri: " + myCriteria)
		var myAction = doTableObj["Action"];  aa.print("act: " + myAction)
		aa.print("enabled: " + doTableObj["Enabled"])
      
		if (doTableObj["Enabled"] == "Yes")
			if (eval(token(myCriteria)))
				eval(token(myAction));

		} // next action
	//var thisDate = new Date();
	//var thisTime = thisDate.getTime();
	//logDebug("Finished executing ASI Table, Elapsed Time: "  + ((thisTime - startTime) / 1000) + " Seconds")
	}

 
 
//
// exists:  return true if Value is in Array
//
function exists(eVal, eArray) {
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}

 
 
function externalLP_CA(licNum, rlpType, doPopulateRef, doPopulateTrx, itemCap) {

	/*
	Version: 3.2

	Usage:

	licNum			:  Valid CA license number.   Non-alpha, max 8 characters.  If null, function will use the LPs on the supplied CAP ID
	rlpType			:  License professional type to use when validating and creating new LPs
	doPopulateRef 	:  If true, will create/refresh a reference LP of this number/type
	doPopulateTrx 	:  If true, will copy create/refreshed reference LPs to the supplied Cap ID.   doPopulateRef must be true for this to work
	itemCap			:  If supplied, licenses on the CAP will be validated.  Also will be refreshed if doPopulateRef and doPopulateTrx are true

	returns: non-null string of status codes for invalid licenses

	examples:

	appsubmitbefore   (will validate the LP entered, if any, and cancel the event if the LP is inactive, cancelled, expired, etc.)
	===============
	true ^ cslbMessage = "";
	CAELienseNumber ^ cslbMessage = externalLP_CA(CAELienseNumber,CAELienseType,false,false,null);
	cslbMessage.length > 0 ^ cancel = true ; showMessage = true ; comment(cslbMessage)

	appsubmitafter  (update all CONTRACTOR LPs on the CAP and REFERENCE with data from CSLB.  Link the CAP LPs to REFERENCE.   Pop up a message if any are inactive...)
	==============
	true ^ 	cslbMessage = externalLP_CA(null,"CONTRACTOR",true,true,capId)
	cslbMessage.length > 0 ^ showMessage = true ; comment(cslbMessage);

	Note;  Custom LP Template Field Mappings can be edited in the script below
	 */

	var returnMessage = "";

	var workArray = new Array();
	if (licNum)
		workArray.push(String(licNum));

	if (itemCap) {
		var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
		if (capLicenseResult.getSuccess()) {
			var capLicenseArr = capLicenseResult.getOutput();
		} else {
			logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());
			return false;
		}

		if (capLicenseArr == null || !capLicenseArr.length) {
			logDebug("**WARNING: no licensed professionals on this CAP");
		} else {
			for (var thisLic in capLicenseArr)
				if (capLicenseArr[thisLic].getLicenseType() == rlpType)
					workArray.push(capLicenseArr[thisLic]);
		}
	} else
		doPopulateTrx = false; // can't do this without a CAP;

	for (var thisLic = 0; thisLic < workArray.length; thisLic++) {
		var licNum = workArray[thisLic];
		var licObj = null;
		var isObject = false;

		if (typeof(licNum) == "object") // is this one an object or string?
		{
			licObj = licNum;
			licNum = licObj.getLicenseNbr();
			isObject = true;
		}

		// Make the call to the California State License Board

		var document;
		var root;
		var aURLArgList = "https://www2.cslb.ca.gov/IVR/License+Detail.aspx?LicNum=" + licNum;
		var vOutObj = aa.httpClient.get(aURLArgList);
		var isError = false;
		if (vOutObj.getSuccess()) {
			var vOut = vOutObj.getOutput();
			var sr = aa.proxyInvoker.newInstance("java.io.StringBufferInputStream", new Array(vOut)).getOutput();
			var saxBuilder = aa.proxyInvoker.newInstance("org.jdom.input.SAXBuilder").getOutput();
			document = saxBuilder.build(sr);
			root = document.getRootElement();
			errorNode = root.getChild("Error");
		} else {
			isError = true;
		}
		if (isError) {
			logDebug("The CSLB web service is currently unavailable");
			continue;
		} else if (errorNode) {
			logDebug("Error for license " + licNum + " : " + errorNode.getText().replace(/\+/g, " "));
			returnMessage += "License " + licNum + " : " + errorNode.getText().replace(/\+/g, " ") + " ";
			continue;
		}

		var lpBiz = root.getChild("BusinessInfo");
		var lpStatus = root.getChild("PrimaryStatus");
		var lpClass = root.getChild("Classifications");
		var lpBonds = root.getChild("ContractorBond");
		var lpWC = root.getChild("WorkersComp");

		// Primary Status
		// 3 = expired, 10 = good, 11 = inactive, 1 = canceled.   We will ignore all but 10 and return text.
		var stas = lpStatus.getChildren();
		for (var i = 0; i < stas.size(); i++) {
			var sta = stas.get(i);

			if (sta.getAttribute("Code").getValue() != "10")
				returnMessage += "License:" + licNum + ", " + sta.getAttribute("Desc").getValue() + " ";
		}

		if (doPopulateRef) // refresh or create a reference LP
		{
			var updating = false;

			// check to see if the licnese already exists...if not, create.

			var newLic = getRefLicenseProf(licNum)

				if (newLic) {
					updating = true;
					logDebug("Updating existing Ref Lic Prof : " + licNum);
				} else {
					var newLic = aa.licenseScript.createLicenseScriptModel();
				}

				if (isObject) // update the reference LP with data from the transactional, if we have some.
				{
					if (licObj.getAddress1())
						newLic.setAddress1(licObj.getAddress1());
					if (licObj.getAddress2())
						newLic.setAddress2(licObj.getAddress2());
					if (licObj.getAddress3())
						newLic.setAddress3(licObj.getAddress3());
					if (licObj.getAgencyCode())
						newLic.setAgencyCode(licObj.getAgencyCode());
					if (licObj.getBusinessLicense())
						newLic.setBusinessLicense(licObj.getBusinessLicense());
					if (licObj.getBusinessName())
						newLic.setBusinessName(licObj.getBusinessName());
					if (licObj.getBusName2())
						newLic.setBusinessName2(licObj.getBusName2());
					if (licObj.getCity())
						newLic.setCity(licObj.getCity());
					if (licObj.getCityCode())
						newLic.setCityCode(licObj.getCityCode());
					if (licObj.getContactFirstName())
						newLic.setContactFirstName(licObj.getContactFirstName());
					if (licObj.getContactLastName())
						newLic.setContactLastName(licObj.getContactLastName());
					if (licObj.getContactMiddleName())
						newLic.setContactMiddleName(licObj.getContactMiddleName());
					if (licObj.getCountryCode())
						newLic.setContryCode(licObj.getCountryCode());
					if (licObj.getEmail())
						newLic.setEMailAddress(licObj.getEmail());
					if (licObj.getCountry())
						newLic.setCountry(licObj.getCountry());
					if (licObj.getEinSs())
						newLic.setEinSs(licObj.getEinSs());
					if (licObj.getFax())
						newLic.setFax(licObj.getFax());
					if (licObj.getFaxCountryCode())
						newLic.setFaxCountryCode(licObj.getFaxCountryCode());
					if (licObj.getHoldCode())
						newLic.setHoldCode(licObj.getHoldCode());
					if (licObj.getHoldDesc())
						newLic.setHoldDesc(licObj.getHoldDesc());
					if (licObj.getLicenseExpirDate())
						newLic.setLicenseExpirationDate(licObj.getLicenseExpirDate());
					if (licObj.getLastRenewalDate())
						newLic.setLicenseLastRenewalDate(licObj.getLastRenewalDate());
					if (licObj.getLicesnseOrigIssueDate())
						newLic.setLicOrigIssDate(licObj.getLicesnseOrigIssueDate());
					if (licObj.getPhone1())
						newLic.setPhone1(licObj.getPhone1());
					if (licObj.getPhone1CountryCode())
						newLic.setPhone1CountryCode(licObj.getPhone1CountryCode());
					if (licObj.getPhone2())
						newLic.setPhone2(licObj.getPhone2());
					if (licObj.getPhone2CountryCode())
						newLic.setPhone2CountryCode(licObj.getPhone2CountryCode());
					if (licObj.getSelfIns())
						newLic.setSelfIns(licObj.getSelfIns());
					if (licObj.getState())
						newLic.setState(licObj.getState());
					if (licObj.getSuffixName())
						newLic.setSuffixName(licObj.getSuffixName());
					if (licObj.getZip())
						newLic.setZip(licObj.getZip());
				}

				// Now set data from the CSLB

				if (lpBiz.getChild("Name").getText() != "")
					newLic.setBusinessName(unescape(lpBiz.getChild("Name").getText()).replace(/\+/g, " "));
				if (lpBiz.getChild("Addr1").getText() != "")
					newLic.setAddress1(unescape(lpBiz.getChild("Addr1").getText()).replace(/\+/g, " "));
				if (lpBiz.getChild("Addr2").getText() != "")
					newLic.setAddress2(unescape(lpBiz.getChild("Addr2").getText()).replace(/\+/g, " "));
				if (lpBiz.getChild("City").getText() != "")
					newLic.setCity(unescape(lpBiz.getChild("City").getText()).replace(/\+/g, " "));
				if (lpBiz.getChild("State").getText() != "")
					newLic.setState(unescape(lpBiz.getChild("State").getText()).replace(/\+/g, " "));
				if (lpBiz.getChild("Zip").getText() != "")
					newLic.setZip(unescape(lpBiz.getChild("Zip").getText()).replace(/\+/g, " "));
				if (lpBiz.getChild("BusinessPhoneNum").getText() != "")
					newLic.setPhone1(unescape(stripNN(lpBiz.getChild("BusinessPhoneNum").getText()).replace(/\+/g, " ")));
				newLic.setAgencyCode(aa.getServiceProviderCode());
			newLic.setAuditDate(sysDate);
			newLic.setAuditID(currentUserID);
			newLic.setAuditStatus("A");
			newLic.setLicenseType(rlpType);
			newLic.setLicState("CA"); // hardcode CA
			newLic.setStateLicense(licNum);

			if (lpBiz.getChild("IssueDt").getText())
				newLic.setLicenseIssueDate(aa.date.parseDate(lpBiz.getChild("IssueDt").getText()));
			if (lpBiz.getChild("ExpireDt").getText())
				newLic.setLicenseExpirationDate(aa.date.parseDate(lpBiz.getChild("ExpireDt").getText()));
			if (lpBiz.getChild("ReissueDt").getText())
				newLic.setLicenseLastRenewalDate(aa.date.parseDate(lpBiz.getChild("ReissueDt").getText()));

			var wcs = root.getChild("WorkersComp").getChildren();

			for (var j = 0; j < wcs.size(); j++) {
				wc = wcs.get(j);

				if (wc.getAttribute("PolicyNo").getValue())
					newLic.setWcPolicyNo(wc.getAttribute("PolicyNo").getValue());
				if (wc.getAttribute("InsCoCde").getValue())
					newLic.setWcInsCoCode(unescape(wc.getAttribute("InsCoCde").getValue()));
				if (wc.getAttribute("WCEffDt").getValue())
					newLic.setWcEffDate(aa.date.parseDate(wc.getAttribute("WCEffDt").getValue()))
					if (wc.getAttribute("WCExpDt").getValue())
						newLic.setWcExpDate(aa.date.parseDate(wc.getAttribute("WCExpDt").getValue()))
						if (wc.getAttribute("WCCancDt").getValue())
							newLic.setWcCancDate(aa.date.parseDate(wc.getAttribute("WCCancDt").getValue()))
							if (wc.getAttribute("Exempt").getValue() == "E")
								newLic.setWcExempt("Y");
							else
								newLic.setWcExempt("N");

				break; // only use first
			}

			//
			// Do the refresh/create and get the sequence number
			//
			if (updating) {
				var myResult = aa.licenseScript.editRefLicenseProf(newLic);
				var licSeqNbr = newLic.getLicSeqNbr();
			} else {
				var myResult = aa.licenseScript.createRefLicenseProf(newLic);

				if (!myResult.getSuccess()) {
					logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
					continue;
				}

				var licSeqNbr = myResult.getOutput()
			}

			logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " Sequence Number " + licSeqNbr);

			/////
			/////  Attribute Data -- first copy from the transactional LP if it exists
			/////


			if (isObject) // update the reference LP with attributes from the transactional, if we have some.
			{
				var attrArray = licObj.getAttributes();

				if (attrArray) {
					for (var k in attrArray) {
						var attr = attrArray[k];
						editRefLicProfAttribute(licNum, attr.getAttributeName(), attr.getAttributeValue());
					}
				}
			}

			/////
			/////  Attribute Data
			/////
			/////  NOTE!  Agencies may have to configure template data below based on their configuration.  Please note all edits
			/////

			var cbs = root.getChild("Classifications").getChildren();
			for (var m = 0; m < cbs.size(); m++) {
				cb = cbs.get(m);

				if (m == 0) {
					editRefLicProfAttribute(licNum, "CLASS CODE 1", cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum, "CLASS DESC 1", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
				}

				if (m == 1) {
					editRefLicProfAttribute(licNum, "CLASS CODE 2", cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum, "CLASS DESC 2", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
				}
				if (m == 2) {
					editRefLicProfAttribute(licNum, "CLASS CODE 3", cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum, "CLASS DESC 3", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
				}

				if (m == 3) {
					editRefLicProfAttribute(licNum, "CLASS CODE 4", cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum, "CLASS DESC 4", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
				}
			}

			var bos = root.getChild("ContractorBond").getChildren();

			for (var n = 0; n < bos.size(); n++) {
				var bo = bos.get(n);
				if (bo.getAttribute("BondAmt").getValue())
					editRefLicProfAttribute(licNum, "BOND AMOUNT", unescape(bo.getAttribute("BondAmt").getValue()));
				if (bo.getAttribute("BondCancDt").getValue())
					editRefLicProfAttribute(licNum, "BOND EXPIRATION", unescape(bo.getAttribute("BondCancDt").getValue()));

				// Currently unused but could be loaded into custom attributes.
				/*
				aa.print("Bond Surety Type       : " + unescape(bo.getAttribute("SuretyTp").getValue()))
				aa.print("Bond Code              : " + unescape(bo.getAttribute("InsCoCde").getValue()))
				aa.print("Bond Insurance Company : " + unescape(bo.getAttribute("InsCoName").getValue()).replace(/\+/g," "))
				aa.print("Bond Number            : " + unescape(bo.getAttribute("BondNo").getValue()))
				aa.print("Bond Amount            : " + unescape(bo.getAttribute("BondAmt").getValue()))
				aa.print("Bond Effective Date    : " + unescape(bo.getAttribute("BondEffDt").getValue()))
				aa.print("Bond Cancel Date       : " + unescape(bo.getAttribute("BondCancDt").getValue()))
				 */
				break; // only use first bond
			}

			if (doPopulateTrx) {
				var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode, licSeqNbr)
					if (!lpsmResult.getSuccess()) {
						logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage());
					}

					var lpsm = lpsmResult.getOutput();

				// Remove from CAP

				var isPrimary = false;

				if (capLicenseArr != null) {
					for (var currLic in capLicenseArr) {
						var thisLP = capLicenseArr[currLic];
						if (thisLP.getLicenseType() == rlpType && thisLP.getLicenseNbr() == licNum) {
							logDebug("Removing license: " + thisLP.getLicenseNbr() + " from CAP.  We will link the new reference LP");
							if (thisLP.getPrintFlag() == "Y") {
								logDebug("...remove primary status...");
								isPrimary = true;
								thisLP.setPrintFlag("N");
								aa.licenseProfessional.editLicensedProfessional(thisLP);
							}
							var remCapResult = aa.licenseProfessional.removeLicensedProfessional(thisLP);
							if (capLicenseResult.getSuccess()) {
								logDebug("...Success.");
							} else {
								logDebug("**WARNING removing lic prof: " + remCapResult.getErrorMessage());
							}
						}
					}
				}

				// add the LP to the CAP
				var asCapResult = aa.licenseScript.associateLpWithCap(itemCap, lpsm)
					if (!asCapResult.getSuccess()) {
						logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage())
					} else {
						logDebug("Associated the CAP to the new LP")
					}

					// Now make the LP primary again
					if (isPrimary) {
						var capLps = getLicenseProfessional(itemCap);

						for (var thisCapLpNum in capLps) {
							if (capLps[thisCapLpNum].getLicenseNbr().equals(licNum)) {
								var thisCapLp = capLps[thisCapLpNum];
								thisCapLp.setPrintFlag("Y");
								aa.licenseProfessional.editLicensedProfessional(thisCapLp);
								logDebug("Updated primary flag on Cap LP : " + licNum);

								// adding this return will cause the test script to work without error, even though this is the last statement executed
								//if (returnMessage.length > 0) return returnMessage;
								//else return null;

							}
						}
					}
			} // do populate on the CAP
		} // do populate on the REF
	} // for each license

	if (returnMessage.length > 0)
		return returnMessage;
	else
		return null;

} // end function 
 
function feeAmount(feestr) {
	// optional statuses to check for (SR5082)
	//
	var checkStatus = false;
	var statusArray = new Array();

	//get optional arguments
	if (arguments.length > 1) {
		checkStatus = true;
		for (var i = 1; i < arguments.length; i++)
			statusArray.push(arguments[i]);
	}

	var feeTotal = 0;
	var feeResult = aa.fee.getFeeItems(capId, feestr, null);
	if (feeResult.getSuccess()) {
		var feeObjArr = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + feeResult.getErrorMessage());
		return false
	}

	for (ff in feeObjArr)
		if (feestr.equals(feeObjArr[ff].getFeeCod()) && (!checkStatus || exists(feeObjArr[ff].getFeeitemStatus(), statusArray)))
			feeTotal += feeObjArr[ff].getFee()

			return feeTotal;
} 
 

//Parameter 1 = CapId, Parameter 2 to n = Fee Code to ignore
function feeAmountExcept(checkCapId) 
	{
   	var checkStatus = false;
	var exceptArray = new Array(); 
	//get optional arguments 
	if (arguments.length > 1)
		{
		checkStatus = true;
		for (var i=1; i<arguments.length; i++)
			exceptArray.push(arguments[i]);
		}
        
	var feeTotal = 0;
	var feeResult=aa.fee.getFeeItems(checkCapId);
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if ( !checkStatus || !exists(feeObjArr[ff].getFeeCod(),exceptArray) )
			feeTotal+=feeObjArr[ff].getFee()
			
	return feeTotal;
	}

 
 
function feeBalance(feestr) {
	// Searches payment fee items and returns the unpaid balance of a fee item
	// Sums fee items if more than one exists.  Optional second parameter fee schedule
	var amtFee = 0;
	var amtPaid = 0;
	var feeSch;

	if (arguments.length == 2)
		feeSch = arguments[1];

	var feeResult = aa.fee.getFeeItems(capId, feestr, null);
	if (feeResult.getSuccess()) {
		var feeObjArr = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
		return false
	}

	for (ff in feeObjArr)
		if (feeObjArr[ff].getFeeitemStatus() != "INVOICED" && (!feestr || feestr.equals(feeObjArr[ff].getFeeCod())) && (!feeSch || feeSch.equals(feeObjArr[ff].getF4FeeItemModel().getFeeSchudle()))) {
			amtFee += feeObjArr[ff].getFee();
			var pfResult = aa.finance.getPaymentFeeItems(capId, null);
			if (pfResult.getSuccess()) {
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
						amtPaid += pfObj[ij].getFeeAllocation()
			}
		}
	return amtFee - amtPaid;
} 
 
function feeBalanceFromDate(searchDays,feestr)
	{
	// Searches payment fee items and returns the unpaid balance of a fee item
	// searchDays = Days in future or past to search for ex. -120 would search for today -120 days
	// feestr = Fee Code to search for
	// optional 3rd parameter Fee Schedule
	// to get balance of fee schedule use following example feeBalanceFromDate(-120,null,"SCHEDULE");
	// to get balance of all fees use following feeBalanceFromDate(-120,null);
	var amtFee = 0;
	var amtPaid = 0;
	var feeSch;
	var jsFeeDate = new Date();
	
	var jsStartDate = new Date();
	jsStartDate.setDate(jsStartDate.getDate() + searchDays);
	

	if (arguments.length == 3) feeSch = arguments[2]; 

	var feeResult=aa.fee.getFeeItems(capId);
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
	{
		jsFeeDate.setTime(feeObjArr[ff].getApplyDate().getEpochMilliseconds());
		if ((!feestr || feestr.equals(feeObjArr[ff].getFeeCod())) && (!feeSch || feeSch.equals(feeObjArr[ff].getF4FeeItemModel().getFeeSchudle())) && (jsFeeDate  >= jsStartDate))
			{
			amtFee+=feeObjArr[ff].getFee();
			var pfResult = aa.finance.getPaymentFeeItems(capId, null);
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
						amtPaid+=pfObj[ij].getFeeAllocation()
				}
			}
	}
	return amtFee - amtPaid;
	} 
 
function feeCopyByDateRange(pStartDate, pEndDate) 
	// gets total for fees assessed during date range
	// optional fee statuses to check for						
	{
	//get End and Start Dates
	var jsStartDate = new Date(pStartDate);
	jsStartDate.setHours(0,0,0,0); //Bring StartDate to 00:00 AM
	var jsEndDate = new Date(pEndDate);
	jsEndDate.setHours(23,59,59,999); //Bring EndDate close to midnight
	
	//logDebug("Start Date: "+ (jsStartDate.getMonth()+1).toString() +"/"+jsStartDate.getDate()+"/"+jsStartDate.getFullYear() + " End Date: " + (jsEndDate.getMonth()+1).toString() +"/"+jsEndDate.getDate()+"/"+jsEndDate.getFullYear());

	//get optional arguments 
	var checkStatus = false;
	var statusArray = new Array(); 
	if (arguments.length > 2)
		{
		checkStatus = true;
		for (var i=2; i<arguments.length; i++)
			statusArray.push(arguments[i]);
		}

	//get all feeitems on CAP
	var feeResult=aa.fee.getFeeItems(capId);
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	//get total applicable fees
	var feesTotal = 0;
	var jsFeeDate = new Date();
	for (ff in feeObjArr)
		{
		jsFeeDate.setTime(feeObjArr[ff].getApplyDate().getEpochMilliseconds());
		//logDebug("Fee Apply Date: "+(jsFeeDate.getMonth()+1).toString() +"/"+ jsFeeDate.getDate()+"/"+jsFeeDate.getFullYear());
		if (jsFeeDate  >= jsStartDate && jsFeeDate <= jsEndDate && (!checkStatus || exists(feeObjArr[ff].getFeeitemStatus(),statusArray) ) )
			{
			 addFee(ffeObjArr[ff].getFeeCod(),  ffeObjArr[ff].getFeeSchudle() ,  ffeObjArr[ff].getPaymentPeriod() ,  ffeObjArr[ff].getFeeUnit() ,    'Y') 
			//logDebug("Added to Total: "+feeObjArr[ff].getFee());
			}
		}
			
	return feesTotal;
	}

 
 
function feeExists(feestr) // optional statuses to check for
{
	var checkStatus = false;
	var statusArray = new Array();

	//get optional arguments
	if (arguments.length > 1) {
		checkStatus = true;
		for (var i = 1; i < arguments.length; i++)
			statusArray.push(arguments[i]);
	}

	var feeResult = aa.fee.getFeeItems(capId, feestr, null);
	if (feeResult.getSuccess()) {
		var feeObjArr = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
		return false
	}

	for (ff in feeObjArr)
		if (feestr.equals(feeObjArr[ff].getFeeCod()) && (!checkStatus || exists(feeObjArr[ff].getFeeitemStatus(), statusArray)))
			return true;

	return false;
} 
 
function feeGetTotByDateRange(pStartDate, pEndDate) 
	// gets total for fees assessed during date range
	// optional fee statuses to check for						
	{
	//get End and Start Dates
	var jsStartDate = new Date(pStartDate);
	jsStartDate.setHours(0,0,0,0); //Bring StartDate to 00:00 AM
	var jsEndDate = new Date(pEndDate);
	jsEndDate.setHours(23,59,59,999); //Bring EndDate close to midnight
	
	//logDebug("Start Date: "+ (jsStartDate.getMonth()+1).toString() +"/"+jsStartDate.getDate()+"/"+jsStartDate.getFullYear() + " End Date: " + (jsEndDate.getMonth()+1).toString() +"/"+jsEndDate.getDate()+"/"+jsEndDate.getFullYear());

	//get optional arguments 
	var checkStatus = false;
	var statusArray = new Array(); 
	if (arguments.length > 2)
		{
		checkStatus = true;
		for (var i=2; i<arguments.length; i++)
			statusArray.push(arguments[i]);
		}

	//get all feeitems on CAP
	var feeResult=aa.fee.getFeeItems(capId);
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	//get total applicable fees
	var feesTotal = 0;
	var jsFeeDate = new Date();
	for (ff in feeObjArr)
		{
		jsFeeDate.setTime(feeObjArr[ff].getApplyDate().getEpochMilliseconds());
		//logDebug("Fee Apply Date: "+(jsFeeDate.getMonth()+1).toString() +"/"+ jsFeeDate.getDate()+"/"+jsFeeDate.getFullYear());
		if (jsFeeDate  >= jsStartDate && jsFeeDate <= jsEndDate && (!checkStatus || exists(feeObjArr[ff].getFeeitemStatus(),statusArray) ) )
			{
			feesTotal += feeObjArr[ff].getFee(); 
			//logDebug("Added to Total: "+feeObjArr[ff].getFee());
			}
		}
			
	return feesTotal;
	}

 
 
function feeQty(feestr) {
	var feeQty = 0;
	var feeResult = aa.fee.getFeeItems(capId, feestr, null);
	if (feeResult.getSuccess()) {
		var feeObjArr = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
		return false
	}

	for (ff in feeObjArr)
		if (feestr.equals(feeObjArr[ff].getFeeCod()))
			feeQty += feeObjArr[ff].getFeeUnit();

	return feeQty;
}
 
 
function generateReport(itemCap,reportName,module,parameters) {

  //returns the report file which can be attached to an email.
  var user = currentUserID;   // Setting the User Name
  var report = aa.reportManager.getReportInfoModelByName(reportName);
  report = report.getOutput();
  report.setModule(module);
  report.setCapId(itemCap.getCustomID());
  report.setReportParameters(parameters); 

  var permit = aa.reportManager.hasPermission(reportName,user);

  if (permit.getOutput().booleanValue()) {
    var reportResult = aa.reportManager.getReportResult(report);
    if(reportResult) {
      reportOutput = reportResult.getOutput();
      var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
      reportFile=reportFile.getOutput();
      return reportFile;
    }  else {
      logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
      return false;
    }
  } else {
    logDebug("You have no permission.");
    return false;
  }
} 
 
function generateReport4Workflow(itemCap,reportName,module,parameters) {

  //returns the report file which can be attached to an email.
  var user = currentUserID;   // Setting the User Name
  var report = aa.reportManager.getReportModelByName(reportName);
  report = report.getOutput();
  //report.setModule(module);
  //report.setCapId(itemCap);
  //report.setReportParameters(parameters); 

  var permit = aa.reportManager.hasPermission(reportName,user);

  if (permit.getOutput().booleanValue()) {
    var reportResult = aa.reportManager.runReport(parameters,report);
    if(reportResult) {
      return reportOutput = reportResult.getOutput();
      
    }  else {
      logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
      return false;
    }
  } else {
    logDebug("You have no permission.");
    return false;
  }
} 
 
function genericTemplateObject(gtmp) {
	this.ASI = new Array(); //Condition Array
	this.ASIT = new Array();
	this.hasASI = false;
	this.hasTables = false;
	this.template = gtmp;

	var formGroupsObj = template.getTemplateForms();
	var formGroups = new Array();
	if (formGroupsObj != null) {
		aa.print(formGroupsObj);
		formGroups = formGroupsObj.toArray();
		for (grp in formGroups) {
			var subgroupsObj = formGroups[grp].getSubgroups();
			if (subgroupsObj != null) {
				var subgroups = subgroupsObj.toArray();
				this.hasASI = true;
				for (sgrp in subgroups) {
					var sgrpName = subgroups[sgrp].getSubgroupName();
					var fields = subgroups[sgrp].getFields().toArray();
					for (fld in fields) {
						this.ASI[sgrpName + "." + fields[fld].getFieldName()] = fields[fld].getDefaultValue();
					}
				}
			}
		}
	}

	var tableGroupsObj = template.getTemplateTables();
	var tableGroups = new Array();
	if (tableGroupsObj != null) {
		var tableGroups = tableGroupsObj.toArray();
		for (grp in tableGroups) {
			var subgroupsObj = tableGroups[grp].getSubgroups();
			if (subgroupsObj != null) {
				var subgroups = subgroupsObj.toArray();
				for (sgrp in subgroups) {
					var sgrpName = subgroups[sgrp].getSubgroupName();
					this.ASIT[sgrpName] = new Array();
					this.hasTables = true;
					var rowsObj = subgroups[sgrp].getRows();
					if (rowsObj != null) {
						var rows = rowsObj.toArray();
						for (i = 0; i < rows.length; i++) {
							this.ASIT[sgrpName][i] = new Array();
							var fields = rows[i].getValues().toArray();
							for (fld in fields) {
								this.ASIT[sgrpName][i][fields[fld].getFieldName()] = fields[fld].getValue();
							}
						}
					}
				}
			}
		}
	}

	return this;
} 
 
 function getACADocDownloadParam4Notification(params,acaUrl,docModel) {

	// pass in a hashtable and it will add the additional parameters to the table



	addParameter(params, "$$acaDocDownloadUrl$$", getACADocumentDownloadUrl(acaUrl,docModel));

	

	return params;	

}



 
 
 function getACADocumentDownloadUrl(acaUrl,documentModel) {

   	

   	//returns the ACA URL for supplied document model



	var acaUrlResult = aa.document.getACADocumentUrl(acaUrl, documentModel);

	if(acaUrlResult.getSuccess())

	{

		acaDocUrl = acaUrlResult.getOutput();

		return acaDocUrl;

	}

	else

	{

		logDebug("Error retrieving ACA Document URL: " + acaUrlResult.getErrorType());

		return false;

	}

}





 
 
 function getACARecordParam4Notification(params,acaUrl) {

	// pass in a hashtable and it will add the additional parameters to the table



	addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl));

	

	return params;	

}



 
 
 function getACARecordURL(acaUrl) {

	

	var acaRecordUrl = "";

	var id1 = capId.ID1;

 	var id2 = capId.ID2;

 	var id3 = capId.ID3;



   	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";   

	acaRecordUrl += "&Module=" + cap.getCapModel().getModuleName();

	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;

	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();



   	return acaRecordUrl;

}
 
 
function getACAUrl(){

	// returns the path to the record on ACA.  Needs to be appended to the site

	itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args
   	var acaUrl = "";
	var id1 = capId.getID1();
	var id2 = capId.getID2();
	var id3 = capId.getID3();
	var cap = aa.cap.getCap(capId).getOutput().getCapModel();

	acaUrl += "/urlrouting.ashx?type=1000";
	acaUrl += "&Module=" + cap.getModuleName();
	acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
	return acaUrl;
	}
 
 
function getAddressCountyByAddressType(aType) { //optional capId parameter
	var itemCap = capId
    if (arguments.length > 1)
        itemCap = arguments[1]; // use cap ID specified in args

    var addResult = aa.address.getAddressByCapId(itemCap);

    if (addResult.getSuccess()) {
    	var addArray = addResult.getOutput();
    	for (var jj in addArray) {
    		var thisAddress = addArray[jj];
    		if (thisAddress.getAddressType() != null) {
	      		if (String(thisAddress.getAddressType()).toUpperCase().equals(aType.toUpperCase())) {
	    			return thisAddress.getCounty();
	    		}		
    		} 
    	}
    } else {
    	logDebug("Could not return address: " + addResult.getErrorMessage());
    	return false;
    }

    logDebug("Could not find an address of type: " + aType);
    return false;
} 
 
function getAddressLineByAddressType(aType) { //optional capId parameter
	var itemCap = capId
    if (arguments.length > 1)
        itemCap = arguments[1]; // use cap ID specified in args

    var addResult = aa.address.getAddressByCapId(itemCap);

    if (addResult.getSuccess()) {
    	var addArray = addResult.getOutput();
    	for (var jj in addArray) {
    		var thisAddress = addArray[jj];
    		if (thisAddress.getAddressType() != null) {
	      		if (String(thisAddress.getAddressType()).toUpperCase().equals(aType.toUpperCase())) {
	    			return thisAddress.getDisplayAddress();
	    		}		
    		} 
    	}
    } else {
    	logDebug("Could not return address: " + addResult.getErrorMessage());
    	return false;
    }

    logDebug("Could not find an address of type: " + aType);
    return false;
} 
 
 function getAppConditions(params,pType,pStatus,pDesc,pImpact) {



    if (pType==null)

        var condResult = aa.capCondition.getCapConditions(capId);

    else

        var condResult = aa.capCondition.getCapConditions(capId,pType);

        

    if (condResult.getSuccess())

        var capConds = condResult.getOutput();

    else { 

        logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());

        logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());

    }

    

    var cStatus;

    var cDesc;

    var cImpact;

    

    var condForEmail = "";



    for (cc in capConds) {

        var thisCond = capConds[cc];

        var cStatus = thisCond.getConditionStatus();

        var cDesc = thisCond.getConditionDescription();

        var cPubDisplayMessage = thisCond.getDispPublicDisplayMessage();

        var cImpact = thisCond.getImpactCode();

        var cType = thisCond.getConditionType();

        if (cStatus==null)

            cStatus = " ";

        if (cDesc==null)

            cDesc = " ";

        if (cImpact==null)

            cImpact = " ";

        //Look for matching condition

        

        if ( (pStatus==null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc==null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact==null || pImpact.toUpperCase().equals(cImpact.toUpperCase())))

            condForEmail += cDesc + ": " + cPubDisplayMessage;

    }



    addParameter(params, "$$conditions$$", condForEmail);



    return params; 



}
 
 
function getAppIdByASI(ASIName,ASIValue,ats)
	//
	// returns the cap Id string of an application based on App-Specific Info and applicationtype.  Returns first result only!
	//
	{
	var ata = ats.split("/");
	if (ata.length != 4)
		logDebug("**ERROR: getAppIdByASI in appMatch.  The following Application Type String is incorrectly formatted: " + ats);

	var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(ASIName,ASIValue);
	if (getCapResult.getSuccess())
		var apsArray = getCapResult.getOutput();
	else
		{ logDebug( "**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()) ; return null }
		

	for (aps in apsArray)
		{
		myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
		myAppTypeString = myCap.getCapType().toString();
		myAppTypeArray = myAppTypeString.split("/");

		isMatch = true;
		for (xx in ata)
			if (!ata[xx].equals(myAppTypeArray[xx]) && !ata[xx].equals("*"))
				isMatch = false;
		
		if (isMatch)
			{
			logDebug("getAppIdByName(" + ASIName + "," + ASIValue + "," + ats + ") Returns " + apsArray[aps].getCapID().toString()); 
			return apsArray[aps].getCapID().toString()
			}
		}
	}

 
 
function getAppIdByName(gaGroup,gaType,gaName)
//
// returns the cap Id string of an application that has group,type,and name
//
	{
	getCapResult = aa.cap.getByAppType(gaGroup,gaType);
	if (getCapResult.getSuccess())
		var apsArray = getCapResult.getOutput();
	else
		{ logDebug( "**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()) ; return null }
		

	for (aps in apsArray)
		{
		var myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
		if (myCap.getSpecialText().equals(gaName))
			{
			logDebug("getAppIdByName(" + gaGroup + "," + gaType + "," + gaName + ") Returns " + apsArray[aps].getCapID().toString()); 
			return apsArray[aps].getCapID().toString()
			}
		}
	}
 
 
function getApplication(appNum) 
//
// returns the capId object of an application
//
	{
	var getCapResult = aa.cap.getCapID(appNum);
	if (getCapResult.getSuccess())
		return getCapResult.getOutput();
	else
		{ logDebug( "**ERROR: getting cap id (" + appNum + "): " + getCapResult.getErrorMessage()) }
	}

 
 
function getAppSpecific(itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}

 
 
function getCapByAddress(ats) 
//
// returns the capid that matches the current address and app type string
// if multiple records will return the first and warning.
//
	{
	var retArr = new Array();
	
	// get address data
	var addResult = aa.address.getAddressByCapId(capId);
	if (addResult.getSuccess())
		{ var aoArray = addResult.getOutput(); }
	else	
		{ logDebug("**ERROR: getting address by cap ID: " + addResult.getErrorMessage()); return false; }
	
	if (aoArray.length)
		{ var ao = aoArray[0]; }
	else
		{ logDebug("**WARNING: no address for comparison:"); return false; }
	
	// get caps with same address
	var capAddResult = aa.cap.getCapListByDetailAddress(ao.getStreetName(),ao.getHouseNumberStart(),ao.getStreetSuffix(),ao.getZip(),ao.getStreetDirection(),null);
	if (capAddResult.getSuccess())
	 	{ var capIdArray=capAddResult.getOutput(); }
	else
	 	{ logDebug("**ERROR: getting similar addresses: " + capAddResult.getErrorMessage());  return false; }
	
	
	// loop through related caps
	for (cappy in capIdArray)
		{
		// get file date
		var relcap = aa.cap.getCap(capIdArray[cappy].getCapID()).getOutput();
		
		// get cap type
		
		reltype = relcap.getCapType().toString();
		
		var isMatch = true;
		var ata = ats.split("/");
		if (ata.length != 4)
			logDebug("**ERROR: The following Application Type String is incorrectly formatted: " + ats);
		else
			for (xx in ata)
				if (!ata[xx].equals(appTypeArray[xx]) && !ata[xx].equals("*"))
					isMatch = false;

		if (isMatch)			
			retArr.push(capIdArray[cappy]);

		} // loop through related caps
		
	if (retArr.length > 1)
		{
		logDebug("**WARNING: Multiple caps returned for this address/apptype") ; return retArr[0] 
		}
	
	if (retArr.length == 0)
		return retArr[0];
		
	}

 
 
function getCapId() {

	var s_id1 = aa.env.getValue("PermitId1");
	var s_id2 = aa.env.getValue("PermitId2");
	var s_id3 = aa.env.getValue("PermitId3");

	if (s_id1 == null || s_id1 == ""
		 || s_id2 == null || s_id2 == ""
		 || s_id3 == null || s_id3 == "") {
		return null;
	}
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
	if (s_capResult.getSuccess())
		return s_capResult.getOutput();
	else {
		logDebug("function getCapID: failed to get capId from script environment: " + s_capResult.getErrorMessage());
		return null;
	}
}
 
 
function getCapsWithConditionsRelatedByRefContact(itemCap,capType,pType,pStatus,pDesc,pImpact) {
	var matchingCapArray = new Array();
	var c = aa.people.getCapContactByCapID(itemCap).getOutput()
	for (var i in c)
		   {
		   var con = c[i];
		   if (con.getCapContactModel().getRefContactNumber())
		       {
			var p = con.getPeople();
			var psm = aa.people.createPeopleModel().getOutput()

			psm.setContactSeqNumber(con.getCapContactModel().getRefContactNumber());

			var cResult = aa.people.getCapIDsByRefContact(psm);  // needs 7.1
			if (cResult.getSuccess()) {
				var cList = cResult.getOutput();
				for (var j in cList) {
					var thisCapId = cList[j];
					if (appMatch(capType,thisCapId)) {
						if (pType==null)
							var condResult = aa.capCondition.getCapConditions(thisCapId);
						else
							var condResult = aa.capCondition.getCapConditions(thisCapId,pType);

						if (condResult.getSuccess())
							var capConds = condResult.getOutput();
						else
							{
							logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
							logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
							return false;
							}

						var cStatus;
						var cDesc;
						var cImpact;

						for (cc in capConds)
							{
							var thisCond = capConds[cc];
							var cStatus = thisCond.getConditionStatus();
							var cDesc = thisCond.getConditionDescription();
							var cImpact = thisCond.getImpactCode();
							var cType = thisCond.getConditionType();
							if (cStatus==null)
								cStatus = " ";
							if (cDesc==null)
								cDesc = " ";
							if (cImpact==null)
								cImpact = " ";
							//Look for matching condition

							if ( (pStatus==null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc==null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact==null || pImpact.toUpperCase().equals(cImpact.toUpperCase())))
								matchingCapArray.push(thisCapId);
							}
						}
					}
				}
			}
		}
	} 
 
function getChildren(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ logDebug( "**WARNING: getChildren function found no children"); return null ; }

	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (xx in childArray)
		{
		childCapId = childArray[xx].getCapID();
		if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
			continue;

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
		childTypeArray = capTypeStr.split("/");
		isMatch = true;
		for (yy in childTypeArray) //looking for matching cap type
			{
			if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
				{
				isMatch = false;
				continue;
				}
			}
		if (isMatch)
			retArray.push(childCapId);
		}
		
	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray;

	}
	
 
 
function getChildTasks(taskName) {
	var childTasks = new Array();
	var childId = null;
	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args

		var workflowResult = aa.workflow.getTaskItems(itemCap, taskName, null, null, null, null);
	var wfObj = workflowResult.getOutput();
	for (i in wfObj) {
		var fTaskSM = wfObj[i];
		if (fTaskSM.getTaskDescription().equals(taskName)) {
			var relationArray = aa.workflow.getProcessRelationByCapID(itemCap, null).getOutput()
				for (thisRel in relationArray) {
					y = relationArray[thisRel]
						if (y.getParentTaskName() && y.getParentTaskName().equals(fTaskSM.getTaskDescription()))
							childId = y.getProcessID()
				}
		}
	}

	for (i in wfObj) {
		var fTaskSM = wfObj[i];
		if (fTaskSM.getProcessID() == childId)
			childTasks.push(fTaskSM)
	}

	return childTasks;

}
 
 
function getCAPConditions(pType, pStatus, pDesc, pImpact) // optional capID
{
	var resultArray = new Array();
	var lang = "en_US";

	var bizDomainModel4Lang = aa.bizDomain.getBizDomainByValue("I18N_SETTINGS", "I18N_DEFAULT_LANGUAGE");
	if (bizDomainModel4Lang.getSuccess())
		lang = bizDomainModel4Lang.getOutput().getDescription();

	if (arguments.length > 4)
		var itemCap = arguments[4]; // use cap ID specified in args
	else
		var itemCap = capId;

	////////////////////////////////////////
	// Check Records
	////////////////////////////////////////

	if (pType == null)
		var condResult = aa.capCondition.getCapConditions(itemCap);
	else
		var condResult = aa.capCondition.getCapConditions(itemCap, pType);

	if (condResult.getSuccess())
		var capConds = condResult.getOutput();
	else {
		var capConds = new Array();
		logDebug("**WARNING: getting cap conditions: " + condResult.getErrorMessage());
	}

	var cStatus;
	var cDesc;
	var cImpact;

	for (cc in capConds) {
		var thisCond = capConds[cc];
		var cStatus = thisCond.getConditionStatus();
		var cDesc = thisCond.getConditionDescription();
		var cImpact = thisCond.getImpactCode();
		var cType = thisCond.getConditionType();
		var cComment = thisCond.getConditionComment();
		var cExpireDate = thisCond.getExpireDate();

		if (cStatus == null)
			cStatus = " ";
		if (cDesc == null)
			cDesc = " ";
		if (cImpact == null)
			cImpact = " ";
		//Look for matching condition

		if ((pStatus == null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc == null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact == null || pImpact.toUpperCase().equals(cImpact.toUpperCase()))) {
			var r = new condMatchObj;
			r.objType = "Record";
			r.object = thisCond;
			r.status = cStatus;
			r.type = cType;
			r.impact = cImpact;
			r.description = cDesc;
			r.comment = cComment;
			r.expireDate = cExpireDate;

			var langCond = aa.condition.getCondition(thisCond, lang).getOutput();

			r.arObject = langCond;
			r.arDescription = langCond.getResConditionDescription();
			r.arComment = langCond.getResConditionComment();

			resultArray.push(r);
		}
	}

	return resultArray;
}
function getAddressConditions(pType, pStatus, pDesc, pImpact) // optional capID
{
	var resultArray = new Array();
	var lang = "en_US";

	var bizDomainModel4Lang = aa.bizDomain.getBizDomainByValue("I18N_SETTINGS", "I18N_DEFAULT_LANGUAGE");
	if (bizDomainModel4Lang.getSuccess())
		lang = bizDomainModel4Lang.getOutput().getDescription();

	if (arguments.length > 4)
		var itemCap = arguments[4]; // use cap ID specified in args
	else
		var itemCap = capId;
	////////////////////////////////////////
	// Check Address
	////////////////////////////////////////

	var addrResult = aa.address.getAddressByCapId(itemCap);
	if (!addrResult.getSuccess()) {
		logDebug("**WARNING: getting CAP addresses: " + addrResult.getErrorMessage());
		var addrArray = new Array();
	} else {
		var addrArray = addrResult.getOutput();
		if (!addrArray)
			addrArray = new Array();
	}

	for (var thisAddr in addrArray)
		if (addrArray[thisAddr].getRefAddressId()) {
			addCondResult = aa.addressCondition.getAddressConditions(addrArray[thisAddr].getRefAddressId())
				if (!addCondResult.getSuccess()) {
					logDebug("**WARNING: getting Address Conditions : " + addCondResult.getErrorMessage());
					var addrCondArray = new Array();
				} else {
					var addrCondArray = addCondResult.getOutput();
				}

				for (var thisAddrCond in addrCondArray) {
					var thisCond = addrCondArray[thisAddrCond];
					var cType = thisCond.getConditionType();
					var cStatus = thisCond.getConditionStatus();
					var cDesc = thisCond.getConditionDescription();
					var cImpact = thisCond.getImpactCode();
					var cType = thisCond.getConditionType();
					var cComment = thisCond.getConditionComment();
					var cExpireDate = thisCond.getExpireDate();

					if (cType == null)
						cType = " ";
					if (cStatus == null)
						cStatus = " ";
					if (cDesc == null)
						cDesc = " ";
					if (cImpact == null)
						cImpact = " ";

					if ((pType == null || pType.toUpperCase().equals(cType.toUpperCase())) && (pStatus == null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc == null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact == null || pImpact.toUpperCase().equals(cImpact.toUpperCase()))) {
						var r = new condMatchObj;
						r.objType = "Address";
						r.addressObj = addrArray[thisAddr];
						r.status = cStatus;
						r.type = cType;
						r.impact = cImpact;
						r.description = cDesc;
						r.comment = cComment;
						r.expireDate = cExpireDate;

						var langCond = aa.condition.getCondition(thisCond, lang).getOutput();

						r.arObject = langCond;
						r.arDescription = langCond.getResConditionDescription();
						r.arComment = langCond.getResConditionComment();

						resultArray.push(r);
					}
				}
		}

	return resultArray;
}
function getParcelConditions(pType, pStatus, pDesc, pImpact) // optional capID
{
	var resultArray = new Array();
	var lang = "en_US";

	var bizDomainModel4Lang = aa.bizDomain.getBizDomainByValue("I18N_SETTINGS", "I18N_DEFAULT_LANGUAGE");
	if (bizDomainModel4Lang.getSuccess())
		lang = bizDomainModel4Lang.getOutput().getDescription();

	if (arguments.length > 4)
		var itemCap = arguments[4]; // use cap ID specified in args
	else
		var itemCap = capId;
	////////////////////////////////////////
	// Check Parcel
	////////////////////////////////////////

	var parcResult = aa.parcel.getParcelDailyByCapID(itemCap, null);
	if (!parcResult.getSuccess()) {
		logDebug("**WARNING: getting CAP addresses: " + parcResult.getErrorMessage());
		var parcArray = new Array();
	} else {
		var parcArray = parcResult.getOutput();
		if (!parcArray)
			parcArray = new Array();
	}

	for (var thisParc in parcArray)
		if (parcArray[thisParc].getParcelNumber()) {
			parcCondResult = aa.parcelCondition.getParcelConditions(parcArray[thisParc].getParcelNumber())
				if (!parcCondResult.getSuccess()) {
					logDebug("**WARNING: getting Parcel Conditions : " + parcCondResult.getErrorMessage());
					var parcCondArray = new Array();
				} else {
					var parcCondArray = parcCondResult.getOutput();
				}

				for (var thisParcCond in parcCondArray) {
					var thisCond = parcCondArray[thisParcCond];
					var cType = thisCond.getConditionType();
					var cStatus = thisCond.getConditionStatus();
					var cDesc = thisCond.getConditionDescription();
					var cImpact = thisCond.getImpactCode();
					var cType = thisCond.getConditionType();
					var cComment = thisCond.getConditionComment();
					var cExpireDate = thisCond.getExpireDate();

					if (cType == null)
						cType = " ";
					if (cStatus == null)
						cStatus = " ";
					if (cDesc == null)
						cDesc = " ";
					if (cImpact == null)
						cImpact = " ";

					if ((pType == null || pType.toUpperCase().equals(cType.toUpperCase())) && (pStatus == null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc == null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact == null || pImpact.toUpperCase().equals(cImpact.toUpperCase()))) {
						var r = new condMatchObj;
						r.objType = "Parcel";
						r.parcelObj = parcArray[thisParc];
						r.status = cStatus;
						r.type = cType;
						r.impact = cImpact;
						r.description = cDesc;
						r.comment = cComment;
						r.expireDate = cExpireDate;

						var langCond = aa.condition.getCondition(thisCond, lang).getOutput();

						r.arObject = langCond;
						r.arDescription = langCond.getResConditionDescription();
						r.arComment = langCond.getResConditionComment();

						resultArray.push(r);
					}
				}
		}

	return resultArray;
}
function getLicenseConditions(pType, pStatus, pDesc, pImpact) // optional capID
{
	var resultArray = new Array();
	var lang = "en_US";

	var bizDomainModel4Lang = aa.bizDomain.getBizDomainByValue("I18N_SETTINGS", "I18N_DEFAULT_LANGUAGE");
	if (bizDomainModel4Lang.getSuccess())
		lang = bizDomainModel4Lang.getOutput().getDescription();

	if (arguments.length > 4)
		var itemCap = arguments[4]; // use cap ID specified in args
	else
		var itemCap = capId;
	////////////////////////////////////////
	// Check License
	////////////////////////////////////////

	var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);

	if (!capLicenseResult.getSuccess()) {
		logDebug("**WARNING: getting CAP licenses: " + capLicenseResult.getErrorMessage());
		var licArray = new Array();
	} else {
		var licArray = capLicenseResult.getOutput();
		if (!licArray)
			licArray = new Array();
	}

	for (var thisLic in licArray)
		if (licArray[thisLic].getLicenseProfessionalModel().getLicSeqNbr()) {
			var licCondResult = aa.caeCondition.getCAEConditions(licArray[thisLic].getLicenseProfessionalModel().getLicSeqNbr());
			if (!licCondResult.getSuccess()) {
				logDebug("**WARNING: getting license Conditions : " + licCondResult.getErrorMessage());
				var licCondArray = new Array();
			} else {
				var licCondArray = licCondResult.getOutput();
			}

			for (var thisLicCond in licCondArray) {
				var thisCond = licCondArray[thisLicCond];
				var cType = thisCond.getConditionType();
				var cStatus = thisCond.getConditionStatus();
				var cDesc = thisCond.getConditionDescription();
				var cImpact = thisCond.getImpactCode();
				var cType = thisCond.getConditionType();
				var cComment = thisCond.getConditionComment();
				var cExpireDate = thisCond.getExpireDate();

				if (cType == null)
					cType = " ";
				if (cStatus == null)
					cStatus = " ";
				if (cDesc == null)
					cDesc = " ";
				if (cImpact == null)
					cImpact = " ";

				if ((pType == null || pType.toUpperCase().equals(cType.toUpperCase())) && (pStatus == null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc == null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact == null || pImpact.toUpperCase().equals(cImpact.toUpperCase()))) {
					var r = new condMatchObj;
					r.objType = "License";
					r.licenseObj = licArray[thisLic];
					r.status = cStatus;
					r.type = cType;
					r.impact = cImpact;
					r.description = cDesc;
					r.comment = cComment;
					r.expireDate = cExpireDate;

					var langCond = aa.condition.getCondition(thisCond, lang).getOutput();

					r.arObject = langCond;
					r.arDescription = langCond.getResConditionDescription();
					r.arComment = langCond.getResConditionComment();

					resultArray.push(r);
				}
			}
		}

	return resultArray;
}

function getContactConditions(pType, pStatus, pDesc, pImpact) // optional capID
{
	var resultArray = new Array();
	var lang = "en_US";

	var bizDomainModel4Lang = aa.bizDomain.getBizDomainByValue("I18N_SETTINGS", "I18N_DEFAULT_LANGUAGE");
	if (bizDomainModel4Lang.getSuccess())
		lang = bizDomainModel4Lang.getOutput().getDescription();

	if (arguments.length > 4)
		var itemCap = arguments[4]; // use cap ID specified in args
	else
		var itemCap = capId;
	////////////////////////////////////////
	// Check Contacts
	////////////////////////////////////////


	var capContactResult = aa.people.getCapContactByCapID(itemCap);

	if (!capContactResult.getSuccess()) {
		logDebug("**WARNING: getting CAP contact: " + capContactResult.getErrorMessage());
		var conArray = new Array();
	} else {
		var conArray = capContactResult.getOutput();
		if (!conArray)
			conArray = new Array();
	}

	for (var thisCon in conArray)
		if (conArray[thisCon].getCapContactModel().getRefContactNumber()) {
			var conCondResult = aa.commonCondition.getCommonConditions("CONTACT", conArray[thisCon].getCapContactModel().getRefContactNumber());

			if (!conCondResult.getSuccess()) {
				logDebug("**WARNING: getting contact Conditions : " + licCondResult.getErrorMessage());
				var conCondArray = new Array();
			} else {
				var conCondArray = conCondResult.getOutput();
			}

			for (var thisConCond in conCondArray) {
				var thisCond = conCondArray[thisConCond];
				var cType = thisCond.getConditionType();
				var cStatus = thisCond.getConditionStatus();
				var cDesc = thisCond.getConditionDescription();
				var cImpact = thisCond.getImpactCode();
				var cType = thisCond.getConditionType();
				var cComment = thisCond.getConditionComment();
				var cExpireDate = thisCond.getExpireDate();

				if (cType == null)
					cType = " ";
				if (cStatus == null)
					cStatus = " ";
				if (cDesc == null)
					cDesc = " ";
				if (cImpact == null)
					cImpact = " ";

				if ((pType == null || pType.toUpperCase().equals(cType.toUpperCase())) && (pStatus == null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc == null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact == null || pImpact.toUpperCase().equals(cImpact.toUpperCase()))) {
					var r = new condMatchObj;
					r.objType = "Contact";
					r.contactObj = conArray[thisCon];
					r.status = cStatus;
					r.type = cType;
					r.impact = cImpact;
					r.description = cDesc;
					r.comment = cComment;
					r.expireDate = cExpireDate;

					var langCond = aa.condition.getCondition(thisCond, lang).getOutput();

					r.arObject = langCond;
					r.arDescription = langCond.getResConditionDescription();
					r.arComment = langCond.getResConditionComment();

					resultArray.push(r);
				}
			}
		}

	return resultArray;
}

function getConditions(pType, pStatus, pDesc, pImpact) // optional capID
{
	var conditions = getCAPConditions(pType, pStatus, pDesc, pImpact);
	var addressConditions = getAddressConditions(pType, pStatus, pDesc, pImpact);
	if (addressConditions) {
		for (var i = 0; i < addressConditions.length; i++) {
			conditions.push(addressConditions[i]);
		}
	}

	var parcelConditions = getParcelConditions(pType, pStatus, pDesc, pImpact);
	if (parcelConditions) {
		for (var i = 0; i < parcelConditions.length; i++) {
			conditions.push(parcelConditions[i]);
		}
	}

	var licenseConditions = getLicenseConditions(pType, pStatus, pDesc, pImpact);
	if (licenseConditions) {
		for (var i = 0; i < licenseConditions.length; i++) {
			conditions.push(licenseConditions[i]);
		}
	}

	var contactConditons = getContactConditions(pType, pStatus, pDesc, pImpact);
	if (contactConditons) {
		for (var i = 0; i < contactConditons.length; i++) {
			conditions.push(contactConditons[i]);
		}
	}

	return conditions;
}

function condMatchObj() {
	this.objType = null;
	this.object = null;
	this.contactObj = null;
	this.addressObj = null;
	this.licenseObj = null;
	this.parcelObj = null;
	this.status = null;
	this.type = null;
	this.impact = null;
	this.description = null;
	this.comment = null;
	this.arObject = null;
	this.arDescription = null;
	this.arComment = null;
	this.expireDate = null;
} 
 
function getContactArray()
	{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];

	var cArray = new Array();

	if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
		{
		capContactArray = cap.getContactsGroup().toArray() ;
		}
	else
		{
		var capContactResult = aa.people.getCapContactByCapID(thisCap);
		if (capContactResult.getSuccess())
			{
			var capContactArray = capContactResult.getOutput();
			}
		}

	if (capContactArray)
		{
		for (yy in capContactArray)
			{
			var aArray = new Array();
			aArray["lastName"] = capContactArray[yy].getPeople().lastName;
			aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
			aArray["firstName"] = capContactArray[yy].getPeople().firstName;
			aArray["middleName"] = capContactArray[yy].getPeople().middleName;
			aArray["businessName"] = capContactArray[yy].getPeople().businessName;
			aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
			aArray["contactType"] =capContactArray[yy].getPeople().contactType;
			aArray["relation"] = capContactArray[yy].getPeople().relation;
			aArray["phone1"] = capContactArray[yy].getPeople().phone1;
			aArray["phone2"] = capContactArray[yy].getPeople().phone2;
			aArray["email"] = capContactArray[yy].getPeople().email;
			aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
			aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
			aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
			aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
			aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
			aArray["fax"] = capContactArray[yy].getPeople().fax;
			aArray["notes"] = capContactArray[yy].getPeople().notes;
			aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
			aArray["fullName"] = capContactArray[yy].getPeople().fullName;
			aArray["peopleModel"] = capContactArray[yy].getPeople();

			var pa = new Array();

			if (arguments.length == 0 && !cap.isCompleteCap()) {
				var paR = capContactArray[yy].getPeople().getAttributes();
				if (paR) pa = paR.toArray();
				}
			else
				var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
	                for (xx1 in pa)
                   		aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

        	cArray.push(aArray);
			}
		}
	return cArray;
	}

 
 
 function getContactArrayBefore()

                {

                // Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE

                // optional capid

                // added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,

                // on ASA it should still be pulled normal way even though still partial cap

 

 

                var envContactList = aa.env.getValue("ContactList");

 

                var capContactArray = envContactList.toArray();

 

                var cArray = new Array();

 

                if (capContactArray)

                                {

                                for (yy in capContactArray)

                                                {

                                                var aArray = new Array();

                                                aArray["lastName"] = capContactArray[yy].getPeople().lastName;

                                                aArray["refSeqNumber"] = capContactArray[yy].getRefContactNumber();

                                                aArray["firstName"] = capContactArray[yy].getPeople().firstName;

                                                aArray["middleName"] = capContactArray[yy].getPeople().middleName;

                                                aArray["businessName"] = capContactArray[yy].getPeople().businessName;

                                                aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;

                                                aArray["contactType"] =capContactArray[yy].getPeople().contactType;

                                                aArray["relation"] = capContactArray[yy].getPeople().relation;

                                                aArray["phone1"] = capContactArray[yy].getPeople().phone1;

                                                aArray["phone2"] = capContactArray[yy].getPeople().phone2;

                                                aArray["email"] = capContactArray[yy].getPeople().email;

                                                aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();

                                                aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();

                                                aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();

                                                aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();

                                                aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();

                                                aArray["fax"] = capContactArray[yy].getPeople().fax;

                                                aArray["notes"] = capContactArray[yy].getPeople().notes;

                                                aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();

                                                aArray["fullName"] = capContactArray[yy].getPeople().fullName;

 

 

                                                var pa = capContactArray[yy].getPeople().getAttributes().toArray();

                                for (xx1 in pa)

                                                aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

                                                cArray.push(aArray);

		                                }

                                        }

                return cArray;

                }



 
 
 function getContactByType(conType,capId) {

    var contactArray = getPeople(capId);



    for(thisContact in contactArray) {

        if((contactArray[thisContact].getPeople().contactType).toUpperCase() == conType.toUpperCase())

            return contactArray[thisContact].getPeople();

    }



    return false;

}



 
 
function getContactObj(itemCap,typeToLoad)
{
    // returning the first match on contact type
    var capContactArray = null;
    var cArray = new Array();

    if (itemCap.getClass() == "com.accela.aa.aamain.cap.CapModel")   { // page flow script 
        var capContactArray = cap.getContactsGroup().toArray() ;
        }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }
    
    if (capContactArray) {
        for (var yy in capContactArray) {
            if (capContactArray[yy].getPeople().contactType.toUpperCase().equals(typeToLoad.toUpperCase())) {
                logDebug("getContactObj returned the first contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
                return new contactObj(capContactArray[yy]);
            }
        }
    }
    
    logDebug("getContactObj could not find a contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
    return false;
            
} 
 
 function getContactObjsBySeqNbr(itemCap,seqNbr) {
	/*var result = aa.people.getCapContactByPK(itemCap,seqNbr);
	
    if (result.getSuccess()) {
		var csm = result.getOutput();
		return new contactObj(csm);
	}*/
	var capContactArray = null;

	var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
        var capContactArray = capContactResult.getOutput();
    }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (String(capContactArray[yy].getPeople().contactSeqNumber).equals(String(seqNbr))) {
                logDebug("getContactObjsBySeqNbr returned the contact on record " + itemCap.getCustomID());
                return new contactObj(capContactArray[yy]);
            }
        }
    }
        
}



 
 
function getContactObjs(itemCap) // optional typeToLoad, optional return only one instead of Array?
{
    var typesToLoad = false;
    if (arguments.length == 2) typesToLoad = arguments[1];
    var capContactArray = new Array();
    var cArray = new Array();
    //if (itemCap.getClass().toString().equals("com.accela.aa.aamain.cap.CapModel"))   { // page flow script 
    if (!cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") {

        if (cap.getApplicantModel()) {
            capContactArray[0] = cap.getApplicantModel();
        }
            
        if (cap.getContactsGroup().size() > 0) {
            var capContactAddArray = cap.getContactsGroup().toArray();
            for (ccaa in capContactAddArray)
                capContactArray.push(capContactAddArray[ccaa]);     
        }
    }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (!typesToLoad || exists(capContactArray[yy].getPeople().contactType, typesToLoad)) {
                cArray.push(new contactObj(capContactArray[yy]));
            }
        }
    }
    
    logDebug("getContactObj returned " + cArray.length + " contactObj(s)");
    return cArray;
            
} 
 
 function getContactObjsByCap(itemCap) // optional typeToLoad, optional return only one instead of Array?

{

	var typesToLoad = false;

	if (arguments.length == 2) typesToLoad = arguments[1];

	var capContactArray = null;

	var cArray = new Array();



	var capContactArray = cap.getContactsGroup().toArray() ;

	

	if (capContactArray) {

		for (var yy in capContactArray)	{

			if (!typesToLoad || exists(capContactArray[yy].getPeople().contactType, typesToLoad)) {

				cArray.push(new contactObj(capContactArray[yy]));

			}

		}

	}

	

	logDebug("getContactObj returned " + cArray.length + " contactObj(s)");

	return cArray;

			

}



 
 
 function getContactParams4Notification(params,conType) {

	// pass in a hashtable and it will add the additional parameters to the table

	// pass in contact type to retrieve



	contactArray = getContactArray();



	for(ca in contactArray) {

		thisContact = contactArray[ca];



		if (thisContact["contactType"] == conType) {



			conType = conType.toLowerCase();



			addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);

			addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);

			addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);

			addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);

			addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);

			addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);

			addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);

			addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);

			addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);

			addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);

			addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);

			addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);

			addParameter(params, "$$" + conType + "City$$", thisContact["city"]);

			addParameter(params, "$$" + conType + "State$$", thisContact["state"]);

			addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);

			addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);

			addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);

			addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);

			addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);

		}

	}



	return params;	

}



 
 
function getCSLBInfo(doPop,doWarning)   // doPop = true populate the cap lic prof with this data
					// doWarning = true, message if license is expired.
	{
	// Requires getNode and getProp functions.
	//
	// Get the first lic prof from the app
	//
	var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
	if (capLicenseResult.getSuccess())
		{ var capLicenseArr = capLicenseResult.getOutput();  }
	else
		{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }

	if (capLicenseArr == null || !capLicenseArr.length)
		{ logDebug("**WARNING: no licensed professionals on this CAP"); return false; }

	var licProfScriptModel = capLicenseArr[0];
	var rlpId = licProfScriptModel.getLicenseNbr();

	//
	// Now make the call to the California State License Board
	//

	var getout = aa.httpClient.get("https://www2.cslb.ca.gov/IVR/License+Detail.aspx?LicNum=" + rlpId);
	if (getout.getSuccess())
	  var lpXML = getout.getOutput();
	else
	   { logDebug("**ERROR: communicating with CSLB: " + getout.getErrorMessage()); return false; }

	// Check to see if error message in the XML:

	if (lpXML.indexOf("<Error>") > 0 )
		{
		logDebug("**ERROR: CSLB information returned an error: " + getNode(getNode(lpXML,"License"),"**ERROR"))
		return false;
		}

	var lpBiz = getNode(lpXML,"BusinessInfo");
	var lpStatus = getNode(lpXML,"PrimaryStatus");
	var lpClass = getNode(lpXML,"Classifications");
	var lpBonds = getNode(lpXML,"ContractorBond");
	var lpWC = getNode(lpXML,"WorkersComp");

	if (doWarning)
		{
		var expDate = new Date(getNode(lpBiz,"ExpireDt"));
		if (expDate < startDate)
			{
			showMessage = true ;
			comment("**WARNING: Professional License expired on " + expDate.toString());
			}
		}

	if (doPop)
		{
		licProfScriptModel.setAddress1(getNode(lpBiz,"Addr1").replace(/\+/g," "));
		licProfScriptModel.setAddress2(getNode(lpBiz,"Addr2").replace(/\+/g," "));
		licProfScriptModel.setBusinessName(getNode(lpBiz,"Name").replace(/\+/g," "));
		licProfScriptModel.setCity(getNode(lpBiz,"City").replace(/\+/g," "));
		licProfScriptModel.setLicenseExpirDate(aa.date.parseDate(getNode(lpBiz,"ExpireDt")))
		licProfScriptModel.setLicesnseOrigIssueDate(aa.date.parseDate(getNode(lpBiz,"IssueDt")))
		licProfScriptModel.setState(getNode(lpBiz,"State").replace(/\+/g," "))
		licProfScriptModel.setPhone1(getNode(lpBiz,"BusinessPhoneNum"))
		licProfScriptModel.setState(getNode(lpBiz,"State").replace(/\+/g," "))
		licProfScriptModel.setZip(getNode(lpBiz,"Zip"))
		aa.m_licenseProfessional.editLicensedProfessional(licProfScriptModel);
		}
	}

 
 
 function getDateDiff(DatetoComp) {



    var date1 = new Date(DatetoComp);

    var sysDate = aa.date.getCurrentDate();

    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");

    //aa.print("sysDateMMDDYYYY:" + sysDateMMDDYYYY + "--DatetoComp:" + DatetoComp);



    var date2 = new Date(sysDateMMDDYYYY);

    var diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24));

    //aa.print("diffDays:" + diffDays);

    return diffDays;

}



 
 
function getDepartmentName(username)
	{
	var suo = aa.person.getUser(username).getOutput(); 
	var dpt = aa.people.getDepartmentList(null).getOutput();
	for (var thisdpt in dpt)
	  	{
	  	var m = dpt[thisdpt]
	  	var  n = m.getServiceProviderCode() + "/" + m.getAgencyCode() + "/" + m.getBureauCode() + "/" + m.getDivisionCode() + "/" + m.getSectionCode() + "/" + m.getGroupCode() + "/" + m.getOfficeCode() 
	  
	  	if (n.equals(suo.deptOfUser)) 
	  	return(m.getDeptName())
  		}
  	}
  
   
 
function getDocumentList() {
	// Returns an array of documentmodels if any
	// returns an empty array if no documents

	var docListArray = new Array();

	docListResult = aa.document.getCapDocumentList(capId,currentUserID);

	if (docListResult.getSuccess()) {		
		docListArray = docListResult.getOutput();
	}
	return docListArray;
} 
 
function getGISBufferInfo(svc,layer,numDistance)
	{
	// returns an array of associative arrays
	// each additional parameter will return another value in the array
	//x = getGISBufferInfo("flagstaff","Parcels","50","PARCEL_ID1","MAP","BOOK","PARCEL","LOT_AREA");
	//
	//for (x1 in x)
	//   {
	//   aa.print("Object " + x1)
	//   for (x2 in x[x1])
	//      aa.print("  " + x2 + " = " + x[x1][x2])
	//   }

	var distanceType = "feet";
	var retArray = new Array();
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		for (argnum = 3; argnum < arguments.length ; argnum++)
			buf.addAttributeName(arguments[argnum]);
		}
	else
		{ aa.print("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ aa.print("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ aa.print("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var n = proxObj[z1].getAttributeNames();
				var v = proxObj[z1].getAttributeValues();
				
				var valArray = new Array();
				
				//
				// 09/18/08 JHS Explicitly adding the key field of the object, since getBufferByRadius will not pull down the key field
				// hardcoded this to GIS_ID
				//
				
				valArray["GIS_ID"] = proxObj[z1].getGisId()
				for (n1 in n)
					{
					valArray[n[n1]] = v[n1];
					}
				retArray.push(valArray);
				}
			
			}
		}
	return retArray
	}

 
 
function getGISInfo(svc,layer,attributename)
	{
	// use buffer info to get info on the current object by using distance 0
	// usage: 
	//
	// x = getGISInfo("flagstaff","Parcels","LOT_AREA");
	//
	
	var distanceType = "feet";
	var retString;
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
				}
			
			}
		}
	return retString
	}

 
 
function getGISInfoArray(svc,layer,attributename)
	{
	// use buffer info to get info on the current object by using distance 0
	// usage: 
	//
	// x = getGISInfo("flagstaff","Parcels","LOT_AREA");
	//
	
	var distanceType = "feet";
	var retArray = new Array();
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues();
				retArray.push(v[0]);
				}
			
			}
		}
	return retArray;
	}

 
 

function getGuideSheetObjects(inspId) {
	//
	// Returns an array of guide sheet objects
	// Optional second parameter, cap ID to load from
	// requires guideSheetObject definition
	//

	var retArray = new Array()
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var r = aa.inspection.getInspections(itemCap);  // have to use this method to get guidesheet data

	if (r.getSuccess())
	 	{
		var inspArray = r.getOutput();

		for (i in inspArray)
			{
			if (inspArray[i].getIdNumber() == inspId)
				{
				var inspModel = inspArray[i].getInspection();

				var gs = inspModel.getGuideSheets()

				if (gs)
					{
					gsArray = gs.toArray();
					for (var loopk in gsArray)
						{
						a = gsArray[loopk];
						
						var gsItems = gsArray[loopk].getItems().toArray()
						for (var loopi in gsItems)
							{
							var gso = new guideSheetObject(gsArray[loopk],gsItems[loopi]);
							retArray.push(gso);
							}						
						}
					} // if there are guidesheets
				else
					logDebug("No guidesheets for this inspection");
				} // if this is the right inspection
			} // for each inspection
		} // if there are inspections

	logDebug("loaded " + retArray.length + " guidesheet items");
	return retArray;
	}
 
 
// function getInspector: returns the inspector ID (string) of the scheduled inspection.  Returns the first result
//
function getInspector(insp2Check)
	{
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();
		for (xx in inspList)
			if (String(insp2Check).equals(inspList[xx].getInspectionType()))
				{
				// have to re-grab the user since the id won't show up in this object.
				inspUserObj = aa.person.getUser(inspList[xx].getInspector().getFirstName(),inspList[xx].getInspector().getMiddleName(),inspList[xx].getInspector().getLastName()).getOutput();
				return inspUserObj.getUserID();
				}
		}
	return false;
	}

 
 
function getLastInspector(insp2Check)
	// function getLastInspector: returns the inspector ID (string) of the last inspector to result the inspection.
	//
	{
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();
		
		inspList.sort(compareInspDateDesc)
		for (xx in inspList)
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && !inspList[xx].getInspectionStatus().equals("Scheduled"))
				{
				// have to re-grab the user since the id won't show up in this object.
				inspUserObj = aa.person.getUser(inspList[xx].getInspector().getFirstName(),inspList[xx].getInspector().getMiddleName(),inspList[xx].getInspector().getLastName()).getOutput();
				return inspUserObj.getUserID();
				}
		}
	return null;
	}

function compareInspDateDesc(a, b) {
	if (a.getScheduledDate() == null && b.getScheduledDate() == null) {
		return false;
	}
	if (a.getScheduledDate() == null && b.getScheduledDate() != null) {
		return true;
	}
	if (a.getScheduledDate() != null && b.getScheduledDate() == null) {
		return false;
	}
	return (a.getScheduledDate().getEpochMilliseconds() < b.getScheduledDate().getEpochMilliseconds());
} 
 
function getLastScheduledInspector(insp2Check)
	// function getLastInspector: returns the inspector ID (string) of the last inspector that is assigned to the inspection.
	//
	{
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();

		inspList.sort(compareInspDateDesc)
		for (xx in inspList)
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().equals("Scheduled"))
				{
				// have to re-grab the user since the id won't show up in this object.
				inspUserObj = aa.person.getUser(inspList[xx].getInspector().getFirstName(),inspList[xx].getInspector().getMiddleName(),inspList[xx].getInspector().getLastName()).getOutput();
				return inspUserObj.getUserID();
				}
		}
	return null;
	}

 
 
function getLicenseProfessional(itemcapId)
{
	capLicenseArr = null;
	var s_result = aa.licenseProfessional.getLicenseProf(itemcapId);
	if(s_result.getSuccess())
	{
		capLicenseArr = s_result.getOutput();
		if (capLicenseArr == null || capLicenseArr.length == 0)
		{
			aa.print("WARNING: no licensed professionals on this CAP:" + itemcapId);
			capLicenseArr = null;
		}
	}
	else
	{
		aa.print("ERROR: Failed to license professional: " + s_result.getErrorMessage());
		capLicenseArr = null;
	}
	return capLicenseArr;
}
 
 
function getNode(fString,fName)
	{
	 var fValue = "";
	 var startTag = "<"+fName+">";
	 var endTag = "</"+fName+">";

	 startPos = fString.indexOf(startTag) + startTag.length;
	 endPos = fString.indexOf(endTag);
	 // make sure startPos and endPos are valid before using them
	 if (startPos > 0 && startPos < endPos)
		  fValue = fString.substring(startPos,endPos);

	 return unescape(fValue);
	}
	
 
 
function getParent() 
	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(capId,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
	}

 
 
function getParentByCapId(itemCap) 
	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(itemCap,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
	} 
 
 function getParentCapID4Renewal() {

    parentLic = getParentLicenseCapID(capId); 

    pLicArray = String(parentLic).split("-"); 

    var parentLicenseCAPID = aa.cap.getCapID(pLicArray[0],pLicArray[1],pLicArray[2]).getOutput();



    return parentLicenseCAPID;

}



 
 

function getParentLicenseCapID(itemCap)
{
	if (itemCap == null || aa.util.instanceOfString(itemCap))
	{
		return null;
	}
	
	var licenseCap = null;
	
	var result2 = aa.cap.getProjectByChildCapID(itemCap, "Renewal", null);
	if(result2.getSuccess())
		{
			licenseProjects = result2.getOutput();
			if (licenseProjects != null && licenseProjects.length > 0)
			{
			licenseProject = licenseProjects[0];
			return licenseProject.getProjectID();
			}
		}

	var result = aa.cap.getProjectByChildCapID(itemCap, "EST", null);
    	if(result.getSuccess())
	{
		projectScriptModels = result.getOutput();
		if (projectScriptModels != null && projectScriptModels.length > 0)
		{
		projectScriptModel = projectScriptModels[0];
		licenseCap = projectScriptModel.getProjectID();
		return licenseCap;
		}
	}
	

	logDebug("**WARNING: Could not find parent license Cap for child CAP(" + itemCap + "): ");
		  return false;
		  
	
}

 
 
function getParents(pAppType) {
	// returns the capId array of all parent caps
	//Dependency: appMatch function
	//

	var i = 1;
	while (true) {
		if (!(aa.cap.getProjectParents(capId, i).getSuccess()))
			break;

		i += 1;
	}
	i -= 1;

	getCapResult = aa.cap.getProjectParents(capId, i);
	myArray = new Array();

	if (getCapResult.getSuccess()) {
		parentArray = getCapResult.getOutput();

		if (parentArray.length) {
			for (x in parentArray) {
				if (pAppType != null) {
					//If parent type matches apType pattern passed in, add to return array
					if (appMatch(pAppType, parentArray[x].getCapID()))
						myArray.push(parentArray[x].getCapID());
				} else
					myArray.push(parentArray[x].getCapID());
			}

			return myArray;
		} else {
			logDebug("**WARNING: GetParent found no project parent for this application");
			return null;
		}
	} else {
		logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return null;
	}
} 
 
 function getPartialCapID(capid)

{

    if (capid == null || aa.util.instanceOfString(capid))

    {

        return null;

    }

    //1. Get original partial CAPID  from related CAP table.

    var result = aa.cap.getProjectByChildCapID(capid, "EST", null);

    if(result.getSuccess())

    {

        projectScriptModels = result.getOutput();

        if (projectScriptModels == null || projectScriptModels.length == 0)

        {

            aa.print("ERROR: Failed to get partial CAP with CAPID(" + capid + ")");

            return null;

        }

        //2. Get original partial CAP ID from project Model

        projectScriptModel = projectScriptModels[0];

        return projectScriptModel.getProjectID();

    }  

    else 

    {

        aa.print("ERROR: Failed to get partial CAP by child CAP(" + capid + "): " + result.getErrorMessage());

        return null;

    }

}



 
 
 function getPeople(capId)

{

	capPeopleArr = null;

	var s_result = aa.people.getCapContactByCapID(capId);

	if(s_result.getSuccess())

	{

		capPeopleArr = s_result.getOutput();

		if(capPeopleArr != null || capPeopleArr.length > 0)

		{

			for (loopk in capPeopleArr)	

			{

				var capContactScriptModel = capPeopleArr[loopk];

				var capContactModel = capContactScriptModel.getCapContactModel();

				var peopleModel = capContactScriptModel.getPeople();

				var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);

				if (contactAddressrs.getSuccess())

				{

					var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());

					peopleModel.setContactAddressList(contactAddressModelArr);    

				}

			}

		}

		

		else

		{

			aa.print("WARNING: no People on this CAP:" + capId);

			capPeopleArr = null;

		}

	}

	else

	{

		aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());

		capPeopleArr = null;	

	}

	return capPeopleArr;

}



 
 
 function getPrimaryAddressLineParam4Notification(params) {

	// pass in a hashtable and it will add the additional parameters to the table



    var addressLine = "";



	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");



	if (adResult.getSuccess()) {

		ad = adResult.getOutput().getAddressModel();



		addParameter(params, "$$addressLine$$", ad.getDisplayAddress());

	}



	return params;

}



 
 
 function getPrimaryOwnerParams4Notification(params) {

	// pass in a hashtable and it will add the additional parameters to the table



	capOwnerResult = aa.owner.getOwnerByCapId(capId);



	if (capOwnerResult.getSuccess()) {

		owner = capOwnerResult.getOutput();



		for (o in owner) {

			thisOwner = owner[o];

			if (thisOwner.getPrimaryOwner() == "Y") {

				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());

				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone);

				break;	

			}

		}

	}

	return params;

}



 
 
function getProp(fString,fName)
	{
	 var fValue = "";
	 var startTag = fName + "='";
	 var endTag = "'";
	 startPos = fString.indexOf(startTag) + startTag.length;
	 if (startPos > 0)
	   fValue = fString.substring(startPos);

	 endPos = fValue.indexOf(endTag);
	 if (endPos > 0)
	  fValue = fValue.substring(0,endPos);

	return unescape(fValue);
	}

 
 
 function getRecordParams4Notification(params) {

	// pass in a hashtable and it will add the additional parameters to the table



	addParameter(params, "$$altID$$", capIDString);

	addParameter(params, "$$capName$$", capName);

	addParameter(params, "$$capStatus$$", capStatus);

	addParameter(params, "$$fileDate$$", fileDate);

	//addParameter(params, "$$workDesc$$", workDescGet(capId));

	addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));

	

	return params;

}



 
 

function getRefLicenseProf(refstlic)
	{
	var refLicObj = null;
	var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(),refstlic);
	if (!refLicenseResult.getSuccess())
		{ logDebug("**ERROR retrieving Ref Lic Profs : " + refLicenseResult.getErrorMessage()); return false; }
	else
		{
		var newLicArray = refLicenseResult.getOutput();
		if (!newLicArray) return null;
		for (var thisLic in newLicArray)
			if (refstlic && newLicArray[thisLic] && refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()))
				refLicObj = newLicArray[thisLic];
		}

	return refLicObj;
	}

 
 

function getRelatedCapsByAddress(ats) 
//
// returns and array of capids that share the same address as the current cap
//
	{
	var retArr = new Array();
	
	// get address data
	var addResult = aa.address.getAddressByCapId(capId);
	if (addResult.getSuccess())
		{ var aoArray = addResult.getOutput(); }
	else	
		{ logDebug("**ERROR: getting address by cap ID: " + addResult.getErrorMessage()); return false; }
	
	for (zzz in aoArray)
		{
		var ao = aoArray[zzz];
		// get caps with same address
		capAddResult = aa.cap.getCapListByDetailAddress(ao.getStreetName(),ao.getHouseNumberStart(),ao.getStreetSuffix(),null,ao.getStreetDirection(),null);
		if (capAddResult.getSuccess())
			{ var capIdArray=capAddResult.getOutput(); }
		else
			{ logDebug("**ERROR: getting similar addresses: " + capAddResult.getErrorMessage());  return false; }


		// loop through related caps
		for (cappy in capIdArray)
			{
			// skip if current cap
			if (capId.getCustomID().equals(capIdArray[cappy].getCustomID()))
				continue;

			// get cap id
			var relcap = aa.cap.getCap(capIdArray[cappy].getCapID()).getOutput();


			// get cap type

			var reltypeArray = relcap.getCapType().toString().split("/");

			var isMatch = true;
			var ata = ats.split("/");
			if (ata.length != 4)
				logDebug("**ERROR: The following Application Type String is incorrectly formatted: " + ats);
			else
				for (xx in ata)
					if (!ata[xx].equals(reltypeArray[xx]) && !ata[xx].equals("*"))
						isMatch = false;

			if (isMatch)			
				retArr.push(capIdArray[cappy]);

			} // loop through related caps
		
		}
	if (retArr.length > 0)
		return retArr;
		
	}

 
 

function getRelatedCapsByParcel(ats) 
//
// returns and array of capids that match parcels on the current app.  Includes all parcels.
// ats, app type string to check for
//
	{
	var retArr = new Array();
	
	var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
	if (capParcelResult.getSuccess())
		{ var Parcels = capParcelResult.getOutput().toArray(); }
	else	
		{ logDebug("**ERROR: getting parcels by cap ID: " + capParcelResult.getErrorMessage()); return false; }

	for (zz in Parcels)
		{
		var ParcelValidatedNumber = Parcels[zz].getParcelNumber();

		// get caps with same parcel
		var capAddResult = aa.cap.getCapListByParcelID(ParcelValidatedNumber,null);
		if (capAddResult.getSuccess())
			{ var capIdArray=capAddResult.getOutput(); }
		else
			{ logDebug("**ERROR: getting similar parcels: " + capAddResult.getErrorMessage());  return false; }

		// loop through related caps
		for (cappy in capIdArray)
			{
			// skip if current cap
			if (capId.getCustomID().equals(capIdArray[cappy].getCustomID()))
				continue;
			
			// get cap ids			
			var relcap = aa.cap.getCap(capIdArray[cappy].getCapID()).getOutput();
			// get cap type
			var reltypeArray = relcap.getCapType().toString().split("/");

			var isMatch = true;
			var ata = ats.split("/");
			if (ata.length != 4)
				logDebug("**ERROR: The following Application Type String is incorrectly formatted: " + ats);
			else
				for (xx in ata)
					if (!ata[xx].equals(reltypeArray[xx]) && !ata[xx].equals("*"))
						isMatch = false;

			if (isMatch)			
				retArr.push(capIdArray[cappy]);

			} // loop through related caps
		}
		
	if (retArr.length > 0)
		return retArr;
		
	}

 
 
 function getRenewalCapByParentCapIDForReview(parentCapid)

{

    if (parentCapid == null || aa.util.instanceOfString(parentCapid))

    {

        return null;

    }

    //1. Get parent license for review

    var result = aa.cap.getProjectByMasterID(parentCapid, "Renewal", "Review");

    if(result.getSuccess())

    {

        projectScriptModels = result.getOutput();

        if (projectScriptModels == null || projectScriptModels.length == 0)

        {

            aa.print("ERROR: Failed to get renewal CAP by parent CAPID(" + parentCapid + ") for review");

            return null;

        }

        //2. return parent CAPID.

        projectScriptModel = projectScriptModels[0];

        return projectScriptModel;

    }  

    else 

    {

      aa.print("ERROR: Failed to get renewal CAP by parent CAP(" + parentCapid + ") for review: " + result.getErrorMessage());

      return null;

    }

}



 
 
function getReportedChannel() // option CapId
{
	var itemCap = capId
	if (arguments.length > 0)
		itemCap = arguments[0]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	var sReturn = cd.getReportedChannel();

	if(sReturn != null)
		return sReturn;
	else
		return "";
}
 
 
 function getRootNode(nodeId, depth)
{
	if (depth > 9)
	{
		return nodeId;
	}
	var depthCount = depth + 1;
	var currentNode = nodeId;
	var directParentsResult = aa.cap.getProjectByChildCapID(currentNode,'R',null);
    if (directParentsResult.getSuccess())
    {
		directParents = directParentsResult.getOutput();
		for(var ff in directParents) {
			
			if (directParents[ff])
			{
				
				var id1 = directParents[ff].getProjectID().getID1();
				var id2 = directParents[ff].getProjectID().getID2();
				var id3 = directParents[ff].getProjectID().getID3();				
				
				while (!isSameNode(currentNode,directParents[ff].getProjectID()))
				{
					currentNode = getRootNode(directParents[ff].getProjectID(), depthCount);					
				}
			}			
		}
    }
	return currentNode;

}



 
 
 function getRoots(nodeId)

{

	var rootsArray = new Array();

	var directParentsResult = aa.cap.getProjectByChildCapID(nodeId,'R',null);

	

    if (directParentsResult.getSuccess())

    {

		tmpdirectParents = directParentsResult.getOutput();

		for(ff in tmpdirectParents) {

			if (tmpdirectParents[ff]) {

				

				var tmpNode = getRootNode(tmpdirectParents[ff].getProjectID(), 1);

				var id1 = tmpNode.getID1();

				var id2 = tmpNode.getID2();

				var id3 = tmpNode.getID3();

				var pCapId = aa.cap.getCapID(id1,id2,id3).getOutput();

				rootsArray.push(pCapId);

			}

		}

    }

	return rootsArray;

}



 
 
function getScheduledInspId(insp2Check)
	{
	// warning, returns only the first scheduled occurrence
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		var inspList = inspResultObj.getOutput();
		for (xx in inspList)
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().toUpperCase().equals("SCHEDULED"))
				return inspList[xx].getIdNumber();
		}
	return false;
	}

 
 
//
// Get the standard choices domain for this application type
//
// Uses free-form alphanumeric indexing.   All enabled script controls will execute.   See getScriptAction_v_1_6 to revert back to sequential numbering scheme
//
function getScriptAction(strControl)
	{
	var actArray = new Array();
	var maxLength = String("" + maxEntries).length;
	
	var bizDomScriptResult = aa.bizDomain.getBizDomain(strControl);
	
	if (bizDomScriptResult.getSuccess())
		{
		bizDomScriptArray = bizDomScriptResult.getOutput().toArray()
		
		for (var i in bizDomScriptArray)
			{
			// this list is sorted the same as the UI, no reason to re-sort
			
			var myObj= new pairObj(bizDomScriptArray[i].getBizdomainValue());
			myObj.load(bizDomScriptArray[i].getDescription());
			if (bizDomScriptArray[i].getAuditStatus() == 'I') myObj.enabled = false;
			actArray.push(myObj);
			}
		}
	
	return actArray;
	}

 
 
//
// Get the standard choices domain for this application type
//
// Requires sequential numbering scheme (01,02,03, etc.) and the maxEntries variable
//
// Rename to getScriptAction and place in your custom functions folder to revert back to master script version 1.6 functionality.
//
//
//
function getScriptAction_v1_6(strControl)
	{
	var actArray = new Array();
	var maxLength = String("" + maxEntries).length;

	for (var count=1; count <= maxEntries; count++)  // Must be sequential from 01 up to maxEntries
		{
		var countstr = "000000" + count;
		countstr = String(countstr).substring(countstr.length,countstr.length - maxLength);
		var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(strControl,countstr);

	   	if (bizDomScriptResult.getSuccess())
	   		{
			bizDomScriptObj = bizDomScriptResult.getOutput();
			var myObj= new pairObj(bizDomScriptObj.getBizdomainValue());
			myObj.load(bizDomScriptObj.getDescription());
			if (bizDomScriptObj.getAuditStatus() == 'I') myObj.enabled = false;
			actArray.push(myObj);
			}
		else
			{
			break;
			}
		}
	return actArray;
	}

 
 
function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}
 
 
function getShortNotes() // option CapId
{
	var itemCap = capId
	if (arguments.length > 0)
		itemCap = arguments[0]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	var sReturn = cd.getShortNotes();

	if(sReturn != null)
		return sReturn;
	else
		return "";
}
 
 
function getTaskDueDate(wfstr) // optional process name.
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(capId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var dueDate = wfObj[i].getDueDate();
			if (dueDate)
				return new Date(dueDate.getMonth() + "/" + dueDate.getDayOfMonth() + "/" + dueDate.getYear());
		}
	}
} 
 
function getTaskStatusForEmail(stask) {
	// returns a string of task statuses for a workflow group
	var returnStr = ""
		var taskResult = aa.workflow.getTaskItems(capId, null, stask, "Y", null, null);
	if (taskResult.getSuccess()) {
		var taskArr = taskResult.getOutput();
	} else {
		logDebug("**ERROR: getting tasks : " + taskResult.getErrorMessage());
		return false
	}

	for (xx in taskArr)
		if (taskArr[xx].getProcessCode().equals(stask) && taskArr[xx].getCompleteFlag().equals("Y")) {
			returnStr += "Task Name: " + taskArr[xx].getTaskDescription() + "\n";
			returnStr += "Task Status: " + taskArr[xx].getDisposition() + "\n";
			if (taskArr[xx].getDispositionComment() != null)
				returnStr += "Task Comments: " + taskArr[xx].getDispositionComment() + "\n";
			returnStr += "\n";
		}
	logDebug(returnStr);
	return returnStr;
} 
 
 function getURLToNewRecord(ACAURL,servProvCode,group,typetype,subtype,category) {



    var smb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicemanagement.ServiceManagementBusiness").getOutput();

    var sm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicemanagement.ServiceModel").getOutput();

    var ctm = aa.cap.getCapTypeModel().getOutput();

    

    ctm.setGroup(group);

    ctm.setType(typetype); 

    ctm.setSubType(subtype);

    ctm.setCategory(category);

    sm.setCapType(ctm);

    sm.setServPorvCode(servProvCode);

    var svcs = smb.getServices(sm).toArray();

    

    // returning first service found 

    

    for (var i in svcs) {

        return ACAURL + "/AgencyRedirect.aspx?agency=" + servProvCode + "&name=" + escape(svcs[i].getServiceName());

    }

    // or nothing

    

    return false;

}
 
 
function getUserEmail() {
    //optional parameter for userid
    var userId = currentUserID;
    if (arguments.length > 0)
        userId = arguments[0];

    var systemUserObjResult = aa.person.getUser(userId.toUpperCase());

    if (systemUserObjResult.getSuccess()) {
        var systemUserObj = systemUserObjResult.getOutput();

        var userEmail = systemUserObj.getEmail();

        if (userEmail)
            return userEmail;
        else
            return false; 

    } else {
        aa.print(systemUserObjResult.getErrorMessage());
        return false;
    }
}
 
 
function getUserFullName() {
    //optional parameter for userid
    var userId = currentUserID;
    if (arguments.length > 0)
        userId = arguments[0];

    var systemUserObjResult = aa.person.getUser(userId.toUpperCase());

    if (systemUserObjResult.getSuccess()) {
        var systemUserObj = systemUserObjResult.getOutput();

        var userEmail = systemUserObj.getEmail();
        var userFullName = "";

        if (!matches(systemUserObj.getFirstName(),null,undefined,"")) userFullName = systemUserObj.getFirstName();
        if (!matches(systemUserObj.getLastName(),null,undefined,"")) userFullName += " " + systemUserObj.getLastName();
        
        if (userFullName != "")
            return userFullName;
        else
            return false; 

    } else {
        logDebug(systemUserObjResult.getErrorMessage());
        return false;
    }
}
 
 

function guideSheetObject(gguidesheetModel,gguidesheetItemModel)
	{
	this.gsType = gguidesheetModel.getGuideType();
	this.gsSequence = gguidesheetModel.getGuidesheetSeqNbr();
	this.gsDescription = gguidesheetModel.getGuideDesc();
	this.gsIdentifier = gguidesheetModel.getIdentifier();
	this.item = gguidesheetItemModel;
	this.text = gguidesheetItemModel.getGuideItemText()
	this.status = gguidesheetItemModel.getGuideItemStatus();
	this.comment = gguidesheetItemModel.getGuideItemComment();
	this.score = gguidesheetItemModel.getGuideItemScore();
	
	this.info = new Array();
	this.infoTables = new Array();
	this.validTables = false;				//true if has ASIT info
	this.validInfo = false;				//true if has ASI info

	
	this.loadInfo = function() {
		var itemASISubGroupList = this.item.getItemASISubgroupList();
		//If there is no ASI subgroup, it will throw warning message.
		if(itemASISubGroupList != null)
		{
			this.validInfo = true;
			var asiSubGroupIt = itemASISubGroupList.iterator();
			while(asiSubGroupIt.hasNext())
			{
				var asiSubGroup = asiSubGroupIt.next();
				var asiItemList = asiSubGroup.getAsiList();
				if(asiItemList != null)
				{
					var asiItemListIt = asiItemList.iterator();
					while(asiItemListIt.hasNext())
					{
						var asiItemModel = asiItemListIt.next();
						this.info[asiItemModel.getAsiName()] = asiItemModel.getAttributeValue();
					}
				}
			}
		}
		

	}
	
	this.loadInfoTables = function() {

		var guideItemASITs = this.item.getItemASITableSubgroupList();
		if (guideItemASITs!=null)
		for(var j = 0; j < guideItemASITs.size(); j++)
		{
			var guideItemASIT = guideItemASITs.get(j);
			var tableArr = new Array();
			var columnList = guideItemASIT.getColumnList();
			for (var k = 0; k < columnList.size() ; k++ )
			{
				var column = columnList.get(k);
				var values = column.getValueMap().values();
				var iteValues = values.iterator();
				while(iteValues.hasNext())
				{
					var i = iteValues.next();
					var zeroBasedRowIndex = i.getRowIndex()-1;
					if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
					tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue()
				}
			}
			
			this.infoTables["" + guideItemASIT.getTableName()] = tableArr;
			this.validTables = true;
		}
	}
} 
 
function handleError(err,context) {
	var rollBack = true;
	var showError = true;

	if (showError) showDebug = true;
	logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);
	}
	 
 
//check if target CAP has primary address
function hasPrimaryAddressInCap(capID) {
	var isPrimaryAddressExist = false;
	var capAddressResult = aa.address.getAddressByCapId(capID);
	if (capAddressResult.getSuccess()) {
		var addressModelArray = capAddressResult.getOutput();
		for (k in addressModelArray) {
			if ("Y" == addressModelArray[k].getPrimaryFlag()) {
				isPrimaryAddressExist = true;
				logDebug("Target CAP has primary address");
				break;
			}

		}
	} else {
		logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
	}
	return isPrimaryAddressExist;
} 
 

function xmlEscapeXMLToHTML(xmlData) {
    /*************************************************************************************
    Function:       xmlEscapeXMLToHTML

    author:         xwisdom@yahoo.com

    description:
        Encodes XML data for use in a web page

    ************************************************************************************/
    var gt;

    var str = xmlData;

    //replace & with &amp;
    gt = -1;
    while (str.indexOf("&", gt + 1) > -1) {
        var gt = str.indexOf("&", gt + 1);
        var newStr = str.substr(0, gt);
        newStr += "&amp;";
        newStr = newStr + str.substr(gt + 1, str.length);
        str = newStr;
    }

    //replace < with &lt;
    gt = -1;
    while (str.indexOf("<", gt + 1) > -1) {
        var gt = str.indexOf("<", gt + 1);
        var newStr = str.substr(0, gt);
        newStr += "&lt;";
        newStr = newStr + str.substr(gt + 1, str.length);
        str = newStr;
    }

    //replace > with &gt;
    gt = -1;
    while (str.indexOf(">", gt + 1) > -1) {
        var gt = str.indexOf(">", gt + 1);
        var newStr = str.substr(0, gt);
        newStr += "&gt;";
        newStr = newStr + str.substr(gt + 1, str.length);
        str = newStr;
    }

    //replace \n with <br>
    gt = -1;
    while (str.indexOf("\n", gt + 1) > -1) {
        var gt = str.indexOf("\n", gt + 1);
        var newStr = str.substr(0, gt);
        newStr += "<br>";
        newStr = newStr + str.substr(gt + 1, str.length);
        str = newStr;
    }

    return str

}  // end function xmlEscapeXMLToHTML

 
 
function include(s) {
	try {
	    var thisDate = new Date();
		var thisTime = thisDate.getTime();
		var st = getScriptText(s);
		if (st.length) {
			logDebug("Executing script : " + s + ", Elapsed Time: " + ((thisTime - startTime) / 1000) + " Seconds")
			eval(st);
			}
		}
	catch (err) { handleError(err,s);	}
	}
	 
 
function insertSubProcess(taskName, process, completeReqd) {

	var itemCap = capId;
	var theTask = null;

	if (arguments.length > 3)
		itemCap = arguments[3]; // use cap ID specified in args

	var workflowResult = aa.workflow.getTaskItems(itemCap, taskName, null, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (var i in wfObj)
		if (taskName.toUpperCase().equals(wfObj[i].getTaskDescription().toUpperCase()))
			theTask = wfObj[i];

	if (theTask) {
		var result = aa.workflow.insertSubProcess(theTask, process, completeReqd)
			if (!result.getSuccess()) {
				logDebug("error " + result.getErrorMessage());
				return false;
			}

			logDebug("attached subprocess " + process + " to " + taskName);
		return true;
	} else {
		logDebug("couldn't find task " + taskName);
		return false;
	}
} 
 
function insertTask(sourceTaskName,newTaskName,insertTaskType) 
	{
	itemCap = capId;
	if (arguments.length > 3)
		itemCap = arguments[3]; // use cap ID specified in args

	var sTask;
	var tTask;
	//copy as next task 
	var insertNType ="N";
	//copy as parrallel task
	insertPType ="P";
	
	//get the task by the task path
	var taskResult1 = aa.workflow.getTask(capId,sourceTaskName);
	if (taskResult1.getSuccess())
	{
		tTask = taskResult1.getOutput();
		aa.print("get task successful : task name = " + tTask.getTaskDescription() + "; Process name = " + tTask.getProcessCode());
	}
	else
		{ aa.print("ERROR: Failed to get task! Path = " + sourceTaskName +";" + taskResult1.getErrorMessage()); }
		

	//change the task name
	tTask.setTaskDescription(newTaskName);
	
	var taskResult = aa.workflow.insertTask(tTask,insertTaskType);
	if (taskResult.getSuccess())
	{
		var processId = tTask.getProcessID();
		var stepNum =tTask.getStepNumber();
		var taskResult1 = aa.workflow.getTask(capId,stepNum,processId);
			
		if (taskResult1.getSuccess())
		{
			tTask = taskResult1.getOutput();
			aa.print("insert task successful : inserted task name = " + tTask.getTaskDescription() + "; Process name = " + tTask.getProcessCode());
		}
		else
			{ aa.print("ERROR: Failed to get task! Path = " + taskPath +";" + taskResult1.getErrorMessage()); return false; }
		
	}
	else
		{ aa.print("ERROR: Failed to insert task! Path = " + taskPath +";" + taskResult.getErrorMessage()); return false; }
		
	
	return tTask;  // returns task item
} 
 
function inspCancelAll()
	{
	var isCancelled = false;
	var inspResults = aa.inspection.getInspections(capId);
	if (inspResults.getSuccess())
		{
		var inspAll = inspResults.getOutput();
		var inspectionId;
		var cancelResult;
		for (ii in inspAll)
			{
			if (inspAll[ii].getDocumentDescription().equals("Insp Scheduled") && inspAll[ii].getAuditStatus().equals("A"))
				{
				inspectionId = inspAll[ii].getIdNumber();		// Inspection identifier	
				cancelResult = aa.inspection.cancelInspection(capId,inspectionId);
				if (cancelResult.getSuccess())
					{
					logMessage("Cancelling inspection: " + inspAll[ii].getInspectionType());
					isCancelled = true;
					}
				else
					logMessage("**ERROR","**ERROR: Cannot cancel inspection: "+inspAll[ii].getInspectionType()+", "+cancelResult.getErrorMessage());
				}
		  }
		}
	else
		logMessage("**ERROR: getting inspections: " + inspResults.getErrorMessage());
	
	return isCancelled;
	}

 
 
function invoiceFee(fcode, fperiod) {
	//invoices all assessed fees having fcode and fperiod
	// SR5085 LL
	var feeFound = false;
	getFeeResult = aa.finance.getFeeItemsByFeeCodeAndPeriod(capId, fcode, fperiod, "NEW");
	if (getFeeResult.getSuccess()) {
		var feeList = getFeeResult.getOutput();
		for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				feeSeqList.push(feeSeq);
				paymentPeriodList.push(fperiod);
				feeFound = true;
				logDebug("Assessed fee " + fcode + " found and tagged for invoicing");
			}
	} else {
		logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
	}
	return feeFound;
} 
 
 function isBlank(str) {

    return (!str || /^\s*$/.test(str));

}

 
 
 function isEmpty(str) {
    return (!str || 0 === str.length);
}

 function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

 function getRoots(nodeId)
{
	var rootsArray = new Array();
	var directParentsResult = aa.cap.getProjectByChildCapID(nodeId,'R',null);
	
    if (directParentsResult.getSuccess())
    {
		tmpdirectParents = directParentsResult.getOutput();
		for(ff in tmpdirectParents) {
			if (tmpdirectParents[ff]) {
				
				var tmpNode = getRootNode(tmpdirectParents[ff].getProjectID(), 1);
				var id1 = tmpNode.getID1();
				var id2 = tmpNode.getID2();
				var id3 = tmpNode.getID3();
				var pCapId = aa.cap.getCapID(id1,id2,id3).getOutput();
				rootsArray.push(pCapId);
			}
		}
    }
	return rootsArray;
}

 function isSameNode(node1, node2)
{
	if (node1 == null || node1 == undefined || node2 == null || node2 == undefined)
	{
		return false;
	}
	return node1.getID1() == node2.getID1() && node1.getID2() == node2.getID2() && node1.getID3() == node2.getID3();
}

 function getRootNode(nodeId, depth)
{
	if (depth > 9)
	{
		return nodeId;
	}
	var depthCount = depth + 1;
	var currentNode = nodeId;
	var directParentsResult = aa.cap.getProjectByChildCapID(currentNode,'R',null);
    if (directParentsResult.getSuccess())
    {
		directParents = directParentsResult.getOutput();
		for(var ff in directParents) {
			
			if (directParents[ff])
			{
				
				var id1 = directParents[ff].getProjectID().getID1();
				var id2 = directParents[ff].getProjectID().getID2();
				var id3 = directParents[ff].getProjectID().getID3();				
				
				while (!isSameNode(currentNode,directParents[ff].getProjectID()))
				{
					currentNode = getRootNode(directParents[ff].getProjectID(), depthCount);					
				}
			}			
		}
    }
	return currentNode;

}











 
 
 function isMatchPeople(capContactScriptModel, capContactScriptModel2)

{

	if (capContactScriptModel == null || capContactScriptModel2 == null)

	{

		return false;

	}

	var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();

	var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();

	var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();

	var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();

	var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();

	var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();

	var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();

	var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();

	if ((contactType1 == null && contactType2 != null) 

		|| (contactType1 != null && contactType2 == null))

	{

		return false;

	}

	if (contactType1 != null && !contactType1.equals(contactType2))

	{

		return false;

	}

	if ((firstName1 == null && firstName2 != null) 

		|| (firstName1 != null && firstName2 == null))

	{

		return false;

	}

	if (firstName1 != null && !firstName1.equals(firstName2))

	{

		return false;

	}

	if ((lastName1 == null && lastName2 != null) 

		|| (lastName1 != null && lastName2 == null))

	{

		return false;

	}

	if (lastName1 != null && !lastName1.equals(lastName2))

	{

		return false;

	}

	if ((fullName1 == null && fullName2 != null) 

		|| (fullName1 != null && fullName2 == null))

	{

		return false;

	}

	if (fullName1 != null && !fullName1.equals(fullName2))

	{

		return false;

	}

	return	true;

}



 
 
function isReadyRenew(capid) {
    if (capid == null || aa.util.instanceOfString(capid)) {
        return false;
    }
    var result = aa.expiration.isExpiredLicenses(capid);
    if (result.getSuccess()) {
        return true;
    }
    else {
        logDebug("ERROR: Failed to get expiration with CAP(" + capid + "): " + result.getErrorMessage());
    }
    return false;
}

 
 
function isRenewProcess(parentCapID, partialCapID) {
    //1. Check to see parent CAP ID is null.
    if (parentCapID == null || partialCapID == null)
    { logDebug("ERROR: the parentCapID or the partialCap ID is null"); return false; }
    //2. Get CAPModel by PK for partialCAP.
    var result = aa.cap.getCap(partialCapID);
    if (result.getSuccess()) {
        capScriptModel = result.getOutput();
        //2.1. Check to see if it is partial CAP.
        if (capScriptModel.isCompleteCap()) {
            logDebug("ERROR: It is not partial CAP(" + capScriptModel.getCapID() + ")");
            return false;
        }
    }
    else {
        logDebug("ERROR: Fail to get CAPModel (" + partialCapID + "): " + result.getErrorMessage());
        return false;
    }
    //3.  Check to see if the renewal was initiated before.
    result = aa.cap.getProjectByMasterID(parentCapID, "Renewal", "Incomplete");
    if (result.getSuccess()) {
        partialProjects = result.getOutput();
        if (partialProjects != null && partialProjects.length > 0) {
            //Avoid to initiate renewal process multiple times.
            logDebug("Warning: Renewal process was initiated before. ( " + parentCapID + ")");
            return false;
        }

    }
    //4 . Check to see if parent CAP is ready for renew.
    return isReadyRenew(parentCapID);
}
 
 
 function isSameNode(node1, node2)

{

	if (node1 == null || node1 == undefined || node2 == null || node2 == undefined)

	{

		return false;

	}

	return node1.getID1() == node2.getID1() && node1.getID2() == node2.getID2() && node1.getID3() == node2.getID3();

}



 
 
function isScheduled(inspType)
	{
	var found = false;
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		var inspList = inspResultObj.getOutput();
		for (xx in inspList)
			if (String(inspType).equals(inspList[xx].getInspectionType()))
				found = true;
		}
	return found;
	}

 
 
function isTaskActive(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, "Y");
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
			if (fTask.getActiveFlag().equals("Y"))
				return true;
			else
				return false;
	}
}
 
 
function isTaskComplete(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, "Y", null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
			if (fTask.getCompleteFlag().equals("Y"))
				return true;
			else
				return false;
	}
}
 
 
function isTaskStatus(wfstr, wfstat) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 2) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, wfstat, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
			if (fTask.getDisposition() != null) {
				if (fTask.getDisposition().toUpperCase().equals(wfstat.toUpperCase()))
					return true;
				else
					return false;
			}
	}
	return false;
}
 
 

function jsDateToASIDate(dateValue)
{
  //Converts Javascript Date to ASI 0 pad MM/DD/YYYY
  //
  if (dateValue != null)
  {
	if (Date.prototype.isPrototypeOf(dateValue))
	{
	    var M = "" + (dateValue.getMonth()+1); 
	    var MM = "0" + M; 
	    MM = MM.substring(MM.length-2, MM.length); 
	    var D = "" + (dateValue.getDate()); 
	    var DD = "0" + D; 
	    DD = DD.substring(DD.length-2, DD.length); 
	    var YYYY = "" + (dateValue.getFullYear()); 
	    return MM + "/" + DD + "/" + YYYY;
	}
	else
	{
		logDebug("Parameter is not a javascript date");
		return ("INVALID JAVASCRIPT DATE");
	}
  }
  else
  {
	logDebug("Parameter is null");
	return ("NULL PARAMETER VALUE");
  }
}

 
 
function jsDateToMMDDYYYY(pJavaScriptDate)
	{
	//converts javascript date to string in MM/DD/YYYY format
	//
	if (pJavaScriptDate != null)
		{
		if (Date.prototype.isPrototypeOf(pJavaScriptDate))
	return (pJavaScriptDate.getMonth()+1).toString()+"/"+pJavaScriptDate.getDate()+"/"+pJavaScriptDate.getFullYear();
		else
			{
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
			}
		}
	else
		{
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
		}
	}

 
 
function licEditExpInfo (pExpStatus, pExpDate)
	{
	//Edits expiration status and/or date
	//Needs licenseObject function
	//06SSP-00238
	//
	var lic = new licenseObject(null);
	if (pExpStatus!=null)
		{
		lic.setStatus(pExpStatus);
		}
		
	if (pExpDate!=null)
		{
		lic.setExpiration(pExpDate);
		}
	}
	
 
 
function licenseObject(licnumber)  // optional renewal Cap ID -- uses the expiration on the renewal CAP.
	{
	itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args


	this.refProf = null;		// licenseScriptModel (reference licensed professional)
	this.b1Exp = null;		// b1Expiration record (renewal status on application)
	this.b1ExpDate = null;
	this.b1ExpCode = null;
	this.b1Status = null;
	this.refExpDate = null;
	this.licNum = licnumber;	// License Number


	// Load the reference License Professional if we're linking the two
	if (licnumber) // we're linking
		{
		var newLic = getRefLicenseProf(licnumber)
		if (newLic)
				{
				this.refProf = newLic;
				tmpDate = newLic.getLicenseExpirationDate();
				if (tmpDate)
						this.refExpDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
				logDebug("Loaded reference license professional with Expiration of " + this.refExpDate);
				}
		}

   	// Load the renewal info (B1 Expiration)

   	b1ExpResult = aa.expiration.getLicensesByCapID(itemCap)
   		if (b1ExpResult.getSuccess())
   			{
   			this.b1Exp = b1ExpResult.getOutput();
			tmpDate = this.b1Exp.getExpDate();
			if (tmpDate)
				this.b1ExpDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
			this.b1Status = this.b1Exp.getExpStatus();
			logDebug("Found renewal record of status : " + this.b1Status + ", Expires on " + this.b1ExpDate);
			}
		else
			{ logDebug("**ERROR: Getting B1Expiration Object for Cap.  Reason is: " + b1ExpResult.getErrorType() + ":" + b1ExpResult.getErrorMessage()) ; return false }


   	this.setExpiration = function(expDate)
   		// Update expiration date
   		{
   		var expAADate = aa.date.parseDate(expDate);

   		if (this.refProf) {
   			this.refProf.setLicenseExpirationDate(expAADate);
   			aa.licenseScript.editRefLicenseProf(this.refProf);
   			logDebug("Updated reference license expiration to " + expDate); }

   		if (this.b1Exp)  {
 				this.b1Exp.setExpDate(expAADate);
				aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration());
				logDebug("Updated renewal to " + expDate); }
   		}

	this.setIssued = function(expDate)
		// Update Issued date
		{
		var expAADate = aa.date.parseDate(expDate);

		if (this.refProf) {
			this.refProf.setLicenseIssueDate(expAADate);
			aa.licenseScript.editRefLicenseProf(this.refProf);
			logDebug("Updated reference license issued to " + expDate); }

		}
	this.setLastRenewal = function(expDate)
		// Update expiration date
		{
		var expAADate = aa.date.parseDate(expDate)

		if (this.refProf) {
			this.refProf.setLicenseLastRenewalDate(expAADate);
			aa.licenseScript.editRefLicenseProf(this.refProf);
			logDebug("Updated reference license issued to " + expDate); }
		}

	this.setStatus = function(licStat)
		// Update expiration status
		{
		if (this.b1Exp)  {
			this.b1Exp.setExpStatus(licStat);
			aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration());
			logDebug("Updated renewal to status " + licStat); }
		}

	this.getStatus = function()
		// Get Expiration Status
		{
		if (this.b1Exp) {
			return this.b1Exp.getExpStatus();
			}
		}

	this.getCode = function()
		// Get Expiration Status
		{
		if (this.b1Exp) {
			return this.b1Exp.getExpCode();
			}
		}
	}
 
 
function licenseProfObject(licnumber, lictype) {
	//Populate the License Model
	this.refLicModel = null; //Reference LP Model
	this.infoTableGroupCodeObj = null;
	this.infoTableSubGroupCodesObj = null;
	this.infoTables = new Array(); //Table Array ex infoTables[name][row][column].getValue()
	this.attribs = new Array(); //Array of LP Attributes ex attribs[name]
	this.valid = false; //true if LP is valid
	this.validTables = false; //true if LP has infoTables
	this.validAttrs = false; //true if LP has attributes

	var result = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licnumber);
	if (result.getSuccess()) {
		var tmp = result.getOutput();
		if (lictype == null)
			lictype = "";
		if (tmp != null)
			for (lic in tmp)
				if (tmp[lic].getLicenseType().toUpperCase() == lictype.toUpperCase() || lictype == "") {
					this.refLicModel = tmp[lic];
					if (lictype == "") {
						lictype = this.refLicModel.getLicenseType();
					}
					break;
				}
	}

	//Get the People Info Tables
	if (this.refLicModel != null) {
		this.infoTableGroupCodeObj = this.refLicModel.getInfoTableGroupCodeModel();
		if (this.infoTableGroupCodeObj == null) {
			//12ACC-00187
			var infoSvc = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
			if (infoSvc.getInfoTableGroupCodeModel() != null) {
				infoSvc.getInfoTableGroupCodeModel().setServProvCode(aa.getServiceProviderCode());
				infoSvc.getInfoTableGroupCodeModel().setCategory(1);
				infoSvc.getInfoTableGroupCodeModel().setReferenceId("");
				infoSvc.getInfoTableGroupCodeModel().setName(lictype.toUpperCase());
				var tmpGrp = aa.licenseProfessional.getRefInfoTableGroupCode(infoSvc).getOutput();
				if (tmpGrp != null) { //If table was found set reference ID and write to DB
					tmpGrp.setReferenceId(this.refLicModel.getLicSeqNbr());
					infoSvc.setInfoTableGroupCodeModel(tmpGrp);
					aa.licenseProfessional.createRefInfoTable(infoSvc);

					//Recapture new data with Table Model
					var tmp = null;
					tmp = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licnumber).getOutput();
					for (lic in tmp)
						if (tmp[lic].getLicenseType().toUpperCase() == lictype.toUpperCase()) {
							this.refLicModel = tmp[lic];
							break;
						}
					//Get the Table Group Code and continue on
					this.infoTableGroupCodeObj = this.refLicModel.getInfoTableGroupCodeModel();
				}
			}
		}
	}

	if (this.infoTableGroupCodeObj != null) {
		var tmp = this.infoTableGroupCodeObj.getSubgroups();
		if (tmp != null)
			this.infoTableSubGroupCodesObj = tmp.toArray();
	}

	//Set flags that can be used for validation
	this.validTables = (this.infoTableSubGroupCodesObj != null);
	this.valid = (this.refLicModel != null);

	//Get all the Table Values, done this way to keep it clean when a row is added
	//Can also be used to refresh manually
	this.refreshTables = function () {
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				var tableArr = new Array()
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
				if (columnsList != null) {
					columnsList = columnsList.toArray();
					for (column in columnsList) {
						var tmpCol = columnsList[column].getTableValues();
						//aa.print(columnsList[column])
						if (tmpCol != null) {
							tmpCol = tmpCol.toArray();
							tmpCol.sort(function (a, b) {
								return a.getRowNumber() - b.getRowNumber()
							})
							//EMSE Dom gets by column, need to pivot to list by row to make usable
							for (var row = 0; row < tmpCol.length; row++) {
								tmpCol[row].setRowNumber(row); //Fix the row numbers
								if (tableArr[row] == null)
									tableArr[row] = new Array();
								tableArr[row][columnsList[column].getName()] = tmpCol[row];
							}
						}
					}
				}
				this.infoTables[this.infoTableSubGroupCodesObj[tbl].getName()] = tableArr;
			}
		}
	}
	this.refreshTables(); //Invoke the Table Refresh to popualte our table arrays

	//Get max row from table for sequencing
	this.getMaxRowByTable = function (vTableName) {
		var maxRow = -1;
		if (this.validTables) {
			var tbl = this.infoTables[vTableName];
			if (tbl != null) {
				for (row in tbl)
					for (col in tbl[row]) //due to way data is stored must loop through all row/columns
						if (maxRow < parseInt(tbl[row][col].getRowNumber()))
							maxRow = parseInt(tbl[row][col].getRowNumber());
			}
		}
		return maxRow;
	}

	//Add Row to Table
	this.addTableRow = function (vTableName, vValueArray) {
		var retVal = false;
		var newRowArray = new Array();
		if (this.validTables)
			for (tbl in this.infoTableSubGroupCodesObj)
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var maxRow = this.getMaxRowByTable(vTableName) + 1;
					var colsArr = this.infoTableSubGroupCodesObj[tbl].getColumnDefines().toArray();
					var colNum = 0;
					colsArr.sort(function (a, b) {
						return (parseInt(a.getDisplayOrder()) - parseInt(b.getDisplayOrder()))
					});
					for (col in colsArr) {
						//12ACC-00189
						var tmpTv = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput().getInfoTableValueModel();
						tmpTv.setAuditStatus("A");
						tmpTv.setServProvCode(aa.getServiceProviderCode());
						tmpTv.setColumnNumber(colNum++);
						tmpTv.setAuditDate(colsArr[col].getAuditDate()); //need proper date
						if (typeof(currentUserID) != 'undefined') //check to make sure a current userID exists
							tmpTv.setAuditId(currentUserID);
						else
							tmpTv.setAuditId("ADMIN"); //default to admin
						tmpTv.setInfoId(colsArr[col].getId());
						tmpTv.setRowNumber(maxRow); //use static new row variable from object
						for (val in vValueArray)
							if (val.toString().toUpperCase() == colsArr[col].getName().toString().toUpperCase()) {
								tmpTv.setValue(vValueArray[val].toString()); //Get Value from associative array
							}

						colsArr[col].addTableValue(tmpTv);
						retVal = true;
					}
					this.refreshTables(); //refresh associative arrays
				}
		return retVal;
	}

	//Process an ASIT row into People Info
	this.addTableFromASIT = function (vTableName, vASITArray) {
		var retVal = true;
		if (this.validTables)
			for (row in vASITArray) { //for Each Row in the ASIT execute the add
				if (!this.addTableRow(vTableName, vASITArray[row]))
					retVal = false;
			}
		else
			retVal = false;
		return retVal;
	}

	//Remove Row from Table
	this.removeTableRow = function (vTableName, vRowIndex) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							var tmpCol = columnsList[column].getTableValues();
							if (tmpCol != null) {
								tmpCol = tmpCol.toArray();
								//aa.print(tmpCol.length);
								if (vRowIndex <= tmpCol.length) {
									var tmpList = aa.util.newArrayList()
										for (row in tmpCol) {
											if (tmpCol[row].getRowNumber() != vRowIndex) {
												tmpList.add(tmpCol[row]);
												//aa.print(tmpCol[row].getColumnNumber() + " :" + tmpCol[row].getRowNumber());
											} else {
												retVal = true;
											}
										}
										columnsList[column].setTableValues(tmpList);
								} //End Remove
							} //end column Check
						} //end column loop
					} //end column list check
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check

		return retVal;
	}

	this.removeTable = function (vTableName) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							var tmpCol = columnsList[column].getTableValues();
							if (tmpCol != null) {
								var tmpList = aa.util.newArrayList()
									columnsList[column].setTableValues(tmpList);
								retVal = true;
							} //End Remove
						} //end column loop
					} //end column list check
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check

		return retVal;
	}

	//Enable or Disable Table Row by index
	this.setTableEnabledFlag = function (vTableName, vRowIndex, isEnabled) {
		var updated = false
			var tmp = null
			tmp = this.infoTables[vTableName];
		if (tmp != null)
			if (tmp[vRowIndex] != null) {
				for (col in tmp[vRowIndex]) {
					tmp[vRowIndex][col].setAuditStatus(((isEnabled) ? "A" : "I"));
					updated = true;
				}
			}
		return updated;
	}

	//Makes table visible in ACA Lookup
	//vIsVisible = 'Y' or 'N'
	this.setDisplayInACA4Table = function (vTableName, vIsVisible) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							columnsList[column].setDisplayLicVeriForACA(vIsVisible);
							retVal = true;
						} //end column loop
					} //end column list check
					if (retVal) {
						var tmpList = aa.util.newArrayList();
						for (col in columnsList) {
							tmpList.add(columnsList[col]);
						}
						this.infoTableSubGroupCodesObj[tbl].setColumnDefines(tmpList);
					}
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check
		return retVal;
	}

	//Get the Attributes for LP
	if (this.valid) {
		var tmpAttrs = this.refLicModel.getAttributes();
		if (tmpAttrs != null) {
			var tmpAttrsList = tmpAttrs.values()
				var tmpIterator = tmpAttrsList.iterator();
			if (tmpIterator.hasNext()) {
				var tmpAttribs = tmpIterator.next().toArray();
				for (x in tmpAttribs) {
					this.attribs[tmpAttribs[x].getAttributeLabel().toUpperCase()] = tmpAttribs[x];
				}
				this.validAttrs = true;
			}
		}
	}

	//get method for Attributes
	this.getAttribute = function (vAttributeName) {
		var retVal = null;
		if (this.validAttrs) {
			var tmpVal = this.attribs[vAttributeName.toString().toUpperCase()];
			if (tmpVal != null)
				retVal = tmpVal.getAttributeValue();
		}
		return retVal;
	}

	//Set method for Attributes
	this.setAttribute = function (vAttributeName, vAttributeValue) {
		var retVal = false;
		if (this.validAttrs) {
			var tmpVal = this.attribs[vAttributeName.toString().toUpperCase()];
			if (tmpVal != null) {
				tmpVal.setAttributeValue(vAttributeValue);
				retVal = true;
			}
		}
		return retVal;
	}

	//Update From Record Contact by Contact Type
	//Uses first contact of type found
	//If contactType == "" then uses primary
	this.updateFromRecordContactByType = function (vCapId, vContactType, vUpdateAddress, vUpdatePhoneEmail) {
		this.retVal = false;
		if (this.valid) {
			var conArr = new Array();
			var capContResult = aa.people.getCapContactByCapID(vCapId);

			if (capContResult.getSuccess()) {
				conArr = capContResult.getOutput();
			} else {
				retVal = false;
			}

			for (contact in conArr) {
				if (vContactType.toString().toUpperCase() ==
					conArr[contact].getPeople().getContactType().toString().toUpperCase()
					 || (vContactType.toString() == "" && conArr[contact].getPeople().getFlag() == "Y")) {

					cont = conArr[contact];
					peop = cont.getPeople();
					addr = peop.getCompactAddress();

					this.refLicModel.setContactFirstName(cont.getFirstName());
					this.refLicModel.setContactMiddleName(peop.getMiddleName()); //get mid from peop
					this.refLicModel.setContactLastName(cont.getLastName());
					this.refLicModel.setBusinessName(peop.getBusinessName());
					if (vUpdateAddress) {
						this.refLicModel.setAddress1(addr.getAddressLine1());
						this.refLicModel.setAddress2(addr.getAddressLine2());
						this.refLicModel.setAddress3(addr.getAddressLine3());
						this.refLicModel.setCity(addr.getCity());
						this.refLicModel.setState(addr.getState());
						this.refLicModel.setZip(addr.getZip());
					}
					if (vUpdatePhoneEmail) {
						this.refLicModel.setPhone1(peop.getPhone1());
						this.refLicModel.setPhone2(peop.getPhone2());
						this.refLicModel.setPhone3(peop.getPhone3());
						this.refLicModel.setEMailAddress(peop.getEmail());
						this.refLicModel.setFax(peop.getFax());
					}
					//Audit Fields
					this.refLicModel.setAgencyCode(aa.getServiceProviderCode());
					this.refLicModel.setAuditDate(sysDate);
					this.refLicModel.setAuditID(currentUserID);
					this.refLicModel.setAuditStatus("A");

					retVal = true;
					break;
				}
			}
		}
		return retVal;
	}

	this.updateFromAddress = function (vCapId) {
		this.retVal = false;
		if (this.valid) {
			var capAddressResult = aa.address.getAddressByCapId(vCapId);
			var addr = null;
			if (capAddressResult.getSuccess()) {
				Address = capAddressResult.getOutput();
				for (yy in Address) {
					if ("Y" == Address[yy].getPrimaryFlag()) {
						addr = Address[yy];
						logDebug("Target CAP has primary address");
						break;
					}
				}
				if (addr == null) {
					addr = Address[0];
				}
			} else {
				logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
			}

			if (addr != null) {
				var addrLine1 = addr.getAddressLine1();
				if (addrLine1 == null) {
					addrLine1 = addr.getHouseNumberStart();
					addrLine1 += (addr.getStreetDirection() != null ? " " + addr.getStreetDirection() : "");
					addrLine1 += (addr.getStreetName() != null ? " " + addr.getStreetName() : "");
					addrLine1 += (addr.getStreetSuffix() != null ? " " + addr.getStreetSuffix() : "");
					addrLine1 += (addr.getUnitType() != null ? " " + addr.getUnitType() : "");
					addrLine1 += (addr.getUnitStart() != null ? " " + addr.getUnitStart() : "");
				}
				this.refLicModel.setAddress1(addrLine1);
				this.refLicModel.setAddress2(addr.getAddressLine2());
				this.refLicModel.setCity(addr.getCity());
				this.refLicModel.setState(addr.getState());
				this.refLicModel.setZip(addr.getZip());
				retVal = true;
			} else {
				retVal = false;
			}
		}
		return retVal;
	}

	//Update From Record Licensed Prof
	//License Number and Type must match that of the Record License Prof
	this.updateFromRecordLicensedProf = function (vCapId) {
		var retVal = false;
		if (this.valid) {

			var capLicenseResult = aa.licenseProfessional.getLicenseProf(capId);
			var capLicenseArr = new Array();
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			} else {
				retVal = false;
			}

			for (capLic in capLicenseArr) {
				if (capLicenseArr[capLic].getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
					 && capLicenseArr[capLic].getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {

					licProfScriptModel = capLicenseArr[capLic];

					this.refLicModel.setAddress1(licProfScriptModel.getAddress1());
					this.refLicModel.setAddress2(licProfScriptModel.getAddress2());
					this.refLicModel.setAddress3(licProfScriptModel.getAddress3());
					this.refLicModel.setAgencyCode(licProfScriptModel.getAgencyCode());
					this.refLicModel.setAuditDate(licProfScriptModel.getAuditDate());
					this.refLicModel.setAuditID(licProfScriptModel.getAuditID());
					this.refLicModel.setAuditStatus(licProfScriptModel.getAuditStatus());
					this.refLicModel.setBusinessLicense(licProfScriptModel.getBusinessLicense());
					this.refLicModel.setBusinessName(licProfScriptModel.getBusinessName());
					this.refLicModel.setCity(licProfScriptModel.getCity());
					this.refLicModel.setCityCode(licProfScriptModel.getCityCode());
					this.refLicModel.setContactFirstName(licProfScriptModel.getContactFirstName());
					this.refLicModel.setContactLastName(licProfScriptModel.getContactLastName());
					this.refLicModel.setContactMiddleName(licProfScriptModel.getContactMiddleName());
					this.refLicModel.setContryCode(licProfScriptModel.getCountryCode());
					this.refLicModel.setCountry(licProfScriptModel.getCountry());
					this.refLicModel.setEinSs(licProfScriptModel.getEinSs());
					this.refLicModel.setEMailAddress(licProfScriptModel.getEmail());
					this.refLicModel.setFax(licProfScriptModel.getFax());
					this.refLicModel.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
					this.refLicModel.setPhone1(licProfScriptModel.getPhone1());
					this.refLicModel.setPhone2(licProfScriptModel.getPhone2());
					this.refLicModel.setSelfIns(licProfScriptModel.getSelfIns());
					this.refLicModel.setState(licProfScriptModel.getState());
					this.refLicModel.setLicState(licProfScriptModel.getState());
					this.refLicModel.setSuffixName(licProfScriptModel.getSuffixName());
					this.refLicModel.setWcExempt(licProfScriptModel.getWorkCompExempt());
					this.refLicModel.setZip(licProfScriptModel.getZip());

					//new
					this.refLicModel.setFein(licProfScriptModel.getFein());
					//licProfScriptModel.getBirthDate()
					//licProfScriptModel.getTitle()
					this.refLicModel.setPhone3(licProfScriptModel.getPhone3());
					this.refLicModel.setBusinessName2(licProfScriptModel.getBusName2());

					retVal = true;
				}
			}
		}
		return retVal;
	}

	//Copy Reference Licensed Professional to a Record
	//If replace is true will remove and readd lic_prof
	//Currently wont copy infoTables...
	this.copyToRecord = function (vCapId, vReplace) {
		var retVal = false;
		if (this.valid) {
			var capLicenseResult = aa.licenseProfessional.getLicenseProf(vCapId);
			var capLicenseArr = new Array();
			var existing = false;
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			}

			if (capLicenseArr != null) {
				for (capLic in capLicenseArr) {
					if (capLicenseArr[capLic].getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
						 && capLicenseArr[capLic].getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {
						if (vReplace) {
							aa.licenseProfessional.removeLicensedProfessional(capLicenseArr[capLic]);
							break;
						} else {
							existing = true;
						}
					}
				}
			}

			if (!existing) {
				capListResult = aa.licenseScript.associateLpWithCap(vCapId, this.refLicModel);
				retVal = capListResult.getSuccess();
				//Add peopleInfoTables via Workaround (12ACC-00186)
				if (this.validTables && retVal) {
					var tmpLicProfObj = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
					this.infoTableGroupCodeObj.setCapId1(vCapId.getID1());
					this.infoTableGroupCodeObj.setCapId2(vCapId.getID2());
					this.infoTableGroupCodeObj.setCapId3(vCapId.getID3());
					//save ref values
					var tmpRefId = this.infoTableGroupCodeObj.getReferenceId();
					var tmpRefType = this.infoTableGroupCodeObj.getReferenceType();
					var tmpRefDesc = this.infoTableGroupCodeObj.getReferenceDesc();
					//update Ref Values
					this.infoTableGroupCodeObj.setReferenceId(this.refLicModel.getStateLicense());
					this.infoTableGroupCodeObj.setReferenceType(this.refLicModel.getLicenseType());
					this.infoTableGroupCodeObj.setReferenceDesc("Description");
					this.infoTableGroupCodeObj.setCategory(1);
					tmpLicProfObj.setInfoTableGroupCodeModel(this.infoTableGroupCodeObj);
					aa.licenseProfessional.createInfoTable(tmpLicProfObj);
					//Set the cap back to null
					this.infoTableGroupCodeObj.setCapId1(null);
					this.infoTableGroupCodeObj.setCapId2(null);
					this.infoTableGroupCodeObj.setCapId3(null);
					//Set the ref values back
					this.infoTableGroupCodeObj.setReferenceId(tmpRefId);
					this.infoTableGroupCodeObj.setReferenceType(tmpRefType);
					this.infoTableGroupCodeObj.setReferenceDesc(tmpRefDesc);
				}
			}
		}
		return retVal;
	}

	this.enable = function () {
		this.refLicModel.setAuditStatus("A");
	}
	this.disable = function () {
		this.refLicModel.setAuditStatus("I");
	}

	//get records associated to license
	this.getAssociatedRecords = function () {
		var retVal = new Array();
		if (this.valid) {
			var resObj = aa.licenseScript.getCapIDsByLicenseModel(this.refLicModel);
			if (resObj.getSuccess()) {
				var tmp = resObj.getOutput();
				if (tmp != null) //make sure your not setting to null otherwise will not work like array
					retVal = tmp;
			}
		}
		return retVal;
	}

	//Save Changes to this object to Ref Licensed Professional
	this.updateRecord = function () {
		var retVal = false
			if (this.valid) {
				this.refreshTables(); //Must ensure row#s are good or wont show in ACA
				var res = aa.licenseScript.editRefLicenseProf(this.refLicModel);
				retVal = res.getSuccess();
			}
			return retVal;
	}

	return this
} 
 
 function linkPublicUserToContact()   // optional: Contact Type, default Applicant

{

    var contactType = "Applicant";

    var contact;

    var refContactNum;

    var userModel;

    if (arguments.length > 0) contactType = arguments[0]; // use contact type specified



    var capContactResult = aa.people.getCapContactByCapID(capId);

    if (capContactResult.getSuccess()) {

		var Contacts = capContactResult.getOutput();

        for (yy in Contacts) {

            if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))

				contact = Contacts[yy];

        }

    }

    

    if (!contact)

    { logDebug("Couldn't link public user for " + contactType + ", no such contact"); return false; }





	if (contact.getPeople().getContactTypeFlag().equals("organization"))

	{ logDebug("Couldn't link public user for " + contactType + ", the contact is an organization"); return false; }

	

    // get the reference contact ID.   We will use to connect to the new public user

    refContactNum = contact.getCapContactModel().getRefContactNumber();



    // check to see if public user exists already based on email address

    var getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);

    if (getUserResult.getSuccess() && getUserResult.getOutput()) {

        userModel = getUserResult.getOutput();

        logDebug("linkPublicUserToContact: Found an existing public user: " + userModel.getUserID());

	} else {

		logDebug("Couldn't link public user for " + contactType + ", no such public user"); return false;

	}



	//  Now that we have a public user let's connect to the reference contact		

	

	if (refContactNum)

		{

		logDebug("linkPublicUserToContact: Linking this public user with reference contact : " + refContactNum);

		aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refContactNum);

		}

	

	return userModel; // send back the new or existing public user

}

 
 
function loadAddressAttributes(thisArr)
{
	//
	// Returns an associative array of Address Attributes
	// Optional second parameter, cap ID to load from
	//

	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var fcapAddressObj = null;
   	var capAddressResult = aa.address.getAddressWithAttributeByCapId(itemCap);
   	if (capAddressResult.getSuccess())
   		var fcapAddressObj = capAddressResult.getOutput();
   	else
     		logDebug("**ERROR: Failed to get Address object: " + capAddressResult.getErrorType() + ":" + capAddressResult.getErrorMessage())

  	for (i in fcapAddressObj)
  	{
  		addressAttrObj = fcapAddressObj[i].getAttributes().toArray();
  		for (z in addressAttrObj)
			thisArr["AddressAttribute." + addressAttrObj[z].getB1AttributeName()]=addressAttrObj[z].getB1AttributeValue();

		// Explicitly load some standard values
		thisArr["AddressAttribute.PrimaryFlag"] = fcapAddressObj[i].getPrimaryFlag();
		thisArr["AddressAttribute.HouseNumberStart"] = fcapAddressObj[i].getHouseNumberStart();
		thisArr["AddressAttribute.StreetDirection"] = fcapAddressObj[i].getStreetDirection();
		thisArr["AddressAttribute.StreetName"] = fcapAddressObj[i].getStreetName();
		thisArr["AddressAttribute.StreetSuffix"] = fcapAddressObj[i].getStreetSuffix();
		thisArr["AddressAttribute.City"] = fcapAddressObj[i].getCity();
		thisArr["AddressAttribute.State"] = fcapAddressObj[i].getState();
		thisArr["AddressAttribute.Zip"] = fcapAddressObj[i].getZip();
		thisArr["AddressAttribute.AddressStatus"] = fcapAddressObj[i].getAddressStatus();
		thisArr["AddressAttribute.County"] = fcapAddressObj[i].getCounty();
		thisArr["AddressAttribute.Country"] = fcapAddressObj[i].getCountry();
		thisArr["AddressAttribute.AddressDescription"] = fcapAddressObj[i].getAddressDescription();
		thisArr["AddressAttribute.XCoordinate"] = fcapAddressObj[i].getXCoordinator();
		thisArr["AddressAttribute.YCoordinate"] = fcapAddressObj[i].getYCoordinator();
  	}
}
 
 

function loadAddressAttributes4ACA(thisArr)
{
	//
	// Returns an associative array of Address Attributes from ACA cap model
	// 
	//

	fcapAddressObj = cap.getAddressModel();

  	if (!fcapAddressObj)
  		{ logDebug("No Address to get attributes"); return false; }
  	
	addressAttr = fcapAddressObj.getAttributes();
		
	if (!addressAttr)
		{ logDebug("No attributes on this address") ; return false ; }

	addressAttrObj = addressAttr.toArray();

	for (z in addressAttrObj)
		thisArr["AddressAttribute." + addressAttrObj[z].getB1AttributeName()]=addressAttrObj[z].getB1AttributeValue();

	// Explicitly load some standard values
	thisArr["AddressAttribute.PrimaryFlag"] = fcapAddressObj.getPrimaryFlag();
	thisArr["AddressAttribute.HouseNumberStart"] = fcapAddressObj.getHouseNumberStart();
	thisArr["AddressAttribute.StreetDirection"] = fcapAddressObj.getStreetDirection();
	thisArr["AddressAttribute.StreetName"] = fcapAddressObj.getStreetName();
	thisArr["AddressAttribute.StreetSuffix"] = fcapAddressObj.getStreetSuffix();
	thisArr["AddressAttribute.City"] = fcapAddressObj.getCity();
	thisArr["AddressAttribute.State"] = fcapAddressObj.getState();
	thisArr["AddressAttribute.Zip"] = fcapAddressObj.getZip();
	thisArr["AddressAttribute.AddressStatus"] = fcapAddressObj.getAddressStatus();
	thisArr["AddressAttribute.County"] = fcapAddressObj.getCounty();
	thisArr["AddressAttribute.Country"] = fcapAddressObj.getCountry();
	thisArr["AddressAttribute.AddressDescription"] = fcapAddressObj.getAddressDescription();
	thisArr["AddressAttribute.XCoordinate"] = fcapAddressObj.getXCoordinator();
	thisArr["AddressAttribute.YCoordinate"] = fcapAddressObj.getYCoordinator();
}
 
 
function loadAppSpecific(thisArr) {
	// 
	// Returns an associative array of App Specific Info
	// Optional second parameter, cap ID to load from
	//
	
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
	 	{
		var fAppSpecInfoObj = appSpecInfoResult.getOutput();

		for (loopk in fAppSpecInfoObj)
			{
			if (useAppSpecificGroupName)
				thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
			else
				thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
			}
		}
	}

 
 
function loadAppSpecific4ACA(thisArr) {
	//
	// Returns an associative array of App Specific Info
	// Optional second parameter, cap ID to load from
	//
	// uses capModel in this event


	var itemCap = capId;
	if (arguments.length >= 2)
		{
		itemCap = arguments[1]; // use cap ID specified in args

    		var fAppSpecInfoObj = aa.appSpecificInfo.getByCapID(itemCap).getOutput();

		for (loopk in fAppSpecInfoObj)
			{
			if (useAppSpecificGroupName)
				thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
			else
				thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
			}
		}
	else
		{
		var capASI = cap.getAppSpecificInfoGroups();
		if (!capASI) {
			logDebug("No ASI for the CapModel");
			}
		else {
			var i= cap.getAppSpecificInfoGroups().iterator();

			while (i.hasNext())
				{
				 var group = i.next();
				 var fields = group.getFields();
				 if (fields != null)
					{
					var iteFields = fields.iterator();
					while (iteFields.hasNext())
						{
						 var field = iteFields.next();

						if (useAppSpecificGroupName)
							thisArr[field.getCheckboxType() + "." + field.getCheckboxDesc()] = field.getChecklistComment();
						else
							thisArr[field.getCheckboxDesc()] = field.getChecklistComment();
					 }
					}
				 }
			}
		}
	} 
 
function loadAppSpecific4Contact(thisArr, contactSeqNbr) {
	var itemCap = capId;
	if (arguments.length == 3)
		itemCap = arguments[2]; // use cap ID specified in args

	var capContactResult = aa.people.getCapContactByPK(itemCap, contactSeqNbr);
	if (capContactResult.getSuccess()) {
		var capContact = capContactResult.getOutput().getCapContactModel();

		if (capContact == null || capContact.getTemplate() == null || capContact.getTemplate().getTemplateForms() == null) {
			//logDebug("No found any Contact Template !");
			return;
		}

		var template = capContact.getTemplate();
		var templateForms = template.getTemplateForms();

		for (var i = 0; i < templateForms.size(); i++) {
			var eachForm = templateForms.get(i);

			//Sub Group
			var subGroup = eachForm.subgroups;

			if (subGroup == null) {
				continue;
			}

			for (var j = 0; j < subGroup.size(); j++) {
				var eachSubGroup = subGroup.get(j);

				if (eachSubGroup == null || eachSubGroup.fields == null) {
					continue;
				}

				var allFields = eachSubGroup.fields;
				for (var k = 0; k < allFields.size(); k++) {
					var eachField = allFields.get(k);
					thisArr[eachField.displayFieldName] = eachField.defaultValue;
				}
			}
		}
	}

} 
 


function loadASITable(tname) {

 	//
 	// Returns a single ASI Table array of arrays
	// Optional parameter, cap ID to load from
	//

	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();

	while (tai.hasNext())
	  {
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      if (!tn.equals(tname)) continue;

	  if (tsm.rowIndex.isEmpty())
	  	{
			logDebug("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

   	  var tempObject = new Array();
	  var tempArray = new Array();

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
      var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
	  var numrows = 1;

	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{
			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		var tval = tsmfldi.next();
		var readOnly = 'N';
		if (readOnlyi.hasNext()) {
			readOnly = readOnlyi.next();
		}
		var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
		tempObject[tcol.getColumnName()] = fieldInfo;

		}
		tempArray.push(tempObject);  // end of record
	  }
	  return tempArray;
	}

 
 

function loadASITables() {

 	//
 	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	//
	// Optional parameter, cap ID to load from
	//

	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();

	while (tai.hasNext())
	  {
	  var tsm = tai.next();

	  var tempObject = new Array();
	  var tempArray = new Array();
	  var tn = tsm.getTableName();
 	  var numrows = 0;
	  tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');

	  if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

	  if (!tsm.rowIndex.isEmpty())
	  	{
	  	  var tsmfldi = tsm.getTableField().iterator();
		  var tsmcoli = tsm.getColumns().iterator();
		  var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
		  var numrows = 1;

		  while (tsmfldi.hasNext())  // cycle through fields
			{
			if (!tsmcoli.hasNext())  // cycle through columns
				{
				var tsmcoli = tsm.getColumns().iterator();
				tempArray.push(tempObject);  // end of record
				var tempObject = new Array();  // clear the temp obj
				numrows++;
				}
			var tcol = tsmcoli.next();
			var tval = tsmfldi.next();
			
			var readOnly = 'N';
			if (readOnlyi.hasNext()) {
				readOnly = readOnlyi.next();
				}

			var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
			tempObject[tcol.getColumnName()] = fieldInfo;
			//tempObject[tcol.getColumnName()] = tval;
			}

			tempArray.push(tempObject);  // end of record
		}

	  var copyStr = "" + tn + " = tempArray";
	  logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	  eval(copyStr);  // move to table name
	  }

	}

 
 
function loadASITables4ACA() {

 	//
 	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	//
	// Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
	//

	var itemCap = capId;
	if (arguments.length == 1)
		{
		itemCap = arguments[0]; // use cap ID specified in args
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
		}
	else
		{
		var gm = cap.getAppSpecificTableGroupModel()
		}

	var ta = gm.getTablesMap();


	var tai = ta.values().iterator();

	while (tai.hasNext())
	  {
	  var tsm = tai.next();

	  if (tsm.rowIndex.isEmpty()) continue;  // empty table

	  var tempObject = new Array();
	  var tempArray = new Array();
	  var tn = tsm.getTableName();

	  tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');

	  if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
	  var numrows = 1;

	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{

			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		var tval = tsmfldi.next().getInputValue();
		tempObject[tcol.getColumnName()] = tval;
		}
	  tempArray.push(tempObject);  // end of record
	  var copyStr = "" + tn + " = tempArray";
	  logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	  eval(copyStr);  // move to table name
	  }

	}

 
 
function loadASITablesBefore() {

	//
	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	//
	//Sometimes "AppSpecificTableGroupModel" is a list
	var gm = aa.env.getValue("AppSpecificTableGroupModel");

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
 

function loadFees()  // option CapId
	{
	//  load the fees into an array of objects.  Does not
	var itemCap = capId
	if (arguments.length > 0)
		{
		ltcapidstr = arguments[0]; // use cap ID specified in args
		if (typeof(ltcapidstr) == "string")
                {
				var ltresult = aa.cap.getCapID(ltcapidstr);
	 			if (ltresult.getSuccess())
  				 	itemCap = ltresult.getOutput();
	  			else
  				  	{ logMessage("**ERROR: Failed to get cap ID: " + ltcapidstr + " error: " +  ltresult.getErrorMessage()); return false; }
                }
		else
			itemCap = ltcapidstr;
		}

  	var feeArr = new Array();

	var feeResult=aa.fee.getFeeItems(itemCap);
		if (feeResult.getSuccess())
			{ var feeObjArr = feeResult.getOutput(); }
		else
			{ logDebug( "**ERROR: getting fee items: " + feeResult.getErrorMessage()); return false }

		for (ff in feeObjArr)
			{
			fFee = feeObjArr[ff];
			var myFee = new Fee();
			var amtPaid = 0;

			var pfResult = aa.finance.getPaymentFeeItems(itemCap, null);
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if (fFee.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
						amtPaid+=pfObj[ij].getFeeAllocation()
				}

			myFee.sequence = fFee.getFeeSeqNbr();
			myFee.code =  fFee.getFeeCod();
			myFee.sched = fFee.getF4FeeItemModel().getFeeSchudle();
			myFee.description = fFee.getFeeDescription();
			myFee.unit = fFee.getFeeUnit();
			myFee.amount = fFee.getFee();
			myFee.amountPaid = amtPaid;
			if (fFee.getApplyDate()) myFee.applyDate = convertDate(fFee.getApplyDate());
			if (fFee.getEffectDate()) myFee.effectDate = convertDate(fFee.getEffectDate());
			if (fFee.getExpireDate()) myFee.expireDate = convertDate(fFee.getExpireDate());
			myFee.status = fFee.getFeeitemStatus();
			myFee.period = fFee.getPaymentPeriod();
			myFee.display = fFee.getDisplay();
			myFee.accCodeL1 = fFee.getAccCodeL1();
			myFee.accCodeL2 = fFee.getAccCodeL2();
			myFee.accCodeL3 = fFee.getAccCodeL3();
			myFee.formula = fFee.getFormula();
			myFee.udes = fFee.getUdes();
			myFee.UDF1 = fFee.getUdf1();
			myFee.UDF2 = fFee.getUdf2();
			myFee.UDF3 = fFee.getUdf3();
			myFee.UDF4 = fFee.getUdf4();
			myFee.subGroup = fFee.getSubGroup();
			myFee.calcFlag = fFee.getCalcFlag();;
			myFee.calcProc = fFee.getFeeCalcProc();
			myFee.version = fFee.getF4FeeItemModel().getVersion();

			feeArr.push(myFee)
			}

		return feeArr;
		}


//////////////////

function Fee() // Fee Object
	{
	this.sequence = null;
	this.code =  null;
	this.description = null;  // getFeeDescription()
	this.unit = null; //  getFeeUnit()
	this.amount = null; //  getFee()
	this.amountPaid = null;
	this.applyDate = null; // getApplyDate()
	this.effectDate = null; // getEffectDate();
	this.expireDate = null; // getExpireDate();
	this.status = null; // getFeeitemStatus()
	this.recDate = null;
	this.period = null; // getPaymentPeriod()
	this.display = null; // getDisplay()
	this.accCodeL1 = null; // getAccCodeL1()
	this.accCodeL2 = null; // getAccCodeL2()
	this.accCodeL3 = null; // getAccCodeL3()
	this.formula = null; // getFormula()
	this.udes = null; // String getUdes()
	this.UDF1 = null; // getUdf1()
	this.UDF2 = null; // getUdf2()
	this.UDF3 = null; // getUdf3()
	this.UDF4 = null; // getUdf4()
	this.subGroup = null; // getSubGroup()
	this.calcFlag = null; // getCalcFlag();
	this.calcProc = null; // getFeeCalcProc()
	this.auditDate = null; // getAuditDate()
	this.auditID = null; // getAuditID()
	this.auditStatus = null; // getAuditStatus()
	this.version = null; // getVersion()
	}

 
 

function loadGuideSheetItems(inspId) {
	//
	// Returns an associative array of Guide Sheet Items
	// Optional second parameter, cap ID to load from
	//

	var retArray = new Array()
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var r = aa.inspection.getInspections(itemCap)

	if (r.getSuccess())
	 	{
		var inspArray = r.getOutput();

		for (i in inspArray)
			{
			if (inspArray[i].getIdNumber() == inspId)
				{
				var inspModel = inspArray[i].getInspection();

				var gs = inspModel.getGuideSheets()

				if (gs)
					{
					gsArray = gs.toArray();
					for (var loopk in gsArray)
						{
						var gsItems = gsArray[loopk].getItems().toArray()
						for (var loopi in gsItems)
							retArray[gsItems[loopi].getGuideItemText()] = gsItems[loopi].getGuideItemStatus();
						}
					} // if there are guidesheets
				else
					logDebug("No guidesheets for this inspection");
				} // if this is the right inspection
			} // for each inspection
		} // if there are inspections

	logDebug("loaded " + retArray.length + " guidesheet items");
	return retArray;
	}
 
 
function loadParcelAttributes(thisArr) {
	//
	// Returns an associative array of Parcel Attributes
	// Optional second parameter, cap ID to load from
	//
	
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var fcapParcelObj = null;
   	var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
   	if (capParcelResult.getSuccess())
   		var fcapParcelObj = capParcelResult.getOutput().toArray();
   	else
     		logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage())
  	
  	for (i in fcapParcelObj)
  		{
  		parcelArea += fcapParcelObj[i].getParcelArea()
  		parcelAttrObj = fcapParcelObj[i].getParcelAttribute().toArray();
  		for (z in parcelAttrObj)
			thisArr["ParcelAttribute." + parcelAttrObj[z].getB1AttributeName()]=parcelAttrObj[z].getB1AttributeValue();

		// Explicitly load some standard values
		thisArr["ParcelAttribute.Block"] = fcapParcelObj[i].getBlock();
		thisArr["ParcelAttribute.Book"] = fcapParcelObj[i].getBook();
		thisArr["ParcelAttribute.CensusTract"] = fcapParcelObj[i].getCensusTract();
		thisArr["ParcelAttribute.CouncilDistrict"] = fcapParcelObj[i].getCouncilDistrict();
		thisArr["ParcelAttribute.ExemptValue"] = fcapParcelObj[i].getExemptValue();
		thisArr["ParcelAttribute.ImprovedValue"] = fcapParcelObj[i].getImprovedValue();
		thisArr["ParcelAttribute.InspectionDistrict"] = fcapParcelObj[i].getInspectionDistrict();
		thisArr["ParcelAttribute.LandValue"] = fcapParcelObj[i].getLandValue();
		thisArr["ParcelAttribute.LegalDesc"] = fcapParcelObj[i].getLegalDesc();
		thisArr["ParcelAttribute.Lot"] = fcapParcelObj[i].getLot();
		thisArr["ParcelAttribute.MapNo"] = fcapParcelObj[i].getMapNo();
		thisArr["ParcelAttribute.MapRef"] = fcapParcelObj[i].getMapRef();
		thisArr["ParcelAttribute.ParcelStatus"] = fcapParcelObj[i].getParcelStatus();
		thisArr["ParcelAttribute.SupervisorDistrict"] = fcapParcelObj[i].getSupervisorDistrict();
		thisArr["ParcelAttribute.Tract"] = fcapParcelObj[i].getTract();
		thisArr["ParcelAttribute.PlanArea"] = fcapParcelObj[i].getPlanArea();
  		}
	}
 
 
function loadTasks(ltcapidstr)
	{
	if (typeof(ltcapidstr) == "string")
                {
		var ltresult = aa.cap.getCapID(ltcapidstr);
	 	if (ltresult.getSuccess())
  		 	ltCapId = ltresult.getOutput();
	  	else
  		  	{ logMessage("**ERROR: Failed to get cap ID: " + ltcapidstr + " error: " +  ltresult.getErrorMessage()); return false; }
                }
	else
		ltCapId = ltcapidstr;

  	var taskArr = new Array();

	var workflowResult = aa.workflow.getTasks(ltCapId);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else
		{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	for (i in wfObj)
		{
		fTask = wfObj[i];
		var myTask = new Task();
		myTask.status = fTask.getDisposition();
		myTask.comment = fTask.getDispositionComment();
		myTask.process = fTask.getProcessCode();
                if (fTask.getStatusDate()) myTask.statusdate = "" + (fTask.getStatusDate().getMonth() + 1) + "/" + fTask.getStatusDate().getDate() + "/" + (fTask.getStatusDate().getYear() + 1900);
		myTask.processID = fTask.getProcessID();
		myTask.note = fTask.getDispositionNote();
		myTask.step = fTask.getStepNumber();
		myTask.active = fTask.getActiveFlag(); 
		taskArr[fTask.getTaskDescription()] = myTask;
		}
	return taskArr;
	}


function Task() // Task Object
	{
	this.status = null
	this.comment = null;
	this.note = null;
    this.statusdate = null;
	this.process = null;
	this.processID = null;
    this.step = null;
    this.active = null;
	}
	


 
 
function loadTaskSpecific(thisArr) 
	{
 	// 
 	// Appends the Task Specific Info to App Specific Array
 	// If useTaskSpecificGroupName==true, appends wf process code.wftask. to TSI field label
	// Optional second parameter, cap ID to load from
	//
	
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

 	var workflowResult = aa.workflow.getTasks(itemCap);
 	if (workflowResult.getSuccess())
 		var wfObj = workflowResult.getOutput();
 	else
 		{ logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()) ; return false; }
 
 	for (i in wfObj)
 		{
 		var fTask = wfObj[i];
 		var stepnumber = fTask.getStepNumber();
 		var processID = fTask.getProcessID();
 		var TSIResult = aa.taskSpecificInfo.getTaskSpecificInfoByTask(itemCap, processID, stepnumber)
 		if (TSIResult.getSuccess())
 			{
 			var TSI = TSIResult.getOutput();
 			for (a1 in TSI)
  				{
  				if (useTaskSpecificGroupName)
  	  				thisArr[fTask.getProcessCode() + "." + fTask.getTaskDescription() + "." + TSI[a1].getCheckboxDesc()] = TSI[a1].getChecklistComment();
  	  			else
	  				thisArr[TSI[a1].getCheckboxDesc()] = TSI[a1].getChecklistComment();
				}
 			}
 		}
	}
 
 
function logDebug(dstr) {
	vLevel = 1
	if (arguments.length > 1)
		vLevel = arguments[1];
	if ((showDebug & vLevel) == vLevel || vLevel == 1)
		debug += dstr + br;
	if ((showDebug & vLevel) == vLevel)
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
}
 
 

function logGlobals(globArray) {

	for (loopGlob in globArray)
		logDebug("{" + loopGlob + "} = " + globArray[loopGlob])
	}

 
 

function logMessage(dstr)
	{
	message+=dstr + br;
	}
 
 
function lookup(stdChoice,stdValue) 
	{
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	
   	if (bizDomScriptResult.getSuccess())
   		{
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;
	}

 
 
function lookupDateRange(stdChoiceEntry,dateValue) // optional val number 
	{
	var valNumber = 1;
	if (arguments.length == 3) valNumber = arguments[2];

	var compDate = new Date(dateValue);
	var domArr
	for (var count=1; count <= 9999; count++)  // Must be sequential from 01 up to 9999
		{
		var countstr = "0000" + count;
		var countstr = String(countstr).substring(countstr.length,countstr.length - 4);
		var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoiceEntry,countstr);
	   	
	   	if (bizDomScriptResult.getSuccess())
	   		{
			var bizDomScriptObj = bizDomScriptResult.getOutput();
			var domVal = bizDomScriptObj.getDescription();
			if (bizDomScriptObj.getAuditStatus() != 'I')
				{
				var domOld = domArr;
				var domArr = domVal.split("\\^")
				var domDate = new Date(domArr[0])
				if (domDate >= compDate)     //  found the next tier, use the last value
					if (domOld)
						return domOld[valNumber];
					else
						break;
				}					
			}
		else
			if (domArr)
				return domArr[valNumber];
			else
				break;
		}
	}	
 
 
function lookupFeesByValuation(stdChoiceEntry,stdChoiceValue,capval) // optional arg number 
	{
	var valNumber = 1;
	if (arguments.length == 4) valNumber = arguments[3];

	var saveVal ; 
	var lookupStr = lookup(stdChoiceEntry,stdChoiceValue);
	
	if (lookupStr)
		{
		workArr = lookupStr.split("^");
		for (var i in workArr)
			{
                        aa.print(workArr[i]);
			workVals = workArr[i].split("|");
			if (workVals[0] > capval) 
				return saveVal;
			else
				if (valNumber == 1)
					saveVal = workVals[valNumber];
				else
					{
					saveVal = parseInt((capval - workVals[0])/100);
					if ((capval - workVals[0]) % 100 > 0) saveVal++;
					saveVal = saveVal * workVals[valNumber];
					}
			}
		}
	return saveVal;
	}


 
 
function lookupFeesByValuationSlidingScale(stdChoiceEntry,stdChoiceValue,capval) // optional arg number 
	{
	var valNumber = 2;
	if (arguments.length == 4) valNumber = (arguments[3] + 1);

	var saveVal ; 
	var lookupStr = lookup(stdChoiceEntry,stdChoiceValue);
	
	if (lookupStr)
		{
		workArr = lookupStr.split("^");
		for (var i in workArr)
			{
                        aa.print(workArr[i]);
                        
                        
			workVals = workArr[i].split("|");
			if (workVals[0] > capval) 
				return saveVal;
			else
				if (valNumber == 2)
					saveVal = workVals[valNumber];
				else
					{
					var divisor = workVals[1];
					saveVal = parseInt((capval - workVals[0])/divisor);
					if ((capval - workVals[0]) % divisor > 0) saveVal++;
					saveVal = saveVal * workVals[valNumber];
					}
			}
		}
	return saveVal;
	}

 
 
function loopTask(wfstr, wfstat, wfcomment, wfnote) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 5) {
		processName = arguments[4]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	if (!wfstat)
		wfstat = "NA";

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess)
				aa.workflow.handleDisposition(capId, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "L");
			else
				aa.workflow.handleDisposition(capId, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "L");

			logMessage("Closing Workflow Task: " + wfstr + " with status " + wfstat + ", Looping...");
			logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat + ", Looping...");
		}
	}
} 
 
function lpSet(desiredSetId) {
	this.refresh = function () {

		var theSet = aa.set.getSetByPK(this.id).getOutput();
		this.status = theSet.getSetStatus();
		this.setId = theSet.getSetID();
		this.name = theSet.getSetTitle();
		this.comment = theSet.getSetComment();
		this.model = theSet.getSetHeaderModel();
		this.statusComment = theSet.getSetStatusComment();

		var memberResult = aa.set.getLPSetMembersByPK(this.id);

		if (!memberResult.getSuccess()) {
			logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage());
		} else {
			this.members = memberResult.getOutput().toArray();
			this.size = this.members.length;
			if (this.members.length > 0) {
				this.empty = false;
				}
			logDebug("lpSet: loaded set " + this.id + " of status " + this.status + " with " + this.size + " records");
		}
	}

	this.add = function (addLicNum) {
		var setMemberStatus;
		if (arguments.length == 2)
			setMemberStatus = arguments[1];

		try {
			var addLic = getRefLicenseProf(addLicNum);
			var addResult = aa.set.addLPSetMember(this.id, addLic.licSeqNbr);

			if (!addResult.getSuccess()) {
				logDebug("**WARNING** error removing license from set " + this.id + " : " + addResult.getErrorMessage());
			} else {
				logDebug("lpSet: added LP " + addLicNum + " from set " + this.id);
			}
		} catch (err) {
			logDebug("**ERROR** error adding license from set " + this.id + " : " + err.message);
		}

	}

	this.remove = function (removeLicNum) {
		try {
			var removeLic = getRefLicenseProf(removeLicNum);
			var removeResult = aa.set.removeSetHeadersListByLP(this.id, removeLic.licSeqNbr)
				if (!removeResult.getSuccess()) {
					logDebug("**WARNING** error removing license from set " + this.id + " : " + removeResult.getErrorMessage());
				} else {
					logDebug("lpSet: removed license " + removeLicNum + " from set " + this.id);
				}
		} catch (err) {
			logDebug("**ERROR** error removing license from set " + this.id + " : " + err.message);
		}
	}

	this.update = function () {
		var sh = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.SetBusiness").getOutput();
		this.model.setSetStatus(this.status)
		this.model.setSetID(this.setId);
		this.model.setSetTitle(this.name);
		this.model.setSetComment(this.comment);
		this.model.setSetStatusComment(this.statusComment);
		this.model.setRecordSetType(this.type);

		logDebug("lpSet: updating set header information");
		try {
			updateResult = sh.updateSetBySetID(this.model);
		} catch (err) {
			logDebug("**WARNING** error updating set header failed " + err.message);
		}

	}

	this.id = desiredSetId;
	this.name = desiredSetId;
	this.type = null;
	this.comment = null;

	if (arguments.length > 1 && arguments[1])
		this.name = arguments[1];
	if (arguments.length > 2 && arguments[2])
		this.type = arguments[2];
	if (arguments.length > 3 && arguments[3])
		this.comment = arguments[3];

	this.size = 0;
	this.empty = true;
	this.members = new Array();
	this.status = "";
	this.statusComment = "";
	this.model = null;

	var theSetResult = aa.set.getSetByPK(this.id);

	if (theSetResult.getSuccess()) {
		this.refresh();
	} else // add the set
	{
		theSetResult = aa.set.createSet(this.id, this.name, "LICENSE_PROFESSIONAL", this.comment); // Options: CAP (Default), LICENSE_PROFESSIONAL, PARCEL, ADDRESS, RANDOMAUDIT
		if (!theSetResult.getSuccess()) {
			logDebug("**WARNING** error creating set " + this.id + " : " + theSetResult.getErrorMessage);
		} else {
			logDebug("lpSet: Created new set " + this.id + " of type " + this.type);
			this.refresh();
		}
	}

}
 
 

//
// matches:  returns true if value matches any of the following arguments
//
function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 
 
function nextWorkDay(td)   
	// uses app server to return the next work day.
	// Only available in 6.3.2
	// td can be "mm/dd/yyyy" (or anything that will convert to JS date)
	{
	
	if (!td) 
		dDate = new Date();
	else
		dDate = convertDate(td);

	if (!aa.calendar.getNextWorkDay)
		{
		logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
		}
	else
		{
		var dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
		}

	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();;
	}


 
 
function openUrlInNewWindow(myurl)
 {
 //
 // showDebug or showMessage must be true for this to work
 //
 newurl = "<invalidTag LANGUAGE=\"JavaScript\">\r\n<!--\r\n newwin = window.open(\""
 newurl+=myurl
 newurl+="\"); \r\n  //--> \r\n </SCRIPT>"
 
 comment(newurl)
 }

 
 
function pairObj(actID) {
	this.ID = actID;
	this.cri = null;
	this.act = null;
	this.elseact = null;
	this.enabled = true;
	this.continuation = false;
	this.branch = new Array();

	this.load = function (loadStr) {
		//
		// load() : tokenizes and loades the criteria and action
		//
		loadArr = loadStr.split("\\^");
		if (loadArr.length < 2 || loadArr.length > 3) {
			logMessage("**ERROR: The following Criteria/Action pair is incorrectly formatted.  Two or three elements separated by a caret (\"^\") are required. " + br + br + loadStr)
		} else {
			this.cri = loadArr[0];
			this.act = loadArr[1];
			this.elseact = loadArr[2];

			if (this.cri.length() == 0)
				this.continuation = true; // if format is like ("^action...") then it's a continuation of previous line

			var a = loadArr[1];
			var bb = a.indexOf("branch(");
			while (!enableVariableBranching && bb >= 0) {
				var cc = a.substring(bb);
				var dd = cc.indexOf("\")");
				if (dd < 0)
					break;
				if (dd >= 9)
					this.branch.push(cc.substring(8, dd));
				a = cc.substring(dd);
				bb = a.indexOf("branch(");
			}

		}
	}
} 
 
function parcelConditionExists(condtype)
	{
	var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
	if (!capParcelResult.getSuccess())
		{ logDebug("**WARNING: error getting cap parcels : " + capParcelResult.getErrorMessage()) ; return false }

	var Parcels = capParcelResult.getOutput().toArray();
	for (zz in Parcels)
		{
		pcResult = aa.parcelCondition.getParcelConditions(Parcels[zz].getParcelNumber());
		if (!pcResult.getSuccess())
			{ logDebug("**WARNING: error getting parcel conditions : " + pcResult.getErrorMessage()) ; return false }
		pcs = pcResult.getOutput();
		for (pc1 in pcs)
			if (pcs[pc1].getConditionType().equals(condtype)) return true;
		}
	}

 
 
function parcelExistsOnCap()
{
	// Optional parameter, cap ID to load from
	//

	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

	var fcapParcelObj = null;
	var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
	if (capParcelResult.getSuccess())
		var fcapParcelObj = capParcelResult.getOutput().toArray();
	else
		{ logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()); return false; }

	for (i in fcapParcelObj)
	{
		return true;
	}

	return false;
}
 
 
function paymentByTrustAccount(fSeqNbr) //optional: itemCap
  {
	// function  performs the following:
	// retrieve primary trust account on capId 
	// initiates payment from identified trust account for the ammount of the fee associated with fseqNbr
	// if payment successful applies payment in full to fee associated with fseqNbr
	// generates receipt for payment for fee associated with fseqNbr
	// if any of the above fails returns false, otherwise will return true.
	// fee must be invoiced for function to work, use optional capId parameter with addFee() call to ensure fee is invoiced prior to this function being called.
	// 06/08/2011 - Joseph Cipriano - Truepoint Solutions: Made revision to function.  Alter call to pull Primary Trust Account on Cap to use method aa.trustAccount.getPrimaryTrustAccountByCAP().

        feeSeqNbr = fSeqNbr;
	itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
	
	//get fee details
	//retrieve a list of invoices by capID
	iListResult = aa.finance.getInvoiceByCapID(itemCap,null);
	if (iListResult.getSuccess())
	  {
		iList = iListResult.getOutput();
		invNbr = "";
		feeAmount = "";
		iFound = false;
		
		//find invoice by matching fee sequence numbers with one passed in
		for (iNum in iList)
		  {
			fList = aa.invoice.getFeeItemInvoiceByInvoiceNbr(iList[iNum].getInvNbr()).getOutput()
			for (fNum in fList)
        	  if (fList[fNum].getFeeSeqNbr() == feeSeqNbr)
			    {	
				  invNbr = iList[iNum].getInvNbr();
				  feeAmount = fList[fNum].getFee();
				  iFound = true;
				  logMessage("Invoice Number Found: " + invNbr);
				  logMessage("Fee Amount: " + feeAmount);
				  break;
				}
		  }
		  if (!iFound)
			{
			  logMessage("Invoice not found");
			  return false;
			}
	  }
	else
	  {
		logDebug("Error: could not retrieve invoice list: " + iListResult.getErrorMessage());
		return false;
	  }

	
	//retrieve trust account
	//will likely need more logic here to select correct trust account
	//will select first account found on cap
        var tPAcctResult = aa.trustAccount.getPrimaryTrustAccountByCAP(itemCap);

	if (tPAcctResult.getSuccess())
	  {
		tAccountID = tPAcctResult.getOutput().getAcctID();
		tAcctResult = aa.trustAccount.getTrustAccountByAccountID(tAccountID);
		if (tAcctResult.getSuccess())
		  {
			tAcct = tAcctResult.getOutput();
			if (tAcct.getOverdraft == "Y")
			 {
				logDebug("Overdraft allowed");
				if ((tAcct.getAcctBalance() + tAcct.getOverdraftLimit()) < feeAmount)
				  {
					logDebug("The trust account balance plus overdraft allowance is less than invoiced fee amount.")
					logMessage("Trust Account Balance: " + tAcct.getAcctBalance());
					logDebug("Trust Account Overlimit allowance: " + tAcct.getOverdraftLimit());
					return false;
				  }
			 }	  
			else
			{
				if (tAcct.getOverdraft == "N")
				{
					if (tAcct.getAcctBalance() < feeAmount)
					{
						logDebug("The trust account balance is less than invoiced fee amount.")
						logMessage("Trust Account Balance: " + tAcct.getAcctBalance());
						return false;
					}
				}	
			}
			comment("Trust Account ID: " + tAcct.getAcctID());  
			logDebug("Trust Account Balance: " + tAcct.getAcctBalance());
		  }

	  }
	else
	  {
		logDebug("Error: could not retrieve trust account object: " + tPAcctResult.getErrorMessage());
		return false;
	  }
	  
	//prepare payment
	//create paymentscriptmodel
	p = aa.finance.createPaymentScriptModel();
	p.setAuditDate(aa.date.getCurrentDate());
	p.setAuditStatus("A");
	p.setCapID(itemCap);
	p.setCashierID(p.getAuditID());
	p.setPaymentSeqNbr(p.getPaymentSeqNbr());
	p.setPaymentAmount(feeAmount);
	p.setAmountNotAllocated(feeAmount);
	p.setPaymentChange(0);
	p.setPaymentComment("Trust Account Auto-Deduct: " + tAccountID);
	p.setPaymentDate(aa.date.getCurrentDate());
	p.setPaymentMethod("Trust Account");
	p.setPaymentStatus("Paid");
	p.setAcctID(tAccountID);
 
	//create payment
	presult = aa.finance.makePayment(p);
	if (presult.getSuccess()) 
	  {
		//get additional payment information
		pSeq = presult.getOutput();
		logDebug("Payment successful");
		pReturn = aa.finance.getPaymentByPK(itemCap,pSeq,currentUserID);
		if (pReturn.getSuccess()) 
			{
				pR = pReturn.getOutput();
				logDebug("PaymentSeq: " + pR.getPaymentSeqNbr());
			}
		else
			{
				logDebug("Error retrieving payment, must apply payment manually: " + pReturn.getErrorMessage());
				return false;
			}
		
	  }
	else 
	  {
		logDebug("error making payment: " + presult.getErrorMessage());
		return false;
	  }
	
	//apply payment
	//need to figure out how to get payment script model of resulting payment, and paymentFeeStatus and paymentIvnStatus
	feeSeqNbrArray = new Array() ; 
	feeSeqNbrArray.push(feeSeqNbr);
	
	invNbrArray = new Array();
	invNbrArray.push(invNbr);
	
	feeAllocArray = new Array();
	feeAllocArray.push(feeAmount);

	applyResult = aa.finance.applyPayment(itemCap,pR.getPaymentSeqNbr(),feeAmount,feeSeqNbrArray,invNbrArray,feeAllocArray,aa.date.getCurrentDate(),"Paid","Paid",pR.getCashierID(),null);
		
	if (applyResult.getSuccess()) 
	  {
		//get additional payment information
		apply = applyResult.getOutput();
		logDebug("Apply Payment Successful");
	  }
	else 
	  {
		logDebug("error applying funds: " + applyResult.getErrorMessage());
		return false;
	  }
	
	
	//generate receipt
	receiptResult = aa.finance.generateReceipt(itemCap,aa.date.getCurrentDate(),pR.getPaymentSeqNbr(),pR.getCashierID(),null);

	if (receiptResult.getSuccess())
	  {
		receipt = receiptResult.getOutput();
		logDebug("Receipt successfully created: ");// + receipt.getReceiptNbr());
	  }
	else 
	  {
		logDebug("error generating receipt: " + receiptResult.getErrorMessage());
		return false;
	  }
	   
	 //everything committed successfully
	 return true;
  } 
 
function paymentByTrustAccount(fSeqNbr) //optional: itemCap
  {
	// function  performs the following:
	// retrieve primary trust account on capId 
	// initiates payment from identified trust account for the ammount of the fee associated with fseqNbr
	// if payment successful applies payment in full to fee associated with fseqNbr
	// generates receipt for payment for fee associated with fseqNbr
	// if any of the above fails returns false, otherwise will return true.
	// fee must be invoiced for function to work, use optional capId parameter with addFee() call to ensure fee is invoiced prior to this function being called.
	// 06/08/2011 - Joseph Cipriano - Truepoint Solutions: Made revision to function.  Alter call to pull Primary Trust Account on Cap to use method aa.trustAccount.getPrimaryTrustAccountByCAP().

        feeSeqNbr = fSeqNbr;
	itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
	
	// 06/08/2011 - Joseph Cipriano - Truepoint Solutions: Remarked out section on validating if the record has a Licensed Professional.
	/*
	//Make sure there is at least one Licensed Professional on cap.
	capLicenseResult = aa.licenseScript.getLicenseProf(capId);
	if (capLicenseResult.getSuccess())
		{
		lpArray = capLicenseResult.getOutput();
		//Alter condition below. Added condition to also check if the lpArray is null.
		if (lpArray == null || lpArray.length == 0) return false; //no LPs found
		}
	else
		{
		//no LPs found
		return false;
		}
        */

	//get fee details
	//retrieve a list of invoices by capID
	iListResult = aa.finance.getInvoiceByCapID(itemCap,null);
	if (iListResult.getSuccess())
	  {
		iList = iListResult.getOutput();
		invNbr = "";
		feeAmount = "";
		iFound = false;
		
		//find invoice by matching fee sequence numbers with one passed in
		for (iNum in iList)
		  {
			fList = aa.invoice.getFeeItemInvoiceByInvoiceNbr(iList[iNum].getInvNbr()).getOutput()
			for (fNum in fList)
        	  if (fList[fNum].getFeeSeqNbr() == feeSeqNbr)
			    {	
				  invNbr = iList[iNum].getInvNbr();
				  feeAmount = fList[fNum].getFee();
				  iFound = true;
				  logMessage("Invoice Number Found: " + invNbr);
				  logMessage("Fee Amount: " + feeAmount);
				  break;
				}
		  }
		  if (!iFound)
			{
			  logMessage("Invoice not found");
			  return false;
			}
	  }
	else
	  {
		logDebug("Error: could not retrieve invoice list: " + iListResult.getErrorMessage());
		return false;
	  }

	
	//retrieve trust account
	//will likely need more logic here to select correct trust account
	//will select first account found on cap
        var tPAcctResult = aa.trustAccount.getPrimaryTrustAccountByCAP(itemCap);

	if (tPAcctResult.getSuccess())
	  {
		tAccountID = tPAcctResult.getOutput().getAcctID();
		tAcctResult = aa.trustAccount.getTrustAccountByAccountID(tAccountID);
		if (tAcctResult.getSuccess())
		  {
			tAcct = tAcctResult.getOutput();
			if (tAcct.getOverdraft == "Y")
			 {
				logDebug("Overdraft allowed");
				if ((tAcct.getAcctBalance() + tAcct.getOverdraftLimit()) < feeAmount)
				  {
					logDebug("The trust account balance plus overdraft allowance is less than invoiced fee amount.")
					logMessage("Trust Account Balance: " + tAcct.getAcctBalance());
					logDebug("Trust Account Overlimit allowance: " + tAcct.getOverdraftLimit());
					return false;
				  }
			 }	  
			else
			{
				if (tAcct.getOverdraft == "N")
				{
					if (tAcct.getAcctBalance() < feeAmount)
					{
						logDebug("The trust account balance is less than invoiced fee amount.")
						logMessage("Trust Account Balance: " + tAcct.getAcctBalance());
						return false;
					}
				}	
			}
			comment("Trust Account ID: " + tAcct.getAcctID());  
			logDebug("Trust Account Balance: " + tAcct.getAcctBalance());
		  }

	  }
	else
	  {
		logDebug("Error: could not retrieve trust account object: " + tPAcctResult.getErrorMessage());
		return false;
	  }
	  
	//prepare payment
	//create paymentscriptmodel
	p = aa.finance.createPaymentScriptModel();
	p.setAuditDate(aa.date.getCurrentDate());
	p.setAuditStatus("A");
	p.setCapID(itemCap);
	p.setCashierID(p.getAuditID());
	p.setPaymentSeqNbr(p.getPaymentSeqNbr());
	p.setPaymentAmount(feeAmount);
	p.setAmountNotAllocated(feeAmount);
	p.setPaymentChange(0);
	p.setPaymentComment("Trust Account Auto-Deduct: " + tAccountID);
	p.setPaymentDate(aa.date.getCurrentDate());
	p.setPaymentMethod("Trust Account");
	p.setPaymentStatus("Paid");
	p.setAcctID(tAccountID);
 
	//create payment
	presult = aa.finance.makePayment(p);
	if (presult.getSuccess()) 
	  {
		//get additional payment information
		pSeq = presult.getOutput();
		logDebug("Payment successful");
		pReturn = aa.finance.getPaymentByPK(itemCap,pSeq,currentUserID);
		if (pReturn.getSuccess()) 
			{
				pR = pReturn.getOutput();
				logDebug("PaymentSeq: " + pR.getPaymentSeqNbr());
			}
		else
			{
				logDebug("Error retrieving payment, must apply payment manually: " + pReturn.getErrorMessage());
				return false;
			}
		
	  }
	else 
	  {
		logDebug("error making payment: " + presult.getErrorMessage());
		return false;
	  }
	
	//apply payment
	//need to figure out how to get payment script model of resulting payment, and paymentFeeStatus and paymentIvnStatus
	feeSeqNbrArray = new Array() ; 
	feeSeqNbrArray.push(feeSeqNbr);
	
	invNbrArray = new Array();
	invNbrArray.push(invNbr);
	
	feeAllocArray = new Array();
	feeAllocArray.push(feeAmount);

	applyResult = aa.finance.applyPayment(itemCap,pR.getPaymentSeqNbr(),feeAmount,feeSeqNbrArray,invNbrArray,feeAllocArray,aa.date.getCurrentDate(),"Paid","Paid",pR.getCashierID(),null);
		
	if (applyResult.getSuccess()) 
	  {
		//get additional payment information
		apply = applyResult.getOutput();
		logDebug("Apply Payment Successful");
	  }
	else 
	  {
		logDebug("error applying funds: " + applyResult.getErrorMessage());
		return false;
	  }
	
	
	//generate receipt
	receiptResult = aa.finance.generateReceipt(itemCap,aa.date.getCurrentDate(),pR.getPaymentSeqNbr(),pR.getCashierID(),null);

	if (receiptResult.getSuccess())
	  {
		receipt = receiptResult.getOutput();
		logDebug("Receipt successfully created: ");// + receipt.getReceiptNbr());
	  }
	else 
	  {
		logDebug("error generating receipt: " + receiptResult.getErrorMessage());
		return false;
	  }
	   
	 //everything committed successfully
	 return true;
  } 
 
function paymentGetNotAppliedTot() //gets total Amount Not Applied on current CAP
	{
	var amtResult = aa.cashier.getSumNotAllocated(capId);
	if (amtResult.getSuccess())
		{
		var appliedTot = amtResult.getOutput();
		//logDebug("Total Amount Not Applied = $"+appliedTot.toString());
		return parseFloat(appliedTot);
		}
	else
		{
		logDebug("**ERROR: Getting total not applied: " + amtResult.getErrorMessage()); 
		return false;
		}
	return false;
	}

 
 
function prepareRenewal() {

    if (isRenewProcess(parentCapId, capId)) {
        logDebug("CAPID(" + parentCapId + ") is ready for renew. PartialCap (" + capId + ")");

        //Associate partial cap with parent CAP.
        var result = aa.cap.createRenewalCap(parentCapId, capId, true);
        if (result.getSuccess()) {
            // Set B1PERMIT.B1_ACCESS_BY_ACA to "N" for partial CAP to not allow that it is searched by ACA user.
            aa.cap.updateAccessByACA(capId, "N");
        }
        else
        { logDebug("ERROR: Associate partial cap with parent CAP. " + result.getErrorMessage()); return false };

        return true;
    }
    else
    { logDebug("Renewal Process did not finish properly"); return false; }
}
 
 
function proximity(svc,layer,numDistance)  // optional: distanceType
	{
	// returns true if the app has a gis object in proximity
	// use with all events except ApplicationSubmitBefore
	// 6/20/07 JHS - Changed errors to Warnings in case GIS server unavailable.

	var distanceType = "feet"
	if (arguments.length == 4) distanceType = arguments[3]; // use distance type in arg list

	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(layer + "_ID");
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }

	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess())
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }

		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			if (proxObj.length)
				{
				return true;
				}
			}
		}
	}

 
 
function proximityToAttribute(svc,layer,numDistance,distanceType,attributeName,attributeValue)
	{
	// returns true if the app has a gis object in proximity that contains the attributeName = attributeValue
	// use with all events except ApplicationSubmitBefore
	// example usage:
	// 01 proximityToAttribute("flagstaff","Parcels","50","feet","BOOK","107") ^ DoStuff...

	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributeName);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
				
				if (retString && retString.equals(attributeValue))
					return true;
				}
			
			}
		}
	}

 
 
function refLicProfGetAttribute(pLicNum, pAttributeName)
	{
	//Gets value of custom attribute from reference license prof record
	//07SSP-00033/SP5014

	//validate parameter values
	if (pLicNum==null || pLicNum.length==0 || pAttributeName==null || pAttributeName.length==0)
		{
		logDebug("Invalid license number or attribute name parameter");
		return ("INVALID PARAMETER");
		}

	//get reference License Professional record

	var newLic = getRefLicenseProf(pLicNum)

	//get reference License Professional's license seq num
	var licSeqNum = 0;
	var attributeType = "";
	if (newLic)
		{
		licSeqNum = newLic.getLicSeqNbr();
		attributeType = newLic.getLicenseType();
		logDebug("License Seq Num: "+licSeqNum + ", License Type: "+attributeType);
		}
	else
		{
		logMessage("No reference licensed professional found with state license number of "+pLicNum);
		logDebug("No reference licensed professional found with state license number of "+pLicNum);
		return ("NO LICENSE FOUND");
		}

	//get ref Lic Prof custom attribute using license seq num & attribute type
	if ( !(licSeqNum==0 || licSeqNum==null || attributeType=="" || attributeType==null) )
		{
		var peopAttrResult = aa.people.getPeopleAttributeByPeople(licSeqNum, attributeType);
			if (!peopAttrResult.getSuccess())
			{
			logDebug("**ERROR retrieving reference license professional attribute: " + peopAttrResult.getErrorMessage());
			return false;
			}

		var peopAttrArray = peopAttrResult.getOutput();
		if (peopAttrArray)
			{
			for (i in peopAttrArray)
				{
				if ( pAttributeName.equals(peopAttrArray[i].getAttributeName()) )
					{
					logDebug("Reference record for license "+pLicNum+", attribute "+pAttributeName+": "+peopAttrArray[i].getAttributeValue());
					return peopAttrArray[i].getAttributeValue();
					}
				}
			logDebug("Reference record for license "+pLicNum+" has no attribute named "+pAttributeName);
			return ("ATTRIBUTE NOT FOUND");
			}
		else
			{
			logDebug("Reference record for license "+pLicNum+" has no custom attributes");
			return ("ATTRIBUTE NOT FOUND");
			}
		}
	else
		{
		logDebug("Missing seq nbr or license type");
		return false;
		}
	}
 
 
function refLicProfGetDate (pLicNum, pDateType)
	{
	//Returns expiration date from reference licensed professional record.  Skips disabled reference licensed professionals.
	//pDateType parameter decides which date field is returned.  Options: "EXPIRE" (default), "RENEW","ISSUE","BUSINESS","INSURANCE"
	//Internal Functions needed: convertDate(), jsDateToMMDDYYYY()
	//07SSP-00033/SP5014  Edited for SR5054A.R70925
	//
	if (pDateType==null || pDateType=="")
		var dateType = "EXPIRE";
	else
		{
		var dateType = pDateType.toUpperCase();
		if ( !(dateType=="ISSUE" || dateType=="RENEW" || dateType=="BUSINESS" || dateType=="INSURANCE") )
			dateType = "EXPIRE";
		}

	if (pLicNum==null || pLicNum=="")
		{
		logDebug("Invalid license number parameter");
		return ("INVALID PARAMETER");
		}

	var newLic = getRefLicenseProf(pLicNum)

	if (newLic)
		{
		var jsExpDate = new Date();

 		if (dateType=="EXPIRE")
			{
			if (newLic.getLicenseExpirationDate())
				{
				jsExpDate = convertDate(newLic.getLicenseExpirationDate());
				logDebug(pLicNum+" License Expiration Date: "+jsDateToMMDDYYYY(jsExpDate));
				return jsExpDate;
				}
			else
				{
				logDebug("Reference record for license "+pLicNum+" has no License Expiration Date");
				return ("NO DATE FOUND");
				}
			}
		else if (dateType=="INSURANCE")
			{
			if (newLic.getInsuranceExpDate())
				{
				jsExpDate = convertDate(newLic.getInsuranceExpDate());
				logDebug(pLicNum+" Insurance Expiration Date: "+jsDateToMMDDYYYY(jsExpDate));
				return jsExpDate;
				}
			else
				{
				logDebug("Reference record for license "+pLicNum+" has no Insurance Expiration Date");
				return ("NO DATE FOUND");
				}
			}
		else if (dateType=="BUSINESS")
			{
			if (newLic.getBusinessLicExpDate())
				{
				jsExpDate = convertDate(newLic.getBusinessLicExpDate());
				logDebug(pLicNum+" Business Lic Expiration Date: "+jsDateToMMDDYYYY(jsExpDate));
				return jsExpDate;
				}
			else
				{
				logDebug("Reference record for license "+pLicNum+" has no Business Lic Exp Date");
				return ("NO DATE FOUND");
				}
			}
		else if (dateType=="ISSUE")
			{
			if (newLic.getLicenseIssueDate())
				{
				jsExpDate = convertDate(newLic.getLicenseIssueDate());
				logDebug(pLicNum+" License Issue Date: "+jsDateToMMDDYYYY(jsExpDate));
				return jsExpDate;
				}
			else
				{
				logDebug("Reference record for license "+pLicNum+" has no Issue Date");
				return ("NO DATE FOUND");
				}
			}
		else if (dateType=="RENEW")
			{
			if (newLic.getLicenseLastRenewalDate())
				{
				jsExpDate = convertDate(newLic.getLicenseLastRenewalDate());
				logDebug(pLicNum+" License Last Renewal Date: "+jsDateToMMDDYYYY(jsExpDate));
				return jsExpDate;
				}
			else
				{
				logDebug("Reference record for license "+pLicNum+" has no Last Renewal Date");
				return ("NO DATE FOUND");
				}
			}
		else
			return ("NO DATE FOUND");
		}
	}

 
 
function removeAllFees(itemCap) // Removes all non-invoiced fee items for a CAP ID
{
	getFeeResult = aa.fee.getFeeItems(itemCap, null, "NEW");
	if (getFeeResult.getSuccess()) {
		var feeList = getFeeResult.getOutput();
		for (feeNum in feeList) {
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
				var feeSeq = feeList[feeNum].getFeeSeqNbr();

				var editResult = aa.finance.removeFeeItem(itemCap, feeSeq);
				if (editResult.getSuccess()) {
					logDebug("Removed existing Fee Item: " + feeList[feeNum].getFeeCod());
				} else {
					logDebug("**ERROR: removing fee item (" + feeList[feeNum].getFeeCod() + "): " + editResult.getErrorMessage());
					break
				}
			}
			if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
				logDebug("Invoiced fee " + feeList[feeNum].getFeeCod() + " found, not removed");
			}
		}
	} else {
		logDebug("**ERROR: getting fee items (" + feeList[feeNum].getFeeCod() + "): " + getFeeResult.getErrorMessage())
	}

} 
 
	function removeASITable(tableName) // optional capId
  	{
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements MUST be strings.
  	var itemCap = capId
	if (arguments.length > 1)
		itemCap = arguments[1]; // use cap ID specified in args

	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,itemCap,currentUserID)

	if (!tssmResult.getSuccess())
		{ aa.print("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }
        else
	logDebug("Successfully removed all rows from ASI Table: " + tableName);

	}

 
 
function removeCapCondition(cType,cDesc)
	{
	var itemCap = capId;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

	var capCondResult = aa.capCondition.getCapConditions(itemCap,cType);

	if (!capCondResult.getSuccess())
		{logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()) ; return false }
	
	var ccs = capCondResult.getOutput();
		for (pc1 in ccs)
			{
			if (ccs[pc1].getConditionDescription().equals(cDesc))
				{
				var rmCapCondResult = aa.capCondition.deleteCapCondition(itemCap,ccs[pc1].getConditionNumber()); 
				if (rmCapCondResult.getSuccess())
					logDebug("Successfully removed condition to CAP : " + itemCap + "  (" + cType + ") " + cDesc);
				else
					logDebug( "**ERROR: removing condition to Parcel " + parcelNum + "  (" + cType + "): " + addParcelCondResult.getErrorMessage());
				}
			}
	}

 
 
function removeFee(fcode, fperiod) // Removes all fee items for a fee code and period
{
	getFeeResult = aa.finance.getFeeItemsByFeeCodeAndPeriod(capId, fcode, fperiod, "NEW");
	if (getFeeResult.getSuccess()) {
		var feeList = getFeeResult.getOutput();
		for (feeNum in feeList) {
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
				var feeSeq = feeList[feeNum].getFeeSeqNbr();

				var editResult = aa.finance.removeFeeItem(capId, feeSeq);
				if (editResult.getSuccess()) {
					logDebug("Removed existing Fee Item: " + fcode);
				} else {
					logDebug("**ERROR: removing fee item (" + fcode + "): " + editResult.getErrorMessage());
					break
				}
			}
			if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
				logDebug("Invoiced fee " + fcode + " found, not removed");
			}
		}
	} else {
		logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
	}

} 
 
function removeParcelCondition(parcelNum,cType,cDesc)
//if parcelNum is null, condition is added to all parcels on CAP
	{
	if (!parcelNum)
		{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				parcelNum = Parcels[zz].getParcelNumber()
				logDebug("Adding Condition to parcel #" + zz + " = " + parcelNum);
				var pcResult = aa.parcelCondition.getParcelConditions(parcelNum);
				if (!pcResult.getSuccess())
					{ logDebug("**WARNING: error getting parcel conditions : " + pcResult.getErrorMessage()) ; return false }
				var pcs = pcResult.getOutput();
				for (pc1 in pcs)
					{
					if (pcs[pc1].getConditionType().equals(cType) && pcs[pc1].getConditionDescription().equals(cDesc))
						{
						var rmParcelCondResult = aa.parcelCondition.removeParcelCondition(pcs[pc1].getConditionNumber(),parcelNum); 
						if (rmParcelCondResult.getSuccess())
							logDebug("Successfully removed condition to Parcel " + parcelNum + "  (" + cType + ") " + cDesc);
						}
					else
						logDebug( "**ERROR: removing condition to Parcel " + parcelNum + "  (" + cType + "): " + addParcelCondResult.getErrorMessage());
					}
				}
			}
		}
	else
		{
		var pcResult = aa.parcelCondition.getParcelConditions(parcelNum);
		if (!pcResult.getSuccess())
			{ logDebug("**WARNING: error getting parcel conditions : " + pcResult.getErrorMessage()) ; return false }
		var pcs = pcResult.getOutput();
		for (pc1 in pcs)
			{
			if (pcs[pc1].getConditionType().equals(cType) && pcs[pc1].getConditionDescription().equals(cDesc))
				{
				var rmParcelCondResult = aa.parcelCondition.removeParcelCondition(pcs[pc1].getConditionNumber(),parcelNum); 
			        if (rmParcelCondResult.getSuccess())
					logDebug("Successfully removed condition to Parcel " + parcelNum + "  (" + cType + ") " + cDesc);
				}
			else
				logDebug( "**ERROR: removing condition to Parcel " + parcelNum + "  (" + cType + "): " + addParcelCondResult.getErrorMessage());
			}
		}
	}

 
 
function removeRefContactAddressFromRecordContact(itemCap,cSeqNumber,rConAddrModel) {

	if (itemCap && cSeqNumber && rConAddrModel) {
		var xRefContactAddress = aa.address.createXRefContactAddressModel().getOutput();
		xRefContactAddress.setCapID(itemCap);
		xRefContactAddress.setAddressID(rConAddrModel.getAddressID());
		// Set the daily contact id to xRefContactAddress model
		xRefContactAddress.setEntityID(aa.util.parseLong(cSeqNumber));
		xRefContactAddress.setEntityType(rConAddrModel.getEntityType());
		// Create
		var xrefResult = aa.address.deleteXRefContactAddress(xRefContactAddress.getXRefContactAddressModel());

		if (xrefResult.getSuccess) {
			logDebug("Successfully removed reference contact address to cap contact: " + cSeqNumber);
			return true;
		} else {
			logDebug("Failed to remove reference contact address to cap: " + xrefResult.getErrorMessage());
			return false;
		}

	} else {
		logDebug("Could not remove reference contact address no address model, capId or cap contact sequence number");
		return false;		
	}

} 
 
function removeTask(targetCapId, removeTaskName) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}

	//
	// Get the target Task
	//
	var workflowResult = aa.workflow.getTaskItems(targetCapId, removeTaskName, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logDebug("**WARNING: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	var tTask = null;

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(removeTaskName.toUpperCase()) && (!useProcess || fTask.getProcessCode().toUpperCase().equals(processName.toUpperCase()))) {
			tTask = wfObj[i];
		}
	}

	if (!tTask) {
		logDebug("**WARNING: Task to remove not found: " + removeTaskName);
		return false;
	}

	var result = aa.workflow.removeTask(tTask)

		if (!result.getSuccess()) {
			logDebug("**WARNING: error removing task " + result.getErrorMessage());
			return false;
		} else {
			logDebug("Removed task " + tTask.getTaskDescription());
		}

}
 
 
function replaceMessageTokens(m)
	{
	//  tokens in pipes will attempt to interpret as script variables
	//  tokens in curly braces will attempt to replace from AInfo (ASI, etc)
	//
	//  e.g.   |capId|  or |wfTask|  or |wfStatus|
	//
	//  e.g.   {Expiration Date}  or  {Number of Electrical Outlets}
	//
	//  e.g.   m = "Your recent license application (|capIdString|) has successfully passed |wfTask| with a status of |wfStatus|"

	while (m.indexOf("|"))
	  {
	  var s = m.indexOf("|")
	  var e = m.indexOf("|",s+1)
	  if (e <= 0) break; // unmatched
	  var r = m.substring(s+1,e)

	  var evalstring = "typeof(" + r + ") != \"undefined\" ? " + r + " : \"undefined\""
	  var v = eval(evalstring)
	  var pattern = new RegExp("\\|" + r + "\\|","g")
	  m = String(m).replace(pattern,v)
	  }

	while (m.indexOf("{"))
	  {
	  var s = m.indexOf("{")
	  var e = m.indexOf("}",s+1)
	  if (e <= 0) break; // unmatched
	  var r = m.substring(s+1,e)

	  var evalstring = "AInfo[\"" + r + "\"]"
	  var v = eval(evalstring)
	  var pattern = new RegExp("\\{" + r + "\\}","g")
	  m = String(m).replace(pattern,v)

	  }

	 return m
	 }
 
 


function replaceNode(fString,fName,fContents)
	{
	 var fValue = "";
	var startTag = "<"+fName+">";
	 var endTag = "</"+fName+">";

		 startPos = fString.indexOf(startTag) + startTag.length;
		 endPos = fString.indexOf(endTag);
		 // make sure startPos and endPos are valid before using them
		 if (startPos > 0 && startPos <= endPos)
		 		{
				  fValue = fString.substring(0,startPos) + fContents + fString.substring(endPos);
 					return unescape(fValue);
			}

	}

 
 
function resultInspection(inspType, inspStatus, resultDate, resultComment) //optional capId
{
	var itemCap = capId
		if (arguments.length > 4)
			itemCap = arguments[4]; // use cap ID specified in args

		var foundID;
	var inspResultObj = aa.inspection.getInspections(itemCap);
	if (inspResultObj.getSuccess()) {
		var inspList = inspResultObj.getOutput();
		for (xx in inspList)
			if (String(inspType).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().toUpperCase().equals("SCHEDULED"))
				foundID = inspList[xx].getIdNumber();
	}

	if (foundID) {
		resultResult = aa.inspection.resultInspection(itemCap, foundID, inspStatus, resultDate, resultComment, currentUserID)

			if (resultResult.getSuccess()) {
				logDebug("Successfully resulted inspection: " + inspType + " to Status: " + inspStatus)
			} else {
				logDebug("**WARNING could not result inspection : " + inspType + ", " + resultResult.getErrorMessage());
			}
	} else {
		logDebug("Could not result inspection : " + inspType + ", not scheduled");
	}

}
 
 
function runEvent(eventName, controlString) {
	try {
		var savePrefix = prefix; // store value of global variable

		if (controlString) {
			if (doStdChoices) {
				doStandardChoiceActions(controlString, true, 0);
			} else {
				logDebug("runEvent:  Can't execute standard choices for control string " + controlString + " because doStdChoices is false");
			}
		}

		prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", eventName);
		if (prefix) {
			if (doScripts) {
				doScriptActions();
			} else {
				logDebug("runEvent:  Can't execute scripts for event " + eventName + " because doScripts is false");
			}
		} else {
			logDebug("runEvent:  Can't execute scripts for event " + eventName + " because prefix is not defined in std Choice EMSE_VARIABLE_BRANCH_PREFIX");
		}

		prefix = savePrefix; // set it back

	} catch (err) {
		handleError(err, s);
	}
}
 
 
function runReport4Email(itemCap,reportName,conObj,rParams,eParams,emailTemplate,module,mailFrom) {
	//If email address available for contact type then email the report, otherwise return false;

	var reportSent = false;

	if (conObj) {
		if (!matches(conObj.people.getEmail(),null,undefined,"")) {
			//Send the report via email
			var rFile;
			rFile = generateReport(itemCap,reportName,module,rParams);
	
			if (rFile) {
				var rFiles = new Array();
				rFiles.push(rFile);
				sendNotification(mailFrom,conObj.people.getEmail(),"",emailTemplate,eParams,rFiles,itemCap);
				return true;
			}
		} else {
			reportSent = false;
		}
	} else {
		reportSent = false;
	}

	if (!reportSent) {
		return false;
	}
}
 
 
function runReport4EmailOrPrint(itemCap,reportName,conObj,rParams,eParams,emailTemplate,module) {
	//If email address available for contact type then email the report, otherwise pop up the report on the screen

	var popUpReport = false;

	if (conObj) {
		if (!matches(conObj.people.getEmail(),null,undefined,"")) {
			//Send the report via email
			var rFile;
			rFile = generateReport(itemCap,reportName,module,rParams);
	
			if (rFile) {
				var rFiles = new Array();
				rFiles.push(rFile);
				sendNotification(sysFromEmail,conObj.people.getEmail(),"",emailTemplate,eParams,rFiles);
				comment("Email with " + reportName + " was sent to " + conObj.people.getEmail());
				popUpReport = true;
			}
		} else {
			popUpReport = true;
		}
	} else {
		popUpReport = true;
	}

	if (popUpReport) {
		var rOutput = generateReport4Workflow(itemCap,reportName,module,rParams);
		showMessage = true;
		comment(rOutput);
	}
} 
 

function runReportAttach(itemCapId,aaReportName)
	{
	// optional parameters are report parameter pairs
	// for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");
	

	var reportName = aaReportName;

	reportResult = aa.reportManager.getReportInfoModelByName(reportName);

	if (!reportResult.getSuccess())
		{ logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); return false; }

	var report = reportResult.getOutput(); 

	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");

	report.setModule(appTypeArray[0]); 
	report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3()); 
	report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());

	var parameters = aa.util.newHashMap();              

	for (var i = 2; i < arguments.length ; i = i+2)
		{
		parameters.put(arguments[i],arguments[i+1]);
		logDebug("Report parameter: " + arguments[i] + " = " + arguments[i+1]);
		}	

	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
		{ 
		var reportResult = aa.reportManager.getReportResult(report); 

		logDebug("Report " + aaReportName + " has been run for " + itemCapId.getCustomID());

		}
	else
		logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
}
 
 
/**
 * Schedule Inspection
 * @param itemCap {capIDModel}
 * @param iType {string}
 * @param DaysAhead {number}
 * @param [inspTime] {string}
 * @param [inspComm] {string}
 */
function scheduleInspect(itemCap,iType,DaysAhead) // optional inspector ID.  This function requires dateAdd function
	{
	// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
	// DQ - Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment");
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3) 
		if (arguments[2] != null)
		{
		var inspRes = aa.person.getUser(arguments[2])
		if (inspRes.getSuccess())
			var inspectorObj = inspRes.getOutput();
		}

	if (arguments.length >= 4)
	    if (arguments[3] != null)
		    inspTime = arguments[3];
	
	if (arguments.length == 5)
	    if (arguments[4] != null)
	        inspComm = arguments[4];

	var schedRes = aa.inspection.scheduleInspection(itemCap, inspectorObj, aa.date.parseDate(dateAdd(null,DaysAhead)), inspTime, iType, inspComm)
	
	if (schedRes.getSuccess())
		logDebug("Successfully scheduled inspection : " + iType + " for " + dateAdd(null,DaysAhead));
	else
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}
 
 
function scheduleInspectDate(iType,DateToSched) // optional inspector ID.
// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110)
// DQ - Added Optional 5th parameter inspComm
	{
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3)
		if (arguments[2] != null)
			{
			var inspRes = aa.person.getUser(arguments[2]);
			if (inspRes.getSuccess())
				inspectorObj = inspRes.getOutput();
			}

        if (arguments.length >= 4)
            if(arguments[3] != null)
		        inspTime = arguments[3];

		if (arguments.length >= 5)
		    if(arguments[4] != null)
		        inspComm = arguments[4];

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(DateToSched), inspTime, iType, inspComm)

	if (schedRes.getSuccess())
		logDebug("Successfully scheduled inspection : " + iType + " for " + DateToSched);
	else
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}

 
 
function scheduleInspection(iType,DaysAhead) // optional inspector ID.  This function requires dateAdd function
	{
	// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
	// DQ - Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment");
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3) 
		if (arguments[2] != null)
		{
		var inspRes = aa.person.getUser(arguments[2])
		if (inspRes.getSuccess())
			var inspectorObj = inspRes.getOutput();
		}

	if (arguments.length >= 4)
	    if (arguments[3] != null)
		    inspTime = arguments[3];
	
	if (arguments.length == 5)
	    if (arguments[4] != null)
	        inspComm = arguments[4];

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(dateAdd(null,DaysAhead)), inspTime, iType, inspComm)
	
	if (schedRes.getSuccess())
		logDebug("Successfully scheduled inspection : " + iType + " for " + dateAdd(null,DaysAhead));
	else
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}

 
 

function searchProject(pProjType,pSearchType) 
{
	// Searches Related Caps
	// pProjType = Application type marking highest point to search.  Ex. Building/Project/NA/NA
	// pSearchType = Application type to search for. Ex. Building/Permit/NA/NA 
	// Returns CapID array of all unique matching SearchTypes
	
    var i = 1;
	var typeArray;
	var duplicate = false;
	var childArray = new Array();
	var tempArray = new Array();
	var temp2Array = new Array();
	var searchArray = new Array();
	var childrenFound = false;
	var isMatch;
        while (true)
        {
	 if (!(aa.cap.getProjectParents(capId,i).getSuccess()))
             break;
         i += 1;
        }
        i -= 1;

	getCapResult = aa.cap.getProjectParents(capId,i);
        myArray = new Array();
	myOutArray = new Array();
	
	if(pProjType != null)
	{
		var typeArray = pProjType.split("/");
		if (typeArray.length != 4)
			logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
	}

	if (getCapResult.getSuccess())
	{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
		{
			for(x in parentArray)
				childTypeArray = parentArray[x].getCapType().toString().split("/");
				isMatch = true;
				for (yy in childTypeArray) //looking for matching cap type
				{
				if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
					{
						isMatch = false;
						break;	 
					}
				}
				if(isMatch)
					myArray.push(parentArray[x].getCapID());
		}
	}

	if (!myArray.length)
		return childArray;

	searchArray = myArray;
	var temp = ""


	if(pSearchType != null)
	{
		typeArray = pSearchType.split("/");
		if (typeArray.length != 4)
			logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pSearchType);
	}


	while (true)
		{
			for(x in searchArray)
				{
					tempArray = getChildren("*/*/*/*",searchArray[x]);
					if (tempArray == null)
						continue;
					for(y in tempArray)
						{
							duplicate = false;
							for(z in childArray)
							{
								if ( childArray[z].getCustomID().equals(tempArray[y].getCustomID()) )
									{duplicate = true; break;}
							}			
							if (!duplicate)
							{
								temp2Array.push(tempArray[y]);
								if(!capId.getCustomID().equals(tempArray[y].getCustomID()))
								{
									var chkTypeArray = aa.cap.getCap(tempArray[y]).getOutput().getCapType().toString().split("/");
									isMatch = true;
									for (p in chkTypeArray) //looking for matching cap type
									{
										if (typeArray[p] != chkTypeArray[p] && typeArray[p] != "*")
										{
											isMatch = false;
											break;
										}
									}
									if(isMatch)
										{childArray.push(tempArray[y]);}
								}		 
							}
						}

				}

			if(temp2Array.length)
				searchArray = temp2Array;
			else
				break;
			temp2Array = new Array();
		}
	return childArray;
}

 
 
 function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)

{

	var itemCap = capId;

	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args



	var id1 = itemCap.ID1;

 	var id2 = itemCap.ID2;

 	var id3 = itemCap.ID3;



	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);





	var result = null;

	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);

	if(result.getSuccess())

	{

		logDebug("Sent email successfully!");

		return true;

	}

	else

	{

		logDebug("Failed to send mail. - " + result.getErrorType());

		return false;

	}

}
 
 
function setContactTypeFlagByType(itemCap) {
	
	var contactsA = getContactObjs(itemCap);

	for (var x in contactsA) {
		thisContact = contactsA[x];
		
		var typeFlag = lookup("CONTACT TYPE FLAG",thisContact.type);

		if (typeFlag == undefined)
			continue; //skip if not setup in the lookup

		thisContact.people.setContactTypeFlag(typeFlag);

		thisContact.save();
	}	
}

 
 
function setIVR(ivrnum)
	{
	/* Removed by Peter Peng, 4/9/2012
	capModel = cap.getCapModel();
	capIDModel = capModel.getCapID();
	capIDModel.setTrackingID(12345678);
	capModel.setCapID(capIDModel);
	aa.cap.editCapByPK(capModel);
	*/

	// new a CapScriptModel
	var scriptModel = aa.cap.newCapScriptModel().getOutput();

	// get a new CapModel
	var capModel = scriptModel.getCapModel();
	var capIDModel = capModel.getCapID();

	capIDModel.setServiceProviderCode(scriptModel.getServiceProviderCode());
	capIDModel.setID1(aa.env.getValue("PermitId1"));
	capIDModel.setID2(aa.env.getValue("PermitId2"));
	capIDModel.setID3(aa.env.getValue("PermitId3"));

	capModel.setTrackingNbr(ivrnum);
	capModel.setCapID(capIDModel);

	// update tracking number
	aa.cap.editCapByPK(capModel);
	logDebug("IVR Tracking Number updated to " + ivrnum);
	}


 
 
 function setLicExpirationDate(itemCap) {

    //itemCap - license capId

    //the following are optional parameters

    //calcDateFrom - MM/DD/YYYY - the from date to use in the date calculation

    //dateOverride - MM/DD/YYYY - override the calculation, this date will be used

    //renewalStatus - if other than active override the status  





    var licNum = itemCap.getCustomID();



    if (arguments.length == 1) {

        calcDateFrom = null;

        dateOverride = null;

        renewalStatus = null;

    }



    if (arguments.length == 2) {

        calcDateFrom = arguments[1];

        dateOverride = null;

        renewalStatus = null;

    }



    if (arguments.length == 3) {

        calcDateFrom = arguments[1];

        dateOverride = arguments[2];

        renewalStatus = null;

    }



    if (arguments.length == 4) {

        calcDateFrom = arguments[1];

        dateOverride = arguments[2];

        renewalStatus = arguments[3];

    }



    var tmpNewDate = "";

    

    b1ExpResult = aa.expiration.getLicensesByCapID(itemCap);

    

    if (b1ExpResult.getSuccess()) {



        this.b1Exp = b1ExpResult.getOutput();

        //Get expiration details

        var expUnit = this.b1Exp.getExpUnit();

        var expInterval = this.b1Exp.getExpInterval();



        if(expUnit == null) {

            logDebug("Could not set the expiration date, no expiration unit defined for expiration code: " + this.b1Exp.getExpCode());

            return false;

        }



        if(expUnit == "Days") {

            tmpNewDate = dateAdd(calcDateFrom, expInterval);

        }



        if(expUnit == "Months") {

            tmpNewDate = dateAddMonths(calcDateFrom, expInterval);

        }



        if(expUnit == "Years") {

            tmpNewDate = dateAddMonths(calcDateFrom, expInterval * 12);

        }

    }



    thisLic = new licenseObject(licNum,itemCap); 



    if(dateOverride == null) {

        thisLic.setExpiration(dateAdd(tmpNewDate,0));

    } else {

        thisLic.setExpiration(dateAdd(dateOverride,0));

    }



    if(renewalStatus != null) {

        thisLic.setStatus(renewalStatus); 

    } else {

        thisLic.setStatus("Active"); 

    }



    logDebug("Successfully set the expiration date and status");



    return true;



}
 
 
function setTask(wfstr, isOpen, isComplete) // optional process name isOpen, isComplete take 'Y' or 'N'
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 4) {
		processName = arguments[3]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			var completeFlag = fTask.getCompleteFlag();

			if (useProcess)
				aa.workflow.adjustTask(capId, stepnumber, processID, isOpen, isComplete, null, null);
			else
				aa.workflow.adjustTask(capId, stepnumber, isOpen, isComplete, null, null);

				logDebug("set Workflow Task: " + wfstr);
		}
	}
}
 
 
String.prototype.trim = String.prototype.trim || function() {
        return this.replace(/^\s+|\s+$/,"");
}

String.prototype.left = function(n) {
        return this.substr(0,n);
};

String.prototype.right = function(n) {
        return this.substr((this.length-n),this.length);
}; 
 
function stripNN(fullStr) {
    var allowed = "0123456789.";
    var stripped = "";
    for (i = 0; i < fullStr.length(); i++)
        if (allowed.indexOf(String.fromCharCode(fullStr.charAt(i))) >= 0)
        stripped += String.fromCharCode(fullStr.charAt(i))
    return stripped;
}
 
 
function taskCloseAllExcept(pStatus,pComment) 
	{
	// Closes all tasks in CAP with specified status and comment
	// Optional task names to exclude
	// 06SSP-00152
	//
	var taskArray = new Array();
	var closeAll = false;
	if (arguments.length > 2) //Check for task names to exclude
		{
		for (var i=2; i<arguments.length; i++)
			taskArray.push(arguments[i]);
		}
	else
		closeAll = true;

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  else
  	{ 
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
		return false; 
		}
	
	var fTask;
	var stepnumber;
	var processID;
	var dispositionDate = aa.date.getCurrentDate();
	var wfnote = " ";
	var wftask;
	
	for (i in wfObj)
		{
   	fTask = wfObj[i];
		wftask = fTask.getTaskDescription();
		stepnumber = fTask.getStepNumber();
		//processID = fTask.getProcessID();
		if (closeAll)
			{
			aa.workflow.handleDisposition(capId,stepnumber,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"Y");
			logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
			logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
			}
		else
			{
			if (!exists(wftask,taskArray))
				{
				aa.workflow.handleDisposition(capId,stepnumber,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"Y");
				logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
				logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
				}
			}
		}
	}

 
 
function taskStatus(wfstr) // optional process name and capID
{
	var useProcess = false;
	var processName = "";
	var itemCap = capId;
	if (arguments.length >= 2) {
		processName = arguments[1]; // subprocess
		if (processName)
			useProcess = true;
	}

	if (arguments.length == 3)
		itemCap = arguments[2]; // use cap ID specified in args


	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
			return fTask.getDisposition()
	}
} 
 
/*
DQ 09/03/2009 - Added Check to ensure Task status date is not null prior to getting status date
Function will return false on fail
*/
function taskStatusDate(wfstr) // optional process name, capId
{
	var itemCap = capId;
	if (arguments.length == 3)
		itemCap = arguments[2]; // use cap ID specified in args

	var useProcess = false;
	var processName = "";
	if (arguments.length > 1 && arguments[1] != null) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + wfObj.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
			if (fTask.getStatusDate() != null)
				return "" + (fTask.getStatusDate().getMonth() + 1) + "/" + fTask.getStatusDate().getDate() + "/" + (parseInt(fTask.getStatusDate().getYear()) + 1900);
			else {
				logMessage("**ERROR: NULL workflow task " + fTask.getTaskDescription() + " status date. ");
				return false;
			}
	}
}
 
 

function token(tstr)
	{
	if (!disableTokens)
		{
		re = new RegExp("\\{","g") ; tstr = String(tstr).replace(re,"AInfo[\"");
		re = new RegExp("\\}","g") ; tstr = String(tstr).replace(re,"\"]");
		}
	return String(tstr);
  	}

 
 

function transferFeesAndPayments(sourceCapId, targetCapId) {
	//
	// Step 1: Unapply payments from the Source
	//
	var piresult = aa.finance.getPaymentByCapID(capId, null).getOutput()

		var feeSeqArray = new Array();
	var invoiceNbrArray = new Array();
	var feeAllocationArray = new Array();

	for (ik in piresult) {
		var thisPay = piresult[ik];
		var pfResult = aa.finance.getPaymentFeeItems(capId, null);
		if (pfResult.getSuccess()) {
			var pfObj = pfResult.getOutput();
			for (ij in pfObj)
				if (pfObj[ij].getPaymentSeqNbr() == thisPay.getPaymentSeqNbr()) {
					feeSeqArray.push(pfObj[ij].getFeeSeqNbr());
					invoiceNbrArray.push(pfObj[ij].getInvoiceNbr());
					feeAllocationArray.push(pfObj[ij].getFeeAllocation());
				}
		}

		if (feeSeqArray.length > 0) {
			z = aa.finance.applyRefund(capId, thisPay, feeSeqArray, invoiceNbrArray, feeAllocationArray, "FeeStat", "InvStat", "123");
			if (z.getSuccess()) {
				logDebug("Refund applied");
			} else {
				logDebug("Error applying refund " + z.getErrorMessage());
			}
		}
	}

	//
	// Step 2: add the fees to the target and void from the source
	//

	feeA = loadFees();

	for (var x in feeA) {
		thisFee = feeA[x];
		logDebug("status is " + thisFee.status);
		if (thisFee.status == "INVOICED") {
			addFee(thisFee.code, thisFee.sched, thisFee.period, thisFee.unit, "Y", targetCapId);
			voidResult = aa.finance.voidFeeItem(capId, thisFee.sequence);
			if (voidResult.getSuccess()) {
				logDebug("Fee item " + thisFee.code + "(" + thisFee.sequence + ") has been voided");
			} else {
				logDebug("**ERROR: voiding fee item " + thisFee.code + "(" + thisFee.sequence + ") " + voidResult.getErrorMessage());
			}

			var feeSeqArray = new Array();
			var paymentPeriodArray = new Array();

			feeSeqArray.push(thisFee.sequence);
			paymentPeriodArray.push(thisFee.period);
			var invoiceResult_L = aa.finance.createInvoice(capId, feeSeqArray, paymentPeriodArray);

			if (!invoiceResult_L.getSuccess())
				logDebug("**ERROR: Invoicing the fee items voided " + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
		}

	}

	//
	// Step 3: transfer the funds from Source to Target
	//

	var unapplied = paymentGetNotAppliedTot();

	var xferResult = aa.finance.makeFundTransfer(capId, targetCapId, currentUserID, "", "", sysDate, sysDate, "", sysDate, unapplied, "NA", "Fund Transfer", "NA", "R", null, "", "NA", "");
	if (xferResult.getSuccess())
		logDebug("Successfully did fund transfer to : " + targetCapId.getCustomID());
	else
		logDebug("**ERROR: doing fund transfer to (" + targetCapId.getCustomID() + "): " + xferResult.getErrorMessage());

	//
	// Step 4: On the target, loop through payments then invoices to auto-apply
	//

	var piresult = aa.finance.getPaymentByCapID(targetCapId, null).getOutput()

		for (ik in piresult) {
			var feeSeqArray = new Array();
			var invoiceNbrArray = new Array();
			var feeAllocationArray = new Array();

			var thisPay = piresult[ik];
			var applyAmt = 0;
			var unallocatedAmt = thisPay.getAmountNotAllocated()

				if (unallocatedAmt > 0) {

					var invArray = aa.finance.getInvoiceByCapID(targetCapId, null).getOutput()

						for (var invCount in invArray) {
							var thisInvoice = invArray[invCount];
							var balDue = thisInvoice.getInvoiceModel().getBalanceDue();
							if (balDue > 0) {
								feeT = aa.invoice.getFeeItemInvoiceByInvoiceNbr(thisInvoice.getInvNbr()).getOutput();

								for (targetFeeNum in feeT) {
									var thisTFee = feeT[targetFeeNum];

									if (thisTFee.getFee() > unallocatedAmt)
										applyAmt = unallocatedAmt;
									else
										applyAmt = thisTFee.getFee(); // use balance here?

									unallocatedAmt = unallocatedAmt - applyAmt;

									feeSeqArray.push(thisTFee.getFeeSeqNbr());
									invoiceNbrArray.push(thisInvoice.getInvNbr());
									feeAllocationArray.push(applyAmt);
								}
							}
						}

						applyResult = aa.finance.applyPayment(targetCapId, thisPay, feeSeqArray, invoiceNbrArray, feeAllocationArray, "PAYSTAT", "INVSTAT", "123");

					if (applyResult.getSuccess())
						logDebug("Successfully applied payment");
					else
						logDebug("**ERROR: applying payment to fee (" + thisTFee.getFeeDescription() + "): " + applyResult.getErrorMessage());

				}
		}
}
 
 
function transferFunds(parentAppNum,dollarAmount) 
// does fund transfer from current app to parentAppNum, but only if current app has enough non-applied funds
// needs function paymentGetNotAppliedTot()
	{
	//validate dollarAmount is number 
	var checkNum = parseFloat(dollarAmount);
	if (isNaN(checkNum))
		{
		logDebug("dollarAmount parameter is not a number, no funds will be transferred");
		return false;
		}

	//check that enough non-applied funds are available
	var fundsAvail = paymentGetNotAppliedTot();
	if (fundsAvail < parseFloat(dollarAmount))
		{
		logDebug("Insufficient funds $"+fundsAvail.toString()+ " available. Fund transfer of $"+dollarAmount.toString()+" not done.");
		logMessage("Insufficient funds available. No funds transferred.");
		return false;
		}

	//enough funds - proceed with transfer
	var getCapResult = aa.cap.getCapID(parentAppNum);
	if (getCapResult.getSuccess())
		{
		var parentId = getCapResult.getOutput();
		
		var xferResult = aa.finance.makeFundTransfer(capId, parentId, currentUserID, "", "", sysDate, sysDate, "", sysDate, dollarAmount, "NA", "Fund Transfer", "NA", "R", null, "", "NA", "");

		
		if (xferResult.getSuccess())
			logDebug("Successfully did fund transfer to : " + parentAppNum);
		else
			logDebug( "**ERROR: doing fund transfer to (" + parentAppNum + "): " + xferResult.getErrorMessage());
		}
	else
		{ 
		logDebug( "**ERROR: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage()) 
		}
	}

 
 
function transferReceiptAndApply(receiptCapId,targetCapId)
{
    var amtResult = parseFloat(aa.cashier.getSumNotAllocated(receiptCapId).getOutput());

    var bDueResult = aa.cashier.getTotalFeeAmount(targetCapId);
    var balanceDue = 0;

    if (bDueResult.getSuccess()) {
        balanceDue = bDueResult.getOutput();
    }

    var transferAmt = balanceDue;

    if (amtResult <= 0) {
        logDebug("insufficient funds to do transfer from receipt record");
        return false;
    }

    if (amtResult < balanceDue) {
        transferAmt = amtResult; 
    }
  


  var xferResult = aa.finance.makeFundTransfer(receiptCapId,targetCapId,currentUserID,"","",sysDate,sysDate,"",sysDate,transferAmt,"NA","Fund Transfer","NA","R",null,"","NA","");
  if (xferResult.getSuccess())
       logDebug("Successfully transferred $" +transferAmt + " from " + receiptCapId + " to " + targetCapId);
  else
       logDebug("Error transferring funds " + xferResult.getErrorMessage());
 

    var piresult = aa.finance.getPaymentByCapID(targetCapId,null).getOutput()

    for (ik in piresult)
        {
        var feeSeqArray = new Array();
        var invoiceNbrArray = new Array();
        var feeAllocationArray = new Array();


        var thisPay = piresult[ik];
        var applyAmt = 0;
        var unallocatedAmt = thisPay.getAmountNotAllocated()

        if (unallocatedAmt > 0)
            {

            var invArray = aa.finance.getInvoiceByCapID(targetCapId, null).getOutput()

            for (var invCount in invArray)
                {
                var thisInvoice = invArray[invCount];
                var balDue = thisInvoice.getInvoiceModel().getBalanceDue();
                if (balDue > 0)
                    {
                    feeT = aa.invoice.getFeeItemInvoiceByInvoiceNbr(thisInvoice.getInvNbr()).getOutput();

                    for (targetFeeNum in feeT)
                        {
                        var thisTFee = feeT[targetFeeNum];

                        if (thisTFee.getFee() > unallocatedAmt)
                            applyAmt = unallocatedAmt;
                        else
                            applyAmt = thisTFee.getFee()   // use balance here?

                        unallocatedAmt = unallocatedAmt - applyAmt;

                        feeSeqArray.push(thisTFee.getFeeSeqNbr());
                        invoiceNbrArray.push(thisInvoice.getInvNbr());
                        feeAllocationArray.push(applyAmt);
                        }
                    }
                }

                applyResult = aa.finance.applyPayment(targetCapId,thisPay,feeSeqArray, invoiceNbrArray, feeAllocationArray, "PAYSTAT", "INVSTAT", "123")

                if (applyResult.getSuccess()) {
                    logDebug("Successfully applied payment");
                    return transferAmt;
                }
                    
                else {
                    logDebug( "**ERROR: applying payment to fee (" + thisTFee.getFeeDescription() + "): " + applyResult.getErrorMessage());
                    return false;
                }
                    

            }
    }

} 
 
function updateAppStatus(stat,cmt) // optional cap id
{
	var itemCap = capId;
	if (arguments.length == 3) 
		itemCap = arguments[2]; // use cap ID specified in args

	var updateStatusResult = aa.cap.updateAppStatus(itemCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
	if (updateStatusResult.getSuccess())
		logDebug("Updated application status to " + stat + " successfully.");
	else
		logDebug("**ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
}

 
 
 function updateEnfOfficer(enfName) // option CapId

    {

    var itemCap = capId

    if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args



    var cdScriptObjResult = aa.cap.getCapDetail(itemCap);

    if (!cdScriptObjResult.getSuccess())

        { logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }



    var cdScriptObj = cdScriptObjResult.getOutput();



    if (!cdScriptObj)

        { logDebug("**ERROR: No cap detail script object") ; return false; }



    cd = cdScriptObj.getCapDetailModel();



    cd.setEnforceOfficerName(enfName);



    cdWrite = aa.cap.editCapDetail(cd)



    if (cdWrite.getSuccess())

        { logDebug("updated enf officer name to " + enfName) }

    else

        { logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }

    }



 
 
function updateFee(fcode, fsched, fperiod, fqty, finvoice, pDuplicate, pFeeSeq) {
	// Updates an assessed fee with a new Qty.  If not found, adds it; else if invoiced fee found, adds another with adjusted qty.
	// optional param pDuplicate -if "N", won't add another if invoiced fee exists (SR5085)
	// Script will return fee sequence number if new fee is added otherwise it will return null (SR5112)
	// Optional param pSeqNumber, Will attempt to update the specified Fee Sequence Number or Add new (SR5112)
	// 12/22/2008 - DQ - Correct Invoice loop to accumulate instead of reset each iteration

	// If optional argument is blank, use default logic (i.e. allow duplicate fee if invoiced fee is found)
	if (pDuplicate == null || pDuplicate.length == 0)
		pDuplicate = "Y";
	else
		pDuplicate = pDuplicate.toUpperCase();

	var invFeeFound = false;
	var adjustedQty = fqty;
	var feeSeq = null;
	feeUpdated = false;

	if (pFeeSeq == null)
		getFeeResult = aa.finance.getFeeItemByFeeCode(capId, fcode, fperiod);
	else
		getFeeResult = aa.finance.getFeeItemByPK(capId, pFeeSeq);

	if (getFeeResult.getSuccess()) {
		if (pFeeSeq == null)
			var feeList = getFeeResult.getOutput();
		else {
			var feeList = new Array();
			feeList[0] = getFeeResult.getOutput();
		}
		for (feeNum in feeList) {
			if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
				if (pDuplicate == "Y") {
					logDebug("Invoiced fee " + fcode + " found, subtracting invoiced amount from update qty.");
					adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
					invFeeFound = true;
				} else {
					invFeeFound = true;
					logDebug("Invoiced fee " + fcode + " found.  Not updating this fee. Not assessing new fee " + fcode);
				}
			}

			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
				adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
			}
		}

		for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated) // update this fee item
			{
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				var editResult = aa.finance.editFeeItemUnit(capId, adjustedQty + feeList[feeNum].getFeeUnit(), feeSeq);
				feeUpdated = true;
				if (editResult.getSuccess()) {
					logDebug("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);
					if (finvoice == "Y") {
						feeSeqList.push(feeSeq);
						paymentPeriodList.push(fperiod);
					}
				} else {
					logDebug("**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage());
					break
				}
			}
	} else {
		logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
	}

	// Add fee if no fee has been updated OR invoiced fee already exists and duplicates are allowed
	if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == "Y"))
		feeSeq = addFee(fcode, fsched, fperiod, adjustedQty, finvoice);
	else
		feeSeq = null;
	updateFeeItemInvoiceFlag(feeSeq, finvoice);
	return feeSeq;
} 
 
function updateFeeItemInvoiceFlag(feeSeq,finvoice)
{
	if(feeSeq == null)
		return;
	if(publicUser && !cap.isCompleteCap())
	{
		var feeItemScript = aa.finance.getFeeItemByPK(capId,feeSeq);
		if(feeItemScript.getSuccess)
		{
			var feeItem = feeItemScript.getOutput().getF4FeeItem();
			feeItem.setAutoInvoiceFlag(finvoice);
			aa.finance.editFeeItem(feeItem);
		}
	}
}
 
 
function updateGuidesheetASIField(inspId,gName,gItem,asiGroup,asiSubGroup, asiLabel,newValue) {
	//updates the guidesheet ID to nGuideSheetID if not currently populated
	//optional capId

	var itemCap = capId;
	//if (arguments > 7) itemCap = arguments[7];

	var r = aa.inspection.getInspections(itemCap);

	if (r.getSuccess()) {
		var inspArray = r.getOutput();

		for (i in inspArray) {
			if (inspArray[i].getIdNumber() == inspId) {
				var inspModel = inspArray[i].getInspection();

				var gs = inspModel.getGuideSheets();

				if (gs) {
					for(var i=0;i< gs.size();i++) {
						var guideSheetObj = gs.get(i);
						if (guideSheetObj && gName.toUpperCase() == guideSheetObj.getGuideType().toUpperCase()) {

							var guidesheetItem = guideSheetObj.getItems();
							for(var j=0;j< guidesheetItem.size();j++) {
								var item = guidesheetItem.get(j);
								//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
								if(item && gItem == item.getGuideItemText() && asiGroup == item.getGuideItemASIGroupName()) {
									var ASISubGroups = item.getItemASISubgroupList();
									if(ASISubGroups) {
										//2. Filter ASI sub group by ASI Sub Group name
										for(var k=0;k< ASISubGroups.size();k++) {
											var ASISubGroup = ASISubGroups.get(k);
											if(ASISubGroup && ASISubGroup.getSubgroupCode() == asiSubGroup) {
												var ASIModels =  ASISubGroup.getAsiList();
												if(ASIModels) {
													//3. Filter ASI by ASI name
													for( var m = 0; m< ASIModels.size();m++) {
														var ASIModel = ASIModels.get(m);
														if(ASIModel && ASIModel.getAsiName() == asiLabel) {
															logDebug("Change ASI value from:"+ ASIModel.getAttributeValue() +" to "+newValue);
															//4. Reset ASI value
															ASIModel.setAttributeValue(newValue);		
														}
													}
												}
											}
										}
									}
								}
							}							

							//Update the guidesheet
							var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
							if (updateResult.getSuccess()) {
								logDebug("Successfully updated " + gName + " on inspection " + inspId + ".");
								return true;
							} else {
								logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
								return false;
							}
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No updates to the guidesheet made");
	return false;
}  
 
function updateGuidesheetID(inspId,gName,nGuideSheetID) {
	//updates the guidesheet ID to nGuideSheetID if not currently populated
	//optional capId

	var itemCap = capId;
	if (arguments > 2) itemCap = arguments[2];

	var r = aa.inspection.getInspections(itemCap);

	if (r.getSuccess()) {
		var inspArray = r.getOutput();

		for (i in inspArray) {
			if (inspArray[i].getIdNumber() == inspId) {
				var inspModel = inspArray[i].getInspection();

				var gs = inspModel.getGuideSheets();

				if (gs) {
					gsArray = gs.toArray();
					for (var loopk in gsArray) {
						if (gName.toUpperCase() == gsArray[loopk].getGuideType().toUpperCase()) {
							gsArray[loopk].setIdentifier(nGuideSheetID);
							var updateResult = aa.guidesheet.updateGGuidesheet(gsArray[loopk],gsArray[loopk].getAuditID());
							if (updateResult.getSuccess()) {
								logDebug("Successfully updated " + gName + " on inspection " + inspId + " to and ID of " + nGuideSheetID);
								return true;
							} else {
								logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
								return false;
							}
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No updates to the guidesheet made");
	return false;
} 
 
function updateRefParcelToCap() //Takes Optional CapId
{
	var vCapId = null;
	if (arguments.length > 0)
		vCapId = arguments[0];
	else
		vCapId = capId;

	var capPrclArr = aa.parcel.getParcelDailyByCapID(vCapId, null).getOutput();
	if (capPrclArr != null) {
		for (x in capPrclArr) {
			var prclObj = aa.parcel.getParceListForAdmin(capPrclArr[x].getParcelNumber(), null, null, null, null, null, null, null, null, null);
			if (prclObj.getSuccess()) {
				var prclArr = prclObj.getOutput();
				if (prclArr.length) {
					var prcl = prclArr[0].getParcelModel();
					var refParcelNumber = prcl.getParcelNumber();
					var capPrclObj = aa.parcel.warpCapIdParcelModel2CapParcelModel(vCapId, prcl);

					if (capPrclObj.getSuccess()) {

						var capPrcl = capPrclObj.getOutput();
						capPrcl.setL1ParcelNo(refParcelNumber);
						aa.parcel.updateDailyParcelWithAPOAttribute(capPrcl);
						logDebug("Updated Parcel " + capPrclArr[x].getParcelNumber() + " with Reference Data");
					} else
						logDebug("Failed to Wrap Parcel Model for " + capPrclArr[x].getParcelNumber());

				} else
					logDebug("No matching reference Parcels found for " + capPrclArr[x].getParcelNumber());
			} else
				logDebug("Failed to get reference Parcel for " + capPrclArr[x].getParcelNumber())
		}
	}
} 
 

function updateShortNotes(newSN) // option CapId
	{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	cd.setShortNotes(newSN);

	cdWrite = aa.cap.editCapDetail(cd)

	if (cdWrite.getSuccess())
		{ logDebug("updated short notes to " + newSN) }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	}

 
 
function updateTask(wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 4) {
		if (arguments[4] != "") {
			processName = arguments[4]; // subprocess
			useProcess = true;
		}
	}
	var itemCap = capId;
	if (arguments.length == 6)
		itemCap = arguments[5]; // use cap ID specified in args

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	if (!wfstat)
		wfstat = "NA";

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			if (useProcess)
				aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			else
				aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			logMessage("Updating Workflow Task " + wfstr + " with status " + wfstat);
			logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
		}
	}
}
 
 
function updateTaskAssignedDate(wfstr, wfAssignDate) // optional process name
{
	// Update the task assignment date
	//
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var assignDate = aa.util.now();
			var tempDate = new Date(wfAssignDate);
			assignDate.setTime(tempDate.getTime())
			if (assignDate) {
				var taskItem = fTask.getTaskItem();
				taskItem.setAssignmentDate(assignDate);

				var adjustResult = aa.workflow.adjustTaskWithNoAudit(taskItem);
				if (adjustResult.getSuccess())
					logDebug("Updated Workflow Task : " + wfstr + " Assigned Date to " + wfAssignDate);
				else
					logDebug("Error updating wfTask : " + adjustResult.getErrorMessage());
			} else
				logDebug("Couldn't update assigned date.  Invalid date : " + wfAssignDate);
		}
	}
} 
 
function updateTaskDepartment(wfstr, wfDepartment) // optional process name
{
	// Update the task assignment department
	//
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (var i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			if (wfDepartment) {
				var taskUserObj = fTask.getTaskItem().getAssignedUser()
					taskUserObj.setDeptOfUser(wfDepartment);

				fTask.setAssignedUser(taskUserObj);
				var taskItem = fTask.getTaskItem();

				var adjustResult = aa.workflow.assignTask(taskItem);
				if (adjustResult.getSuccess())
					logDebug("Updated Workflow Task : " + wfstr + " Department Set to " + wfDepartment);
				else
					logDebug("Error updating wfTask : " + adjustResult.getErrorMessage());
			} else
				logDebug("Couldn't update Department.  Invalid department : " + wfDepartment);
		}
	}
}
 
 
function updateWorkDesc(newWorkDes) // optional CapId
{
	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args


		var workDescResult = aa.cap.getCapWorkDesByPK(itemCap);
	var workDesObj;

	if (!workDescResult.getSuccess()) {
		aa.print("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage());
		return false;
	}

	var workDesScriptObj = workDescResult.getOutput();
	if (workDesScriptObj) {
		workDesObj = workDesScriptObj.getCapWorkDesModel();
	} else {
		aa.print("**ERROR: Failed to get workdes Obj: " + workDescResult.getErrorMessage());
		return false;
	}

	workDesObj.setDescription(newWorkDes);
	aa.cap.editCapWorkDes(workDesObj);

	aa.print("Updated Work Description to : " + newWorkDes);

}
 
 
function validateGisObjects()
	{
	// returns true if the app has GIS objects that validate in GIS
	//
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap
		{
		var gischk = aa.gis.getGISObjectAttributes(fGisObj[a1]);

		if (gischk.getSuccess())
			var gisres = gischk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving GIS Attributes.  Reason is: " + gischk.getErrorType() + ":" + gischk.getErrorMessage()) ; return false }	
		
		if (gisres != null)
			return true;  // we have a gis object from GIS
		}
	}

 
 
/*  Verhoeff algorithm for check digit	http://en.wikipedia.org/wiki/Verhoeff_algorithm

	usage:  
		x = new verhoeff();
		y = x.compute("524243");
		aa.print(x.check(y));
*/

function verhoeff() {
	var F = new Array();
	F[ 0 ] = new Array( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 );
	F[ 1 ] = new Array( 1, 5, 7, 6, 2, 8, 3, 0, 9, 4 );

	for ( var i = 2; i < 8; i++ ) {
	    F[ i ] = new Array();
	    for ( var j = 0; j < 10; j++ )
	        F[ i ][ j ] = F[ i - 1 ][ F[ 1 ][ j ]];
	}

	Op = new Array();
	Op[0] = new Array( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 );
	Op[1] = new Array( 1, 2, 3, 4, 0, 6, 7, 8, 9, 5 );
	Op[2] = new Array( 2, 3, 4, 0, 1, 7, 8, 9, 5, 6 );
	Op[3] = new Array( 3, 4, 0, 1, 2, 8, 9, 5, 6, 7 );
	Op[4] = new Array( 4, 0, 1, 2, 3, 9, 5, 6, 7, 8 );
	Op[5] = new Array( 5, 9, 8, 7, 6, 0, 4, 3, 2, 1 );
	Op[6] = new Array( 6, 5, 9, 8, 7, 1, 0, 4, 3, 2 );
	Op[7] = new Array( 7, 6, 5, 9, 8, 2, 1, 0, 4, 3 );
	Op[8] = new Array( 8, 7, 6, 5, 9, 3, 2, 1, 0, 4 );
	Op[9] = new Array( 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 );

	Inv = new Array( 0, 4, 3, 2, 1, 5, 6, 7, 8, 9 );
	
	reverse_str =  function( str )	{
	    var rev = "";
	    for ( var i = str.length - 1; i >= 0; i-- )
	        rev = rev + str.charAt( i );
	    return rev;
	}

	this.check =  function ( num )	{
	    var a = reverse_str( num );
	    var check = 0;
	    for ( var i=0; i < a.length; i++ )
	        check = Op[ check ][ F[ i % 8 ][ a.charAt( i )]];
	    if ( check != 0 )
	        return false;
	    else
	        return true;
	}

	this.compute = function(num) {
	    var a = "x" + reverse_str( num );
	    var check = 0;
	    for ( var i = 1; i < a.length; i++ )
	        check = Op[ check ][ F[ i % 8 ][ a.charAt( i )]];
	    return num + Inv[ check ];
	}
} 
 
function workDescGet(pCapId)
	{
	//Gets work description
	//07SSP-00037/SP5017
	//
	var workDescResult = aa.cap.getCapWorkDesByPK(pCapId);
	
	if (!workDescResult.getSuccess())
		{
		logDebug("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage()); 
		return false;
		}
		
	var workDescObj = workDescResult.getOutput();
	var workDesc = workDescObj.getDescription();
	
	return workDesc;
	}
	 
 
function zeroPad(num,count)
{ 
var numZeropad = num + '';
while(numZeropad.length < count) {

numZeropad = "0" + numZeropad; 
}
return numZeropad;
} 
 
