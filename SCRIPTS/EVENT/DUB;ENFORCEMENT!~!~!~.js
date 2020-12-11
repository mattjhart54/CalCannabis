//check if document should be uploadable
//notifyDocumentInReview(capId);
    
    var docsList = new Array();
    docsList = getDocumentList();

    //var assignDocList = aa.util.newArrayList();
	//logDebug("Current File Name 1234: " + aa.document.getDocName());
		
		
    for (dl in docsList) 
    {
        var thisDocument = docsList[dl];
		logDebug("FileStatus: " + thisDocument.getDocStatus());
		logDebug("File Name: " + thisDocument.getDocName());
		
        //if (thisDocument.getDocStatus().equals("Uploaded") && exists(thisDocument.getDocCategory().toUpperCase(),docCategories.split(","))) 
        //        assignDocList.add(thisDocument);
    }
	
	for ( i in documentModelArray	)
	{
        var thisDocument2 = documentModelArray[i];
		
		for (var x in thisDocument2) 
			{
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
			logDebug(" 1 Filename is: " + fileName);
			
			fileNameExtensionDtls = String(fileName).split(".");
			extension = fileNameExtensionDtls[1];
			logDebug("File Extension = " + extension);
			if(matches(extension.toLowerCase(),"ade","adp","bat","chm","cmd","com","cpl","exe","hta","htm","html","ins","isp","jar","js","jse","lib","lnk","mde","mht","mhtml","msc","msp","mst","php","pif","scr","sct","shb","sys","vb","vbe","vbs","vxd","wsc","wsf","wsh","zip","dll")){
				cancel = true;		
				showMessage = true;
				comment("We accept the following file types for upload: PDF; Word; Excel; TXT; JPG; PNG; and Tiff.");
			
			}
		}
		
		function isContainsSpecialCharacters(fileName)
		{
			logDebug(" In isContainsSpecialCharacters(), Filename is: " + fileName);
			return false;
		}	
		


