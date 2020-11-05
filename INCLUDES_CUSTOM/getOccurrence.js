function getOccurrence(array, value) {
	var result = array.filter(x => x == value);
    return result.length;
}
