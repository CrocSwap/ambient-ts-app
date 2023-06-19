// RegExp object for a decimalized number
// at least one 0-9 numeral
// ... + an optional decimal
// ... + more 0-9 numerals
export const decimalNumRegEx = new RegExp('^[0-9,]*[.]?[0-9]*$');
