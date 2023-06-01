// fn to validate a chain ID (construction only)
export default function validateChain(chn: string): boolean {
    const chnRegEx = new RegExp('0x[0-9a-fA-F]+$');
    return chnRegEx.test(chn);
}
