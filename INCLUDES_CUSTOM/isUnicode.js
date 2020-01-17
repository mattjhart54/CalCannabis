function isUnicode(str) {
	for (var i = 0, n = str.length; i < n; i++) {
		if (str.charCodeAt( i ) > 255) { return true; }
	}
	return false;
}