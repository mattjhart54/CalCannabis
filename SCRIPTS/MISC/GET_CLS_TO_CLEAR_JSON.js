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
		//recParmVal = "LCA23-0000046"
		var validRec = "Y";
		var licType = "";
		var appTYpeString = "";
		var licNbr = "";
		var lappNbr = "";
		var county = "";
		var legalBusinessName = "";
		var contDrp = "";
		var address = "";
		var licType = "";
		var licIssType = "";
		var capStatus = "";
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
			var AInfo = [];
			loadAppSpecific(AInfo);
		
			if (!matches(AInfo["Legal Business Name"], null, undefined, "")) {
				legalBusinessName = "" + AInfo["Legal Business Name"];
			}
			var firstThree = String(recParmVal.substr(0,3));
			var lastTen =  String(recParmVal.substr(3,10));
			if (firstThree == "CCL") {
				licNbr = recParmVal;
				appNbr = "LCA" + lastTen;
			} else {
				if (firstThree == "LCA") {
					appNbr = recParmVal;
					licNbr = "";
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
		
			capStatus = cap.getCapStatus();
		
			if (!matches(AInfo["APN"], null, undefined, ""))
				APN = AInfo["APN"];
			
			var contDRP = getContactByType("Designated Responsible Party", capId);
			var DRPName = contDRP.firstName + " " + contDRP.lastName;
		}

		logDebug("------------------------------------------------");
		logDebug("Valid Record: " + validRec);
		logDebug("LicenseType: " + licType);
		logDebug("Record Type: " + appTypeString);
		logDebug("License Number: " + licNbr);
		logDebug("Application Number: " + appNbr);
		logDebug("County: " + county); 
		logDebug("Business Name: " + legalBusinessName);
		logDebug("License Name: " + DRPName);
		logDebug("Premises Address Information: " + address);
		logDebug("Annual or Provisional: " + licIssType);
		logDebug("License Status: " + capStatus);
		logDebug("Assessor Parcel Number(APN): " + APN);
	
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
			"License Status": capStatus,
			"Assessor Parcel Number(APN)": APN,
		}

		return jsonResult;
	} catch (err) {
		logDebug("A JavaScript Error occurred: licenseNumberToCatJson: " + err.message);
		logDebug(err.stack);
		aa.sendMail(sysFromEmail, emailAddress, "", "A JavaScript Error occurred: licenseNumberToCatJson: " + startDate, "capId: " + capId + br + err.message + br + err.stack);
	}
}
