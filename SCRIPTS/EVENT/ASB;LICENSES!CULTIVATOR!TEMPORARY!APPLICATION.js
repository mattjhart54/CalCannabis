try{
	cancel = true;
	showDebug =true;
	showMessage = true;
	var ApplicantContactAddressModelList = aa.env.getValue("ApplicantContactAddressModelList");
	var RefAddressType = aa.env.getValue("RefAddressType");
	logDebug("ApplicantContactAddressModelList:"+ ApplicantContactAddressModelList);
	logDebug("RefAddressType:"+ RefAddressType);
	for (x in ApplicantContactAddressModelList){
		var thisAddr = ApplicantContactAddressModelList[x];
		for(y in thisAddr){
			if(typeof(thisAddr[y])!="function"){
				logDebug(y+": " + thisAddr[y]);
			}
		}
	}
	cap = aa.cap.getCap(capId).getOutput();
	var contactList = cap.getContactsGroup();
	showDebug=true;
	showMessage=true;
	cancel = true;
	if(contactList != null && contactList.size() > 0){
		var arrContacts = contactList.toArray();
		for(var i in arrContacts) {
			var thisCont = arrContacts[i];
			var contEmail = thisCont.email;
			var contType = thisCont.contactType;
			if(contType == "Designated Responsible Party")
				drpFnd = true;
			if(contType == "Business")
				appFnd = true;
			if(!matches(contEmail,"",null,"undefined")){
				if(contEmail.toUpperCase() == currEmail.toUpperCase() && matches(contType, "Designated Responsible Party", "Business","DRP - Temporary License")){
					contactFnd = true;
				}
			}
			var contactAddresses = aa.address.getContactAddressListByCapContact(thisCont);
			if (contactAddresses.getSuccess()) {
				var contAddrs = contactAddresses.getOutput();
				var contactAddressModelArr = convertContactAddressModelArr(contactAddresses.getOutput());
				//this.people.setContactAddressList(contactAddressModelArr);
				for (r in contactAddressModelArr){
					var thisAddr = contactAddressModelArr[r];
					for(z in thisAddr){
						if(typeof(thisAddr[z])!="function"){
							logDebug(z+": " + thisAddr[z]);
						}
					}
				}
			}else {
				pmcal = thisCont.people.getContactAddressList();
				if (pmcal) {
					var contAddrs = pmcal.toArray();
					for (r in contAddrs){
						var thisAddr = contAddrs[r];
						for(z in thisAddr){
							if(typeof(thisAddr[z])!="function"){
								logDebug(z+": " + thisAddr[z]);
							}
						}
					}
				}
			}
		}
	}

}catch (err){
	logDebug("An error has occurred in ASB:Licenses/Cultivation/Temporary/Application: Completed field check: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: ASB:Licenses/Cultivation/Temporary/Application: Completed field check: " + startDate, "capId: " + capId + ": " + br + err.message + br + err.stack + br + currEnv);

}