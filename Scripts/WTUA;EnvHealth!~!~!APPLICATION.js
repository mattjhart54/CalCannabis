if(wfTask == "Application Intake" && wfStatus == "Void"){
    taskCloseAllExcept("Void", "Updated by Workflow Task update after event");
} 
if(wfTask == "Application Intake" && wfStatus == "Withdrawn"){
    taskCloseAllExcept("Withdrawn", "Updated by Workflow Task update after event");
}
if(wfTask == "Application Intake" && wfStatus == "Denied"){
    taskCloseAllExcept("Denied", "Updated by Workflow Task update after event");
}
if(wfTask == "Application Review" && wfStatus == "Withdrawn"){
    taskCloseAllExcept("Withdrawn", "Updated by Workflow Task update after event");
}
if(wfTask == "Application Review" && wfStatus == "Denied"){
    taskCloseAllExcept("Denied", "Updated by Workflow Task update after event");
}
if(wfTask == "Plan Review" && wfStatus == "Withdrawn"){
    taskCloseAllExcept("Withdrawn", "Updated by Workflow Task update after event");
}
if(wfTask == "Plan Review" && wfStatus == "Denied"){
    taskCloseAllExcept("Denied", "Updated by Workflow Task update after event");
}
if(wfTask == "Plan Review" && wfStatus == "Plans Approved"){
    scheduleInspection("Pre-Operational Inspection", 0, currentUserID);
} 
if(wfTask == "Inspection" && wfStatus == "Withdrawn"){
    taskCloseAllExcept("Withdrawn", "Updated by Workflow Task update after event");
}
if(wfTask == "Inspection" && wfStatus == "Denied" ){
    taskCloseAllExcept("Denied", "Updated by Workflow Task update after event");
}
if(wfTask == "Permit Issuance" && wfStatus == "Denied"){
    taskCloseAllExcept("Denied", "Updated by Workflow Task update after event");
}