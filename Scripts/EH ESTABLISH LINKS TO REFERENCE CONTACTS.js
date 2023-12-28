iArr = new Array();  // attributes to ignore
contactTypeArray = new Array("Applicant","Business Owner","Accounts Receivable","Facility Owner","Certified Food Handler","Commissary","Manager");
if(!feeEstimate)
    createRefContactsFromCapContactsAndLink(capId,contactTypeArray,iArr,false,false,comparePeopleGeneric);
