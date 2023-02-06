/*lwacht: 180320: story 5233: 
	4. If the NOV Date is populated and the Violation Contested field is blank, CEB staff cannot close the workflow for a 
		case the Investigation workflow task status cannot be set to "NOV Monetary Approved" or "NOV Non-Monetary Approved" (dependent on Story 5204).
	5. If Violation Contested = Yes, the Investigation workflow task status cannot be set to "NOV Monetary Approved" or 
		"NOV Non-Monetary Approved" if a document with the type "Request for Hearing" is not attached to the case (dependent on Story 5204).
*/
try{
	//lwacht: 180320: story 5233: because of changed workflow, removing the wfTask criterion
	//if(wfTask=="Investigation" && matches(wfStatus, "NOV Non-Monetary Approved", "NOV Monetary Approved")){
	if(matches(wfStatus, "NOV Non-Monetary Approved", "NOV Monetary Approved")){
	//lwacht: 180320: story 5233: end
		var violNotUpdated = false;
		var violContested = false;
		if(!matches(AInfo["NOV Date"], "",null,"undefined") && matches(AInfo["Violation Contested"], "",null,"undefined")){
			violNotUpdated = true;
			logDebug("Bad");
		}
		if( matches(AInfo["Violation Contested"], "Y", "YES", "Yes")){
			violContested = true;
		}
		if(violNotUpdated){
			cancel =true;
			showMessage = true;
			comment("'Violation Contested' field must be updated.");
		}else{
			if(violContested){
				var docExists = false;
				var arrDocs = getDocumentList();
				for(doc in arrDocs){
					var thisDocument = arrDocs[doc];
					if (thisDocument.getDocCategory() == "Request for Hearing"){
						docExists=true;
					}
				}
				if(!docExists){
					cancel = true;
					showMessage = true;
					comment("The 'Request for Hearing' document must be uploaded before continuing.");
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUB:ENFORCEMENT/CASE/NA/NA: Prevent NOV Workflow updates: " + err.message);
	logDebug(err.stack);
}
//lwacht: 180320: story 5233: end
/*lwacht: 180320: 
		story 5228: Corrective Action Plan = Yes, the Supervisor Review Case Disposition workflow task status 
		cannot be set to "Closed - Corrective Action Plan Approved" if a document with the type "Corrective 
		Action Plan" is not attached to the case (dependent on Story 5204).
*/
try{
 	//lwacht: 180404: story 5233: because of changed workflow, removing the wfTask criterion
	if(wfTask=="Legal Review" && wfStatus == "Action Approved" && matches(AInfo["Corrective Action Plan"], "Yes", "Y", "YES")){
	//lwacht: 180404: story 5233: end
		var docExists = false;
		var arrDocs = getDocumentList();
		for(doc in arrDocs){
			var thisDocument = arrDocs[doc];
		//Mhart 180418: story 5402 change criteria to look for document Final Corrective Action Plan			
			if (matches(thisDocument.getDocCategory(), "Final Corrective Action Plan", "Stipulated Decision and Order")){
		//Mhart 180418: end
				docExists=true;
			}
		}
		if(!docExists){
			cancel = true;
			showMessage = true;
			comment("Before this case can be closed the Final Corrective Action Plan or Stipulated Decision and Order document must be attached.");
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUB:ENFORCEMENT/CASE/NA/NA: Prevent Corrective Action Workflow updates:" + err.message);
	logDebug(err.stack);
}
//lwacht: 180320: story 5228: end 

try {
	if(wfTask == "Case Assessment" && wfStatus == "Referred") {
		var cdScriptObj = aa.cap.getCapDetail(capId).getOutput();
		if (!cdScriptObj){
			logDebug("**ERROR: No cap detail script object") ; 
		}
		si = cdScriptObj.getAsgnStaff();
		logDebug("Special Investigator " + si);	
		if(matches(si,null,"",undefined)) {
			cancel = true;
			showMessage = true;
			comment("Before this case can be referred you must assign the case to a Special Investigator");
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUB:ENFORCEMENT/CASE/NA/NA: Case unassigned on Referral" + err.message);
	logDebug(err.stack);
}