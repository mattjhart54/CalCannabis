try{
	if(!publicUser) {
// Validate total ownership percentage
		var totPct = 0;
		if (typeof(OWNERS) == "object") {
			for(x in OWNERS) {
				if(OWNERS[x]["Change Status"] != "Delete") {
					var ownPct = parseFloat(OWNERS[x]["Percent Ownership"]);
					totPct = totPct + ownPct;
				}
			}
		}
		if (totPct > 100 || totPct < 0) {
			cancel = true;
			showMessage = true;
			comment("The total Percent Ownership must be greater than 0 and less than 100.")
		}

// Validate for duplicate email addresses
		var tblOwnerEmails = [];
		var emailDuplicate = false;
		for(row in OWNERS){
			tblOwnerEmails.push(OWNERS[row]);
		}
		for(o in OWNERS) {
			var ownEmail = ""+ OWNERS[o]["Email Address"];
			ownEmail = ownEmail.toUpperCase();
			if(OWNERS[o]["Status"] == "Deleted")
					continue;
			for(x in tblOwnerEmails) {
				if( x == o) 
					continue;
				var tblEmail = ""+ tblOwnerEmails[x]["Email Address"];
				tblEmail = tblEmail.toUpperCase();
				logDebug(ownEmail + " " + OWNERS[o]["Status"] + " " + tblEmail + " " + tblOwnerEmails[x]["Status"]);
				if (tblEmail == ownEmail && tblOwnerEmails[x]["Status"] != "Deleted") {
					emailDuplicate = true;
				}
			}
			if(emailDuplicate) {
				cancel = true;
				showMessage = true;
				comment("Each Owner in the table must have a unique email address.");
				break;
			}
		}
// Validate that DRP Owner cannot be deleted
		var licContactResult = aa.people.getCapContactByCapID(parentCapId);
		if (licContactResult.getSuccess()){
			var licContacts = licContactResult.getOutput();
			for(c in licContacts) {
				licCont = licContacts[c].getCapContactModel();
				logDebug("contact " + licCont.email + " end Date " + licCont.endDate);
				if(licCont.contactType == "Designated Responsible Party") {
					var endDate = licCont.endDate;
					var drpEmail = ""+ licCont.email;
					drpEmail = drpEmail.toUpperCase();
				}
			}
			if (typeof(OWNERS) == "object") {
				for(o in OWNERS) {
					var ownEmail = ""+ OWNERS[o]["Email Address"];
					ownEmail = ownEmail.toUpperCase();
					if(OWNERS[o]["Change Status"] == "Delete" && ownEmail == drpEmail && matches(endDate,null,"",undefined)) {
						cancel = true;
						showMessage = true;
						comment("This Owner, " + ownEmail + ", cannot be deleted as it is the Designated Responsible Party for this license.");
					}
				}
			}
		}
	}	
} catch(err){
	logDebug("An error has occurred in ASIUB:LICENSES/CULTIVATOR/AMENDMENT/OWNER CHANGE: PCT and EMAIL Check: " + err.message);
	logDebug(err.stack);
}