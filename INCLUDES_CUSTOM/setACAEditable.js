/**
 * TREE-742
 * Flips record to be editable in ACA 
 * Must be configured in ACA Classic admin to work properly
 * use Masterscript "cap" global or get capScript using aa.cap.getCap(capIdModel).getOuput()
 * @param {capScriptModel} inCapScriptModel 
 */
function setACAEditable(inCapScriptModel){
    var tempCapModel = inCapScriptModel.getCapModel();
    tempCapModel.setCapClass("EDITABLE");
    
    var results = aa.cap.editCapByPK(tempCapModel);
    return results.getSuccess();
}