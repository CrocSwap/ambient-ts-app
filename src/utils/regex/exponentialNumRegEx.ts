// RegExp object for an exponential notation number
// at least one 0-9 numeral
// ... + an optional decimal
// ... + more 0-9 numerals
// ... + an optional 'E' or 'e'
// ... + at least one 0-9 numeral
// ... + an optional decimal
// ... + more 0-9 numerals
export const exponentialNumRegEx = new RegExp(
    /^(\d*\.?\d*|\d{0,3}(,\d{3})*(\.\d+)?)?$/,
);
