// Library doesn't provide typescript bindings :(
const hashSum = require('hash-sum/hash-sum'); // eslint-disable-line

/* Provides a high-performance way to generate a short but unique fingerprint
 * against any arbitrary object. Useful for react hooks that we want to run when
 * some large object or array changes, without the overhead of full stringification. */
export function hashFingerprint(val: any): string {
    return hashSum(val);
}
