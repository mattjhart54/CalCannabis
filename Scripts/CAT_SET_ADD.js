/*------------------------------------------------------------------------------------------------------/
| Program : CAT_SET_ADD.js
| Event   : N/A
|
| Usage   : Adds the given capId to the CAT SET
| By: John Towell
/------------------------------------------------------------------------------------------------------*/
showMessage = true;
showDebug = true;
var SET_ID = 'CAT_UPDATES';
var SCRIPT_VERSION = '1.0';


function addToCATSet(licenseNumberString) {
    var createResult = createSetIfNeeded();
    if(!createResult.getSuccess()) {
        return createResult;
    }
    var capId = aa.cap.getCapID(licenseNumberString).getOutput();
    var addResult = aa.set.add('CAT_UPDATES', capId);

    return addResult;
}

function createSetIfNeeded() {
    var theSetResult = aa.set.getSetByPK(SET_ID);
    if (!theSetResult.getSuccess()) {
        theSetResult = aa.set.createSet(SET_ID, SET_ID, null, null);
    }

    return theSetResult;
}

//testing
//addToCATSet('TAL17-0000039');