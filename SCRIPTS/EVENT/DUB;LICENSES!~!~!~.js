//check if document should be uploadable
//notifyDocumentInReview(capId);
    
    var docsList = new Array();
    docsList = getDocumentList();

    //var assignDocList = aa.util.newArrayList();
	//logDebug("Current File Name 1234: " + aa.document.getDocName());
		
		
    for (dl in docsList) {
        var thisDocument = docsList[dl];
		logDebug("FileStatus: " + thisDocument.getDocStatus());
		logDebug("File Name: " + thisDocument.getDocName());
		
        //if (thisDocument.getDocStatus().equals("Uploaded") && exists(thisDocument.getDocCategory().toUpperCase(),docCategories.split(","))) 
        //        assignDocList.add(thisDocument);
    }
	
	for (i in documentModelArray){
        var thisDocument2 = documentModelArray[i];
	
		for (var x in thisDocument2){
			logDebug(" Y is: " + x + "," + thisDocument2[x]);
		}
		//logDebug("Current File Name: " + thisDocument2.getDocName());		
	}	
	
		logDebug(" pass here 1");
		var documentModels = documentModelArray.toArray();
		var err = 0;
		logDebug("pass here 2");
		
		//if (capId != null) {
			
		var renamedFileName = "ThisisRenamedFile";
		var renamedFile = null;
		var documentModel = null;
		var fileName = null;
		var fileNameExtensionDtls = null;
		var extension = null;
		logDebug("pass here 3: " + documentModels.length);
		
		for (i = 0; i < documentModels.length; i++) {
			documentModel = documentModels[i];
			fileName = documentModel.getFileName();
			fileName = String(fileName);
			logDebug(" 1 Filename is: " + fileName);
			
			if (fileName.indexOf('.') > -1){
				fileNameExtensionDtls = fileName.substring(fileName.lastIndexOf(".")+1);
				extension = fileNameExtensionDtls.toLowerCase();
				logDebug("File Extension = " + extension);
				var extAllowed =  lookup("AA_EDMS_ALLOWED_FILE_TYPES","ALLOWED_FILE_TYPES");
				extArray = String(extAllowed).split(",");
				if(extArray.indexOf(extension) < 0){
					cancel = true;		
					showMessage = true;
					comment("We accept the following file types for upload: " + extArray.join('; ') + ".");	
				}
			}else{
				cancel = true;		
				showMessage = true;
				comment("In order to upload file extension must be displayed");
			}
		}
		
	function isContainsSpecialCharacters(fileName){
		logDebug(" In isContainsSpecialCharacters(), Filename is: " + fileName);
		return false;
	}
	
	function lookup(stdChoice, stdValue) {
		var strControl = null;          // RS 8/25/2015 Modified to return NULL if value is not found.
		var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

		if (bizDomScriptResult.getSuccess()) {
			var bizDomScriptObj = bizDomScriptResult.getOutput();
			strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
			logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
		else {
			logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
		return strControl;
	}	
		


