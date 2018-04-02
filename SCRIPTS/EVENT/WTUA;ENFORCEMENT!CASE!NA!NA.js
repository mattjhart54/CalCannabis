//lwacht: 180323: story 5204: close case disposition task with whatever status activated it 
try{
	if(isTaskActive("Case Disposition")){
		closeTask("Case Disposition", "CL: " + wfStatus, "Closed via WTUA:ENFORCEMENT/CASE/NA/NA", "");
		updateAppStatus("CL: " + wfStatus,"Closed via WTUA:ENFORCEMENT/CASE/NA/NA");
	}
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/NA/NA: Close Case Disposition task:" + err.message);
	logDebug(err.stack);
}
//lwacht: 180323: story 5204: end 