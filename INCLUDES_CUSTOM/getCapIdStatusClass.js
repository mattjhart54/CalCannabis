/**
 * Gets record status class
 * COMPLETE = real record
 * INCOMPLETE TMP = Initial state of partial cap
 * INCOMPLETE CAP = In process cap/estimate that save and resumed
 * INCOMPLETE EST = Completed estimate/partial cap
 * EDITABLE = Complete cap re-opened for ACA edit
 * @param {capIdModel} inCapId
 */
function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
}