//lwacht: 171006: removing as this is done in an expression
/*
try {
	if(!publicUser) {
	var totAcre = 0;
	var mediumLic = "N";
	var maxAcres = 0;

	var licLookup = lookup("LIC_CC_LICENSE_TYPE", AInfo["License Type"]);
	if(!matches(licLookup, "", null, undefined)) {
		var licTbl = licLookup.split(";");
		maxAcres = licTbl[0];
		totAcre += parseInt(maxAcres);
	}
		var contactList = cap.getContactsGroup();
		logDebug("got contactlist " + contactList.size());
		if(contactList != null && contactList.size() > 0){
				var arrContacts = contactList.toArray();
				for(var i in arrContacts) {
					var thisCont = arrContacts[i];
					var contType = thisCont.contactType;
					if(contType =="Business") {
						//check for legal business name if not a Sole Proprietor
						if(AInfo["Business Entity Structure"] != "Sole Proprietorship" && matches(thisCont.middleName,"",null,undefined)) {
							showMessage = true;
							cancel = true;
							logMessage("Warning: Legal Business Name must be entered if the Business Entity Structure is not Sole Proprietor.  Click the edit button to enter your Legal Business Name");
						}
						var refContNrb = thisCont.refContactNumber;
	//					logMessage("contact nbr " + refContNrb + " Name " + thisCont.fullName + " Business " + thisCont.middleName);
						if (!matches(refContNrb,null, "", "undefined")) {
							var pplMdl = aa.people.createPeopleModel().getOutput();
							pplMdl.setContactSeqNumber(refContNrb);
							pplMdl.setServiceProviderCode("CALCANNABIS");
							if(!matches(thisCont.fullName,null, "", "undefined")) {
								pplMdl.setFullName(thisCont.fullName);
							}else {
								pplMdl.setMiddlesName (thisCont.middleName);
							}
							var capResult = aa.people.getCapIDsByRefContact(pplMdl);  // needs 7.1

							if (capResult.getSuccess()) {
								var capList = capResult.getOutput();
								for (var j in capList) {
									var thisCapId = capList[j];
									var thatCapId = thisCapId.getCapID();
									thatCap = aa.cap.getCap(thatCapId ).getOutput();
									thatAppTypeResult = thatCap .getCapType();
									thatAppTypeString = thatAppTypeResult.toString();
									thatAppTypeArray = thatAppTypeString.split("/");
									if(thatAppTypeArray[2] != "Temporary" && thatAppTypeArray[3] == "Application") {
										var capLicType = getAppSpecific("License Type",thatCapId);
										var licLookup = lookup("LIC_CC_LICENSE_TYPE", capLicType);
										if(!matches(licLookup, "", null, undefined)) {
											licTbl = licLookup.split("|");
											maxAcres = licTbl[0];
											totAcre += parseInt(maxAcres);
										}
										if (matches(capLicType, "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light Tier 1", "Medium Mixed-Light Tier 2")) {
											mediumLic = true;
										}
									}
								}
							}else{
								logMessage("error finding cap ids: " + capResult.getErrorMessage());
							}
						}
					}
				}
			logDebug( "Acres " + totAcre + "Medium " + mediumLic);

			if((totAcre) > 43560) {
				showMessage = true;
				cancel = true;
				comment("You cannot apply for anymore cultivator licenses as you will or have exceeded the 1 acre size limit");
			}
			if(matches(AInfo["Licnese Type"], "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light Tier 1", "Medium Mixed-Light Tier 2") && mediumLic == true) {
				showMessage = true;
				cancel = true;
				comment("You cannot apply for a medium license as you already have a medium license");
			}
		}
	}
}catch (err) {
    logDebug("A JavaScript Error occurred: Licenses/Cultivation/* /Application: " + err.message);
	logDebug(err.stack);
}

*/