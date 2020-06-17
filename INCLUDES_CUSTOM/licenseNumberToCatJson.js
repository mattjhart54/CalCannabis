function licenseNumberToCatJson(licenseNumber) {
	try{
		if (String(licenseNumber.substr(0,3)) == "CCL"){
			var validationMessage = "";
			logDebug("licenseNumber: " + licenseNumber);
			licenseNumber = "" + licenseNumber;
			capId = aa.cap.getCapID(licenseNumber).getOutput();
			var capScriptObj = aa.cap.getCap(capId);
			cap = capScriptObj.getOutput();
			var capModel = (capScriptObj.getOutput()).getCapModel();
			var AInfo = [];
			loadAppSpecific(AInfo);
			if(AInfo["Legal Business Name"]==null){
				var legalBusinessName = "No Business Name provided";
			}else{
				if(!isUnicode(String(AInfo["Legal Business Name"]))){
					var legalBusinessName = "" + AInfo["Legal Business Name"].substr(0, 100);
				}else{	
					validationMessage += " An illegal character has been found in Legal Business Name of " + licenseNumber;
				}
			}
	//		var firstThree = licenseNumber.substring(0, 3);
	//		if(firstThree == "CAL" || firstThree == "TAL" || firstThree == "PAL") {
			if(matches(AInfo["Cultivator Type"],null,undefined,"")){
				validationMessage += " Record " + licenseNumber + " - License Type is null";
			}else{
				if(matches(AInfo["Cultivator Type"],"Adult-Use","Medicinal")){
					if(AInfo["Cultivator Type"] == "Adult-Use")	{
						var licenseType ="A-"+AInfo["License Type"];
					} else {
						var licenseType = "M-"+AInfo["License Type"];
					}
				}else{
					validationMessage += " Record " + licenseNumber + " - Cultivation Type field is invalid";
				}
			}
	//lwacht: 180424: story 5411/5412: only allowing 'active' and 'inactive' statuses
	//espenaj: 200506: Story 6513: adding "Expired - Pending Renewal" to list of active statuses
			var recStatus = capModel.getCapStatus();
			if(matches(recStatus,"Active", "About to Expire", "Suspended", "Expired - Pending Renewal")) {
				var licenseStatus =  "Active";
			} else  {
				var licenseStatus = "Inactive";
			}
	//lwacht: 180613: story 5563: dates are off by a year
			//var licenseValidityStart ="" + dateFormatted(licStartDate.getMonth()+1,licStartDate.getDate(),licStartDate.getYear()+1899,"YYYY-MM-DD");
			if(!matches(AInfo["Valid From Date"],null,undefined,"")){
				var licStartDate = convertDate(AInfo["Valid From Date"]);
				var licenseValidityStart ="" + dateFormatted(licStartDate.getMonth()+1,licStartDate.getDate(),licStartDate.getYear()+1900,"YYYY-MM-DD");
			}else{
				validationMessage += " Record " + licenseNumber + " - Invalid Valid from Date";
			}
			var vLicenseObj = new licenseObject(licenseNumber);
			var expDate = vLicenseObj.b1ExpDate;
			if (expDate){
				var licExp = new Date(vLicenseObj.b1ExpDate);
				//var pYear = licExp.getYear() + 1899;
				var pYear = licExp.getYear() + 1900;
		//lwacht: 180613: story 5563: end
				var pMonth = licExp.getMonth();
				var pDay = licExp.getDate();
				if(pMonth<12){
					pMonth++;
				}else{
					pMonth=1;
				}
				if (pMonth > 9)
					var mth = pMonth.toString();
				else
					var mth = "0" + pMonth.toString();
				if (pDay > 9)
					var day = pDay.toString();
				else
					var day = "0" + pDay.toString();
				var licenseExpiration = "" + pYear.toString() + "-" + mth + "-" +  day;
			}else{
				validationMessage += " Record " + licenseNumber + "- Invalid Expiration Date";
			}
			var contDRP = getContactByType("Designated Responsible Party",capId);
			var contBsns = getContactByType("Business",capId);
			if (!matches(contDRP.phone3,null,undefined,"")){
				var drpPhoneNumber = ""+ contDRP.phone3.substr(0, 20);
			}else{
				validationMessage += " Record " + licenseNumber + "- Invalid DRP phone number";
			}
			if (!matches(contBsns.phone3,null,undefined,"")){
				var facilityPhone = ""+ contBsns.phone3.substr(0, 20);
			}else{
				validationMessage += " Record " + licenseNumber + " - Invalid Business phone number";
			}
			if (!matches(contDRP.email,null,undefined,"")){
				var drpEmail = "" + contDRP.email.substr(0, 255);
			}else{
				validationMessage += " Record " + licenseNumber + " - The DRP email address is null";
			}
	//Mhart 12072018 Story 5827 Remove logic to get Premise adress information form the business contact
				if(AInfo["Premise Address"]==null){
					var premiseAddress = "N/A";
				}else{
					if(!isUnicode(String(AInfo["Premise Address"]))){
						var premiseAddress = "" + AInfo["Premise Address"].substr(0, 100);
					}else{	
						validationMessage += " An illegal character has been found in Premise Address of " + licenseNumber;
					}
				}
			var premiseAddress2 = "";
			if(AInfo["Premise City"]==null){
				var premiseCity = "N/A";
			}else{
				var premiseCity = "" + AInfo["Premise City"].substr(0, 40);
			}
			if(AInfo["Premise County"]==null){
				validationMessage += " Record " + licenseNumber + "- The Premises County is null";
			}else{
				var premiseCounty = "" + AInfo["Premise County"].substr(0, 40);
			}
			if(AInfo["Premise State"]==null){
				var premiseState = "CA";
			}else{
				var premiseState = "" + AInfo["Premise State"].substr(0, 40);
			}
			if(AInfo["Premise Zip"]==null){
				var premiseZip = "";
			}else{
				var premiseZip = "" + AInfo["Premise Zip"].substr(0, 20);
			}
	//Mhart 12072018 Story 5827
			if(!matches(contDRP.firstName,null,undefined,"")){
				var drpFirstName = "" + contDRP.firstName.substr(0, 100);
			}else{
				validationMessage += " Record " + licenseNumber + "- The Designated Responsible Party first name is null";
			}
			if(!matches(contDRP.lastName,null,undefined,"")){
				var drpLastName = "" + contDRP.lastName.substr(0, 100);
			}else{
				validationMessage += " Record " + licenseNumber + "- The Designated Responsible Party last name is null";
			}
			if(AInfo["APN"]==null){
				validationMessage += " Record " + licenseNumber +  "- The Premise APN is null";
			}else{
				var apn = "" + AInfo["APN"].substr(0, 75);
			}
			if(AInfo["BOE Seller's Permit Number"]==null){
				var sellersPermitNumber = "N/A";
			}else{
				var sellersPermitNumber = "" + AInfo["BOE Seller's Permit Number"].substr(0, 50);
			}
		/*    */
		if (matches(validationMessage,null,undefined,"")){
			logDebug("------------------------------------------------");
			logDebug("NOTE: ANY FIELDS NOT REPRESENTED BELOW ARE BLANK");
			logDebug("LicenseNumber: " + licenseNumber);
			logDebug("LicenseName: " + legalBusinessName);
			logDebug("licenseType: " + licenseType);
			logDebug("licenseStatus: " + licenseStatus);
			logDebug("licenseValidityStart: " + licenseValidityStart);
			logDebug("licenseExpiration: " + licenseExpiration);
			logDebug("MobilePhoneNumber: " + drpPhoneNumber);
			logDebug("MainPhoneNumber: " + facilityPhone);
			logDebug("MainEmail: " + drpEmail);
			logDebug("Street1: " + premiseAddress);
			logDebug("Street2: " + premiseAddress2);
			logDebug("City: " + premiseCity);
			logDebug("County: " + premiseCounty);
			logDebug("State: " + premiseState);
			logDebug("PostalCode: " + premiseZip);
			logDebug("ManagerFirstName: " + drpFirstName);
			logDebug("ManagerLastName: " + drpLastName);
			logDebug("APN: " + apn);
			logDebug("SellerPermitNumber: " + sellersPermitNumber);
			logDebug("------------------------------------------------");

			////////////FORMAT DATA TO JSON////////////////////////////////////////////////////
				var jsonResult = {
					"LicenseNumber": licenseNumber,
					"LicenseName": legalBusinessName,
					"LicenseType": licenseType,
					"LicenseSubtype": "",
					"LicenseStatus": licenseStatus,
					"LicenseValidityStart": licenseValidityStart,
					"LicenseExpiration": licenseExpiration,
					"MobilePhoneNumber": drpPhoneNumber,
					"MainPhoneNumber": facilityPhone,
					"MainEmail": drpEmail,
					"PhysicalAddress": {
						"Street1": premiseAddress,
						"Street2": premiseAddress2,
						"Street3": "",
						"Street4": "",
						"City": premiseCity,
						"County": premiseCounty,
						"State": premiseState,
						"PostalCode": premiseZip
					},
					"ManagerFirstName": drpFirstName,
					"ManagerMiddleName": "",
					"ManagerLastName": drpLastName,
					"AssessorParcelNumber" : apn,
					"SellerPermitNumber" : sellersPermitNumber
				};
			}else{
				jsonResult = "Record " + licenseNumber + " was not processed due to validation errors: " + validationMessage;
			}
		}else{
			var jsonResult =  "Record " + licenseNumber + " is not a valid record number";			
		}
		return jsonResult;
	}catch (err){
		logDebug("A JavaScript Error occurred: licenseNumberToCatJson: " + err.message);
		logDebug(err.stack);
		aa.sendMail(sysFromEmail, emailAddress, "", "A JavaScript Error occurred: licenseNumberToCatJson: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
	}
}