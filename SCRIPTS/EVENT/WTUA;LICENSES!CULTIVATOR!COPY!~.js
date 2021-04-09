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
		if (processedArray.length > 0){
			processedArray.push(String(capId.getCustomID()));
			var d = new Date();
			var hr = d.getHours();
			var min = d.getMinutes();
			var timeStamp = hr+":"+min;
			for (xx in processedArray){
				var thisRow = processedArray[xx];
				thisCap = getApplication(thisRow);
				createCapComment(sourceRec + " was copied on " + wfDate + " at " + timeStamp + " by " + wfActionByUserID + " to target records " + processedArray +". Reference " + capId.getCustomID() + ".",thisCap);
			}
		}			
	}

									