// RegExp object for an exponential notation number
// at least one 0-9 numeral
// ... + an optional decimal
// ... + more 0-9 numerals
// ... + an optional 'E' or 'e'
// ... + at least one 0-9 numeral
// ... + an optional decimal
// ... + more 0-9 numerals
export const exponentialNumRegEx = new RegExp(
    '^[0-9,]*[.]?[0-9]*[Ee]?[+-]?[0-9]*[.]?[0-9]*$',
);
