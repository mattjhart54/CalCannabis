/*------------------------------------------------------------------------------------------------------/
| Program : CAT_PUT.js
| Event   : N/A
|
| Usage   : Initiates PUT to the CAT Licensing API
| By: John Towell
|
| Notes   : Houses all functions for communicating with the CAT Licensing API.
| Converts to JSON then Initiates Apache Common Http Client.  Currently only supports
| PUT as per CAT Idempotence Requirement.  This interface is one directional with Accela
| as the system of record.
/------------------------------------------------------------------------------------------------------*/
var _debug = false;

var SCRIPT_VERSION = '3.0';

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_CUSTOM_GLOBALS"));


function getScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
    return emseScript.getScriptText() + "";
}

/**
 * Converts the given capId to a CAT JSON representation
 */
function capIdToJSON(licenseNumber) {
    useAppSpecificGroupName = false;
    licenseNumber = '' + licenseNumber;
    capId = aa.cap.getCapID(licenseNumber).getOutput();
    var capScriptObj = aa.cap.getCap(capId);
    cap = capScriptObj.getOutput();
    var capModel = (capScriptObj.getOutput()).getCapModel();

    var legalBusinessName = '' + getAppSpecific('Legal Business Name');
    var licenseType = getLicenseType(licenseNumber, '' + getAppSpecific('License Type'));
    var licenseStatus = getLicenseStatus('' + capModel.getCapStatus());
    var licenseValidityStart = '' + getAppSpecific('Valid From Date');
    var vLicenseObj = new licenseObject(licenseNumber);
    var licenseExpiration = '' + vLicenseObj.b1ExpDate;
    var drpPhoneNumber = '' + getDRPInfo('phone3');
    var facilityPhone = '' + getAppSpecific('Premise Phone');
    var drpEmail = '' + getDRPInfo('email');
    var premiseAddress = '' + getAppSpecific('Premise Address');
    var premiseCity = '' + getAppSpecific('Premise City');
    var premiseCounty = '' + getAppSpecific('Premise County');
    var premiseState = '' + getAppSpecific('Premise State');
    var premiseZip = '' + getAppSpecific('Premise Zip');
    var drpFirstName = '' + getDRPInfo('firstName');
    var drpLastName = '' + getDRPInfo('lastName');
    var apn = '' + getAppSpecific('APN');
    var sellersPermitNumber = '' + getAppSpecific('BOE Seller\'s Permit Number');

    ////////////FORMAT DATA TO JSON////////////////////////////////////////////////////
    var jsonResult = {
        "LicenseNumber": licenseNumber,
        "LicenseName": legalBusinessName,
        "LicenseType": licenseType,
        "LicenseSubtype": "N/A",
        "LicenseStatus": licenseStatus,
        "LicenseValidityStart": licenseValidityStart,
        "LicenseExpiration": licenseExpiration,
        "MobilePhoneNumber": drpPhoneNumber,
        "MainPhoneNumber": facilityPhone,
        "MainEmail": drpEmail,
        "PhysicalAddress": {
            "Street1": premiseAddress,
            "Street2": null,
            "Street3": null,
            "Street4": null,
            "City": premiseCity,
            "County": premiseCounty,
            "State": premiseState,
            "PostalCode": premiseZip
        },
        "ManagerFirstName": drpFirstName,
        "ManagerMiddleName": null,
        "ManagerLastName": drpLastName,
        "AssessorParcelNumber" : apn,
        "SellerPermitNumber" : sellersPermitNumber
    };

    return jsonResult;
}


////////////////////////////3.1 APACHE CLIENT//////////////////////////////////


/**
 * returns the object methods and properties
 *
 * @param {any} objExplore
 */
function exploreObject(objExplore) {
    _logDebug("Methods:");
    for (var x in objExplore) {
        if (typeof (objExplore[x]) == "function") {
            _logDebug("   " + objExplore[x]);
        }
    }
    _logDebug("");
    _logDebug("Properties:");
    for (x in objExplore) {
        if (typeof (objExplore[x]) != "function") {
            _logDebug("  <b> " + x + ": </b> " + objExplore[x]);
        }
    }
}

/**
 * Override the logDebug function to work for this script
 */
function _logDebug(dstr){
    if(_debug) {
        aa.print(dstr);
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

// ['firstName']);
// aa.print('last name = ' + contactArray[i]['lastName']);
// aa.print('email = ' + contactArray[i]['email']);

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


//for testing
//var catPutResult = initiateCATPut(['CAL17-0000053', 'TAL17-0000039', 'CML-0000229', 'TAL17-0000040','LCA17-0000060'], 'https://mojfcfpmt1.execute-api.us-east-1.amazonaws.com/test/cat-update', 'ABC123');
//aa.print(JSON.stringify(catPutResult.getOutput(), null, 4));
