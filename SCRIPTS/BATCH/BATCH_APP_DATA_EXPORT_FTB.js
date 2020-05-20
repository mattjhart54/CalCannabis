/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_APP_DATA_EXPORT_FTB
| Client:  CDFA_CalCannabis
|
| Version 1.0 - Base Version. 
| Version 1.1 - eshanower 190111 story 5862: add Provisional records and set License Type codes
| Version 20.0 - espenaj Story 6212 (2020 spec changes), fixed missing business space padding
| Version 20.1 - espenaj fixed to grab FEIN from License Record rather than Contact
| Version 20.2 - espenaj fixed phone number, deleted erroneous comment
| Version 20.3 - espenaj fixed phone number validation
| Version 20.4 - espenaj added validation for FEIN and address correction
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 4.5 * 60;
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/* test parameters 
aa.env.setValue("lookAheadDays", "-100");
aa.env.setValue("daySpan", "100");
aa.env.setValue("emailAddress", "joseph.espena@cdfa.ca.gov");
aa.env.setValue("sendToEmail", "joseph.espena@cdfa.ca.gov");
aa.env.setValue("sysFromEmail", "calcannabislicensing@cdfa.ca.gov");
aa.env.setValue("reportName", "oclcdfa");
aa.env.setValue("recordGroup", "Licenses");
aa.env.setValue("recordType", "Cultivator");
aa.env.setValue("recordSubType", "License");
aa.env.setValue("recordCategory", "License,Provisional");
aa.env.setValue("licenseContactType", "Designated Responsible Party");
aa.env.setValue("businessContactType", "Business");
aa.env.setValue("licenseAddressType", "Mailing");
aa.env.setValue("businessAddressType", "Business");
aa.env.setValue("appStatus", "Active,About to Expire");
*/
 
var emailAddress = getJobParam("emailAddress");			// email to send report
var lookAheadDays = getJobParam("lookAheadDays");
var daySpan = getJobParam("daySpan");
var sysFromEmail = getJobParam("sysFromEmail");
var sendToEmail = getJobParam("sendToEmail");
var rptName = getJobParam("reportName");
var appGroup = getJobParam("recordGroup");
var appTypeType = getJobParam("recordType");
//var appSubtype = getJobParam("recordSubType");
var appSubTypeArray = getJobParam("recordSubType").split(",");
//var appCategory = getJobParam("recordCategory");
var appCategoryArray = getJobParam("recordCategory").split(",");
var task = getJobParam("activeTask");
var licenseContactType = getJobParam("licenseContactType");
var licenseAddressType = getJobParam("licenseAddressType");
var businessContactType = getJobParam("businessContactType");
var businessAddressType = getJobParam("businessAddressType"); // ees 20190311 defect 5921
var sArray = getJobParam("appStatus").split(",");

var filepath = "c://test"; 


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0,0,0,0);
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var fromDate = dateAdd(null,parseInt(lookAheadDays));
var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan));
fromJSDate = new Date(fromDate);
toJSDate = new Date(toDate);
var dFromDate = aa.date.parseDate(fromDate);
var dToDate = aa.date.parseDate(toDate);
logDebug("fromDate: " + fromDate + "  toDate: " + toDate);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);

if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	var arrProcRecds = [];
	var recdsFound = false;
	var tmpRecd = 0;
	var badDate = 0;
	var incompRecd = 0;
	var dupedRecds = 0;
	var statusRecd = 0;
	var noContactType = 0;
	var capCount = 0;
	var rptDate = new Date();
	var pYear = rptDate.getYear() + 1899;
	var pMonth = rptDate.getMonth();
	var pDay = rptDate.getDate();
	var pHour = rptDate.getHours();
	var pMinute = rptDate.getMinutes();
	if(pMonth<12){
		pMonth++;
	}else{
		pMonth=1;
	}
	if (pMonth > 9)
		var mth = pMonth.toString();
	else
		var mth = "0" + pMonth.toString();
	if (pDay > 9)
		var day = pDay.toString();
	else
		var day = "0" + pDay.toString();
	if (pHour > 9)
		var hour = pHour.toString();
	else
		var hour = "0" + pHour.toString();
	if (pMinute > 9)
		var minute = pMinute.toString();
	else
		var minute = "0" + pMinute.toString();
	
	var rptDateFormatted = "" + pYear.toString() + mth + day + hour + minute;
	var newRptName = rptName + rptDateFormatted + ".txt";
	logDebug("newRptName: " + newRptName);
	var rptToEmail = filepath + "/" + newRptName;
	var capFilterBalance = 0;
	var capFilterDateRange = 0;
	var capCount = 0;
	var capList = new Array();
	
	// Start appSubTypeArray and appCategoryArray loops
	for (i in appSubTypeArray) {
		logDebug("subType: " + appSubTypeArray[i]);
		// keep this category loop embedded within the appSubTypeArray loop so all categories get queried
		for (ee in appCategoryArray) {
			logDebug("appCategory: " + appCategoryArray[ee])
			capListResult = aa.cap.getByAppType(appGroup,appTypeType,appSubTypeArray[i],appCategoryArray[ee]);
			if (capListResult.getSuccess()) {
				tempcapList = capListResult.getOutput();
				logDebug("Category count: " + tempcapList.length);
				if (tempcapList.length > 0) {
					capList = capList.concat(tempcapList);
				}
			}else{
				logDebug("Error retrieving records: " + capListResult.getErrorMessage());
			}
		}
	}	
	if (capList.length > 0) {
		logDebug("Found " + capList.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
	for (myCapsXX in capList) {
//		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
//			logDebug("WARNING a script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
//			timeExpired = true ;
//			break; 
//		}
    	capId = capList[myCapsXX].getCapID();
		altId =	 capId.getCustomID();
// if(altId != "TAL18-0007739" &&altId != "TML18-0002487" && altId != "TAL18-0016638") continue;  
		var cmpltStatus = getCapIdStatusClass(capId);
		if(cmpltStatus != "COMPLETE" && cmpltStatus != null){
			logDebug("Skipping due to incomplete record: " + altId + " Status " + cmpltStatus);
			incompRecd++;
			continue;
		}
		if(exists(altId, arrProcRecds)){
			logDebug("Skipping due to duplicated record: " + altId);
			dupedRecds++;
			continue;
		}else{
			arrProcRecds = arrProcRecds.concat(altId);
		}
		cap = aa.cap.getCap(capId).getOutput();	
		capStatus = cap.getCapStatus();
		var capModel = aa.cap.getCap(capId).getOutput().getCapModel();
		var rptDateOrig = capModel.getFileDate().toString().substring(0,10);
		var rptDateConv = rptDateOrig.split("-");
		var rptDate = new Date(""+rptDateConv[0], ""+rptDateConv[1] - 1, ""+rptDateConv[2]);
		var fromTime = fromJSDate.getTime();
		var toTime = toJSDate.getTime();
		if(rptDate.getTime() < fromTime || rptDate.getTime() > toTime){
			logDebug("Skipping due to incorrect date: " + altId);
			badDate++;
			continue;
		}
		if(!exists(capStatus,sArray)) {
			logDebug("Skipping due to record status: " + altId);
			statusRecd++;
			continue;
		}
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var AInfo = [];
		loadAppSpecific(AInfo);
		logDebug("Processing altId: " + altId);
		var rptLine = "";
		//not all  custom fields are on the license, so pulling from application
//		var arrChild = getChildrenB("Licenses/Cultivator/*/Application", capId);
//		if(arrChild){
//			if(arrChild.length>0){
//				//assuming one child
//				var currCap = capId;
//				capId = arrChild[0];
//				var AInfo = [];
//				loadAppSpecific(AInfo);
//				capId = currCap;
//			}
//		}
		var licLine = "";
		var capContactResult = aa.people.getCapContactByCapID(capId);
		if (capContactResult.getSuccess()){
			var licNotFound = true;
			var busNotFound = true;
			var Contacts = capContactResult.getOutput();
			for (var yy in Contacts){
				var thisContact = Contacts[yy].getCapContactModel();
				//license contact type - change to match temp record
				if(appTypeArray[2]=="Temporary" && licenseContactType =="Designated Responsible Party"){
					var licContactType = "DRP - Temporary License";
				}else{
					var licContactType =licenseContactType;
				}
				if(thisContact.contactType==licContactType && licNotFound){
					/* FEIN contact field is not used -JE
					if(matches(thisContact.fein, null, "", "undefined")){
						var lFein = zeroPad("",9);
					}else{
						var lFein = zeroPad(thisContact.fein,9);
					}
					*/
					if(matches(thisContact.birthDate, null, "", "undefined")){
						var bDate = zeroPad("",8);
					}else{
						bDate= thisContact.birthDate.toString();
						var bDate = ""+bDate.substr(0,4) + bDate.substr(5,2) + bDate.substr(8,2);
					}
					// if(matches(thisContact.phone1, null, "", "undefined")){
					// Check correct phone field -JE
					if(matches(thisContact.phone3, null, "", "undefined")){
						var phNbr = zeroPad("",10);
					}else{
						// var phNbr = zeroPad(thisContact.phone1,10);
						// Get correct phone number field -JE
						var phNbr = (""+thisContact.phone3).replace(/ -()/g, "");
					}
					// get rid of any phone number that isn't the right length -JE
					if(phNbr.length != 10){
						phNbr = zeroPad("",10);
					}
					licNotFound = false;
					if(thisContact.lastName==null){
						licLine+=spacePad("",15);
					}else{
						var lName = removeSpecialCharacters(thisContact.lastName);
						if(lName.length>15){
							lName = lName.substring(0,15);
							licLine += lName;
						}else{
							licLine+=spacePad(lName,15);
						}
					}
					if(thisContact.firstName==null){
						licLine+=spacePad("",11);
					}else{
						var fName = removeSpecialCharacters(thisContact.firstName);
						if(fName.length>11){
							fName = fName.substring(0,11);
							licLine+=fName;
						}else{
							licLine+=spacePad(fName,11);
						}
					}
					//middle initial - never collected
					licLine += " ";
					//address: po box if found; otherwise, street address
					var newPeople = thisContact.getPeople();
					var addressList = aa.address.getContactAddressListByCapContact(thisContact).getOutput();
					var addrNotFound = true;
					for (g in addressList){
						thisAddr = addressList[g];
						if(!addrNotFound) 
								continue;
						if(thisAddr.addressType==licenseAddressType){
							addrNotFound = false;
							var invalidChar = checkChar(thisAddr.addressLine1);
							if(invalidChar) {
								logDebug("Record " + altId + " processed with an invalid character found in DRP address line, " + thisAddr.addressLine1);
							}
							if(thisAddr.addressLine1.toUpperCase().substr(0,6)=="PO BOX" ||
							   thisAddr.addressLine1.toUpperCase().substr(0,8)=="P.O. BOX"){
								if(thisAddr.addressLine1.length()>20){
									licLine += thisAddr.addressLine1.substr(0,20);
									licLine += spacePad("",33);
								}else{
									licLine += spacePad(thisAddr.addressLine1,20);
									licLine += spacePad("",33);
								}
							}else{
							
								if(thisAddr.addressLine1.length()>33){
									licLine += spacePad("",20);
									licLine += thisAddr.addressLine1.substr(0,33);
								}else{
									licLine += spacePad("",20);
									licLine += spacePad(thisAddr.addressLine1,33);
								}
							}
							//city
							if(thisAddr.city.length()>12){
								licLine += thisAddr.city.substr(0,12);
							}else{
								licLine += spacePad(thisAddr.city,12);
							}
							/* JE 20.4 figure out if US address
							* This is needed because of users incorrectly selecting a country other than US
							* for addresses that are clearly US addresses.
							*/
							var USAddr = false;
							if(thisAddr.zip!=null){
								var vZip = (""+thisAddr.zip).replace(/-/g, "");
								if(!isNaN(vZip) && (vZip.length == 5 || vZip.length == 9)){
									USAddr = true;
								}
							}
							if(thisAddr.countryCode=="US"){
								USAddr = true;
							}
							//addresses within the u.s.
							// if(thisAddr.countryCode=="US"){
							if(USAddr){
								//state
								if(thisAddr.state.length()>2){
									licLine += thisAddr.state.substr(0,2);
								}else{
									licLine += spacePad(thisAddr.state,2);
								}
								//zip
								// var vZip = (""+thisAddr.zip).replace(/-/g, "");
								if(vZip.length>9){
									licLine += vZip.substr(0,9);
								}else{
									licLine += zeroPadRight(vZip,9);
								}
								//us country code
								licLine += "001";
							//addresses outside of the u.s.
							}else{
								//country, country code (not stored)
								if(thisAddr.countryCode.length()>11){
									licLine += thisAddr.countryCode.substr(0,11);
									licLine += zeroPad("",3);
								}else{
									licLine += spacePad(thisAddr.countryCode,11);
									licLine += zeroPad("",3);
								}
							}
						}
					}
					if(addrNotFound){
						licLine += spacePad("",79);
					}
				}
				//business contact type--gathering here so do not have to cycle through contacts again but using later
				if(thisContact.contactType==businessContactType && busNotFound){
					busNotFound = false;
					bAddrNotFound = true;
					var bsnsLine = "";
					//address: po box if found; otherwise, street address
					var newPeople = thisContact.getPeople();
					if(thisContact.middleName==null){
						var bsnsName = spacePad("",33);
					}else{
//			logDebug("bname " + thisContact.middleName);
					invalidChar = checkChar(thisContact.middleName);
					if(invalidChar) {
						logDebug("Record " + altId + " processed with an invalid character found in business name, " + thisContact.middleName);
					}
						if(thisContact.middleName.length()>33){
							var bsnsName = thisContact.middleName.substr(0,33);
						}else{
							var bsnsName = spacePad(thisContact.middleName,33);
						}
					}
					var addressList = aa.address.getContactAddressListByCapContact(thisContact).getOutput();
					for (g in addressList){
						thisAddr = addressList[g];
						if(!bAddrNotFound) 
							continue;
						if(thisAddr.addressType==businessAddressType){
							bAddrNotFound = false;
							if(thisAddr.addressLine1.toUpperCase().substr(0,6)=="PO BOX" ||
							   thisAddr.addressLine1.toUpperCase().substr(0,8)=="P.O. BOX"){
								if(thisAddr.addressLine1.length()>20){
									bsnsLine += thisAddr.addressLine1.substr(0,20);
									bsnsLine += spacePad("",33);
								}else{
									bsnsLine += spacePad(thisAddr.addressLine1,20);
									bsnsLine += spacePad("",33);
								}
							}else{
								invalidChar = checkChar(thisAddr.addressLine1);
								if(invalidChar) {
									logDebug("Record " + altId + " processed with an invalid character found in Business address line, " + thisAddr.addressLine1);
								}
								if(thisAddr.addressLine1.length()>33){
									bsnsLine += spacePad("",20);
									bsnsLine += thisAddr.addressLine1.substr(0,33);
								}else{
									bsnsLine += spacePad("",20);
									bsnsLine += spacePad(thisAddr.addressLine1,33);
								}
							}
							//city
							if(thisAddr.city.length()>12){
								bsnsLine += thisAddr.city.substr(0,12);
							}else{
								bsnsLine += spacePad(thisAddr.city,12);
							}
							/* JE 20.4 figure out if US address
							* This is needed because of users incorrectly selecting a country other than US
							* for addresses that are clearly US addresses.
							*/
							var USAddr = false;
							if(thisAddr.zip!=null){
								var vZip = (""+thisAddr.zip).replace(/-/g, "");
								if(!isNaN(vZip) && (vZip.length == 5 || vZip.length == 9)){
									USAddr = true;
								}
							}
							if(thisAddr.countryCode=="US"){
								USAddr = true;
							} 
							//addresses within the u.s.
							// if(thisAddr.countryCode=="US"){
							if(USAddr){
								//state
								if(thisAddr.state.length()>2){
									bsnsLine += thisAddr.state.substr(0,2);
								}else{
									bsnsLine += spacePad(thisAddr.state,2);
								}
								//zip
								// var vZip = (""+thisAddr.zip).replace(/-/g, "");
								if(vZip.length>9){
									bsnsLine += vZip.substr(0,9);
								}else{
									bsnsLine += zeroPadRight(vZip,9);
								}
								//us country code  ees 20190312 defect 5921
								bsnsLine += "001";
							//addresses outside of the u.s.
							}else{
								//country, country code (not stored)
								if(thisAddr.countryCode.length()>11){
									bsnsLine += thisAddr.countryCode.substr(0,11);
									bsnsLine += zeroPad("",3);	// ees 20190312 defect 5921
								}else{
									bsnsLine += spacePad(thisAddr.countryCode,11);
									bsnsLine += zeroPad("",3);	// ees 20190312 defect 5921
								}
							}
						}
					}
					if(bAddrNotFound){
						bsnsLine += spacePad("",79);
					}
				}
			}
			if(licNotFound){
				licLine = spacePad("",106);
			}
			// fixed to account for missing space -JE
			if(busNotFound){
				bsnsLine = spacePad("",79);
//				bsnsLine = spacePad("",76);
			}
		}else{
			logDebug("Skipping due to no contacts");
			noContactType++;
			continue;
		}
		//start populating file here
		//ssn
		if(AInfo["SSN"]==null){
			rptLine += zeroPad("",9);
		}else{
			var vSSN = (""+AInfo["SSN"]).replace(/-/g, "");
			rptLine += zeroPad(vSSN,9);
		}
		//fein
		// rptLine += lFein;
		// Pos 10-18 Get FEIN from license record -JE
		if(AInfo["EIN/ITIN"]==null){
			rptLine += zeroPad("",9);
		}else{
			var vFEIN = (""+AInfo["EIN/ITIN"]).replace(/-/g, "").substr(0,9);
			// check for non-numberic values JE 20.4
			if(isNaN(vFEIN)){
				rptLine += zeroPad("",9);
			}else{
				rptLine += zeroPad(vFEIN,9);
			}
		}
		//occupational license nbr
		//rptLine += ""+ altId.substr(6,7);  //not sure if this is right, so leaving just in case
		//rptLine += spacePad("",7);
		// Occupation License No. pos 19-38
		rptLine += spacePad(altId,20);
		//ownership type
		switch(""+AInfo["Business Entity Structure"]){
			case "Corporation":
				rptLine += "C"; break;
			case "General Partnership":
				rptLine += "P"; break;
			case "Joint Venture":
				rptLine += " "; break;
			case "Limited Liability Company (LLC)":
				rptLine += "C"; break;
			case "Limited Liability Partnership(LLP)":
				rptLine += "L"; break;
			case "Limited Partnership":
				rptLine += "P"; break;
			case "Sole Proprietorship":
				rptLine += "S"; break;
			case "Sovereign Entity":
				rptLine += " "; break;
			case "Trust":
				rptLine += " "; break;
			case "Other" :
				rptLine += " "; break;
			default:
				rptLine += " "; break;
		}
		rptLine +=licLine;
//		logDebug("RPTLINE: " + rptLine);
		//business name
		rptLine +=bsnsName;
		//business contact info
		rptLine +=bsnsLine;
		//effective date of license
//		var lAinfo = [];
//		loadAppSpecific(lAinfo);
		var lEffDate = AInfo["Valid From Date"];
		if(!matches(lEffDate,null,"", "undefined")){
			rptLine += ""+lEffDate.substr(6,4) + lEffDate.substr(0,2) + lEffDate.substr(3,2);
		}else{
			rptLine += spacePad("",8);
		}
		//expiration date of license
		var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
		if (b1ExpResult.getSuccess()){
			var b1Exp = b1ExpResult.getOutput();
			tmpDate = b1Exp.getExpDate();
			if (tmpDate){
				var tYr = tmpDate.getYear().toString();
				var tMn = tmpDate.getMonth().toString();
				var tDy = tmpDate.getDayOfMonth().toString();
				if (tMn < 10)
					tMn = "0" + tMn;
				if (tDy < 10)
					tDy = "0" + tDy;
				rptLine += ""+tYr + tMn +  tDy;
			}else{
				rptLine += spacePad("",8);
			}
			if(b1Exp.getExpStatus()=="Active"){
				rptLine += "A";
			}else{
				rptLine += "I";
			}
		}
		//new or renewal--if no renewal child record, then new
		var arrChild = getChildrenB("Licenses/Cultivator/*/Renewal", capId);
		if(arrChild){
			if(arrChild.length>0){
				rptLine += "R";
			}else{
				rptLine += "N";
			}
		}else{
			rptLine += "N";
		}
		//sic: never collected
		// is 9999 correct or should we just zero fill? leaving as is for now -JE 
		rptLine += spacePad("9999",4);
		//rptLine += spacePad("",4);	// comment out to set license type code per list provided--EES
		// Type of License pos 280-283 -JE
		// pos 280: Adult-Use or Medicinal?
		if(AInfo["Cultivator Type"] == "Adult-Use") {
			rptLine += "A";
		}else{
			if(AInfo["Cultivator Type"] == "Medicinal") {
				rptLine += "M";
			}else{
				rptLine += " ";
			}
		}
		// pos 281: Annual or Provisional?
		if(AInfo["License Issued Type"] == "Annual") {
			rptLine += "A";
		}else{
			if(AInfo["License Issued Type"] == "Provisional") {
				rptLine += "P";
			}else{
				rptLine += " ";
			}
		}
		// pos 282-283: cultivator type
		switch(""+AInfo["License Type"]){
			case "Specialty Cottage Outdoor":
				rptLine += "01"; break;
			case "Specialty Cottage Indoor":
				rptLine += "02"; break;
			case "Specialty Cottage Mixed-Light Tier 1":
				rptLine += "03"; break;
			case "Specialty Cottage Mixed-Light Tier 2":
				rptLine += "04"; break;
			case "Specialty Outdoor":
				rptLine += "05"; break;
			case "Specialty Indoor":
				rptLine += "06"; break;
			case "Specialty Mixed-Light Tier 1":
				rptLine += "07"; break;
			case "Specialty Mixed-Light Tier 2":
				rptLine += "08"; break;
			case "Small Outdoor":
				rptLine += "09"; break;
			case "Small Indoor":
				rptLine += "10"; break;
			case "Small Mixed-Light Tier 1":
				rptLine += "11"; break;
			case "Small Mixed-Light Tier 2":
				rptLine += "12"; break;
			case "Medium Outdoor":
				rptLine += "13"; break;
			case "Medium Indoor":
				rptLine += "14"; break;
			case "Medium Mixed-Light Tier 1":
				rptLine += "15"; break;
			case "Medium Mixed-Light Tier 2":
				rptLine += "16"; break;
			case "Nursery":
				rptLine += "17"; break;
			case "Processor":
				rptLine += "18"; break;
			default:
				rptLine += "  "; break;
		}
		/*
		// Start set the license type code for FTB--EES
		var licType = "    ";
		if (appTypeArray[2] == "Temporary") {
			licType = "TCL ";	
		}
		if (AInfo["Cultivator Type"] == "Adult-Use" && AInfo["License Issued Type"] == "Annual") {
                     licType = "ACL ";
              }
              if (AInfo["Cultivator Type"] == "Medicinal" && AInfo["License Issued Type"] == "Annual") {
                     licType = "MCL ";
              }
              if (AInfo["Cultivator Type"] == "Adult-Use" && AInfo["License Issued Type"] == "Provisional") {
                     licType = "PACL";
              }
              if (AInfo["Cultivator Type"] == "Medicinal" && AInfo["License Issued Type"] == "Provisional") {
                     licType = "PMCL";
              }
// logDebug(altId + " License Type " + licType + " " + AInfo["License Issued Type"] + " " + AInfo["Cultivator Type"]);
		rptLine += licType;		
		// End set the license type code for FTB--EES
		*/

		//frequency: always annual?
		rptLine += "A";
		//licensing board number
		rptLine += spacePad("859",3);
		//date of birth
		rptLine += bDate;
		//drivers license: not collected
		rptLine += zeroPad("",8);
		//phone nbr
		rptLine += phNbr;
//		logDebug("rptLine: " + rptLine);
		//Line return after each record has been written.
		rptLine += "\r\n";
		aa.util.writeToFile(rptLine,rptToEmail);
		recdsFound = true;
		capCount ++;
	}



	if(recdsFound){
		var rFiles = [];
		rFiles.push(rptToEmail);
		//sendNotification(sysFromEmail,sendToEmail,"","","", rFiles,null);
		var result = aa.sendEmail(sysFromEmail, sendToEmail, "", newRptName, ".", rFiles);
		if(result.getSuccess()){
			logDebug("Sent email successfully!");
		}else{
			logDebug("Failed to send mail. - " + result.getErrorType());
		}
	}
 	logDebug("Total CAPS qualified : " + capList.length);
 	//logDebug("Ignored due to temp record: " + tmpRecd);
 	logDebug("Ignored due to bad date: " + badDate);
 	logDebug("Ignored due to incomplete record: " + incompRecd);
 	logDebug("Ignored due to duped record: " + dupedRecds);
	logDebug("Ignored due to status: " + statusRecd);
 	logDebug("Ignored due to no contact type: " + noContactType);
 	logDebug("Total CAPS processed: " + capCount);

}catch (err){
	logDebug("An error occurred in BATCH_APP_DATA_EXPORT_FRANWELL: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, emailAddress, "", "An error has occurred in " + batchJobName, err.message + br + err.stack + br + "env: av6(prod)");
}}
	
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function getCapIdByIDs(s_id1, s_id2, s_id3)  {
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
    if(s_capResult.getSuccess())
		return s_capResult.getOutput();
    else
       return null;
}

function getJobParam(pParamName){ //gets parameter value and logs message showing param value
try{
	var ret;
	if (aa.env.getValue("paramStdChoice") != "") {
		var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"),pParamName);
		if (b.getSuccess()) {
			ret = b.getOutput().getDescription();
			}	

		ret = ret ? "" + ret : "";   // convert to String
		
		logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
		}
	else {
			ret = "" + aa.env.getValue(pParamName);
			logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
		}
	return ret;
}catch (err){
	logDebug("ERROR: getJobParam: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}

function getCapIdStatusClass(inCapId){
    var inCapScriptModel = aa.cap.getCap(inCapId).getOutput();
    var retClass = null;
    if(inCapScriptModel){
        var tempCapModel = inCapScriptModel.getCapModel();
        retClass = tempCapModel.getCapClass();
    }
   
    return retClass;
}

function getChildrenB(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ logDebug( "**WARNING: getChildren function found no children"); return null ; }

	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (xx in childArray)
		{
		childCapId = childArray[xx].getCapID();
		if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
			continue;

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
		childTypeArray = capTypeStr.split("/");
		isMatch = true;
		for (yy in childTypeArray) //looking for matching cap type
			{
			if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
				{
				isMatch = false;
				continue;
				}
			}
		if (isMatch)
			retArray.push(childCapId);
		}
		
//	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray;

}
	
function removeSpecialCharacters(testPhrase){
	testPhrase = (""+testPhrase).replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
	return testPhrase;
}

function testForSpecialCharacter(testPhrase){
	if (testPhrase.indexOf('"') != -1) {
		testPhrase = (""+testPhrase).replace(/"/g, '""');
		testPhrase = '"' + testPhrase + '"';
	}else{
		if (testPhrase.indexOf(',')!= -1) {
			testPhrase = '"' + testPhrase + '"';
		}
	}
	return testPhrase;
}

function zeroPad(num,count){ 
	var numZeropad = num + '';
	while(numZeropad.length < count) {
		numZeropad = "0" + numZeropad; 
	}
	return numZeropad;
}

function zeroPadRight(num,count){ 
	var numZeropad = num + '';
	while(numZeropad.length < count) {
		numZeropad = numZeropad + "0" ; 
	}
	return numZeropad;
}

function spacePad(num,count){ 
	var numZeropad = num + '';
	while(numZeropad.length < count) {
		numZeropad = numZeropad +" "; 
	}
	return numZeropad;
}
function checkChar(input) {
     var base64test = /[^A-Za-z0-9\&\/\\#,+()$~%.'":*?<>{}=\-\_ ]/g;

     if (base64test.exec(input)) {
//        logDebug("There were invalid base64 characters in the input text." + input)
		return true;
     }
	 else {
		return false;
	}
}
