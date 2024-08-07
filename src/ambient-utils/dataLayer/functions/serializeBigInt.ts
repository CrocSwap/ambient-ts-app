// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeBigInt(obj: any): string {
    return JSON.stringify(obj, (key, value) => {
        return typeof value === 'bigint' ? value.toString() : value;
    });
}
