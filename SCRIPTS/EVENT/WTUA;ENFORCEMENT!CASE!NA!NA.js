//lwacht: 180323: test: close case disposition task with whatever status activated it 
try{
	if(isTaskActive("Case Disposition")){
		closeTask("Case Disposition", "Closed - " + wfStatus, "Close via WTUA:ENFORCEMENT/CASE/NA/NA", "");
	}
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/NA/NA: Close Case Disposition task:" + err.message);
	logDebug(err.stack);
}
//lwacht: 180323: test: end 