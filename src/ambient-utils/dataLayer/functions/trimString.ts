// this function shortens long strings for display
// first arg is the string to shorten
// second arg is how many characters to retain from start
// third arg is how many characters to retain from end
// fourth arg is the separator character(s) to use

export function trimString(
    input: string,
    startLength: number,
    endLength: number,
    separator = '…',
): string {
    // return input unchanged if shorter than the number of characters to use
    if (input.length <= startLength + endLength + 1) return input;
    // get `startLength` number of characters from the start of the string
    const start: string = input.slice(0, startLength);
    // get `endLength` number of characters from the end of the string
    const end: string = endLength > 0 ? input.slice(-endLength) : '';
    // concatenate start and end with user-specified separator if provided
    const truncated: string = start + separator + end;
    // return shortened string
    return truncated;
}
