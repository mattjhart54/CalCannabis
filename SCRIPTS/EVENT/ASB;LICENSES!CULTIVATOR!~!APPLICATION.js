
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
		var c = aa.people.getCapContactByCapID(capId).getOutput();

		for (var i in c){
			var con = c[i];

			var ct = con.getCapContactModel().getContactType();
			if(ct =="Business") {
				var crn = con.getCapContactModel().getRefContactNumber();
				if (crn != null && crn != "") {
					var p = con.getPeople();
					var psm = aa.people.createPeopleModel().getOutput();
					psm.setContactSeqNumber(con.getCapContactModel().getRefContactNumber());
					psm.setServiceProviderCode(con.getServiceProviderCode());
					var fn=con.getFirstName();
					if(fn !=null && fn !="") {
						var cfn = con.getCapContactModel().getFirstName();
						var cln = con.getCapContactModel().getLastName();
						psm.setFullName(cfn + " " + cln);
					}
					else {
						var cbn = con.getCapContactModel().getMiddleName()
						psm.setMiddleName (cbn);
					}

					var cResult = aa.people.getCapIDsByRefContact(psm);  // needs 7.1
					if (cResult.getSuccess()) {
						var cList = cResult.getOutput();
						for (var j in cList) {
							var thisCapId = cList[j];
							var thatCapId = thisCapId.getCapID();
							thatCap = aa.cap.getCap(thatCapId).getOutput();
							thatAppTypeResult = thatCap.getCapType();
							thatAppTypeString = thatAppTypeResult.toString();
							thatAppTypeArray = thatAppTypeString.split("/");
							if(thatAppTypeArray[2] != "Temporary" && thatAppTypeArray[3] == "Application") {
								var cs = getAppSpecific("Canopy Size",thatCapId);
								var capLicType = getAppSpecific("License Type",thatCapId);
								var licLookup = lookup("LIC_CC_LICENSE_TYPE", capLicType );
								if(!matches(licLookup, "", null, undefined)) {
									var licTbl = licLookup.split(";");
									maxAcres = licTbl[0];
									totAcre += parseInt(maxAcres);
								}
								if (matches(capLicType, "Medium Outdoor", "Medium Indoor", "Medium Mixed-Light Tier 1", "Medium Mixed-Light Tier 2")) {
									mediumLic = true;
								} 
							}
						}
					}
					else{
						logDebug("error finding cap ids: " + cResult.getErrorMessage());
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
}catch (err) {
    logDebug("A JavaScript Error occurred: Licenses/Cultivation/* /Application: " + err.message);
	logDebug(err.stack);
}

