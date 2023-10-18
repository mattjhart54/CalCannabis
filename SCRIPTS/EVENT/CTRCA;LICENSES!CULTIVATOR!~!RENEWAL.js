try{
// Make the renewal record accessible in ACA	
	aa.cap.updateAccessByACA(capId,"Y");
// Update alt id on renewal record
	vLicenseID = getParentLicenseCapID(capId);
	vIDArray = String(vLicenseID).split("-");
	vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();
	if (vLicenseID != null) {
		vLicenseAltId = vLicenseID.getCustomID();
		cIds = getChildren("Licenses/Cultivator/License/Renewal",vLicenseID);
		if(matches(cIds, null, "", undefined)) 
			renewNbr = renewNbr = "0" + 1;
		else {
			cIdLen = cIds.length 
			if(cIds.length <= 9) {
				renewNbr = cIdLen + 1;
				renewNbr = "0" +  renewNbr;
			}else {
				renewNbr = cIdLen + 1;
			}
		}
		newAltId = vLicenseAltId + "-R" + renewNbr;
		var resAltId = aa.cap.updateCapAltID(capId,newAltId);
		aa.env.setValue("capAltID", newAltId);
		if(resAltId.getSuccess()==true){
			logDebug("Alt ID set to " + newAltId);
		}else{
			logDebug("Error updating Alt ID: " +resAltId.getErrorMessage());
		}
	}
// Copy business contact from license
	copyContactsByType(vLicenseID,capId,"Designated Responsible Party");
	copyContactsByType(vLicenseID,capId,"Business");
	pInfo = new Array;
	loadAppSpecific(pInfo,vLicenseID); 
	updateWorkDesc(pInfo["Legal Business Name"]);

//Apply Fees
	var fees = false;
	b1ExpResult = aa.expiration.getLicensesByCapID(vLicenseID);
	var curDate = new Date();
	if (b1ExpResult.getSuccess()) {
		this.b1Exp = b1ExpResult.getOutput();
		expDate = this.b1Exp.getExpDate();
		if(expDate) {
			tmpExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
			curDateFormat = curDate.getMonth() + 1 + "/" + curDate.getDate() + "/" + curDate.getFullYear();
			var tmpDate = new Date(tmpExpDate);
			curDate = new Date(curDateFormat);
			var expDateChange = AInfo["License Expiration Date Change"] == "Yes";
			var newExpDateStr = AInfo["New Expiration Date"];
			if (expDateChange){
		        if (newExpDateStr) {
		            // Convert the custom field value to a Date object
		            var newExpDate = new Date(newExpDateStr);

		            // Calculate the time difference in milliseconds
		            var timeDiff = newExpDate.getTime() - tmpDate.getTime();

		            // Calculate the number of days
		            var daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
				}
			}
			if(!publicUser){
			    voidRemoveAllFees();
			    if(AInfo["License Type Change"] == "Yes"){
			        licType = AInfo["New License Type"];
			    }else{
			        licType = getAppSpecific("License Type",vLicenseID);
			    }
			    var expDateChange = AInfo["License Expiration Date Change"] == "Yes";
		            var newExpDateStr = AInfo["New Expiration Date"];
			    if (expDateChange && newExpDateStr){
			       	var feeDesc = licType + " - Renewal Fee with Date Change";
			       	var feeSchedule = "LIC_CC_REN_EXP";
					var feeQty = daysDiff;
				}else{
					var feeDesc = licType + " - Renewal Fee";
					var feeSchedule = "LIC_CC_REN";
					var feeQty = 1;
				}
			    var thisFee = getFeeDefByDesc(feeSchedule, feeDesc);
			    if(thisFee){
			        updateFee(thisFee.feeCode,feeSchedule, "FINAL", feeQty, "Y", "N");
				fees = true;
				if(licType.substring(0,5) == "Large") {
			            lType = lookup("LIC_CC_LICENSE_TYPE", licType);
			            if(!matches(lType,"", null, undefined)){
			                licTbl = lType.split(";");
			                var base = parseInt(licTbl[3]);
			                feeDescE = licType + " - Per 2,000 sq ft over " + maskTheMoneyNumber(base) + " with Date Change";
			                feeDescR = licType + " - Per 2,000 sq ft over " + maskTheMoneyNumber(base);
			                logDebug("feeDesc " + feeDescR + " " + feeDescE);
			                var sqft = getAppSpecific("Canopy SF",vLicenseID);
			                logDebug("SQ FT " + sqft + " Base " + base);

			               if (newExpDateStr){
						qty = (parseInt(sqft) - base) / 2000;
						thisFee = getFeeDefByDesc("LIC_CC_REN", feeDescR);
						logDebug("Fee Calc" +thisFee.formula);
						feeAmt = ((thisFee.formula*parseInt(qty))/365)*feeQty;
						logDebug("FeeAmt " + feeAmt);
						thisFee = getFeeDefByDesc(feeSchedule, feeDescE);
						if(feeAmt > 0){        
			                   		updateFee_Rev(thisFee.feeCode,feeSchedule, "FINAL", feeAmt, "Y", "N");
						}
			                }else{
						thisFee = getFeeDefByDesc(feeSchedule, feeDescR);
			                        qty = (parseInt(sqft) - base) / 2000;
						logDebug("qty " + parseInt(qty));
						if(qty > 0){           
			                        	updateFee_Rev(thisFee.feeCode,feeSchedule, "FINAL", parseInt(qty), "Y", "N");
						}
			                } 
			            }
			        }
			        
			    }else{
			        aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: WTUA:Licenses/Cultivation/License/Renewal: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
			        logDebug("An error occurred retrieving fee item: " + feeDesc);
			    }
			}
			if(tmpDate < curDate) {
				if (newExpDateStr){
                		var feeDesc = AInfo["License Type"] + " - Late Fee with Date Change";
                		var feeSchedule = "LIC_CC_REN_EXP";
                		var feeQty = 1;
		            }else{
		                var feeDesc = AInfo["License Type"] + " - Late Fee";
		                var feeSchedule = "LIC_CC_REN";
		                var feeQty = 1;
		            }
				var thisFee = getFeeDefByDesc(feeSchedule, feeDesc);
				if(thisFee){
					if (!feeExists(thisFee.feeCode,"NEW")){
						updateFee(thisFee.feeCode,feeSchedule, "FINAL", 1, "Y", "N");
						fees = true;					
					}
				}else{
					aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/Licnese/Renewal: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
					logDebug("An error occurred retrieving fee item: " + feeDesc);
				}
			}
		}
	}
	
// Set status and deactivate workflow if fees are due
	
	if(balanceDue > 0 || fees) {
		updateAppStatus("Renewal Fee Due"," ");
		deactivateActiveTasks();
		fees = true;
	}
// Invoice all fees if cash payment selected at submission in ACA
	if(AInfo["License Type Change"] == "Yes"){
		licType = AInfo["New License Type"];
	}else{
		licType = AInfo["License Type"];
	}
	if (newExpDateStr){
       		var feeDesc = licType + " - Renewal Fee with Date Change";
        	var feeSchedule = "LIC_CC_REN_EXP";
      		var feeQty = daysDiff;
	}else{
        	var feeDesc = licType + " - Renewal Fee";
        	var feeSchedule = "LIC_CC_REN";
        	var feeQty = 1;
   	}
	var thisFee = getFeeDefByDesc(feeSchedule, feeDesc);
	if(thisFee){
		var hasFee = feeExists(thisFee.feeCode,"NEW");
		if(hasFee) {
			var invNbr = invoiceAllFees();
			fees = true;
			updateAppStatus("Renewal Fee Due","Licensee chose Cash Option at checkout");
			deactivateTask("Annual Renewal Review");
			deactivateTask("Provisional Renewal Review");
		}
	}else{
		aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/License/Renewal: Get Fee: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
		logDebug("An error occurred retrieving fee item: " + feeDesc);
	}
// Check License Cases to see if renewal can be fast tracked
	var event = "CTRCA";
	logDebug("has Fee " + fees + "event " + event);
	fastTrack = renewalProcess(newAltId, event, fees);

//  No fast track. Send renewal submitted email notification to DRP
	if(fastTrack =='No'){
		var priContact = getContactObj(capId,"Designated Responsible Party");
		if(priContact){
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$altId$$", newAltId);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$parentId$$", vLicenseAltId);
			var rFiles = [];
			var priEmail = ""+priContact.capContact.getEmail();
			
			sendNotification(sysFromEmail,priEmail,"","LCA_RENEWAL_SUBMISSION",eParams, rFiles,capId)
	
			var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
			if(!matches(priChannel, "",null,"undefined", false)){
				if(priChannel.indexOf("Postal") > -1 ){
					var sName = createSet("Renewal Submission","Renewal Notifications", "New");
					if(sName){
						setAddResult=aa.set.add(sName,capId);
						if(setAddResult.getSuccess()){
							logDebug(capId.getCustomID() + " successfully added to set " +sName);
						}else{
							logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
						}
					}
					var invoiceSet = createSet("POSTAL_RENEWAL INVOICE","Renewal Notifications", "New");
					if(invoiceSet){
						setAddResult=aa.set.add(invoiceSet,capId);
						if(setAddResult.getSuccess()){
							logDebug(capId.getCustomID() + " successfully added to set " +invoiceSet);
						}else{
							logDebug("Error adding record to set " + invoiceSet + ". Error: " + setAddResult.getErrorMessage());
						}
					}
				}
			}
		}
	}
	// add records to set to email Invoice to DRP
	var srName = createSet("RENEWAL_INVOICE","Renewal", "New");
	if(srName){
		setAddResult=aa.set.add(srName,capId);
		if(setAddResult.getSuccess()){
			logDebug(capId.getCustomID() + " successfully added to set " +srName);
		}else{
			logDebug("Error adding record to set " + srName + ". Error: " + setAddResult.getErrorMessage());
		}
	}

} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/RENEWAL: Submission: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/LICENSE/RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
