// import sum from 'hash-sum';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function diffHashSig(x: any): string {
    if (!x) {
        return 'null';
    }
    if (x.length === 0) {
        return 'empty';
    }
    const result = JSON.stringify(x);
    return result;
}
