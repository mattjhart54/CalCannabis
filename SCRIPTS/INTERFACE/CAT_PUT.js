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
showMessage = true
showDebug = true

var SCRIPT_VERSION = '1.0'

//////////////////////////////////////////////////////////////////////////////
/**^ IMPORTANT NOTE: Any Data pulled from EMSE API in Accela
* with class Java.Lang.String MUST be converted to Javascript String
* prior to JSON conversion. To do this add '' to the Java.String, this
* this will force it into a formal javascript string for
* JSON conversion and variable compatibility
*/

///////////REQUIRED ENTRIES, NO NULLS ACCEPTED////////////////////////////////////

function initiateCATPut(capIdStrings, url, key) {
    var dataJsonArray = [];
    for (var i = 0, len = capIdStrings.length; i < len; i++) {
        dataJsonArray.push(capIdToJSON(capIdStrings[i]));
    }

    ////////////FORMAT DATA TO JSON////////////////////////////////////////////////////
    var nData = {
        "Key" : key,
        "Data" : dataJsonArray
    };

    var nDataJson = JSON.stringify(nData);


    ///Validation of Data Formatting, disable after validation///
    aa.print(nDataJson);

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

    //todo return response codes
}

/*
* Converts the given capId to a CAT JSON representation
*/
function capIdToJSON(capId) {
        var licenseNo = capId.toString();
        var capID = aa.cap.getCapID(licenseNo).getOutput();
        var capScriptObj = aa.cap.getCap(capID);
        var capModel = (capScriptObj.getOutput()).getCapModel();
        var capName = '' + capModel.getSpecialText();
        var capType = '' + capModel.getCapType().getType();
        var capSubType = '' + capModel.getCapType().getSubType();
        var appStatus = '' + capModel.getCapStatus();
        var licenseNumber = '' + licenseNo;

        ///////////FUTURE EXPANSION SOCKETS (MORE CAN BE ADDED)////////////////////////////
        /** var expModel = capModel.getB1ExpirationModel();
        * var expDateJava = expModel.getExpDate();
        * var expDateStr = expModel.getExpDateString();
        */

        ///////////PHYSICAL ADDRESS ENTRIES//////////////////////////////////////////////
        var capViewModel = aa.cap.getCapViewBySingle(capID)
        var pAddressModel = capViewModel.getAddressModel();
        var pAddressLine1 = '' + pAddressModel.getAddressLine1();
        var pCity = '' + pAddressModel.getCity();
        var pCounty = '' + pAddressModel.getCounty();
        var pState = '' + pAddressModel.getState();
        var pZip = '' + pAddressModel.getZip();


        ////////////FORMAT DATA TO JSON////////////////////////////////////////////////////
        var jsonResult = {
                "LicenseNumber" : licenseNumber,
                "LicenseName" : capName,
                "LicenseType" : capType,
                "LicenseSubtype" : capSubType,
                "LicenseStatus" : appStatus,
                "PhysicalAddress" : {
                    "Street1" : pAddressLine1,
                    "Street2" : null,
                    "Street3" : null,
                    "Street4" : null,
                    "City" : pCity,
                    "County" : pCounty,
                    "State" : pState,
                    "PostalCode" : pZip
                }
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

//for testing
//initiateCATPut(['CAL17-0000053', 'TAL17-0000039'],'http://www.google.com', 'ABC123');
