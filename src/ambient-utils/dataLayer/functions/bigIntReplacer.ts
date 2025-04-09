// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function bigintReplacer(key: any, value: { toString: () => any }) {
    return typeof value === 'bigint' ? value.toString() : value;
}
