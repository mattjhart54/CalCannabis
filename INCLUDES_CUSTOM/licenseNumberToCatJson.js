/*------------------------------------------------------------------------------------------------------/
| Program : licenseNumberToCatJson.js
| Event   : N/A
|
| Usage   : Converts a license number into a CAT JSON object.
| By: John Towell
|
| Notes   : This file should contain all CDFA specific code for gathering CAT data.
/------------------------------------------------------------------------------------------------------*/
function licenseNumberToCatJson(licenseNumber) {
    useAppSpecificGroupName = false;
    licenseNumber = '' + licenseNumber;
    capId = aa.cap.getCapID(licenseNumber).getOutput();
    var capScriptObj = aa.cap.getCap(capId);
    cap = capScriptObj.getOutput();
    var capModel = (capScriptObj.getOutput()).getCapModel();

    var legalBusinessName = stringValue(getAppSpecific('Legal Business Name'), 100);
    var licenseType = getLicenseType(licenseNumber, '' + getAppSpecific('License Type'));
    var licenseStatus = getLicenseStatus('' + capModel.getCapStatus());
    var licenseValidityStart = dateFormat(stringValue(getAppSpecific('Valid From Date')));
    var vLicenseObj = new licenseObject(licenseNumber);
    var licenseExpiration = dateFormat(stringValue(vLicenseObj.b1ExpDate));
    var drpPhoneNumber = stringValue(getDRPInfo('phone3'), 20);
    var facilityPhone = stringValue(getAppSpecific('Premise Phone'), 20);
    var drpEmail = stringValue(getDRPInfo('email'), 255);
    var premiseAddress = stringValue(getAppSpecific('Premise Address'), 100);
    var premiseCity = stringValue(getAppSpecific('Premise City'), 40);
    var premiseCounty = stringValue(getAppSpecific('Premise County'), 40);
    var premiseState = stringValue(getAppSpecific('Premise State'), 40);
    var premiseZip = stringValue(getAppSpecific('Premise Zip'), 20);
    var drpFirstName = stringValue(getDRPInfo('firstName'), 100);
    var drpLastName = stringValue(getDRPInfo('lastName'), 100);
    var apn = stringValue(getAppSpecific('APN'), 75);
    var sellersPermitNumber = stringValue(getAppSpecific('BOE Seller\'s Permit Number'), 50);

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

    /**
     * ======================= PRIVATE FUNCTIONS ===========================
     *
     * Nested functions to reduce global namespace pollution
     */


    /**
     * Returns the string value or empty string ("") for nulls, can also optionally truncate
     */
    function stringValue(value, length) {
        var result = '' + value;
        if("null" == result) {
            return "";
        } else if ("undefined" == result) {
            return "";
        } else {
            if(length) {
                return truncate(result, length);
            } else {
                return result;
            }
        }
    }

    /**
     * Truncates the value if it is longer then length
     */
    function truncate(value, length) {
        if(value.length > length) {
            return value.substring(0, length);
        } else {
            return value;
        }
    }

    /**
     * Formats the date to CAT format YYYY-MM-DD
     */
    function dateFormat(value) {
        if(value == "") {
            return value;
        } else {
            var dateSplit = value.split("/");
            return dateSplit[2] + "-" + dateZeroPad(dateSplit[0]) + "-" + dateZeroPad(dateSplit[1]);
        }
    }

    /**
     * Left pads the string digit with zero for single digits.
     */
    function dateZeroPad(value) {
        if(value.length === 1) {
            return "0"+value;
        } else {
            return value;
        }
    }

    /**
     * Returns the CAT license status based on this license status
     */
    function getLicenseStatus(licenseStatus) {
        if(licenseStatus === 'Active') {
            return 'Active';
        } else  {
            return 'Inactive';
        }
    }

    /**
     * Returns the CAT license type based on license number and license Type
     */
    function getLicenseType(licenseNumber, licenseType) {
        var firstThree = licenseNumber.substring(0, 3);
        if(firstThree === 'CAL' || firstThree === "TAL") {
            return "A-"+licenseType;
        } else {
            return "M-"+licenseType;
        }
    }

    /**
     * Returns information from the DRP contact array
     */
    function getDRPInfo(name) {
        var contactArray = getContactArrayLocal();
        for (var i = 0, len = contactArray.length; i < len; i++) {
            if (contactArray[i]['contactType'] = 'Designated Responsible Party') {
                return '' + contactArray[i][name];
            }
        }
    }

    /**
     * Similar to getContactArray() global function except it adds phone3 which we need.
     */
    function getContactArrayLocal() {
        // Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
        // optional capid
        // added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
        // on ASA it should still be pulled normal way even though still partial cap
        var thisCap = capId;
        if (arguments.length == 1) thisCap = arguments[0];

        var cArray = new Array();

        if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
        {
            capContactArray = cap.getContactsGroup().toArray();
        }
        else {
            var capContactResult = aa.people.getCapContactByCapID(thisCap);
            if (capContactResult.getSuccess()) {
                var capContactArray = capContactResult.getOutput();
            }
        }

        if (capContactArray) {
            for (yy in capContactArray) {
                var aArray = new Array();
                aArray["lastName"] = capContactArray[yy].getPeople().lastName;
                aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
                aArray["firstName"] = capContactArray[yy].getPeople().firstName;
                aArray["middleName"] = capContactArray[yy].getPeople().middleName;
                aArray["businessName"] = capContactArray[yy].getPeople().businessName;
                aArray["contactSeqNumber"] = capContactArray[yy].getPeople().contactSeqNumber;
                aArray["contactType"] = capContactArray[yy].getPeople().contactType;
                aArray["relation"] = capContactArray[yy].getPeople().relation;
                aArray["phone1"] = capContactArray[yy].getPeople().phone1;
                aArray["phone3"] = capContactArray[yy].getPeople().phone3;
                aArray["email"] = capContactArray[yy].getPeople().email;
                aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
                aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
                aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
                aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
                aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
                aArray["fax"] = capContactArray[yy].getPeople().fax;
                aArray["notes"] = capContactArray[yy].getPeople().notes;
                aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
                aArray["fullName"] = capContactArray[yy].getPeople().fullName;
                aArray["peopleModel"] = capContactArray[yy].getPeople();

                var pa = new Array();

                if (arguments.length == 0 && !cap.isCompleteCap()) {
                    var paR = capContactArray[yy].getPeople().getAttributes();
                    if (paR) pa = paR.toArray();
                }
                else
                    var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
                for (xx1 in pa)
                    aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

                cArray.push(aArray);
            }
        }
        return cArray;
    }
}
