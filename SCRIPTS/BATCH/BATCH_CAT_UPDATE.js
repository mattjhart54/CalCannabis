/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CAT_UPDATE
| Version 1.0 - Base Version.
|
| Script to run nightly to send license updates to CAT
| Batch job name: CAT Nightly Update
/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//lwacht: 180418: story 5411: moving to batch folder, cleaning up
var maxSeconds = 4 * 60;				// number of seconds allowed for batch processing, usually < 5*60
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = true;	// Use Group name when populating Task Specific Info Values
var currentUserID = "ADMIN";
var publicUser = null;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var showDebug = true;	

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var startDate = new Date();
var startTime = startDate.getTime();
var timeExpired = false;
var message = "";						// Message String
var debug = "";							// Debug String
var br = "<BR>";						// Break Tag
var emailText = "";
var catAPIChunkSize = 10;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
	return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");

/*test params
aa.env.setValue("emailAddress", "lwacht@trustvip.com");
aa.env.setValue("baseUrl", "https://testing-services-ca.metrc.com/licenses/facility");
aa.env.setValue("apiKey", "6gka3YS4EzoZAG1jrsv-qhe5OszsP8SPJZ4ZoPOCjCGPK1Ra");
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
*/


var emailAddress = aa.env.getValue("emailAddress"); // email address to send failures
var baseUrl = aa.env.getValue("baseUrl"); // base url for CAT API
var apiKey = aa.env.getValue("apiKey"); // key for CAT API
var sysFromEmail = getParam("sysFromEmail");


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//
// Your variables go here
// Ex. var appGroup = getParam("Group");
//
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|-----------------------------------------------------------------------------------------------------+/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

var SET_ID = "CAT_UPDATES";

try {
    var theSet = aa.set.getSetByPK(SET_ID).getOutput();
    var status = theSet.getSetStatus();
    var setId = theSet.getSetID();
    var memberResult = aa.set.getCAPSetMembersByPK(SET_ID);
    if (!memberResult.getSuccess()) {
        logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage());
    } else {
        var members = memberResult.getOutput().toArray();
        var size = members.length;
        if (members.length > 0) {
            var compositeResult = {
                totalCount: size,
                activeCount: 0,
                inactiveCount: 0,
                errorRecordCount: 0,
                errorRecords: [],
                errors: []
            };
            logDebug("capSet: loaded set " + setId + " of status " + status + " with " + size + " records");
            var licenseNos = capIdsToLicenseNos(members);
            var start, end, licenseNosChunk;
            for (start = 0, end = licenseNos.length; start < end; start += catAPIChunkSize) { //chunk calls to the API
				if (elapsed() > maxSeconds) { // only continue if time hasn"t expired
					logDebug("WARNING: A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
					timeExpired = true ;
					break; 
				}
                licenseNosChunk = licenseNos.slice(start, start + catAPIChunkSize);
                var putResult = initiateCatPut1(licenseNosChunk, String(baseUrl), String(apiKey));
                if (putResult.getSuccess()) {
                    var resultObject = putResult.getOutput();
                    removeFromSet(licenseNosToCapIds(licenseNosChunk), resultObject.errorRecords);
                    compositeResult = {
                        totalCount: compositeResult.totalCount,
                        activeCount: compositeResult.activeCount + resultObject.activeCount,
                        inactiveCount: compositeResult.inactiveCount + resultObject.inactiveCount,
                        errorRecordCount: compositeResult.errorRecordCount + resultObject.errorRecordCount,
                        errorRecords: compositeResult.errorRecords.concat(resultObject.errorRecords),
                        errors: compositeResult.errors.concat(resultObject.errors)
                    };
                } else {
                    logDebug( "ERROR: " + putResult.getErrorType() + " " + putResult.getErrorMessage());
                }
            }
        } else {
            logDebug("Completed successfully: No records to process");
        }
    }
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
} catch (err) {
    logDebug("ERROR: " + err.message + " In " + batchJobName);
    logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function capIdsToLicenseNos(capIdArray) {
    var licenseNoArray = [];
    for (var i = 0, len = capIdArray.length; i < len; i++) {
        var licenseNo = aa.cap.getCap(capIdArray[i]).getOutput().getCapID().getCustomID();
        licenseNoArray.push(licenseNo.toString());
    }
    return licenseNoArray;
}

function licenseNosToCapIds(licenseNoArray) {
    var capIdArray = [];
    for (var i = 0, len = licenseNoArray.length; i < len; i++) {
        var capId = toCapId(licenseNoArray[i]);
        capIdArray.push(capId);
    }
    return capIdArray;
}

function toCapId(licenseNo) {
    return aa.cap.getCapID(licenseNo).getOutput();
}

function removeFromSet(capIds, errorLicenseNumbers) {
    for (var i = 0, len = capIds.length; i < len; i++) {
        var licenseNumber = capIds[i].getCustomID();
        if (contains(errorLicenseNumbers, licenseNumber)) {
            logDebug("error number " + licenseNumber + "/" + capIds[i] + " not removing from set");
        } else {
            var removeResult = aa.set.removeSetHeadersListByCap(SET_ID, capIds[i]);
            if (!removeResult.getSuccess()) {
                logDebug("**WARNING** error removing record from set " + SET_ID + " : " + removeResult.getErrorMessage());
            } else {
                logDebug("capSet: removed record " + capIds[i] + " from set " + SET_ID);
            }
        }
    }
}

function contains(stringArray, string) {
    for (var i = 0, len = stringArray.length; i < len; i++) {
        if (String(stringArray[i]) == String(string)) {
            return true;
        }
    }
    return false;
}



function licenseNumberToCatJson1(licenseNumber) {
try{
    licenseNumber = "" + licenseNumber;
    capId = aa.cap.getCapID(licenseNumber).getOutput();
    var capScriptObj = aa.cap.getCap(capId);
    cap = capScriptObj.getOutput();
    var capModel = (capScriptObj.getOutput()).getCapModel();
	var AInfo = [];
	loadAppSpecific(AInfo);
    var legalBusinessName = "" + AInfo["Legal Business Name"].substr(0,100);
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
    var licStartDate = convertDate(AInfo["Valid From Date"]);
    var licenseValidityStart ="" + dateFormatted(licStartDate.getMonth()+1,licStartDate.getDate(),licStartDate.getYear()+1899,"YYYY-MM-DD");
    var vLicenseObj = new licenseObject(licenseNumber);
    var licExp = new Date(vLicenseObj.b1ExpDate);
	var pYear = licExp.getYear() + 1899;
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
	/*
	logDebug("licenseNumber: " + licenseNumber);
	logDebug("legalBusinessName: " + legalBusinessName);
	logDebug("licenseType: " + licenseType);
	logDebug("licenseStatus: " + licenseStatus);
	logDebug("licenseValidityStart: " + licenseValidityStart);
	logDebug("licenseExpiration: " + licenseExpiration);
	logDebug("drpPhoneNumber: " + drpPhoneNumber);
	logDebug("drpEmail: " + drpEmail);
	logDebug("premiseAddress: " + premiseAddress);
	logDebug("premiseAddress2: " + premiseAddress2);
	logDebug("premiseCity: " + premiseCity);
	logDebug("premiseCounty: " + premiseCounty);
	logDebug("premiseState: " + premiseState);
	logDebug("premiseZip: " + premiseZip);
	logDebug("drpFirstName: " + drpFirstName);
	logDebug("drpLastName: " + drpLastName);
	logDebug("apn: " + apn);
	logDebug("sellersPermitNumber: " + sellersPermitNumber);
    */
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
	logDebug("A JavaScript Error occurred: licenseNumberToCatJson " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, emailAddress, "", "A JavaScript Error occurred: licenseNumberToCatJson: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
}}



function initiateCatPut1(licenseNumStrings, url, key) {
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
            var jsonData = licenseNumberToCatJson1(licenseNumStrings[i]);
            if (jsonData["LicenseStatus"] == 'Active') {
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
    logDebug("here: " + key);
    logDebug("here: " + JSON.stringify(nData, null, 4));
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
			case 100: resp_errorType =  "100 - Continue"; break;
			case 101: resp_errorType =  "101 - Switching Protocols";break;
			case 200: resp_errorType =  "200 - OK, Transmission Accepted";break;
			case 201: resp_errorType =  "201 - Created";break;
			case 202: resp_errorType =  "202 - Accepted";break;
			case 203: resp_errorType =  "203 - Non-Authoritative Information";break;
			case 204: resp_errorType =  "204 - No Content";break;
			case 205: resp_errorType =  "205 - Reset Content";break;
			case 206: resp_errorType =  "206 - Partial Content";break;
			case 300: resp_errorType =  "300 - Multiple Choices";break;
			case 301: resp_errorType =  "301 - Moved Permanently";break;
			case 302: resp_errorType =  "302 - Found";break;
			case 303: resp_errorType =  "303 - See Other";break;
			case 304: resp_errorType =  "304 - Not Modified";break;
			case 305: resp_errorType =  "305 - Use Proxy";break;
			case 306: resp_errorType =  "306 - (Unused)";break;
			case 307: resp_errorType =  "307 - Temporary Redirect";break;
			case 400: resp_errorType =  "400 - Bad Request";break;
			case 401: resp_errorType =  "401 - Unauthorized";break;
			case 402: resp_errorType =  "402 - Payment Required";break;
			case 403: resp_errorType =  "403 - Forbidden";break;
			case 404: resp_errorType =  "404 - Not Found";break;
			case 405: resp_errorType =  "405 - Method Not Allowed";break;
			case 406: resp_errorType =  "406 - Not Acceptable";break;
			case 407: resp_errorType =  "407 - Proxy Authentication Required";break;
			case 408: resp_errorType =  "408 - Request Timeout";break;
			case 409: resp_errorType =  "409 - Conflict";break;
			case 410: resp_errorType =  "410 - Gone";break;
			case 411: resp_errorType =  "411 - Length Required";break;
			case 412: resp_errorType =  "412 - Precondition Failed";break;
			case 413: resp_errorType =  "413 - Request Entity Too Large";break;
			case 414: resp_errorType =  "414 - Request-URI Too Long";break;
			case 415: resp_errorType =  "415 - Unsupported Media Type";break;
			case 416: resp_errorType =  "416 - Requested Range Not Satisfiable";break;
			case 417: resp_errorType =  "417 - Expectation Failed";break;
			case 500: resp_errorType =  "500 - Internal Server Error";break;
			case 501: resp_errorType =  "501 - Not Implemented";break;
			case 502: resp_errorType =  "502 - Bad Gateway";break;
			case 503: resp_errorType =  "503 - Service Unavailable";break;
			case 504: resp_errorType =  "504 - Gateway Timeout";break;
			case 505: resp_errorType =  "505 - HTTP Version Not Supported";break;
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
	logDebug("A JavaScript Error occurred: initiateCatPut: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, emailAddress, "", "A JavaScript Error occurred: initiateCatPut: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
}}