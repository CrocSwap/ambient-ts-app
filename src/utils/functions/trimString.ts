// this function shortens long strings for display
// first arg is the string to shorten
// second arg is how many characters to retain from ends

export const trimString = (
    input:string,
    startLength:number,
    endLength:number,
    separator:string
) => {
    // get `startLength` number of characters from the start of the string
    const start = input.slice(0, startLength);
    // get `endLength` number of characters from the end of the string
    const end = input.slice(-endLength);
    // concatenate start and end with user-specified separator
    const shortString = start + separator + end;
    // return shortened string
    return shortString;
}
