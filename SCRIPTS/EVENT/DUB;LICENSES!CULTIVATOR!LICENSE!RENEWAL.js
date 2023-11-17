/* Unable to get AppSpecific Data in DUB
var AInfo = new Array()     
loadAppSpecific4ACA(AInfo,capId);
if (publicUser) {
	cultPlan = false;
    for (idx = 0; idx < documentModelArray.size(); idx++) {
        var docCat = String(documentModelArray.get(idx).getDocCategory());
        if(docCat == "Cultivation Plan - Detailed Premises Diagram"){
        	cultPlan = true;
        }
    }
    if (cultPlan && AInfo['License Change'] == "No"){
    	cancel = true;
        showMessage = true;
        message = "A cultivation license size change was not selected and a premises diagram is not required. For further questions, please contact the Department of Cannabis Control by calling 1-844-61-CA-DCC (1-844-612-2322) or by sending an email to licensing@cannabis.ca.gov.";
    }

}
*/
