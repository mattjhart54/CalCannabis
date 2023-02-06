/*---- User intial parameters ----*/var from = "ethan.mo@achievo.com";var cc = "ethan.mo@achievo.com";var taskStatus = aa.env.getValue("WorkflowStatus");var taskName = aa.env.getValue("WorkflowTask");var processCode = aa.env.getValue("PROCESSCODE");/*---- User intial parameters ----*/function sendMail(){	var taskItem = getTaskItem();	if(taskItem == null)	{		aa.print("No email sent.");		return;	}	var capIDModel = getCapID();	if(capIDModel == null)	{		aa.print("No email sent.");		return;	}	var fileNames = [];	var to = "william.wang@achievo.com"; 	if(to != "")	{		var processNoteScriptModel;		var returnResult = aa.workflow.getProcessNoteScriptModelByTaskItem(taskItem);		if(returnResult.getSuccess())		{			processNoteScriptModel = returnResult.getOutput();		}		var isSuccess = aa.document.sendEmailAndSaveAsDocument4Workflow(from, to, cc, "subject",  "content", fileNames, processNoteScriptModel)		if(isSuccess.getSuccess())		{			aa.print("Sent email successfully.");		}		else		{			aa.print("Sent email failed.");		}	}	else	{		aa.print("Email address is empty.");	}}function getTaskItem(){	var taskItemResult = aa.workflow.getTask(getCapID(), taskName);	if(taskItemResult.getSuccess())	{		return taskItemResult.getOutput();	}	return null;}function getCapID(){	var id1 = aa.env.getValue("PermitId1");	var id2 = aa.env.getValue("PermitId2");	var id3 = aa.env.getValue("PermitId3");	var capIDResult = aa.cap.getCapID(id1, id2, id3);	if(capIDResult.getSuccess())	{		return capIDResult.getOutput();	}	return null;}aa.env.setValue("ScriptReturnCode","0");aa.env.setValue("ScriptReturnMessage","Examination available.");sendMail();