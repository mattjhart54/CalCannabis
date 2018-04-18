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
//lwacht: 180417: story 5411: adding try/catch and removing functions not called elsewhere
function initiateCatPut(licenseNumStrings, url, key) {
try{
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
    //logDebug(JSON.stringify(nData, null, 4));
    var nDataJson = JSON.stringify(nData);

    var postResp = httpClientPut(url, nDataJson, 'application/json', 'utf-8');
	//content type and encoding are optional; if not sent default values
	var contentType =  "application/json";
	encoding = "utf-8";

	//build the http client, request content, and post method from the apache classes
	var httpClientClass = org.apache.commons.httpclient;
	var httpMethodParamsClass = org.apache.commons.params.HttpMethodParams;
	var httpClient = new httpClientClass.HttpClient();
	var putMethod = new httpClientClass.methods.PutMethod(url);

	httpClient.getParams().setParameter(httpMethodParamsClass.RETRY_HANDLER, new httpClientClass.DefaultHttpMethodRetryHandler());
	putMethod.addRequestHeader("Content-Type", contentType);
	putMethod.addRequestHeader("Content-Length", nDataJson.length);

	var requestEntity = new httpClientClass.methods.StringRequestEntity(nDataJson, contentType, encoding);
	putMethod.setRequestEntity(requestEntity);

	//set variables to catch and logic on response success and error type. build a result object for the data returned
	var resp_success = true;
	var resp_errorType = null;

	var resultObj = {
		resultCode: 999,
		result: null
	};
	resultObj.resultCode = httpClient.executeMethod(putMethod);
	resultObj.result = putMethod.getResponseBodyAsString();
	putMethod.releaseConnection();

	//if any response other than transaction success, set success to false and catch the error type string
	var statusCode = resultObj.resultCode;
	if (resultObj.resultCode.toString().substr(0, 1) !== '2') {
		resp_success = false;
		switch (statusCode) {
			case 100: resp_errorType =  "100 - Continue";
			case 101: resp_errorType =  "101 - Switching Protocols";
			case 200: resp_errorType =  "200 - OK, Tranmission Accepted";
			case 201: resp_errorType =  "201 - Created";
			case 202: resp_errorType =  "202 - Accepted";
			case 203: resp_errorType =  "203 - Non-Authoritative Information";
			case 204: resp_errorType =  "204 - No Content";
			case 205: resp_errorType =  "205 - Reset Content";
			case 206: resp_errorType =  "206 - Partial Content";
			case 300: resp_errorType =  "300 - Multiple Choices";
			case 301: resp_errorType =  "301 - Moved Permanently";
			case 302: resp_errorType =  "302 - Found";
			case 303: resp_errorType =  "303 - See Other";
			case 304: resp_errorType =  "304 - Not Modified";
			case 305: resp_errorType =  "305 - Use Proxy";
			case 306: resp_errorType =  "306 - (Unused)";
			case 307: resp_errorType =  "307 - Temporary Redirect";
			case 400: resp_errorType =  "400 - Bad Request";
			case 401: resp_errorType =  "401 - Unauthorized";
			case 402: resp_errorType =  "402 - Payment Required";
			case 403: resp_errorType =  "403 - Forbidden";
			case 404: resp_errorType =  "404 - Not Found";
			case 405: resp_errorType =  "405 - Method Not Allowed";
			case 406: resp_errorType =  "406 - Not Acceptable";
			case 407: resp_errorType =  "407 - Proxy Authentication Required";
			case 408: resp_errorType =  "408 - Request Timeout";
			case 409: resp_errorType =  "409 - Conflict";
			case 410: resp_errorType =  "410 - Gone";
			case 411: resp_errorType =  "411 - Length Required";
			case 412: resp_errorType =  "412 - Precondition Failed";
			case 413: resp_errorType =  "413 - Request Entity Too Large";
			case 414: resp_errorType =  "414 - Request-URI Too Long";
			case 415: resp_errorType =  "415 - Unsupported Media Type";
			case 416: resp_errorType =  "416 - Requested Range Not Satisfiable";
			case 417: resp_errorType =  "417 - Expectation Failed";
			case 500: resp_errorType =  "500 - Internal Server Error";
			case 501: resp_errorType =  "501 - Not Implemented";
			case 502: resp_errorType =  "502 - Bad Gateway";
			case 503: resp_errorType =  "503 - Service Unavailable";
			case 504: resp_errorType =  "504 - Gateway Timeout";
			case 505: resp_errorType =  "505 - HTTP Version Not Supported";
			default: resp_errorType = statusCode + " - Unknown Status Code";
		}
	}
	//resp_errorType = httpStatusCodeMessage(resultObj.resultCode);
	//create script result object with status flag, error type, error message, and output and return
	var postResp = new com.accela.aa.emse.dom.ScriptResult(resp_success, resp_errorType, resultObj.result, resultObj);
    //if success, write out the response code and message. Otherwise, get the error message
    var response = postResp.getOutput();
    logDebug("Response code: " + response.resultCode);
    if (postResp.getSuccess()) {
        logDebug("Response message: " + response.result);
        //exploreObject(response);
        result.resultCode = response.resultCode;
        result.resultBody = String(response.result);
        return new com.accela.aa.emse.dom.ScriptResult(true, null, null, result);
    } else {
        logDebug("Error retrieving postResp: " + postResp.getErrorMessage());
        return postResp;
    }
}catch (err){
	logDebug("A JavaScript Error occurred: initiateCatPut " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: initiateCatPut: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}}
