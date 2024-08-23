export function checkEoaHexAddress(inputString: string) {
    // Regular expression to match a forward slash followed by '0x' and then exactly 40 hex characters
    const regex = /\/0x[a-fA-F0-9]{40}/;

    // Test the input string against the regular expression
    return regex.test(inputString);
}
