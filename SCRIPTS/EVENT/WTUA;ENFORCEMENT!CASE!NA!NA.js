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
	if(wfTask == "Case Assessment" && wfStatus == "Referred") {
		var TInfo = [];
		loadTaskSpecific(TInfo);
		var rFiles = [];
		var eParams = aa.util.newHashtable();
		addParameter(eParams,"$$fileDate$$", fileDate);
		var caseDesc = workDescGet(capId);
		addParameter(eParams,"$$caseDesc$$", caseDesc);
		addParameter(eParams,"$$appType$$", appTypeAlias);
		addParameter(eParams,"$$caseName$$", capName);
		addParameter(eParams,"$$caseType$$", AInfo["Case Type"]);
		addParameter(eParams,"$$priority$$", AInfo["Priority"]);
		addParameter(eParams,"$$dueDate$$", AInfo["Due Date"]);
		addParameter(eParams,"$$source$$", AInfo["Source of Complaint"]);
		addParameter(eParams,"$$otherEntity$$", AInfo["Other Source"]);
		addParameter(eParams,"$$typeSubmittal$$", AInfo["Type of Submittal"]);
		addParameter(eParams,"$$type$$", AInfo["Complaint Type"]);
		addParameter(eParams,"$$otherType$$", AInfo["Other Complaint Type"]);
		addParameter(eParams,"$$typeSubmittal$$", AInfo["Type of Submittal"]);
		addParameter(eParams,"$$APN$$", AInfo["APN"]);
		addParameter(eParams,"$$location$$", AInfo["Address"]);
		addParameter(eParams,"$$city$$", AInfo["City"]);
		addParameter(eParams,"$$county$$", AInfo["County"]);
		addParameter(eParams,"$$caseComments$$", wfComment);
		var locEmail =  TInfo["E-mail Address"];
		var caseContact = getContactObj(capId,"Subject");
		if(caseContact) {
			if(!matches(caseContact.capContact.firstName,null,"",undefined)) {
				addParameter(eParams, "$$contactName$$", caseContact.capContact.firstName + " " + caseContact.capContact.lastName);
				addParameter(eParams, "$$contactPhone$$", caseContact.capContact.phone3);
				addParameter(eParams, "$$contactEmail$$", caseContact.capContact.email);
			}
		}
		var docList = aa.document.getDocumentListByEntity(capId.toString(),"CAP").getOutput();
	//	logDebug("Doc List " + docList.size());
		var num = docList.size();
		if(num>0) {
			for(var i=0;i<num;i++){
				if(docList.get(i).getDocCategory() == "Weed Tip Referral") {
					docContent = aa.document.downloadFile2Disk(docList.get(i), "Enforcement", "", "", true);
					rFile = docContent.getOutput();
					rFiles.push(rFile);
	//				logDebug("doc content " + docContent);
				}
			}
		}
		sendNotification("CDFA.CalCannabis_Enforcement@cdfa.ca.gov",locEmail,"","ENF_REFERRAL_NOTIFICATION",eParams,rFiles,capId);
	}	
} catch(err){
	logDebug("An error has occurred in WTUA:ENFORCEMENT/CASE/NA/NA: Close Case Disposition task:" + err.message);
	logDebug(err.stack);
}
//lwacht: 180323: story 5204: end 