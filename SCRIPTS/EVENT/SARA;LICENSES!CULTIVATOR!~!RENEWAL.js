//lwacht
//update AltId
//lwacht: commenting out and putting in CTRCA

try{
    aa.sendMail("noreply@cannabis.ca.gov", "evontrapp@etechconsultingllc.com", "", "Event Output", debug);
} catch(err){
    logDebug("An error has occurred in SARA:LICENSES/CULTIVATOR/* /RENEWAL: Update AltId: " + err.message);
    logDebug(err.stack);
    aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}