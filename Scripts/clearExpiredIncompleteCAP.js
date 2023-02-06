batchJobName = "Purge Unsubmitted Applications"; // Please replace batchJobName value with the actual Batch Job Name.
batchJobDesc = "Purge  based on value in PARTIALLY_COMPLETED_CAP_PURGE_DAYS"; // Please replace batchJobDesc value with the actual Batch Job Description.
batchJobResult = "clearExpiredIncompleteCAP"; // Please replace batchJobResult value with the actual Batch Job Result.

sysDate = aa.date.getCurrentDate(); 
batchJobID = aa.batchJob.getJobID().getOutput(); 
var removeResult = aa.cap.removeExpiredIncompleteCAP();
if(removeResult.getSuccess()) {
  aa.print("passed");
  aa.env.setValue("ScriptReturnCode","0");
  aa.env.setValue("ScriptReturnMessage","Remove expired incomplete CAPS successful");
  aa.eventLog.createEventLog("Cleared Incomplete CAPs successfully", "Batch Process", batchJobName, sysDate, sysDate,batchJobDesc, batchJobResult, batchJobID);
}
else {
  aa.print("failed");
  aa.env.setValue("ScriptReturnCode","1");
  aa.env.setValue("ScriptReturnMessage","Remove expired incomplete CAPS failed");
}   