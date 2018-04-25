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
    licenseNumber = "" + licenseNumber;
    capId = aa.cap.getCapID(licenseNumber).getOutput();
    var capScriptObj = aa.cap.getCap(capId);
    cap = capScriptObj.getOutput();
    var capModel = (capScriptObj.getOutput()).getCapModel();
	var AInfo = [];
	loadAppSpecific(AInfo);
    var legalBusinessName = AInfo["Legal Business Name"].substr(1,100);
	var firstThree = licenseNumber.substring(0, 3);
	if(firstThree == "CAL" || firstThree == "TAL") {
		var licenseType ="A-"+AInfo["License Type"];
	} else {
		var licenseType = "M-"+AInfo["License Type"];
	}
	//lwacht: 180424: story 5411/5412: only allowing 'active' and 'inactive' statuses
	if(capModel.getCapStatus() == "Active") {
		var licenseStatus =  "Active";
	} else  {
		var licenseStatus = "Inactive";
	}
    var licenseValidityStart = AInfo["Valid From Date"].replace("/","-");
    var vLicenseObj = new licenseObject(licenseNumber);
    var licExp = new Date(vLicenseObj.b1ExpDate);
	var pYear = licExp.getYear() + 1899;
	var pMonth = licExp.getMonth();
	var pDay = licenseExlicExppiration.getDate();
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
	var licenseExpiration = day + "/" + mth + "/" + pYear.toString();
	var contDRP = getContactByType("Designated Responsible Party",capId);
	var drpPhoneNumber = contDRP.phone3.substr(0, 20);
    var facilityPhone = AInfo["Premise Phone"].substr(0,20);
    var drpEmail = contDRP.email.substr(0, 255);
    var premiseAddress = stringValue(getAppSpecific("Premise Address"), 100);
    var premiseCity = AInfo["Premise City"].substr(0, 40);
    var premiseCounty = AInfo["Premise County"].substr(0, 40);
    var premiseState = AInfo["Premise State"].substr(0, 40);
    var premiseZip = AInfo["Premise Zip"].substr(0, 20);
    var drpFirstName = contDRP.firstName.substr(0, 100);
    var drpLastName = contDRP.lastName.substr(0, 100);
    var apn = AInfo["APN"].substr(0, 75);
    var sellersPermitNumber = AInfo["BOE Seller's Permit Number"].substr(0, 50);

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
            "Street2": "",
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
	logDebug("A JavaScript Error occurred: licenseNumberToCatJson " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: licenseNumberToCatJson: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}}