function editAppTypeAlias(newname,newtype) {
	var itemCap = capId;
	if (arguments.length == 3) 
		itemCap = arguments[2]; // use cap ID specified in args

	capResult = aa.cap.getCap(itemCap)

	if (!capResult.getSuccess())
		{logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()) ; return false }

	capModel = capResult.getOutput().getCapModel();
	cType = capModel.getCapType();
//	describeObject(cType);
	cType.setSubType(newtype);
	cType.setAlias(newname);
	capModel.setCapType(cType);
	capModel.setSpecialText(newname)
	setNameResult = aa.cap.editCapByPK(capModel)

	if (!setNameResult.getSuccess()) { 
		logDebug("**WARNING: error setting cap alias : " + setNameResult.getErrorMessage()) ; 
		return false
	}
	else{
		return true;
	}
}