/*lwacht: 180320: story 5233: 
	4. If the NOV Date is populated and the Violation Contested field is blank, CEB staff cannot close the workflow for a 
		case the Investigation workflow task status cannot be set to "NOV Monetary Approved" or "NOV Non-Monetary Approved" (dependent on Story 5204).
	5. If Violation Contested = Yes, the Investigation workflow task status cannot be set to "NOV Monetary Approved" or 
		"NOV Non-Monetary Approved" if a document with the type "Request for Hearing" is not attached to the case (dependent on Story 5204).
*/
try{
	if(wfTask=="Investigation" && matches(wfStatus, "NOV Non-Monetary Approved", "NOV Monetary Approved")){
		var tblViolNotUpdated = false;
		var violContested = false;
		if(VIOLATION){
			if(VIOLATION.length>0){
				for(row in VIOLATION){
					if(!matches(VIOLATION[row]["NOV Date"], "",null,"undefined") && matches(VIOLATION[row]["Violation Contested"], "",null,"undefined")){
						tblViolNotUpdated = true;
						logDebug("Bad");
					}
					if( matches(VIOLATION[row]["Violation Contested"], "Y", "YES", "Yes")){
						violContested = true;
					}
				}
			}
		}
		if(tblViolNotUpdated){
			cancel =true;
			showMessage = true;
			comment("'Violation Contested' field in the VIOLATION table must be updated for one or more rows.");
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
					comment("The 'Request for Hearing' document must be uploaded before continuing");
				}
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in WTUB:ENFORCEMENT/CASE/NA/NA: Prevent NOV Workflow updates: " + err.message);
	logDebug(err.stack);
}

