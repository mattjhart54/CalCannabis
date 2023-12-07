AdHocSettings.CurrentUserIsAdmin = (bool)HttpContext.Current.Session["IsAdmin"];
AdHocSettings.CurrentUserName = HttpContext.Current.Session["UserName"];
AdHocSettings.ShowSettingsButtonForNonAdmins = false;

if(AdHocSettings.CurrentUserIsAdmin) {
    //Sam is an administrator in the system and has full access to everything
    AdHocSettings.SharedWithValues = new string[] { "Report Admin"}; //Sam can freely choose who to share with based on department or username
}
else {
    if(AdHocSettings.CurrentUserName == "JSHEAR") {
        AdHocSettings.CurrentUserRoles = new string[] { "Report Admin" };
        AdHocSettings.SharedWithValues = new string[] { "JSHEAR", "Report Admin", "MHART"}; //Bob can share reports with anyone but Mallory but cannot view reports that are not shared with "Bob" or "Sales"
    }
    else if(AdHocSettings.CurrentUserName == "MHART") {
        AdHocSettings.CurrentUserRoles = new string[] { "Report Admin"};
        AdHocSettings.SharedWithValues = new string[] { "JSHEAR", "Report Admin", "MHART"}; //Alice cannot share reports with Bob or Mallory specifically but Bob can still view reports created by Alice if they are shared with "Sales" and Mallory can view reports shared by Alice if they are shared with "Marketing"
    }
    else {
        AdHocSettings.CurrentUserRoles = new string[] { "Visitor" }; //visitors cannot share with anyone but can see reports shared with the "Visitor" role
    }
}