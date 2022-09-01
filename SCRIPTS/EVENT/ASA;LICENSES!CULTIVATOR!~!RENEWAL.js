//lwacht
//update AltId
//lwacht: commenting out and putting in CTRCA

try{
	var partialCapId = getIncompleteCapId();
	parentLic = getParentLicenseCapID(capId);
	if (!parentLic){
		parentLic = "" + aa.env.getValue("ParentCapID");
	}
    pLicArray = String(parentLic).split("-");
    var parentCapId = aa.cap.getCapID(pLicArray[0],pLicArray[1],pLicArray[2]).getOutput();
	var parentAltId = parentCapId.getCustomID();
	pCap = aa.cap.getCap(parentCapId).getOutput();
	var pStatus = pCap.getCapStatus();
	b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
	var curDate = new Date();
	var curDateFormat = curDate.getMonth() + 1 + "/" + curDate.getDate() + "/" + curDate.getFullYear();
	curDate = new Date(curDateFormat);
	if (b1ExpResult.getSuccess()) {
		this.b1Exp = b1ExpResult.getOutput();
		expDate = this.b1Exp.getExpDate();
		if(expDate) {
			tmpExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
			var tmpDate = new Date(tmpExpDate);
		}
	}		
	//1. Check to see if license is ready for renew
	if (isRenewProcess(parentCapId, partialCapId)){
		logDebug("CAPID(" + parentCapId + ") is ready for renew. PartialCap (" + partialCapId + ")");
	//2. Associate partial cap with parent CAP.
		var result = aa.cap.createRenewalCap(parentCapId, partialCapId, true);
		if (result.getSuccess()){
	//3. Copy key information from parent license to partial cap
			pInfo = new Array;
			loadAppSpecific(pInfo,parentCapId); 
			editAppSpecific("License Number",parentAltId);
			editAppSpecific("License Type", pInfo["License Type"]);
			editAppSpecific("License Issued Type", pInfo["License Issued Type"]);
			editAppSpecific("Business Name", pInfo["Legal Business Name"]);
			editAppSpecific("Premises Address", pInfo["Premise Address"]);
			editAppSpecific("Premises City", pInfo["Premise City"]);
			editAppSpecific("Premises Zip", pInfo["Premise Zip"]);
			editAppSpecific("Premises County", pInfo["Premise County"]);
			editAppSpecific("APN", pInfo["APN"]);
			editAppSpecific("Cultivator Type", pInfo["Cultivator Type"]);
	//		editAppSpecific("Parent ID",parentCapId);
	//		copyContactsByType(parentCapId,partialCapId,"Designated Responsible Party");
			updateWorkDesc(pInfo["Legal Business Name"]);
			if(expDate) {
				editAppSpecific("Expiration Date", tmpExpDate);
			}
		//4. Assess Renewal Fee
			voidRemoveAllFees();
			var feeDesc = pInfo["License Type"] + " - Renewal Fee";
			var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
			if(thisFee){
				if (matches(AInfo["License Type"],"Large Outdoor","Large Indoor","Large Mixed-Light Tier 1","Large Mixed-Light Tier 2")){
					updateFee(thisFee.feeCode,"LIC_CC_REN", "FINAL", Number(pInfo["Canopy SF"]), "Y", "N");
				}else{
					updateFee(thisFee.feeCode,"LIC_CC_REN", "FINAL", 1, "Y", "N");
				}
			}else{
				aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/Licnese/Renewal: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
				logDebug("An error occurred retrieving fee item: " + feeDesc);
			}
			if(tmpDate < curDate) {
				var feeDesc = pInfo["License Type"] + " - Late Fee";
				var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
				if(thisFee){
					updateFee(thisFee.feeCode,"LIC_CC_REN", "FINAL", 1, "Y", "N");
					}else{
					aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/Licnese/Renewal: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
					logDebug("An error occurred retrieving fee item: " + feeDesc);
				}
			}
		//5. Set B1PERMIT.B1_ACCESS_BY_ACA to "N" for partial CAP to not allow that it is searched by ACA user.
	//		aa.cap.updateAccessByACA(partialCapId, "N");
		}else{
			aa.print("ERROR: Associate partial cap with parent CAP. " + result.getErrorMessage());
		}
	}else{
		//Check to see if late fee is needed after ACA review.  Used for records saved before expiration and submitted after expiration.
		if(tmpDate < curDate) {
			var feeDesc = getAppSpecific("License Type",parentCapId) + " - Late Fee";
			var thisFee = getFeeDefByDesc("LIC_CC_REN", feeDesc);
			if(thisFee){
				if (!feeExists(thisFee.feeCode)){
					updateFee(thisFee.feeCode,"LIC_CC_REN", "FINAL", 1, "Y", "N");
				}
				}else{
				aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASA:Licenses/Cultivation/Licnese/Renewal: Add Fees: " + startDate, "fee description: " + feeDesc + br + "capId: " + capId + br + currEnv);
				logDebug("An error occurred retrieving fee item: " + feeDesc);
			}
		}
	}
} catch(err){
	logDebug("An error has occurred in ASA:LICENSES/CULTIVATOR/* /RENEWAL: Update AltId: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}

function isRenewProcess(parentCapID, partialCapID)
{
	//1. Check to see parent CAP ID is null.
	if (parentCapID == null || partialCapID == null 
		|| aa.util.instanceOfString(parentCapID))
	{
		return false;
	}
	//2. Get CAPModel by PK for partialCAP.
	var result = aa.cap.getCap(partialCapID);
	if(result.getSuccess())
	{
		capScriptModel = result.getOutput();
		//2.1. Check to see if it is partial CAP.	
		if (capScriptModel.isCompleteCap())
		{
			aa.print("ERROR: It is not partial CAP(" + capScriptModel.getCapID() + ")");
			return false;
		}
	}
	else
	{
		aa.print("ERROR: Fail to get CAPModel (" + partialCapID + "): " + result.getErrorMessage());
		return false;
	}
	//3.  Check to see if the renewal was initiated before. 
	result = aa.cap.getProjectByMasterID(parentCapID, "Renewal", "Incomplete");
	if(result.getSuccess())
	{
		partialProjects = result.getOutput();
		if (partialProjects != null && partialProjects.length > 0)
		{
			//Avoid to initiate renewal process multiple times.
			aa.print("Warning: Renewal process was initiated before. ( "+ parentCapID + ")");
			return false;
		}
		
	}
	//4 . Check to see if parent CAP is ready for renew.
	return isReadyRenew(parentCapID);
}

function isReadyRenew(capid)
{
	if (capid == null || aa.util.instanceOfString(capid))
	{
		return false;
	}
	var result = aa.expiration.isExpiredLicenses(capid);
    if(result.getSuccess())
	{
		return true;
	}  
    else 
    {
      aa.print("ERROR: Failed to get expiration with CAP(" + capid + "): " + result.getErrorMessage());
    }
	return false;
}

function getIncompleteCapId() {
	var s_id1 = aa.env.getValue("PermitId1");
	var s_id2 = aa.env.getValue("PermitId2");
	var s_id3 = aa.env.getValue("PermitId3");
	var result = aa.cap.getCapIDModel(s_id1, s_id2, s_id3);
	if(result.getSuccess()){
		return result.getOutput();
	}else{
		aa.print("ERROR: Failed to get capId: " + result.getErrorMessage());
		return null;
	}
}

