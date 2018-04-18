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
try{
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
}catch (err){
	logDebug("A JavaScript Error occurred: httpClientPut " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: httpClientPut: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}}