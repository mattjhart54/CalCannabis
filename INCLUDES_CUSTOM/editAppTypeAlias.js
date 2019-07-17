function editAppTypeAlias(newname) {
	var itemCap = capId;
	if (arguments.length == 2) 
		itemCap = arguments[1]; // use cap ID specified in args

	capResult = aa.cap.getCap(itemCap)

	if (!capResult.getSuccess())
		{logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()) ; return false }

	capModel = capResult.getOutput().getCapModel();
//	cType = capModel.getCapType();
//	describeObject(cType);
//	cType.setSubType(newtype);
	capModel.setAppTypeAlias(newname);

	setNameResult = aa.cap.editCapByPK(capModel)

	if (!setNameResult.getSuccess()) { 
		logDebug("**WARNING: error setting cap alias : " + setNameResult.getErrorMessage()) ; 
		return false
	}
	else{
		return true;
	}
}