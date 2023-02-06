try{
	if(wfTask == "Owner Application Review" && wfStatus != "Under Review"){
		var currCap = capId;
		var ownerUpdated=true;
		var notUpdated = "Yes";
		var arrChild = getChildren("Licenses/Cultivator/Owner/Amendment");
		if(arrChild){
			for(ch in arrChild){
				capId = arrChild[ch];
				if(isTaskActive("Amendment Review")){
					ownerUpdated=false;
					if(notUpdated=="Yes"){
						notUpdated= arrChild[ch].getCustomID();
					}else {
						notUpdated += "; " + arrChild[ch].getCustomID();
					}
				}
			}
			capId = currCap;
			if(!ownerUpdated){
				cancel=true;
				showMessage=true;
				comment("The following owner amendment record(s) need to be updated before continuing: " + notUpdated);
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/*/APPLICATION: Check owner update: " + err.message);
	aa.print(err.stack);
}


