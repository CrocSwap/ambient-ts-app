/* eslint-disable no-useless-escape */
// RegExp object for an exponential notation number
let exponentialNumRegEx: RegExp;

if (navigator.userAgent.includes('Safari')) {
    exponentialNumRegEx = /^[\d]+[.]?[,\d]*[eE]?[+\-]?[\d]*[.]?[\d]*/;
} else {
    exponentialNumRegEx = /^[\d]+[.]?[,\d]*[eE]?[+-]?[\d]*[.]?[\d]*/;
}

export { exponentialNumRegEx };
