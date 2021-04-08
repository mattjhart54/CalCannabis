function getAppSpecificInfo(capId) {
    capAppSpecificInfo = null;
    var s_result = aa.appSpecificInfo.getByCapID(capId);
    if (s_result.getSuccess()) {
        capAppSpecificInfo = s_result.getOutput();
        if (capAppSpecificInfo == null || capAppSpecificInfo.length == 0) {
            aa.print("WARNING: no appSpecificInfo on this CAP:" + capId);
            capAppSpecificInfo = null;
        }
    }
    else {
        aa.print("ERROR: Failed to appSpecificInfo: " + s_result.getErrorMessage());
        capAppSpecificInfo = null;
    }
    // Return AppSpecificInfoModel[] 
    return capAppSpecificInfo;
}