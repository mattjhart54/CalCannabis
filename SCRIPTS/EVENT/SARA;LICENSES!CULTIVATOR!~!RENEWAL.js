//SaveAndResumeAfter4ACA for LICENSES!CULTIVATOR!~!RENEWAL

try{
	//evontrapp US 7714: if expiration date is later than or equal to effective date and one or more key ASI fields are null, force the user to start from the beginning of an in-flight renewal
	var licenseASI = AInfo["License Number"];
	var parentCapId = aa.cap.getCapID(licenseASI).getOutput();
	var expObj = aa.expiration.getLicensesByCapID(parentCapId).getOutput();
	var expDate = expObj.getExpDate();
	var expDateJS = convertDate(expDate);
	var effectiveDate = lookup("EFFECTIVE_DATE_RENEWALS", "effectiveDate");
	var effectiveDateJS = new Date(effectiveDate);
	
	logDebug("expDateJS: " +  expDateJS);
	logDebug("effectiveDateJS: " + effectiveDateJS);
	
	if (expDateJS > effectiveDateJS) {
		//check ASI values for new ASI fields
		var licExpDateChange = AInfo["License Expiration Date Change"];
		var licChange = AInfo["License Change"];
		var limitedOperation = AInfo["Limited Operation"];
		
		//if any of them are missing, force the user to start at the beginning when they resume the renewal
		if (!licExpDateChange || !licChange || !limitedOperation) {
			//wipe out the save and resume values from PERMIT_TEMPORARY_DATA
			var id1 = capId.getID1();
			var id2 = capId.getID2();
			var id3 = capId.getID3();
			var sql = "DELETE FROM PERMIT_TEMPORARY_DATA WHERE SERV_PROV_CODE = 'CALCANNABIS' and B1_PER_ID1 = '" + id1 + "' and B1_PER_ID2 = '" + id2 + "' and B1_PER_ID3 = '" + id3 + "' and ENTITY_TYPE = 'ResumePageState'";
			doSQL(sql);
			aa.sendMail("noreply@cannabis.ca.gov", "evontrapp@etechconsultingllc.com", "", "Event Output 1", debug);
		}
	}
	aa.sendMail("noreply@cannabis.ca.gov", "evontrapp@etechconsultingllc.com", "", "Event Output 2", debug);
} catch(err) {
    logDebug("An error has occurred in SARA:LICENSES/CULTIVATOR/* /RENEWAL: Update AltId: " + err.message);
    logDebug(err.stack);
    aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in ASA:LICENSES/CULTIVATOR/* /RENEWAL: Submission: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}

function doSQL(sql) {
    try {
        var array = [];
        var conn = aa.db.getConnection();
        var sStmt = conn.prepareStatement(sql);
        if (sql.toUpperCase().indexOf("SELECT") == 0) {
            var rSet = sStmt.executeQuery();
            while (rSet.next()) {
                var obj = {};
                var md = rSet.getMetaData();
                var columns = md.getColumnCount();
                for (i = 1; i <= columns; i++) {
                    obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i))).replace("null", "");
                }
                array.push(obj);
            }
            aa.print(JSON.stringify(array));
            rSet.close();
        } else {
            aa.print("(doSQL) executing : " + sql);
            var r = sStmt.executeUpdate();
            aa.print("(doSQL) number of rows affected : " + r);
        }
        sStmt.close();
        conn.close();
    } catch (err) {
        aa.print(err.message);
    }
}