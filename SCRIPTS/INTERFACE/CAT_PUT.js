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
var showMessage = true;
var showDebug = true;

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

function initiateCATPut(capIdStrings, url, key) {
    aa.print("cap id strings: " + capIdStrings);
    var dataJsonArray = [];
    for (var i = 0, len = capIdStrings.length; i < len; i++) {
        dataJsonArray.push(capIdToJSON(capIdStrings[i]));
    }

    ////////////FORMAT DATA TO JSON////////////////////////////////////////////////////
    var nData = {
        "Key": key,
        "Data": dataJsonArray
    };
    aa.print(JSON.stringify(nData, null, 4));
    var nDataJson = JSON.stringify(nData);

    var postResp = httpClientPut(url, nDataJson, 'application/json', 'utf-8');

    //if success, write out the response code and message. Otherwise, get the error message
    //@ts-ignore
    aa.print("//------------ begin JSON results -------------//");

    var response = postResp.getOutput();
    // @ts-ignore
    aa.print("Response code: " + response.resultCode);

    if (postResp.getSuccess()) {
        // @ts-ignore
        aa.print("Response message: " + response.result);
        exploreObject(response);
    } else {
        // @ts-ignore
        aa.print("Error message: " + postResp.getErrorMessage());
    }
    //@ts-ignore
    aa.print("//------------ end JSON results -------------//");

    return postResp;
}

/*
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
        "SellersPermitNumber" : sellersPermitNumber
    };

    return jsonResult;
}


////////////////////////////3.1 APACHE CLIENT//////////////////////////////////
/**
 * Builds an Apache 3.1 Http client and submits the contents to the external service.
 *
 * @param {any} url  - The endpoint URL
 * @param {any} jsonString - The content string to be posted
 * @param {any} contentType - Optional. If undefined or empty, default to application/json
 * @param {any} encoding - Optional. If undefined or empty, default to utf-8
 * @returns ScriptResult object with status flag, error type, error message, and output
 */

function httpClientPut(url, jsonString, contentType, encoding) {
    //content type and encoding are optional; if not sent default values
    contentType = (typeof contentType != 'undefined') ? contentType : "application/json";
    encoding = (typeof encoding != 'undefined') ? encoding : "utf-8";

    //build the http client, request content, and post method from the apache classes
    //@ts-ignore
    var httpClientClass = org.apache.commons.httpclient;
    var httpMethodParamsClass = org.apache.commons.params.HttpMethodParams;
    var httpClient = new httpClientClass.HttpClient();
    var putMethod = new httpClientClass.methods.PutMethod(url);

    httpClient.getParams().setParameter(httpMethodParamsClass.RETRY_HANDLER, new httpClientClass.DefaultHttpMethodRetryHandler());
    putMethod.addRequestHeader("Content-Type", contentType);
    putMethod.addRequestHeader("Content-Length", jsonString.length);

    var requestEntity = new httpClientClass.methods.StringRequestEntity(jsonString, contentType, encoding);
    putMethod.setRequestEntity(requestEntity);

    //set variables to catch and logic on response success and error type. build a result object for the data returned
    var resp_success = true;
    var resp_errorType = null;

    var resultObj = {
        resultCode: 999,
        result: null
    };

    try {
        resultObj.resultCode = httpClient.executeMethod(putMethod);
        resultObj.result = putMethod.getResponseBodyAsString();
    } finally {
        putMethod.releaseConnection();
    }

    //if any response other than transaction success, set success to false and catch the error type string
    if (resultObj.resultCode.toString().substr(0, 1) !== '2') {
        resp_success = false;
        resp_errorType = httpStatusCodeMessage(resultObj.resultCode);
    }

    //create script result object with status flag, error type, error message, and output and return
    //@ts-ignore
    var scriptResult = new com.accela.aa.emse.dom.ScriptResult(resp_success, resp_errorType, resultObj.result, resultObj);

    return scriptResult;
}

/**
 * returns the object methods and properties
 *
 * @param {any} objExplore
 */
function exploreObject(objExplore) {
    //@ts-ignore
    aa.print("Methods:");
    for (var x in objExplore) {
        if (typeof (objExplore[x]) == "function") {
            //@ts-ignore
            aa.print("   " + objExplore[x]);
        }
    }
    //@ts-ignore
    aa.print("");
    //@ts-ignore
    aa.print("Properties:");
    for (x in objExplore) {
        if (typeof (objExplore[x]) != "function") {
            //@ts-ignore
            aa.print("  <b> " + x + ": </b> " + objExplore[x]);
        }
    }
}

/**
 * Takes a status code and returns the standard HTTP status code string
 *
 * @param {any} statusCode
 * @returns string of HTTP status code
 */
function httpStatusCodeMessage(statusCode) {
    switch (statusCode) {
        case 100:
            return "100 - Continue";
        case 101:
            return "101 - Switching Protocols";
        case 200:
            return "200 - OK, Tranmission Accepted";
        case 201:
            return "201 - Created";
        case 202:
            return "202 - Accepted";
        case 203:
            return "203 - Non-Authoritative Information";
        case 204:
            return "204 - No Content";
        case 205:
            return "205 - Reset Content";
        case 206:
            return "206 - Partial Content";
        case 300:
            return "300 - Multiple Choices";
        case 301:
            return "301 - Moved Permanently";
        case 302:
            return "302 - Found";
        case 303:
            return "303 - See Other";
        case 304:
            return "304 - Not Modified";
        case 305:
            return "305 - Use Proxy";
        case 306:
            return "306 - (Unused)";
        case 307:
            return "307 - Temporary Redirect";
        case 400:
            return "400 - Bad Request";
        case 401:
            return "401 - Unauthorized";
        case 402:
            return "402 - Payment Required";
        case 403:
            return "403 - Forbidden";
        case 404:
            return "404 - Not Found";
        case 405:
            return "405 - Method Not Allowed";
        case 406:
            return "406 - Not Acceptable";
        case 407:
            return "407 - Proxy Authentication Required";
        case 408:
            return "408 - Request Timeout";
        case 409:
            return "409 - Conflict";
        case 410:
            return "410 - Gone";
        case 411:
            return "411 - Length Required";
        case 412:
            return "412 - Precondition Failed";
        case 413:
            return "413 - Request Entity Too Large";
        case 414:
            return "414 - Request-URI Too Long";
        case 415:
            return "415 - Unsupported Media Type";
        case 416:
            return "416 - Requested Range Not Satisfiable";
        case 417:
            return "417 - Expectation Failed";
        case 500:
            return "500 - Internal Server Error";
        case 501:
            return "501 - Not Implemented";
        case 502:
            return "502 - Bad Gateway";
        case 503:
            return "503 - Service Unavailable";
        case 504:
            return "504 - Gateway Timeout";
        case 505:
            return "505 - HTTP Version Not Supported";
    }
    return statusCode + " - Unknown Status Code";
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
//initiateCATPut(['CAL17-0000053', 'TAL17-0000039', 'CML-0000229', 'TAL17-0000040'], 'http://www.google.com', 'ABC123');
