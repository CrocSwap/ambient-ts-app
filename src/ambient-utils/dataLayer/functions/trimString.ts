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
) {
    // return input unchanged if shorter than the number of characters to use
    if (input.length <= startLength + endLength) return input;
    // get `startLength` number of characters from the start of the string
    const start = input.slice(0, startLength);
    // get `endLength` number of characters from the end of the string
    const end = endLength > 0 ? input.slice(-endLength) : '';
    // concatenate start and end with user-specified separator if provided
    const shortString = start + separator + end;
    // return shortened string
    return shortString;
}
