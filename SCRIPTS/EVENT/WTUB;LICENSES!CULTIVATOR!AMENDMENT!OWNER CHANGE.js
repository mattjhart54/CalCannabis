try{
	if(wfStatus == "Amendment Approved"){
		var currCap = capId;
		var ownerApprv=true;
		var notUpdated="Yes"
		var arrChild = getChildren("Licenses/Cultivator/Medical/Owner Application");
		if(arrChild){
			for(ch in arrChild){
				capId = arrChild[ch];
				if(taskStatus("Owner Application Review") != "Review Completed"){
					ownerApprv=false;
					if(notUpdated=="Yes"){
						notUpdated= arrChild[ch].getCustomID();
					}else {
						notUpdated += "; " + arrChild[ch].getCustomID();
					}
				}
			}
			capId = currCap;
			if(!ownerApprv){
				cancel=true;
				showMessage=true;
				comment("The following owner amendment record(s) have not been approved: " + notUpdated);
			}
		}
	}
}catch(err){
	aa.print("An error has occurred in WTUB:LICENSES/CULTIVATOR/AMENDMENT/OWNER CHANGE: Check owner apps approved: " + err.message);
	aa.print(err.stack);
}