/*===========================================
Title: validateEmail
Purpose: Verifies the email format 
Author: Lynda Wacht		
Functional Area : ASI, Contact
Description : 
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : 
Parameters: 
	email: text: email address to verify
============================================== */
function validateEmail(email)
{
 var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
 if (reg.test(email)){
 return true; }
 else{
 return false;
 }
} catch(err){
	logDebug("An error occurred in validateEmail: " + err.message);
	logDebug(err.stack);
}}