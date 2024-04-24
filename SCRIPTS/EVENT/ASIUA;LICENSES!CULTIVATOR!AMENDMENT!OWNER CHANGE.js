try{
	var tblOwners = loadASITable("OWNERS");
	var newOwner = false;
	for(o in tblOwners){
		if(tblOwners[o]["Change Status"] == "New" && matches(tblOwners[o]["Status"],null, "", undefined)) {
			newOwner = true;
			tblOwners[o]["Status"] = "Pending";
			var nFirst = tblOwners[o]["First Name"];
			var nLast = tblOwners[o]["Last Name"];
			var nEmail = tblOwners[o]["Email Address"];
			emailParameters = aa.util.newHashtable();
			var sysDate = aa.date.getCurrentDate();
			var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
			var acaSite = getACABaseUrl();   
			addParameter(emailParameters, "$$acaURL$$", acaSite);
			
			addParameter(emailParameters, "$$AltID$$", capId.getCustomID());
			addParameter(emailParameters, "$$ParentAltID$$", capId.getCustomID());
			addParameter(emailParameters, "$$fName$$",""+nFirst);
			addParameter(emailParameters, "$$lName$$",""+nLast);
			addParameter(emailParameters, "$$mmddyy$$", sysDateMMDDYYYY);
			sendNotification(sysEmail,nEmail,"","LCA_OWNER_APP_NOTIF",emailParameters,null,capId);
		}
	}
	if(newOwner) {
		removeASITable("OWNERS")
		addASITable("OWNERS",tblOwners);
		updateAppStatus("Pending Owner Applications","Updated via ASIUA:LICENSES/CULTIVATOR/AMENDMENT/OWNER CHANGE");
		deactivateTask("Ownership Change Amendment Review");
	}
	
} catch(err){
	logDebug("An error has occurred in ASIUA:LICENSES/CULTIVATOR/AMENDMENT/CHANGE OWNER: New Owner: " + err.message);
	logDebug(err.stack);
}