/*------------------------------------------------------------------------------------------------------/
| Program : CAT_SET_ADD.js
| Event   : N/A
|
| Usage   : Adds the given capId to the CAT SET
| By: John Towell
/------------------------------------------------------------------------------------------------------*/
showMessage = true
showDebug = true

var SCRIPT_VERSION = '1.0'

function addToCATSet(capIdString) {
    var capId = aa.cap.getCapID(capIdString).getOutput();
    var addResult = aa.set.add('CAT_UPDATES', capId);

    return addResult;
}
//testing
//addToCATSet('TAL17-0000039');