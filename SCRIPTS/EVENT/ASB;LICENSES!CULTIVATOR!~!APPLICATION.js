//lwacht: 180412: story 5428:  don't allow submission until everything is completed
try{
	if(publicUser){
		if(appTypeArray[2]!="Temporary"){
			var incompleteApp = false;
			if(matches(AInfo["License Type"],"",null,"undefined")){
				incompleteApp = true;
			}
			if(matches(AInfo["Business Entity Structure"],"",null,"undefined")){
				incompleteApp = true;
			}
			if(matches(AInfo["Premise County"],"",null,"undefined")){
				incompleteApp = true;
			}
			if(matches(AInfo["Local Authority Type"],"",null,"undefined")){
				incompleteApp = true;
			}
			if(incompleteApp){
				showMessage = true;
				cancel = true;
				comment("The record has not been completed.  Please edit each page to ensure all required fields are populated.");
			}
		}
	}
//MJH 190412 story 5979 - validate that each email address in owner table is unique 
	loadASITables();
	var tblOwner = [];
	var emailDuplicate = false;
	for(row in OWNERS){
		tblOwner.push(OWNERS[row]);
	}
	for(x in tblOwner) {
		var tblEmail = ""+ tblOwner[x]["Email Address"];
		tblEmail = tblEmail.toUpperCase();
		for(o in OWNERS) {
			if( x == o) 
				continue;
			var ownEmail = ""+ OWNERS[o]["Email Address"];
			ownEmail = ownEmail.toUpperCase();
			logDebug("tblEmail " + tblEmail + " ownEmail " + ownEmail);
			if (tblEmail == ownEmail) {
				emailDuplicate = true;
			}
		}
		if(emailDuplicate) {
			cancel = true;
			showMessage = true;
			comment("Each Owner in the table must have a unique email address.");
			break;
		}
	}
//MJH 190412 story 5979 - end
} catch (err) {
	logDebug("An error has occurred in ASB:Licenses/Cultivation/*/Application: Completed field check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/*/Application: Completed field check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}

// IAS User Story Prod Defect 6135 - record app, the business, DRP, and ASOP contacts are missing.

try {
	var applContactResult = aa.people.getCapContactByCapID(capId);
	if (applContactResult.getSuccess()){
		var applContacts = applContactResult.getOutput();
		var cntDRP = false;
		var cntBusiness =false;
		var cntASOP = false;
		
		for (a in applContacts){
			if(applContacts[a].getCapContactModel().getContactType()== "Designated Responsible Party") 
				cntDRP=true;
			if(applContacts[a].getCapContactModel().getContactType()== "Business") 
				cntBusiness=true;
			if(applContacts[a].getCapContactModel().getContactType()== "Agent for Service of Process") 
				cntASOP=true;	
		}
		
		
		if(cntDRP = false) {
			cancel=true;
			showMessage=true;
			comment("No required Designated Responsible Party contact has been entered on the application.  Please add before submitting the application");
		}
		if(cntBusiness = false) {
			cancel=true;
			showMessage=true;
			comment("There must be one and only one Business contact");
		}
		if(cntASOP = false) {
			cancel=true;
			showMessage=true;
			comment("There must be one and only one Agent for Service Process contact");
		}
		
	}
			
} catch(err){
	logDebug("An error has occurred in ASB;LICENSES!CULTIVATOR!~!APPLICATION.js: Check Number of contacts " + err.message);
	logDebug(err.stack);
}


//lwacht: 180412: story 5428: end

//lwacht 180104 Story 5105 start
/*
try{
	if(appTypeArray[2]!="Temporary"){
		cancel = true;
		showMessage = true;
		comment("The application cannot be submitted at this time; to complete the annual license application you will need to submit Live Scan fingerprints for each person who meets the definition of 'Owner', as described in the emergency regulations. We are finalizing the information needed for this process and will post the required 'Request for Live Scan' form on the CDFA website (calcannabis.cdfa.ca.gov) soon. <font color='red'>PLEASE SELECT THE 'SAVE AND RESUME LATER' BUTTON PRIOR TO EXITING THIS PAGE TO SAVE YOUR APPLICATION.</font>");
	}
}catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivation/* /Application: No Submittal: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/ * /Application: No Submittal: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}
//lwacht 180104 Story 5105 end
*/

//lwacht: double checking required docs
/* lwacht: not working - removing
try {
	var eText = "";
	docsMissing = false;
	showList = true;
	addConditions = false;
	addTableRows = false;
	var tblRow = [];
	var conditionTable = [];
	r = getReqdDocs("Application", "AV");
	logDebug("capIDString: " + typeof(capIDString));
	//if("undefined".equals(typeof(capIDString))){
	if("".equals(capIDString)){
		vSubmittedDocList = aa.env.getValue("DocumentModelList");
		submittedDocList = vSubmittedDocList.toArray();
		eText+=" using aa.env.getValue" + br;
		logDebug(" using aa.env.getValue");
	}else{
		//capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
		submittedDocList = aa.document.getDocumentListByEntity(capIDString,"TMP_CAP").getOutput().toArray();
		eText+=" using getDocumentListByEntity" + br;
	}
	uploadedDocs = new Array();
	dr = "";
	eText+=("submittedDocList: " + submittedDocList.length) + br;
	//logDebug("submittedDocList: " + submittedDocList.length());
	//getValue isn't working but do not need this the first time around, so hack.
	var docsSubmitted = false;
	for (var i in submittedDocList ){
		uploadedDocs[submittedDocList[i].getDocCategory()] = true;
		eText+=("uploaded doc: " + submittedDocList[i].getDocCategory()) + br;
		docsSubmitted =true;
	}
	eText+=("r.length: " + r.length) + br;
	if (r.length > 0 && showList) {
		for (x in r) {
			eText+=(" required doc: " + r[x].document) + br;
			eText+=(" uploaded doc: " +uploadedDocs[r[x].document]) + br;
			if(uploadedDocs[r[x].document] == undefined) {
				showMessage = true; 
				if (!docsMissing)  {
					comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>The following documents are required based on the information you have provided: </span><ol>"); 	
					docsMissing = true; 
					showList = true;
				}
				conditionType = "License Required Documents";
				dr = r[x].condition;
				publicDisplayCond = null;
				if (dr) {
					ccr = aa.capCondition.getStandardConditions(conditionType, dr).getOutput();
					for(var i = 0;i<ccr.length;
					i++) if(ccr[i].getConditionDesc().toUpperCase() == dr.toUpperCase()) publicDisplayCond = ccr[i];
				}
				if (dr && ccr.length > 0 && showList && publicDisplayCond) {
					message += "<li><span>" + dr + "</span>: " + publicDisplayCond.getPublicDisplayMessage() + "</li>";
				}
				if (dr && ccr.length > 0 && addConditions && !appHasCondition(conditionType,null,dr,null)) {
					addStdCondition(conditionType,dr);
				}
				if (dr && ccr.length > 0 && addTableRows) {
					tblRow["Document Type"] = new asiTableValObj("Document Type",""+dr, "Y"); 
					tblRow["Document Description"]= new asiTableValObj("Document Description",""+lookup("LIC_CC_DOCUMENTS", dr), "Y"); 
					tblRow["Uploaded"] = new asiTableValObj("Uploaded","UNCHECKED", "Y"); 
					tblRow["Status"] = new asiTableValObj("Status","Not Submitted", "Y"); ; 
					conditionTable.push(tblRow);
				}	
			}	
		}
		if (dr && ccr.length > 0 && addTableRows) {
			removeASITable("ATTACHMENTS"); 
			asit = cap.getAppSpecificTableGroupModel();
			addASITable4ACAPageFlow(asit,"ATTACHMENTS",conditionTable);
		}
	}
	aa.sendMail(sysFromEmail,debugEmail, "", "INFO ONLY: ASB:Licenses/Cultivation/ * /Application: Doc check: " + startDate, "capId: " + capId + ": " + eText);
	logDebug("eText: " + eText);

	if (r.length > 0 && showList && docsMissing && docsSubmitted && publicUser)  {
		cancel = true;
		showMessage = true;
		comment("</ol></div>");
	}
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ASB:Licenses/Cultivation/ * /Application: Doc check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/ * /Application: Doc check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);
}
*/