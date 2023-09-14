import { contractAddrRegEx } from '../regex/exports';

// fn to validate a contract address (construction only)
export default function validateAddress(addr: string): boolean {
    console.log(contractAddrRegEx.test(addr));
    return contractAddrRegEx.test(addr);
}
