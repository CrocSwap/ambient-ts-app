export const trimString = (input: string, length: number) => {
    const start = input.slice(0, length);
    const end = input.slice(-length);
    const shortString = start + '...' + end;
    return shortString;
};
