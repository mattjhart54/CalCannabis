//lwacht: 180323: story 5204: close case disposition task with whatever status activated it 
try{
	if(isTaskActive("Case Disposition")){
		if(wfStatus == "Action Approved"){
			if(isTaskStatus("Supervisor Review", "Corrective Action Plan Approved")){
				closeTask("Case Disposition", "CL-Corrective Action Plan APV", "Closed via WTUA:ENFORCEMENT/CASE/NA/NA", "");
				updateAppStatus("CL-Corrective Action Plan APV","Closed via WTUA:ENFORCEMENT/CASE/NA/NA");
			}else{
				if(isTaskStatus("Supervisor Review", "Administrative Hold Approved")){
					closeTask("Case Disposition", "CL-Administrative Hold APV", "Closed via WTUA:ENFORCEMENT/CASE/NA/NA", "");
					updateAppStatus("CL-Administrative Hold APV","Closed via WTUA:ENFORCEMENT/CASE/NA/NA");
				}else{
					if(isTaskStatus("Supervisor Review", "Licensing Action Approved")){
						closeTask("Case Disposition", "CL-Licensing Action APV", "Closed via WTUA:ENFORCEMENT/CASE/NA/NA", "");
						updateAppStatus("CL-Licensing Action APV","Closed via WTUA:ENFORCEMENT/CASE/NA/NA");
					}else{
						closeTask("Case Disposition", "CL-" + wfStatus, "Closed via WTUA:ENFORCEMENT/CASE/NA/NA", "");
						updateAppStatus(capStatus,"Closed via WTUA:ENFORCEMENT/CASE/NA/NA");
					}
				}
			}
		}else{
			closeTask("Case Disposition", "CL-" + wfStatus, "Closed via WTUA:ENFORCEMENT/CASE/NA/NA", "");
			updateAppStatus(capStatus,"Closed via WTUA:ENFORCEMENT/CASE/NA/NA");
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/NA/NA: Close Case Disposition task:" + err.message);
	logDebug(err.stack);
}
//lwacht: 180323: story 5204: end 