/*------------------------------------------------------------------------------------------------------/
| Program : licenseNumberToCatJson.js
| Event   : N/A
|
| Usage   : Converts a license number into a CAT JSON object.
| By: John Towell
|
| Notes   : This file should contain all CDFA specific code for gathering CAT data.
/	180424: lwacht: story 5411: updated to conform to standards, simplify code
/------------------------------------------------------------------------------------------------------*/
function licenseNumberToCatJson(licenseNumber) {
try{
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
		var legalBusinessName = "" + AInfo["Legal Business Name"].substr(0, 100);
	}
	var firstThree = licenseNumber.substring(0, 3);
	if(firstThree == "CAL" || firstThree == "TAL" || firstThree == "PAL") {
		var licenseType ="A-"+AInfo["License Type"];
	} else {
		var licenseType = "M-"+AInfo["License Type"];
	}
	//lwacht: 180424: story 5411/5412: only allowing 'active' and 'inactive' statuses
	if(capModel.getCapStatus().indexOf("Active")==0) {
		var licenseStatus =  "Active";
	} else  {
		var licenseStatus = "Inactive";
	}
    var licStartDate = convertDate(AInfo["Valid From Date"]);
	//lwacht: 180613: story 5563: dates are off by a year
    //var licenseValidityStart ="" + dateFormatted(licStartDate.getMonth()+1,licStartDate.getDate(),licStartDate.getYear()+1899,"YYYY-MM-DD");
    var licenseValidityStart ="" + dateFormatted(licStartDate.getMonth()+1,licStartDate.getDate(),licStartDate.getYear()+1900,"YYYY-MM-DD");
    var vLicenseObj = new licenseObject(licenseNumber);
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
	var contDRP = getContactByType("Designated Responsible Party",capId);
	var contBsns = getContactByType("Business",capId);
	var drpPhoneNumber = ""+ contDRP.phone3.substr(0, 20);
    var facilityPhone = ""+ contDRP.phone3.substr(0, 20);
    var drpEmail = "" + contDRP.email.substr(0, 255);
	//going to use business address if premise address is not available
	var bsnsFound = false;
	if(AInfo["Premise Address"]==null){
		var capContactResult = aa.people.getCapContactByCapID(capId);
		if (capContactResult.getSuccess()){
			var Contacts = capContactResult.getOutput();
			for (var yy in Contacts){
				var thisContact = Contacts[yy].getCapContactModel();
				if(thisContact.contactType=="Business"){
					var newPeople = thisContact.getPeople();
					var addressList = aa.address.getContactAddressListByCapContact(thisContact).getOutput();
					var addrNotFound = true;
					for (g in addressList){
						thisAddr = addressList[g];
						if(thisAddr.addressType=="Business"){
							bsnsFound = true;
							var premiseAddress = "" + thisAddr.addressLine1;
							var premiseAddress2 = "" + thisAddr.addressLine2;
							var premiseCity = "" + thisAddr.city;
							var premiseCounty = "" + thisAddr.addressLine3;
							var premiseState = "" + thisAddr.state;
							var premiseZip = "" + thisAddr.zip;
						}
					}
				}
			}
		}
	}
	if(AInfo["Premise Address"]!=null || !bsnsFound){
		if(AInfo["Premise Address"]==null){
			var premiseAddress = "N/A";
		}else{
			var premiseAddress = "" + AInfo["Premise Address"].substr(0, 100);
		}
		var premiseAddress2 = "";
		if(AInfo["Premise City"]==null){
			var premiseCity = "N/A";
		}else{
			var premiseCity = "" + AInfo["Premise City"].substr(0, 40);
		}
		if(AInfo["Premise County"]==null){
			var premiseCounty = "N/A";
		}else{
			var premiseCounty = "" + AInfo["Premise County"].substr(0, 40);
		}
		if(AInfo["Premise State"]==null){
			var premiseState = "N/A";
		}else{
			var premiseState = "" + AInfo["Premise State"].substr(0, 40);
		}
		if(AInfo["Premise Zip"]==null){
			var premiseZip = "N/A";
		}else{
			 var premiseZip = "" + AInfo["Premise Zip"].substr(0, 20);
		}
	}
    var drpFirstName = "" + contDRP.firstName.substr(0, 100);
    var drpLastName = "" + contDRP.lastName.substr(0, 100);
	if(AInfo["APN"]==null){
		var apn = "N/A";
	}else{
		 var apn = "" + AInfo["APN"].substr(0, 75);
	}
	if(AInfo["BOE Seller's Permit Number"]==null){
		var sellersPermitNumber = "N/A";
	}else{
		 var sellersPermitNumber = "" + AInfo["BOE Seller's Permit Number"].substr(0, 50);
	}
	/*    */
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
	logDebug("SellerPermitNumber: " + apn);
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
    return jsonResult;
}catch (err){
	logDebug("A JavaScript Error occurred: licenseNumberToCatJson: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, emailAddress, "", "A JavaScript Error occurred: licenseNumberToCatJson: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
}}
