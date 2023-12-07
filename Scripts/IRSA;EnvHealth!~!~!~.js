showDebug = true; 
showMessage = true; 
var riskLevel = AInfo["Risk"];
var inspDate =  inspObj.getInspectionDate().getMonth() + "/" + inspObj.getInspectionDate().getDayOfMonth() + "/" + inspObj.getInspectionDate().getYear();
logDebug("Inspection Date= " + inspDate);

if(inspType == "Pre-Operational Inspection" && inspResult == "Meets Standards"){
    branchTask("Inspection","Inspection Passed","Updated by Inspection Result","Note");
} 
if(inspType == "Pre-Operational Inspection" && inspResult == "Fails to Meet Standards"){
    message="All Inspections must meets standards before completing the Inspection Workflow Task.<br/><br/>";
    scheduleInspection("Follow-up Inspection",0,currentUserID);
    debug=message;
} 
if(inspType == "Follow-up Inspection" && inspResult == "Meets Standards"){
    branchTask("Inspection","Inspection Passed","Updated by Inspection Result","Note");
} 
if(inspType == "Follow-up Inspection" && inspResult == "Fails to Meet Standards"){
    message="All Inspections must meet standards before completing the Inspection Workflow Task.<br/><br/>";
    debug=message;
} 
if(riskLevel!=null && riskLevel==1 && inspType == "Routine Inspection" && inspResult == "Meets Standards"){
    scheduleInspection("Routine Inspection", Math.round(( new Date(dateAddMonths(inspDate, 12))- new Date())/(1000*60*60*24) + 1), currentUserID);
} 
if(riskLevel!=null && riskLevel==2 && inspType == "Routine Inspection" && inspResult == "Meets Standards"){
    scheduleInspection("Routine Inspection", Math.round(( new Date(dateAddMonths(inspDate, 6))- new Date())/(1000*60*60*24) + 1), currentUserID);
} 
if(riskLevel!=null && riskLevel==3 && inspType == "Routine Inspection" && inspResult == "Meets Standards"){
    scheduleInspection("Routine Inspection", Math.round(( new Date(dateAddMonths(inspDate, 4))- new Date())/(1000*60*60*24) + 1), currentUserID);
} 
if(riskLevel!=null && riskLevel==4 && inspType == "Routine Inspection" && inspResult == "Meets Standards"){
    scheduleInspection("Routine Inspection", Math.round(( new Date(dateAddMonths(inspDate, 3))- new Date())/(1000*60*60*24) + 1), currentUserID);
} 

if(riskLevel!=null && riskLevel==1 && inspType == "Routine Inspection" && inspResult == "Fails to Meet Standards"){
    scheduleInspection("Routine Inspection", Math.round(( new Date(dateAddMonths(inspDate, 12))- new Date())/(1000*60*60*24) + 1), currentUserID);
} 
if(riskLevel!=null && riskLevel==2 && inspType == "Routine Inspection" && inspResult == "Fails to Meet Standards"){
    scheduleInspection("Routine Inspection", Math.round(( new Date(dateAddMonths(inspDate, 6))- new Date())/(1000*60*60*24) + 1), currentUserID);
} 
if(riskLevel!=null && riskLevel==3 && inspType == "Routine Inspection" && inspResult == "Fails to Meet Standards"){
    scheduleInspection("Routine Inspection", Math.round(( new Date(dateAddMonths(inspDate, 4))- new Date())/(1000*60*60*24) + 1), currentUserID);
} 
if(riskLevel!=null && riskLevel==4 && inspType == "Routine Inspection" && inspResult == "Fails to Meet Standards"){
    scheduleInspection("Routine Inspection", Math.round(( new Date(dateAddMonths(inspDate, 3))- new Date())/(1000*60*60*24) + 1), currentUserID);
}