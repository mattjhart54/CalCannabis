function getOccurrence(array, value) {
	var result = array.filter(function (x) {return x == value;});
	return result.length;
}
