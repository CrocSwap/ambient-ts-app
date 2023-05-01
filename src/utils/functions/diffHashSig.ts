import sum from 'hash-sum';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function diffHashSig(x: any): string {
    if (!x || !x.length) {
        return '';
    }
    return sum(x);
}
