// this function shortens long strings for display
// first arg is the string to shorten
// second arg is how many characters to retain from ends

export const trimString = (input: string, length: number) => {
    // get `length` number of characters from the start of the string
    const start = input.slice(0, length);
    // get `length` number of characters from the end of the string
    const end = input.slice(-length);
    // concatenate start and end with ellipsis
    const shortString = start + '...' + end;
    // return shortened string
    return shortString;
};
