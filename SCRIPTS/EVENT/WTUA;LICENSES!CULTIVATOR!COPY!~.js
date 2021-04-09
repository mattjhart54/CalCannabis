	if(wfStatus == "Approve Copy"){
		var sourceRec = getAppSpecific("Record Number",capId);
		var processedArray = [];
		if (typeof(TARGETRECORDS) == "object") {
			for (var x in TARGETRECORDS) {
				var theRow = TARGETRECORDS[x];
				if (theRow["Copy ?"].fieldValue == "CHECKED") {
					targetCapId = getApplication(theRow["Record ID"].fieldValue);
					var appStatus = aa.cap.getCap(targetCapId).getOutput().getCapStatus();
					if (appMatch("Licenses/Cultivator/Copy/Science Amendment",targetCapId)){
						if (!matches(appStatus,"Additional info needed","Submitted","Under Review")){
							continue;
						}
					}else{
						 if (exists(appStatus,['License Issued','Revoked','Provisional license issue'])){
							 continue;
						 }
					}
					var recordASIGroup = aa.appSpecificInfo.getByCapID(capId);
					if (recordASIGroup.getSuccess()){
						var recordASIGroupArray = recordASIGroup.getOutput();
						for (i in recordASIGroupArray) {
							var group = recordASIGroupArray[i];
							var groupName = String(group.getGroupCode());
							var recordField = String(group.getCheckboxDesc());
							var subGroup = String(group.getCheckboxType());
							var fieldValue = String(group.getChecklistComment());

							if (recordField.substring(0, 5) == "Copy_"){
								if(fieldValue == "CHECKED"){
									sourceCapId = getApplication(sourceRec);
									var editField = recordField.substring(5);
									var sourceValue = getAppSpecific(editField,sourceCapId);
									logDebug("Editing: " + editField + ": " + sourceValue + " To: " + sourceCapId.getCustomID());
									editAppSpecific(editField,sourceValue,targetCapId);
									if (processedArray.indexOf(String(targetCapId.getCustomID())) < 0){
										processedArray.push(String(targetCapId.getCustomID()));
									}
								}
							}
						}
					}
				}
			}
		}
		//Apply Comments to all Records
		if (processedArray.length > 0){
			var comDate = aa.date.getCurrentDate();
			var hr = comDate.getHours();
			var min = comDate.getMinutes();
			var timeStamp = hr+":"+min;
			createCapComment(sourceRec + " was copied on " + wfDate + " at " + timeStamp + " by " + wfActionByUserID + " to target records " + processedArray +". Reference " + capId.getCustomID() + ".",capId);
			var commentArray =[];
			var capCommentScriptModel = aa.cap.createCapCommentScriptModel();
			capCommentScriptModel.setCapIDModel(capId);
			var capCommentModel = capCommentScriptModel.getCapCommentModel();
			var cQuery = aa.cap.getCapComment(capCommentModel);
			cResult = cQuery.getOutput();
			for (xx in processedArray){
				var thisRow = processedArray[xx];
				thisCap = getApplication(thisRow);
				for (ii in cResult){
					createCapComment(cResult[ii].getText(),thisCap);
				}
			}
		}			
	}

									