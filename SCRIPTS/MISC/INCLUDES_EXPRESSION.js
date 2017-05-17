/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_EXPRESSION.js
| Event   : N/A
|
| Usage   : Common Script to Include in expression to validate Buiseness rules  
|         : Can be shared across super agency
| Notes   : 08/26/2015, Ray Schug,     Initial Version 
|         
/------------------------------------------------------------------------------------------------------*/
// Standard variables.
var showMessage = false; 	// Set to true to see results in popup window
var showDebug = true; 		// Set to true to see debug messages in popup window
var disableTokens = false; 	// turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values

// variables for logDebug.
var message = ""; 								    // Message String
if (typeof debug === 'undefined') var debug = ""; 	// Debug String, do not re-define if calling multiple
var br = "<BR>"; 								    // Break Tag
var br = "\r";

function logDebug(dstr) {
    debug += dstr + br;
}

/******** STANDARD EXPRESSION FUNCTIONS *********/
var toPrecision = function(value) {
    var multiplier = 10000;
    return Math.round(value * multiplier) / multiplier;
}
function addDate(iDate, nDays) {
    if (isNaN(nDays)) {
        throw ("Day is a invalid number!");
    }
    return expression.addDate(iDate, parseInt(nDays));
}

function diffDate(iDate1, iDate2) {
    return expression.diffDate(iDate1, iDate2);
}

function parseDate(dateString) {
    return expression.parseDate(dateString);
}

function formatDate(dateString, pattern) {
    if (dateString == null || dateString == '') {
        return null;
    }
    return expression.formatDate(dateString, pattern);
}

/**** END STANDARD EXPRESSION FUNCTIONS ****/
function appMatch(ats) { // optional capId or CapID string
    var matchArray = appTypeArray //default to current app
    if (arguments.length == 2) {
        matchCapParm = arguments[1]
        if (typeof (matchCapParm) == "string")
            matchCapId = aa.cap.getCapID(matchCapParm).getOutput();   // Cap ID to check
        else
            matchCapId = matchCapParm;
        if (!matchCapId) {
            // logDebug("**WARNING: CapId passed to appMatch was not valid: " + arguments[1]);
            return false
        }
        matchCap = aa.cap.getCap(matchCapId).getOutput();
        matchArray = matchCap.getCapType().toString().split("/");
    }

    var isMatch = true;
    var ata = ats.split("/");
    // if (ata.length != 4)
    //    logDebug("**ERROR in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
    // else
    for (xx in ata)
        if (!ata[xx].equals(matchArray[xx]) && !ata[xx].equals("*")) isMatch = false;
    return isMatch;
}

function getAppSpecific(itemName) { // optional: itemCap
    var updated = false;
    var i = 0;
    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0)
        { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false }

        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();

        if (itemName != "") {
            for (i in appspecObj)
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup)) {
                return appspecObj[i].getChecklistComment();
                break;
            }
        } // item name blank
    }
    else
    { logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}

function getCapId(recordNum) {
    var getCapResult = aa.cap.getCapID(recordNum);

    if (getCapResult.getSuccess()) {
        return getCapResult.getOutput();
    } else {
        return false;
    }
}

function getExpirationStatus(capId) {
    b1ExpResult = aa.expiration.getLicensesByCapID(capId);
    if (b1ExpResult.getSuccess()) {
        this.b1Exp = b1ExpResult.getOutput();
        licStatus = this.b1Exp.getExpStatus();
        return licStatus;
    } else {
        return false;
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

function isActiveLicense(itemCap) { return matches(getExpirationStatus(itemCap), "Active", "About to Expire") }
function isLicenseType(appType, itemCap) { return appMatch(appType, itemCap) }

function isValidEmail(inputvalue) {
    var isValid = false;
    if (inputvalue != null && inputvalue != '') {

        var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
        if (pattern.test(inputvalue)) {
            isValid = true;
        } else {
            isValid = false;
        }
    } else {
        isValid = true;
    }
    return isValid;
}

// Valid Employer Identification Number
// Must be 9 numeric characters (Min and Max)
// Format is #########
function isValidEmployerIdentificationNumber(inputValue) {
    var isValid = true;
    if (inputValue != null && inputValue != '') {
        var einPattern = /^[0-9]{9}$/;
        isValid = inputValue.test(einPattern);
    }
    return isValid;
}

// Valid Federal Employer Identification Number
// Must be 9 numeric characters (Min and Max)
// Format is #########
function isValidFEIN(fein) {
    var isValid = true;
    if (fein != null && fein != '') {
        var einPattern = /^[0-9]{9}$/;
        isValid = fein.test(einPattern);
    }
    return isValid;
}

function isValidSsn(ssn) {
    var isValid = false;
    if (ssn != null && ssn != '') {
        var matchArr = ssn.match(/^(\d{3})-?\d{2}-?\d{4}$/);
        var numDashes = ssn.split('-').length - 1;
        if (matchArr == null || numDashes == 1) {
            isValid = false;
        }
        else {
            if (parseInt(matchArr[1], 10) == 0) {
                isValid = false;
            }
        }
    } else {
        isValid = true;
    }
    return isValid;
}

// Function to check phone number
// Not more than 9 characters
// Formats are (or combinations of
//  (###) ###-####, ###-###-####, 
//  (###) ###.####, ###.###.####
//  (###) ### ####, ### ### ####
function isValidPhoneNumber(inputvalue) {
    var isValid = false;
    if (inputvalue != null && inputvalue != '') {
        var pattern = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
        if (pattern.test(inputvalue)) {
            isValid = true;
        } else {
            isValid = false;
        }
    } else {
        isValid = true;
    }
    return isValid;
}

// Function to check routing number
// Not more than 9 characters
// Entry should be numeric
function isValidRoutingNumber(inputValue) {
    var isValid = true;
    if (inputValue != null && inputValue != '') {
        if (String(inputValue.value).length <= 9) {
            var routingNumberFormat = /^[0-9]{1,9}$/;
            isValid = routingNumberFormat.test(inputValue);
        }
    }
    return isValid;
}

function lookup(stdChoice, stdValue) {
    var strControl = null;          // RS 8/25/2015 Modified to return NULL if value is not found.
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else {
        logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
}

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] == eVal) {
            return true;
        }
    }
    return false;
}

function nextWorkDay(td) {
    // uses app server to return the next work day.
    // Only available in 6.3.2
    // td can be "mm/dd/yyyy" (or anything that will convert to JS date)

    if (!td)
        dDate = new Date();
    else
        dDate = convertDate(td);

    if (!aa.calendar.getNextWorkDay) {
        logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
    }
    else {
        var dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
    }

    return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear(); ;
}

function restrictASCII(inputValue) {
    var isValid = true;

    if (inputvalue != null && inputvalue != '') {
        string = inputValue;
        for (var i = 0; i < string.length; i++) {
            asciiNum = string.charCodeAt(i);
            if (((asciiNum < 10 && asciiNum > 7) && (asciiNum > 29 && asciiNum < 91) && (asciiNum = 92) && (asciiNum > 94 && asciiNum < 127) && (asciiNum = 130) && (asciiNum > 144 && asciiNum < 149) && (asciiNum = 150) && (asciiNum = 8211) && (asciiNum > 8215 && asciiNum < 8219) && (asciiNum > 8219 && asciiNum < 8222))) {
                isValid = isValid && true;
            }
            else {
                isValid = isValid && false;
            }
        }
    } else {
        isValid = true;
    }
    return isValid;
}

var toPrecisionFixed = function(value, digits) {
    return ((value * 1.0).toFixed(digits) * 1);
}

function getAge(birthDate) {
  var now = new Date();

  function isLeap(year) {
    return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
  }

  // days since the birthdate    
  var days = Math.floor((now.getTime() - birthDate.getTime())/1000/60/60/24);
  var age = 0;
  // iterate the years
  for (var y = birthDate.getFullYear(); y <= now.getFullYear(); y++){
    var daysInYear = isLeap(y) ? 366 : 365;
    if (days >= daysInYear){
      days -= daysInYear;
      age++;
      // increment the age only if there are available enough days for the year.
    }
  }
  return age;
}
//
function getSingleNodeval(fString,fName) {

var fValue =""
var subvalue = fString.substr(fString.indexOf(fName));
fValue = subvalue.substr(0,subvalue.indexOf(","));


if (fName=="officers"){
   fValue = subvalue.substr(0,subvalue.indexOf("],"))
   fValue = fValue.substr(fName.length+3,subvalue.indexOf("],") )+"]"; 
    if (fName=="ns2:FirstName") varCnt = varCnt + 1;  
   //fValue =  fValue.replace("\"","").replace("\"","");
    }else if (fName=="owners"){
    fValue = subvalue.substr(7,subvalue.indexOf("businessLicenseExpirationDate"));
    //fValue = fValue.replace("\"","").replace("\"","");
    fValue =  fValue.substr(0,fValue.lastIndexOf(","))
   }else if (fName=="physicalAddress"){
    fValue = subvalue.substr(18,subvalue.indexOf("firstName"));
   //fValue = fValue.replace("\"","").replace("\"","");
   fValue =  fValue.substr(0,fValue.lastIndexOf(","))
   }else
 {
    fValue = fValue.substr(fName.length+3,subvalue.indexOf(","));
    fValue = fValue.replace("\"","").replace("\"","").replace("}","");
    if (fName=="ns2:LastName") {
     fValue = subvalue.substr(16,10);
     fValue = fValue.replace("\"","").replace("\"","").replace("}","");
   }
   if (fName=="city") {
     fValue = subvalue.substr(6,20);
     fValue = fValue.replace("\"","").replace("\"","").replace("}","");
   }
 }


return fValue ;
            
}