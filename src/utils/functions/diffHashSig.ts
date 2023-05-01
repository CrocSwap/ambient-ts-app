// import sum from 'hash-sum';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function diffHashSig(x: any): string {
    if (!x) {
        return 'null';
    }
    if (x.length === 0) {
        return 'empty';
    }
    /* console.log(x)
    const start = Date.now()*/
    const result = JSON.stringify(x);
    /* const end = Date.now()
    if (end - start >= 1) { throw new Error('Too long')}*/
    return result;
}
