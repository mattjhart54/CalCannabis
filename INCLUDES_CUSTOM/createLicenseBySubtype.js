function createLicenseBySubtype(initStatus,subType,copyASI) {
	//initStatus - record status to set the license to initially
	//subType - Set the record subtype for license to create
	//copyASI - copy ASI from Application to License? (true/false)

	var newLic = null;
	var newLicId = null;
	var newLicIdString = null;
	
	//create the license record
	newLicId = createParent(appTypeArray[0], appTypeArray[1], subType, "License",null);

	//field repurposed to represent the current term effective date
	editScheduledDate(sysDateMMDDYYYY,newLicId);
	
	//field repurposed to represent the original effective date
	editFirstIssuedDate(sysDateMMDDYYYY,newLicId);
	newLicIdString = newLicId.getCustomID();
	updateAppStatus(initStatus,"",newLicId);

	//copy all ASI
	if(copyASI) {
		copyAppSpecific(newLicId);
	}
	return newLicId;	
}