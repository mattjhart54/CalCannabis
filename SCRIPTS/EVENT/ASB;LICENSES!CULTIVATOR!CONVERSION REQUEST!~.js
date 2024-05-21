try {
// MJH Stpry 7953 - Removed check for public user so script will run for convesrion applications submitted in both ACA and AV
	
	if(typeof(LICENSERECORDSFORCONVERSION) == "object"){
		if(LICENSERECORDSFORCONVERSION.length > 0){
			var addedRow = true;
		}
	}
			
	if(!addedRow){
		cancel=true; 
		showMessage=true; 
		comment("Conversion record can not be submitted without a secondary license record");
	}		
}catch(err){
	logDebug("An error has occurred in ASB:LICENSES/CULTIVATOR/CONVERSION REQUEST/*: " + err.message);
	logDebug(err.stack);
}
