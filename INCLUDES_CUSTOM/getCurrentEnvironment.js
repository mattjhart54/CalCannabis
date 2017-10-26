function getCurrentEnvironment() {
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    var firstPart = acaSite.substr(0, acaSite.indexOf(".accela.com"));
    var dotArray = firstPart.split(".");

    return dotArray[dotArray.length-1];
}