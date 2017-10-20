/*===========================================
Title: ASUA;LICENSES!CULTIVATOR!~!LICENSE
Purpose: Sends license to CAT when status becomes 'Inactive'
Author: John Towell
============================================== */

try{
    if(matches(appStatus, "Revoked", "Suspended")){
        addToCat(capId);
    }
}catch(err){
    logDebug("An error has occurred in ASUA;LICENSES!CULTIVATOR!~!LICENSE: Generic notifications: " + err.message);
    logDebug(err.stack);
}
