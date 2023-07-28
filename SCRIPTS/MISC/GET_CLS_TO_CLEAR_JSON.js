var replacer = function (key, value) {
    var returnValue = value;
    try {
        if (value.getClass() !== null) { // If Java Object
            if (value instanceof java.lang.Number) {
                returnValue = 1 * value;
            } else if (value instanceof java.lang.Boolean) {
                returnValue = value.booleanValue();
            } else { // if (value instanceof java.lang.String) 
                returnValue = '' + value;
            }
        }
    } catch (err) {

    }
    return returnValue;
};

var response;

try {
    var reqjson = JSON.stringify(aa.env.getValue("request"), replacer);
    try {
        var request = JSON.parse(reqjson);
        try {
            aa.env.setValue("response", ClsRecToClearJson(request));
        } catch (err) {
            aa.env.setValue("response", "eval error: " + err);
        }
    } catch (err) {
        aa.env.setValue("response", "request error: " + err);
    }
} catch (err) {
    aa.env.setValue("response", "regjson error: " + err);
}

function ClsRecToClearJson(recParmVal) {
	try {
//		recParmVal = "CCL23-0000003"
		var validRec = "Y";
		var licType = "";
		var appTypeString = "";
		var licNbr = "";
		var appNbr = "";
		var county = "";
		var legalBusinessName = "";
		var contDrp = "";
		var address = "";
		var licIssType = "";
		var licStatus = "";
		var APN = "";
		var recId = aa.cap.getCapID(recParmVal);

		if (!recId.getSuccess()) {
			validRec = "N";
		} else {
			capId = recId.getOutput();
			var capScriptObj = aa.cap.getCap(capId);
			cap = capScriptObj.getOutput();
			appTypeResult = cap.getCapType();
			appTypeString = appTypeResult.toString();
			appTypeArray = appTypeString.split("/");
			capStatus = cap.getCapStatus();
			var AInfo = [];
			loadAppSpecific(AInfo);
		
			if (!matches(AInfo["Legal Business Name"], null, undefined, "")) {
				legalBusinessName = "" + AInfo["Legal Business Name"];
			}
			var firstThree = String(recParmVal.substr(0,3));
			var lastTen =  String(recParmVal.substr(3,10));
			if (firstThree == "CCL") {
				licNbr = recParmVal;
				licStatus = capStatus;
				appNbr = "LCA" + lastTen;
			} else {
				if (firstThree == "LCA") {
					appNbr = recParmVal;
					if(capStatus == 'License Issued' || capStatus == 'Provisional License Issued') {
						licNbr = "CCL" + lastTen;
						var licId = aa.cap.getCapID(licNbr);
						licCapId = licId.getOutput();
						var licCapScriptObj = aa.cap.getCap(licCapId);
						licCap = licCapScriptObj.getOutput();
						licStatus = licCap.getCapStatus();
					} else {
						licNbr = "";
						licStatus = "";
					}
				} else {
					validRec = "N"
				}
			}
			if (!matches(AInfo["Premise County"], null, undefined, ""))
				county = AInfo["Premise County"];
				
			if (!matches(AInfo["Premise Address"], null, undefined, ""))
				address = AInfo["Premise Address"];
			
			if (!matches(AInfo["License Type"], null, undefined, ""))
				licType = AInfo["License Type"];
		
			if (!matches(AInfo["License Issued Type"], null, undefined,""))
				licIssType = AInfo["License Issued Type"];
		
			if (!matches(AInfo["APN"], null, undefined, ""))
				APN = AInfo["APN"];
			
			var contDRP = getContactByType("Designated Responsible Party", capId);
			var DRPName = contDRP.firstName + " " + contDRP.lastName;
		}

		aa.print("------------------------------------------------");
		aa.print("Valid Record: " + validRec);
		aa.print("LicenseType: " + licType);
		aa.print("Record Type: " + appTypeString);
		aa.print("License Number: " + licNbr);
		aa.print("Application Number: " + appNbr);
		aa.print("County: " + county); 
		aa.print("Business Name: " + legalBusinessName);
		aa.print("License Name: " + DRPName);
		aa.print("Premises Address Information: " + address);
		aa.print("Annual or Provisional: " + licIssType);
		aa.print("License Status: " + licStatus);
		aa.print("Assessor Parcel Number(APN): " + APN);
	
		///	FORMAT DATA TO JSON  ///
		var jsonResult = {
			"Valid Record": validRec,
			"Record Type": appTypeString,
			"License Number": licNbr,
			"Application Number": appNbr,
			"County": county,
			"Business Name": legalBusinessName,
			"License Name": DRPName,
			"Premises Address Information": address,
			"License Type": licType,
			"Annual or Provisional": licIssType,
			"License Status": licStatus,
			"Assessor Parcel Number(APN)": APN,
		}

		return jsonResult;
	} catch (err) {
		aa.print("A JavaScript Error occurred: GET_CLS_TO_CLEAR_JSON: " + err.message);
		aa.print(err.stack);
		aa.sendMail("noreply@accela.com", "evontrapp@etechconsultingllc.com", "", "A JavaScript Error occurred: GET_CLS_TO_CLEAR_JSON: " + new Date(), "capId: " + capId + "<br>" + err.message + "<br>" + err.stack);
	}
}

function loadAppSpecific(thisArr) {
    // Returns an associative array of App Specific Info
    // Optional second parameter, cap ID to load from

    var itemCap = capId;
	var useAppSpecificGroupName = false;
    if (arguments.length == 2)
        itemCap = arguments[1]; // use cap ID specified in args

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var fAppSpecInfoObj = appSpecInfoResult.getOutput();

        for (loopk in fAppSpecInfoObj) {
            if (useAppSpecificGroupName)
                thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
            else
                thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
        }
    }
}

function getContactByType(conType, capId) {
    var contactArray = getPeople(capId);
    for (thisContact in contactArray) {
        if ((contactArray[thisContact].getPeople().contactType).toUpperCase() == conType.toUpperCase())
            return contactArray[thisContact].getPeople();
    }

    return false;
}

function getPeople(capId) {
    capPeopleArr = null;
    var s_result = aa.people.getCapContactByCapID(capId);

    if (s_result.getSuccess()) {
        capPeopleArr = s_result.getOutput();
        if (capPeopleArr != null || capPeopleArr.length > 0) {
            for (loopk in capPeopleArr) {
                var capContactScriptModel = capPeopleArr[loopk];
                var capContactModel = capContactScriptModel.getCapContactModel();
                var peopleModel = capContactScriptModel.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
                if (contactAddressrs.getSuccess()) {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    peopleModel.setContactAddressList(contactAddressModelArr);
                }
            }
        } else {
            aa.print("WARNING: no People on this CAP:" + capId);
            capPeopleArr = null;
        }
    } else {
        aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
        capPeopleArr = null;
    }

    return capPeopleArr;
}

function convertContactAddressModelArr(contactAddressScriptModelArr) {
    var contactAddressModelArr = null;
    if (contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0) {
        contactAddressModelArr = aa.util.newArrayList();
        for (loopk in contactAddressScriptModelArr) {
            contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
        }
    }

    return contactAddressModelArr;
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 
