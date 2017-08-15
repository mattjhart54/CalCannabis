/*------------------------------------------------------------------------------------------------------/
|  getParents replacement functions (Start)
/------------------------------------------------------------------------------------------------------*/

function getRoots(nodeId){
try{
	var rootsArray = new Array();
	var directParentsResult = aa.cap.getProjectByChildCapID(nodeId,'R',null);
    if (directParentsResult.getSuccess()){
		tmpdirectParents = directParentsResult.getOutput();
		for(ff in tmpdirectParents) {
			if (tmpdirectParents[ff]) {
				
				var tmpNode = getRootNode(tmpdirectParents[ff].getProjectID(), 1);
				var id1 = tmpNode.getID1();
				var id2 = tmpNode.getID2();
				var id3 = tmpNode.getID3();
				var pCapId = aa.cap.getCapID(id1,id2,id3).getOutput();
				rootsArray.push(pCapId);
			}
		}
    }
	return rootsArray;
}catch(err){
	logDebug("An error has occurred in getRoots: " + err.message);
	logDebug(err.stack);
}}

function isSameNode(node1, node2){
try{
	if (node1 == null || node1 == undefined || node2 == null || node2 == undefined){
		return false;
	}
	return node1.getID1() == node2.getID1() && node1.getID2() == node2.getID2() && node1.getID3() == node2.getID3();
}catch(err){
	logDebug("An error has occurred in isSameNode: " + err.message);
	logDebug(err.stack);
}}


function getRootNode(nodeId, depth){
try{
	if (depth > 9){
		return nodeId;
	}
	var depthCount = depth + 1;
	var currentNode = nodeId;
	var directParentsResult = aa.cap.getProjectByChildCapID(currentNode,'R',null);
    if (directParentsResult.getSuccess()){
		directParents = directParentsResult.getOutput();
		for(var ff in directParents) {
			if (directParents[ff]){
				var id1 = directParents[ff].getProjectID().getID1();
				var id2 = directParents[ff].getProjectID().getID2();
				var id3 = directParents[ff].getProjectID().getID3();				
				while (!isSameNode(currentNode,directParents[ff].getProjectID())){
					currentNode = getRootNode(directParents[ff].getProjectID(), depthCount);					
				}
			}			
		}
    }
	return currentNode;
}catch(err){
	logDebug("An error has occurred in getRootNode: " + err.message);
	logDebug(err.stack);
}}

function getParentsRev(pAppType){
try{
	// returns the capId array of all parent caps
	//Dependency: appMatch function
	//
	parentArray = getRoots(capId);
	myArray = new Array();
	if (parentArray.length > 0){
		if (parentArray.length){
			for(x in parentArray){
				if (pAppType != null){
					//If parent type matches apType pattern passed in, add to return array
					if ( appMatch( pAppType, parentArray[x] ) )
						myArray.push(parentArray[x]);
				}else{
					myArray.push(parentArray[x]);
				}
			}
			return myArray;
		}else{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return null;
		}
	}else{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return null;
	}
}catch(err){
	logDebug("An error has occurred in getParentsRev: " + err.message);
	logDebug(err.stack);
}}

/*------------------------------------------------------------------------------------------------------/
|  getParents replacement functions (End)
/------------------------------------------------------------------------------------------------------*/