function licenseObject(licnumber) // optional renewal Cap ID -- uses the expiration on the renewal CAP.
{
    itemCap = capId;
    if (arguments.length == 2)
        itemCap = arguments[1]; // use cap ID specified in args


    this.refProf = null; // licenseScriptModel (reference licensed professional)
    this.b1Exp = null; // b1Expiration record (renewal status on application)
    this.b1ExpDate = null;
    this.b1ExpCode = null;
    this.b1Status = null;
    this.refExpDate = null;
    this.licNum = licnumber; // License Number


    // Load the reference License Professional if we're linking the two
    if (licnumber) // we're linking
    {
        var newLic = getRefLicenseProf(licnumber)
            if (newLic) {
                this.refProf = newLic;
                tmpDate = newLic.getLicenseExpirationDate();
                if (tmpDate)
                    this.refExpDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
                logDebug("Loaded reference license professional with Expiration of " + this.refExpDate);
            }
    }

    // Load the renewal info (B1 Expiration)

    b1ExpResult = aa.expiration.getLicensesByCapID(itemCap)
        if (b1ExpResult.getSuccess()) {
            this.b1Exp = b1ExpResult.getOutput();
            tmpDate = this.b1Exp.getExpDate();
			// Begin User Story 7740, fixing date objects due to issues in SaaS multi-tenant environments
			tmpDate = fixDate(tmpDate);
            if (tmpDate)
                this.b1ExpDate = (tmpDate.getMonth() + 1) + "/" + tmpDate.getDate() + "/" + tmpDate.getFullYear();
			// End User Story 7740, fixing date objects due to issues in SaaS multi-tenant environments
            this.b1Status = this.b1Exp.getExpStatus();
            logDebug("Found renewal record of status : " + this.b1Status + ", Expires on " + this.b1ExpDate);
        } else {
            logDebug("**ERROR: Getting B1Expiration Object for Cap.  Reason is: " + b1ExpResult.getErrorType() + ":" + b1ExpResult.getErrorMessage());
            return false
        }

        this.setExpiration = function (expDate)
    // Update expiration date
    {
        var expAADate = aa.date.parseDate(expDate);

        if (this.refProf) {
            this.refProf.setLicenseExpirationDate(expAADate);
            aa.licenseScript.editRefLicenseProf(this.refProf);
            logDebug("Updated reference license expiration to " + expDate);
        }

        if (this.b1Exp) {
            this.b1Exp.setExpDate(expAADate);
            aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration());
            logDebug("Updated renewal to " + expDate);
        }
    }

    this.setIssued = function (expDate)
    // Update Issued date
    {
        var expAADate = aa.date.parseDate(expDate);

        if (this.refProf) {
            this.refProf.setLicenseIssueDate(expAADate);
            aa.licenseScript.editRefLicenseProf(this.refProf);
            logDebug("Updated reference license issued to " + expDate);
        }

    }
    this.setLastRenewal = function (expDate)
    // Update expiration date
    {
        var expAADate = aa.date.parseDate(expDate)

            if (this.refProf) {
                this.refProf.setLicenseLastRenewalDate(expAADate);
                aa.licenseScript.editRefLicenseProf(this.refProf);
                logDebug("Updated reference license issued to " + expDate);
            }
    }

    this.setStatus = function (licStat)
    // Update expiration status
    {
        if (this.b1Exp) {
            this.b1Exp.setExpStatus(licStat);
            aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration());
            logDebug("Updated renewal to status " + licStat);
        }
    }

    this.getStatus = function ()
    // Get Expiration Status
    {
        if (this.b1Exp) {
            return this.b1Exp.getExpStatus();
        }
    }

    this.getCode = function ()
    // Get Expiration Status
    {
        if (this.b1Exp) {
            return this.b1Exp.getExpCode();
        }
    }
}