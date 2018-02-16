//lwacht: 180215: story 4796: if the workflow is closed, update the parent admin record
try{
	if(!isTaskActive("Amendment Review")){
		if(parentCapId){
			if(DEFICIENCIES.length>0){
				var parTblDef = loadASITable("DEFICIENCIES", parentCapId);
				var oldRecd = true;
				for(rP in parTblDef){
					for(rT in DEFICIENCIES){
						if(!matches(parTblDef[rP]["UID"], "",null, "undefined")){
							if(""+parTblDef[rP]["UID"]==""+DEFICIENCIES[rT]["UID"]){
								oldRecd = false;
								var tblRow = [];
								parTblDef[rP]["Deficiency Type"] = parTblDef[rP]["Deficiency Type"];
								parTblDef[rP]["Deficiency Details"] = parTblDef[rP]["Deficiency Detail"];
								parTblDef[rP]["Resolution"] = DEFICIENCIES[rT]["Resolution"];
								parTblDef[rP]["Additional Notes"] = DEFICIENCIES[rT]["Additional Notes"];
								parTblDef[rP]["Status"] = DEFICIENCIES[rT]["Status"];
								parTblDef[rP]["UID"] = parTblDef[rP]["UID"];
							}
						}
					}
				}
				if(oldRecd){
					showMessage=true;
					comment("<font color='purple'>NOTE: The Deficiency table was not updated to have unique identifiers. The parent record will NOT be updated to reflect the notes on the Deficiency table on this record.</font>");
				}else{
					removeASITable("DEFICIENCIES",parentCapId); 
					addASITable("DEFICIENCIES", parTblDef,parentCapId);
				}
			}
		}
	}
}catch(err){
	logDebug("An error has occurred in WTUA:LICENSES/CULTIVATOR/*/AMENDMENT: Copy deficiencies back to parent: " + err.message);
	logDebug(err.stack);
}
//lwacht: 180215: story 4796: end
