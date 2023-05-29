// fn to validate a contract address (construction only)
export default function validateAddress(addr: string): boolean {
    const addrRegEx = new RegExp('0x[0-9a-fA-F]{40}$');
    return addrRegEx.test(addr);
}
