function getNonTableRequiredDocs4ACA() {

    var requirementArray = new Array();

    /*------------------------------------------------------------------------------------------------------/
    | Load up Record Types : NEEDS REVIEW, map variables to record types
    /------------------------------------------------------------------------------------------------------*/

    //Global requirements cross discipline
    var isConversionRequest                    = appMatch("Licenses/Cultivator/Conversion Request/NA");
	var isRenewal			                   = appMatch("Licenses/*/License/Renewal");
 

    /*------------------------------------------------------------------------------------------------------/
    | Load up Standard Requirements : NEEDS REVIEW, map variable to standard condition
    /------------------------------------------------------------------------------------------------------*/

    //License documentation requirements
    var premisesDiagram                        		= "Cultivation Plan - Detailed Premises Diagram";
    var lightingDiagram                             = "Cultivation Plan - Lighting Diagram";
	var pestManagementPlan							= "Cultivation Plan - Pest Management Plan";
	var wasteManagementPlan							= "Cultivation Plan - Waste Management Plan"; 
	var ceqaCompliance								= "Local - Evidence of CEQA Compliance";
	var electricityUsgae							= "Electricity Usage";


	//Remove all conditions first
	removeAllCapConditions();
	
	//Global documentation requirements

    if (isConversionRequest) {
		requirementArray.push(premisesDiagram);
		requirementArray.push(lightingDiagram);
		requirementArray.push(pestManagementPlan);
		requirementArray.push(wasteManagementPlan);
		requirementArray.push(ceqaCompliance);
    }
	
	if (isRenewal) {
		requirementArray.push(electricityUsgae);
    }

    return requirementArray;

}