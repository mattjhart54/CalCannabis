function maskTheMoneyNumber(val) {
   //set regex pattern for mask
    var pattern;
    pattern = /\B(?=(\d{3})+(?!\d))/g; //add commas to number
	if (val == null || val == '') {
        return '';
    }
	var strVal = new String(val.toString());
    var cleanVal = strVal.replace(/,/g, ""); //remove commas before masking
    var maskedVal = cleanVal.replace(pattern, ",")
	return maskedVal;
}
