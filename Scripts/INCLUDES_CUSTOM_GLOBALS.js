/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM_GLOBALS.js
| Event   : N/A
|
| Usage   : Accela Custom Includes.  Required for all Custom Parameters
|
| Notes   : 
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| Custom Parameters
|	Ifchanges are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"VIP_ADMINMGR","MHART", "MATTH", "ACCELASUPP6","ACCELACRC","JSHEAR")){
	showDebug=3;
	showMessage=true;
}else{
	showDebug=0;
	showMessage=false;
}

debugEmail = "mhart@trustvip.com; jshear@trustvip.com, CLStechsupport@cannabis.ca.gov";
sysFromEmail = "noreply@cannabis.ca.gov";
sysEmail = "noreply@cannabis.ca.gov";
paymentEmail = "mhart@trustvip.com"
acaUrl = "https://acasupp6.accela.com/CALCANNABIS"
currEnv = "av.supp6";

feeEstimate=false;
if(vEventName.equals("FeeEstimateAfter4ACA")) 
	feeEstimate=true;
/*------------------------------------------------------------------------------------------------------/
| END Custom Parameters
/------------------------------------------------------------------------------------------------------*/