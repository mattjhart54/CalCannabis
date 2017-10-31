/*------------------------------------------------------------------------------------------------------/
| Program : initiateCatPut.js
| Event   : N/A
|
| Usage   : Initiates PUT to the CAT Licensing API
| By: John Towell
|
| Notes   : Houses all functions for communicating with the CAT Licensing API.
| Converts to JSON then Initiates Apache Common Http Client.  Currently only supports
| PUT as per CAT Idempotence Requirement.  This interface is one directional with Accela
| as the system of record.
|
| Dependencies : licenseNumberToCatJson.js
/------------------------------------------------------------------------------------------------------*/

function initiateCatPut(licenseNumStrings, url, key) {
    logDebug("license number strings: " + licenseNumStrings);
    var result = {
        totalCount : licenseNumStrings.length,
        activeCount : 0,
        inactiveCount: 0,
        errorRecordCount: 0,
        errorRecords: [],
        errors: [],
        resultCode: null,
        resultBody: null
    };
    var dataJsonArray = [];

    for (var i = 0, len = licenseNumStrings.length; i < len; i++) {
        try {
            var jsonData = licenseNumberToCatJson(licenseNumStrings[i]);
            if (jsonData["LicenseStatus"] === 'Active') {
                result.activeCount++;
            } else {
                result.inactiveCount++;
            }
            dataJsonArray.push(jsonData);
        } catch (err) {
            aa.print(err.stack);
            result.errorRecordCount++;
            var errorMessage = 'Error processing licenseNum ' + licenseNumStrings[i] + ' ' + err;
            result.errors.push(errorMessage);
            result.errorRecords.push(licenseNumStrings[i]);
            logDebug(errorMessage);
        }
    }

    ////////////FORMAT DATA TO JSON////////////////////////////////////////////////////
    var nData = {
        "Key": key,
        "Data": dataJsonArray
    };
    logDebug(JSON.stringify(nData, null, 4));
    var nDataJson = JSON.stringify(nData);

    var postResp = httpClientPut(url, nDataJson, 'application/json', 'utf-8');

    //if success, write out the response code and message. Otherwise, get the error message
    logDebug("//------------ begin JSON results -------------//");

    var response = postResp.getOutput();
    logDebug("Response code: " + response.resultCode);

    if (postResp.getSuccess()) {
        logDebug("Response message: " + response.result);
        exploreObject(response);
        result.resultCode = response.resultCode;
        result.resultBody = String(response.result);
        return new com.accela.aa.emse.dom.ScriptResult(true, null, null, result);
    } else {
        logDebug("Error message: " + postResp.getErrorMessage());
        return postResp;
    }
    logDebug("//------------ end JSON results -------------//");

    /**
     * ======================= PRIVATE FUNCTIONS ===========================
     *
     * Nested functions to reduce global namespace pollution
     */

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
        var scriptResult = new com.accela.aa.emse.dom.ScriptResult(resp_success, resp_errorType, resultObj.result, resultObj);

        return scriptResult;
    }

    /**
     * returns the object methods and properties
     *
     * @param {any} objExplore
     */
    function exploreObject(objExplore) {
        logDebug("Methods:");
        for (var x in objExplore) {
            if (typeof (objExplore[x]) == "function") {
                logDebug("   " + objExplore[x]);
            }
        }
        logDebug("");
        logDebug("Properties:");
        for (x in objExplore) {
            if (typeof (objExplore[x]) != "function") {
                logDebug("  <b> " + x + ": </b> " + objExplore[x]);
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
}
